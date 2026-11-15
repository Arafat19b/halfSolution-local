"""
RouterClient — cascade automatique de modèles.

Essaie chaque modèle de la liste dans l'ordre. Si l'un échoue
(rate limit, timeout, JSON invalide, erreur serveur), le suivant
prend immédiatement le relais. Lève une exception seulement si
tous les modèles ont échoué.
"""
import logging
from typing import Union

from groq import RateLimitError, APIStatusError, APITimeoutError

from core.groq_engine import GroqClient
from core.llm_engine import OllamaClient

logger = logging.getLogger(__name__)

# Erreurs Groq qui déclenchent le passage au modèle suivant
_FALLBACK_EXCEPTIONS = (
    RateLimitError,      # 429 — quota dépassé
    APIStatusError,      # 5xx — erreur serveur Groq
    APITimeoutError,     # timeout réseau
    ValueError,          # JSON invalide dans la réponse
)


class RouterClient:
    """
    Interface identique à OllamaClient / GroqClient.
    Tente les modèles dans l'ordre ; bascule sur le suivant à chaque erreur récupérable.
    """

    def __init__(self, clients: list[Union[GroqClient, OllamaClient]]):
        if not clients:
            raise ValueError("RouterClient : la liste de clients est vide.")
        self._clients = clients
        self._active_index = 0  # index du modèle actif (observable depuis l'extérieur)

    @property
    def model(self) -> str:
        return self._clients[self._active_index].model

    @property
    def active_index(self) -> int:
        return self._active_index

    def check_connection(self) -> None:
        """Vérifie la connexion du premier client disponible."""
        last_exc: Exception = RuntimeError("Aucun client disponible.")
        for i, client in enumerate(self._clients):
            try:
                client.check_connection()
                self._active_index = i
                return
            except Exception as exc:
                logger.warning("check_connection échoué pour le client %d (%s) : %s", i, client.model, exc)
                last_exc = exc
        raise last_exc

    def generate_json(self, prompt: str, retries: int = 1) -> dict:
        """
        Génère une réponse JSON en cascade :
        - Essaie le modèle actif.
        - En cas d'erreur récupérable, passe au suivant.
        - En cas de JSON invalide, réessaie sur le même modèle (retries fois) avant de passer au suivant.
        """
        # Commence par le modèle actif pour profiter du "warm" éventuel
        indices = list(range(self._active_index, len(self._clients))) + \
                  list(range(0, self._active_index))

        last_exc: Exception = RuntimeError("Tous les modèles ont échoué.")

        for i in indices:
            client = self._clients[i]
            for attempt in range(1, retries + 2):  # +1 pour avoir au moins 2 tentatives
                try:
                    result = client.generate_json(prompt, retries=1)
                    # Succès : mémoriser ce modèle comme actif
                    if self._active_index != i:
                        logger.info("Modèle actif basculé de %s vers %s", self._clients[self._active_index].model, client.model)
                        self._active_index = i
                    return result
                except _FALLBACK_EXCEPTIONS as exc:
                    last_exc = exc
                    if isinstance(exc, (RateLimitError, APIStatusError, APITimeoutError)):
                        # Erreur infrastructure : passer directement au modèle suivant
                        logger.warning("Modèle %s indisponible (%s), passage au suivant.", client.model, type(exc).__name__)
                        break
                    # JSON invalide : réessayer sur ce modèle avant de passer au suivant
                    if attempt <= retries:
                        logger.warning("JSON invalide avec %s (tentative %d/%d), nouvel essai.", client.model, attempt, retries + 1)
                        continue
                    logger.warning("JSON invalide avec %s après %d tentatives, passage au suivant.", client.model, attempt)
                    break
                except Exception as exc:
                    # Erreur inattendue : passer au suivant
                    last_exc = exc
                    logger.warning("Erreur inattendue avec %s : %s", client.model, exc)
                    break

        raise last_exc
