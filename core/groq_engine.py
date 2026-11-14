"""
Client Groq — interface identique à OllamaClient pour être interchangeable.
Utilise l'API Groq (cloud) au lieu d'Ollama (local).
"""
import json
import re

from groq import Groq


class GroqClient:
    def __init__(self, api_key: str, model: str, timeout: int = 60):
        self.model = model
        self.timeout = timeout
        self._client = Groq(api_key=api_key)

    # ---- Interface publique identique à OllamaClient ----

    def check_connection(self) -> None:
        """Vérifie que la clé API est valide en listant les modèles."""
        try:
            self._client.models.list()
        except Exception as exc:
            raise RuntimeError(f"Connexion Groq impossible : {exc}") from exc

    def generate_json(self, prompt: str, retries: int = 2) -> dict:
        last_exc: Exception = ValueError("Aucune tentative")
        for attempt in range(1, retries + 1):
            try:
                completion = self._client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.0 if attempt > 1 else 0.1,
                    max_completion_tokens=512,
                    top_p=1,
                    stream=False,
                    stop=None,
                )
                raw = completion.choices[0].message.content or ""
                return self._extract_json(raw)
            except (ValueError, json.JSONDecodeError) as exc:
                last_exc = exc
                continue
            except Exception as exc:
                raise exc
        raise last_exc

    # ---- Utilitaire privé ----

    def _extract_json(self, text: str) -> dict:
        text = text.strip()
        # 1. Essai direct
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass
        # 2. Bloc ```json ... ```
        m = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
        if m:
            try:
                return json.loads(m.group(1))
            except json.JSONDecodeError:
                pass
        # 3. Premier { ... } dans le texte
        m = re.search(r"\{.*\}", text, re.DOTALL)
        if m:
            try:
                return json.loads(m.group(0))
            except json.JSONDecodeError:
                pass
        raise ValueError(f"JSON invalide dans la réponse Groq : {text[:200]}")
