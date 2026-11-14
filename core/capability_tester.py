import json


def evaluate_tasks(client, context, tasks):
    """Évalue toutes les tâches en UN SEUL appel LLM."""
    tasks_list = "\n".join(
        f"{i+1}. {t['task']} (poids {t['weight']})" for i, t in enumerate(tasks)
    )
    prompt = f"""JSON uniquement, sans texte autour.
Évalue chaque tâche : peut-elle être accomplie par un LLM local seul, sans BDD ni outils externes ?
Retourne exactement ce format :
{{"evaluations":[{{"i":1,"capability":40,"autonomy":"faible","limitation":"raison courte"}}]}}
capability = 0 à 100. i = numéro de la tâche.
Produit : {context}
Tâches :
{tasks_list}
JSON :"""

    data = client.generate_json(prompt)
    evals = data.get("evaluations", [])

    # Construire un dict indexé par numéro
    by_index = {int(e.get("i", 0)): e for e in evals if e.get("i")}

    results = []
    for i, item in enumerate(tasks):
        e = by_index.get(i + 1, {})
        results.append({
            "task": item["task"],
            "weight": item["weight"],
            "capability": max(0, min(100, float(e.get("capability", 30)))),
            "autonomy": str(e.get("autonomy", "faible")),
            "limitation": str(e.get("limitation", "Non évaluée")),
            "confidence": "moyenne",
        })
    return results
