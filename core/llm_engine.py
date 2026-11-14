import json
import re
import requests


class OllamaClient:
    def __init__(self, base_url: str, model: str, timeout: int = 120):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout = timeout

    def check_connection(self):
        response = requests.get(f"{self.base_url}/api/tags", timeout=10)
        response.raise_for_status()
        models = [m.get("name", "") for m in response.json().get("models", [])]
        if not any(name == self.model or name.startswith(self.model + ":") for name in models):
            raise RuntimeError(
                f"Modèle '{self.model}' introuvable. Modèles installés : {', '.join(models) or 'aucun'}"
            )

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
        raise ValueError(f"JSON invalide : {text[:200]}")

    def generate_json(self, prompt: str, retries: int = 2) -> dict:
        last_exc: Exception = ValueError("Aucune tentative")
        for attempt in range(1, retries + 1):
            try:
                response = requests.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "format": "json",
                        "options": {
                            "temperature": 0.0,
                            "num_predict": 512,
                            "num_ctx": 4096,
                        },
                    },
                    timeout=self.timeout,
                )
                response.raise_for_status()
                raw = response.json().get("response", "")
                return self._extract_json(raw)
            except (ValueError, json.JSONDecodeError) as exc:
                last_exc = exc
                continue
            except Exception as exc:
                raise exc
        raise last_exc
