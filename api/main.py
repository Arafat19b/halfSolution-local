"""API FastAPI : couche REST au-dessus du moteur d'analyse Python existant."""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests

from core.llm_engine import OllamaClient

from . import settings
from .errors import classify_error
from .jobs import create_job, get_job
from .schemas import AnalyzeRequest

app = FastAPI(title="HalfSolution API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/config")
def config():
    engine = settings.LLM_ENGINE
    if engine == "groq":
        model = settings.GROQ_MODEL
        timeout = settings.GROQ_TIMEOUT
    else:
        model = settings.OLLAMA_MODEL
        timeout = settings.OLLAMA_TIMEOUT

    data = {
        "model": model,
        "engine": engine,
        "timeout_seconds": timeout,
        "opportunity_threshold": 60,
    }
    if engine == "ollama" and settings.EXPOSE_OLLAMA_URL:
        data["ollama_url"] = settings.OLLAMA_BASE_URL
    return data


@app.get("/api/ollama/status")
def ollama_status():
    """
    Toujours 200. Si le moteur actif est Groq, retourne connected=True directement
    (la clé est vérifiée au démarrage de l'analyse). Sinon interroge Ollama.
    """
    if settings.LLM_ENGINE == "groq":
        has_key = bool(settings.GROQ_API_KEY)
        return {
            "engine": "groq",
            "connected": has_key,
            "model": settings.GROQ_MODEL,
            "model_available": has_key,
            "installed_models": [settings.GROQ_MODEL] if has_key else [],
            "error": None if has_key else {
                "code": "missing_api_key",
                "message": "GROQ_API_KEY absent du fichier .env.",
                "hint": "Ajoutez GROQ_API_KEY=<votre_clé> dans le fichier .env.",
            },
        }

    # Moteur Ollama
    client = OllamaClient(settings.OLLAMA_BASE_URL, settings.OLLAMA_MODEL, timeout=5)
    status = {
        "engine": "ollama",
        "connected": False,
        "model": settings.OLLAMA_MODEL,
        "model_available": False,
        "installed_models": [],
        "error": None,
    }
    try:
        r = requests.get(f"{client.base_url}/api/tags", timeout=5)
        r.raise_for_status()
        names = [m.get("name", "") for m in r.json().get("models", [])]
        status["connected"] = True
        status["installed_models"] = names
        status["model_available"] = any(
            n == client.model or n.startswith(client.model + ":") for n in names)
        if not status["model_available"]:
            status["error"] = {
                "code": "model_missing",
                "message": f"Modèle « {client.model} » non installé.",
                "hint": f"ollama pull {client.model}",
            }
    except Exception as exc:  # noqa: BLE001
        status["error"] = classify_error(exc)
    return status


@app.post("/api/analyze", status_code=202)
def analyze(body: AnalyzeRequest):
    """Valide la demande puis lance l'analyse en arrière-plan. Récupérer l'état via GET /api/analyze/{id}."""
    if not body.problem or not body.value_proposition:
        raise HTTPException(422, detail={
            "code": "missing_fields",
            "message": "Le problème client et la proposition de valeur sont obligatoires.",
        })
    job = create_job(body.model_dump())
    return {"id": job["id"], "status": job["status"], "created_at": job["created_at"]}


@app.get("/api/analyze/{job_id}")
def analyze_status(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(404, detail={
            "code": "not_found",
            "message": "Analyse introuvable (le serveur a peut-être redémarré).",
        })
    return job
