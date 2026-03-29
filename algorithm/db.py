"""Shared MongoDB helpers used by Phases 4 and 5."""

from __future__ import annotations

import os
from typing import TYPE_CHECKING

from pymongo import MongoClient

if TYPE_CHECKING:
    from pymongo.database import Database

# Collection names
PRICE_HISTORY_COL = "price_history"
SIGNALS_COL = "signals"
VALIDATED_COL = "validated_opportunities"
MARKETS_COL = "markets"

_client: MongoClient | None = None


def get_db() -> "Database":
    global _client
    if _client is None:
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
        _client = MongoClient(mongo_uri)
    db_name = os.getenv("MONGO_DB", "prediction_markets")
    return _client[db_name]


def reset_client() -> None:
    """Reset the client (useful in tests)."""
    global _client
    _client = None
