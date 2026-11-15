"""Configuration de l'API, lue depuis les variables d'environnement."""
import os
from pathlib import Path

# Charge le fichier .env situé à la racine du projet (si python-dotenv est disponible)
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    pass


def _int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except ValueError:
        return default


# --- Ollama (moteur local) ---
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
OLLAMA_TIMEOUT = _int("OLLAMA_TIMEOUT", 120)
EXPOSE_OLLAMA_URL = os.getenv("EXPOSE_OLLAMA_URL", "false").lower() == "true"

# --- Groq (moteur cloud) ---
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_TIMEOUT = _int("GROQ_TIMEOUT", 60)

# Liste ordonnée de modèles Groq — le premier est prioritaire, les suivants
# prennent le relais automatiquement en cas d'échec (rate limit, timeout, erreur).
_raw_models = os.getenv(
    "GROQ_MODELS",
    "openai/gpt-oss-120b,llama-3.3-70b-versatile,llama3-70b-8192,gemma2-9b-it",
)
GROQ_MODELS: list[str] = [m.strip() for m in _raw_models.split(",") if m.strip()]
# Rétrocompatibilité : GROQ_MODEL seul (ancienne config) → inséré en tête de liste
_legacy = os.getenv("GROQ_MODEL", "")
if _legacy and _legacy not in GROQ_MODELS:
    GROQ_MODELS.insert(0, _legacy)

# --- Sélection du moteur ---
_engine_env = os.getenv("LLM_ENGINE", "").lower()
if _engine_env in ("groq", "ollama"):
    LLM_ENGINE = _engine_env
else:
    LLM_ENGINE = "groq" if GROQ_API_KEY else "ollama"

# --- Commun ---
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]
MAX_JOBS_IN_MEMORY = _int("MAX_JOBS_IN_MEMORY", 50)
