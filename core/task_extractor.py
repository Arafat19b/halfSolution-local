def extract_tasks(client, context):
    """Extrait 3 à 4 tâches max pour limiter le nombre d'appels LLM."""
    prompt = f"""JSON uniquement, sans texte autour.
Décompose ce produit en 3 ou 4 tâches clés que le client veut accomplir.
Format exact :
{{"tasks":[{{"task":"verbe + résultat","weight":3}}]}}
weight = entier 1 à 5. Maximum 4 tâches.
Produit : {context}
JSON :"""

    data = client.generate_json(prompt)
    tasks = data.get("tasks", [])
    if not tasks:
        raise ValueError("Le modèle n'a extrait aucune tâche exploitable.")

    cleaned = []
    for item in tasks[:4]:  # jamais plus de 4
        task = str(item.get("task", "")).strip()
        if task:
            cleaned.append({
                "task": task,
                "weight": max(1, min(5, int(item.get("weight", 3)))),
                "why_it_matters": "",
            })
    return cleaned
