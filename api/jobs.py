"""
Exécution asynchrone des analyses.

Supporte deux moteurs LLM : Ollama (local) et Groq (cloud).
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
    }


def _set_step(job: dict, key: str, status: str) -> None:
    with _lock:
        for s in job["progress"]["steps"]:
            if s["key"] == key:
                s["status"] = status


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


def _make_client():
    """Instancie le bon client LLM selon la configuration."""
    if settings.LLM_ENGINE == "groq":
        return GroqClient(
            api_key=settings.GROQ_API_KEY,
            model=settings.GROQ_MODEL,
            timeout=settings.GROQ_TIMEOUT,
        )
    return OllamaClient(
        settings.OLLAMA_BASE_URL,
        settings.OLLAMA_MODEL,
        settings.OLLAMA_TIMEOUT,
    )


def _run(job: dict, payload: dict) -> None:
    current = "connection"
    try:
        client = _make_client()

        _set_step(job, current, "running")
        client.check_connection()
        _set_step(job, current, "done")

        current = "extraction"
        _set_step(job, current, "running")
        tasks = extract_tasks(client, payload)
        with _lock:
            job["progress"]["tasks_total"] = len(tasks)
        _set_step(job, current, "done")

        current = "evaluation"
        _set_step(job, current, "running")
        with _lock:
            job["progress"]["tasks_total"] = len(tasks)
        # Un seul appel LLM pour toutes les tâches
        evaluations = evaluate_tasks(client, payload, tasks)
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
            "methodology_note": "LLM-estimated; not empirically benchmarked.",
        }
        with _lock:
            job["result"] = result
            job["status"] = "done"
    except Exception as exc:  # noqa: BLE001 - on veut toute erreur du moteur
        _set_step(job, current, "error")
        with _lock:
            job["error"] = {**classify_error(exc), "step": current}
            job["status"] = "error"
