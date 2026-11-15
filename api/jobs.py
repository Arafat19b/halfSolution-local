"""
Exécution asynchrone des analyses.

Supporte deux moteurs LLM : Groq (cloud, avec fallback multi-modèles) et Ollama (local).
Le moteur actif est déterminé par LLM_ENGINE dans settings.py.
"""
import threading
import uuid
from collections import OrderedDict
from datetime import datetime, timezone
from typing import Optional

from analysis.monetization import build_opportunities
from core.capability_tester import evaluate_tasks
from core.groq_engine import GroqClient
from core.llm_engine import OllamaClient
from core.router import RouterClient
from core.scoring import calculate_score
from core.task_extractor import extract_tasks

from . import settings
from .errors import classify_error

STEPS = [
    ("connection", "Vérification du moteur IA"),
    ("extraction", "Extraction des tâches"),
    ("evaluation", "Évaluation des capacités IA"),
    ("scoring", "Calcul du score"),
    ("opportunities", "Identification des opportunités"),
]

_jobs: "OrderedDict[str, dict]" = OrderedDict()
_lock = threading.Lock()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _new_progress() -> dict:
    return {
        "steps": [{"key": k, "label": l, "status": "pending"} for k, l in STEPS],
        "tasks_total": None,
        "tasks_done": 0,
        "active_model": None,  # modèle LLM qui a répondu en dernier
    }


def _set_step(job: dict, key: str, status: str) -> None:
    with _lock:
        for s in job["progress"]["steps"]:
            if s["key"] == key:
                s["status"] = status


def _update_active_model(job: dict, model: str) -> None:
    with _lock:
        job["progress"]["active_model"] = model


def create_job(payload: dict) -> dict:
    job = {
        "id": uuid.uuid4().hex[:12],
        "status": "running",
        "created_at": _now(),
        "progress": _new_progress(),
        "result": None,
        "error": None,
    }
    with _lock:
        _jobs[job["id"]] = job
        while len(_jobs) > settings.MAX_JOBS_IN_MEMORY:
            _jobs.popitem(last=False)
    threading.Thread(target=_run, args=(job, payload), daemon=True).start()
    return job


def get_job(job_id: str) -> Optional[dict]:
    with _lock:
        return _jobs.get(job_id)


def _make_client() -> RouterClient:
    """
    Construit un RouterClient avec tous les modèles configurés.
    - Groq : un GroqClient par modèle dans GROQ_MODELS (cascade automatique).
    - Ollama : un seul OllamaClient en dernier recours si LLM_ENGINE != groq.
    """
    clients = []

    if settings.LLM_ENGINE == "groq" and settings.GROQ_API_KEY:
        for model in settings.GROQ_MODELS:
            clients.append(GroqClient(
                api_key=settings.GROQ_API_KEY,
                model=model,
                timeout=settings.GROQ_TIMEOUT,
            ))

    # Ollama toujours ajouté en dernier recours si disponible
    clients.append(OllamaClient(
        settings.OLLAMA_BASE_URL,
        settings.OLLAMA_MODEL,
        settings.OLLAMA_TIMEOUT,
    ))

    return RouterClient(clients)


def _run(job: dict, payload: dict) -> None:
    current = "connection"
    try:
        client = _make_client()

        _set_step(job, current, "running")
        client.check_connection()
        _update_active_model(job, client.model)
        _set_step(job, current, "done")

        current = "extraction"
        _set_step(job, current, "running")
        tasks = extract_tasks(client, payload)
        _update_active_model(job, client.model)
        with _lock:
            job["progress"]["tasks_total"] = len(tasks)
        _set_step(job, current, "done")

        current = "evaluation"
        _set_step(job, current, "running")
        evaluations = evaluate_tasks(client, payload, tasks)
        _update_active_model(job, client.model)
        with _lock:
            job["progress"]["tasks_done"] = len(evaluations)
        _set_step(job, current, "done")

        current = "scoring"
        _set_step(job, current, "running")
        score = calculate_score(evaluations)
        _set_step(job, current, "done")

        current = "opportunities"
        _set_step(job, current, "running")
        opportunities = build_opportunities(evaluations)
        _set_step(job, current, "done")

        result = {
            "product": payload,
            "score": score,
            "evaluations": evaluations,
            "monetization_opportunities": opportunities,
            "model_used": client.model,
            "methodology_note": "LLM-estimated; not empirically benchmarked.",
        }
        with _lock:
            job["result"] = result
            job["status"] = "done"

    except Exception as exc:  # noqa: BLE001
        _set_step(job, current, "error")
        with _lock:
            job["error"] = {**classify_error(exc), "step": current}
            job["status"] = "error"
