import requests, json, re

body = {
    "model": "qwen3.5:4b",
    "prompt": "JSON only. No text before or after. Format: {\"tasks\":[{\"task\":\"verb result\",\"weight\":3}]}. Product: task management app. JSON:",
    "stream": False,
    "format": "json",
    "options": {"temperature": 0.0, "num_predict": 400, "num_ctx": 1024}
}

r = requests.post("http://localhost:11434/api/generate", json=body, timeout=60)
raw = r.json().get("response", "")
print("=== REPONSE BRUTE (repr) ===")
print(repr(raw[:800]))
print("\n=== TEXTE ===")
print(raw[:800])

# test parsing
try:
    parsed = json.loads(raw)
    print("\n=== JSON OK (direct) ===")
    print(parsed)
except Exception as e:
    print(f"\n=== JSON DIRECT FAILED: {e} ===")
    # cherche un { ... }
    m = re.search(r"\{.*\}", raw, re.DOTALL)
    if m:
        try:
            parsed = json.loads(m.group(0))
            print("=== JSON OK (extrait) ===")
            print(parsed)
        except Exception as e2:
            print(f"=== JSON EXTRAIT FAILED: {e2} ===")
            print("Extrait tentative:", m.group(0)[:300])
    else:
        print("=== AUCUN { } TROUVE ===")
