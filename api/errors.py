"""Traduit les exceptions du moteur en erreurs lisibles par l'interface."""
import json
import requests


def classify_error(exc: Exception) -> dict:
    if isinstance(exc, requests.exceptions.ConnectionError):
        return {"code": "ollama_unreachable", "message": "Ollama est inaccessible.",
                "hint": "Lancez Ollama avec « ollama serve », puis réessayez."}
    if isinstance(exc, requests.exceptions.Timeout):
        return {"code": "timeout", "message": "Le modèle a mis trop de temps à répondre.",
                "hint": "Un modèle local peut être lent. Réessayez ou simplifiez la description."}
    if isinstance(exc, RuntimeError) and "introuvable" in str(exc):
        return {"code": "model_missing", "message": str(exc),
                "hint": f"Téléchargez le modèle avec « ollama pull <nom_du_modèle> »."}
    if isinstance(exc, (json.JSONDecodeError, KeyError, ValueError, TypeError)):
        return {"code": "invalid_response", "message": "Le modèle a renvoyé une réponse inexploitable.",
                "hint": "Réessayez : les petits modèles locaux produisent parfois un JSON invalide."}
    if isinstance(exc, requests.exceptions.HTTPError):
        return {"code": "engine_error", "message": f"Erreur du moteur IA : {exc}", "hint": None}
    return {"code": "engine_error", "message": f"L'analyse a échoué : {exc}", "hint": None}
