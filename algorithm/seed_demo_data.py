"""Seed MongoDB with realistic dummy data for the ArbIt demo."""
from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.getenv("DATABASE_URL") or os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB") or os.getenv("MONGO_DATABASE", "arbit")

END_DATE = datetime(2025, 6, 30, 16, 0, 0, tzinfo=timezone.utc)
TODAY = datetime(2025, 6, 16, 0, 0, 0, tzinfo=timezone.utc)  # fixed "today" for demo

# ── Market pairs ──────────────────────────────────────────────────────────────

PAIRS = [
    {
        "pair_id": "demo-pair-001",
        "kalshi": {
            "market_id": "DEMO-K-001",
            "question": "Will Powell say 'inflation' 40+ times at the Jun 2025 FOMC?",
            "yes_price": 0.72,   # entry price (spread capture point)
            "final_price": 0.95,  # resolved YES
            "volume": 125_000,
        },
        "poly": {
            "market_id": "demo-p-001",
            "question": "Will Jerome Powell mention inflation 40+ times at June FOMC?",
            "yes_price": 0.61,
            "final_price": 0.95,
            "volume": 98_000,
        },
        "spread": 0.11,
        "similarity": 0.912,
        "expected_profit": 82.50,
        "recommended_size": 550.0,
        "confidence": 0.91,
    },
    {
        "pair_id": "demo-pair-002",
        "kalshi": {
            "market_id": "DEMO-K-002",
            "question": "Will the Fed cut rates in June 2025?",
            "yes_price": 0.55,
            "final_price": 0.96,
            "volume": 210_000,
        },
        "poly": {
            "market_id": "demo-p-002",
            "question": "Will the Federal Reserve lower interest rates at their June meeting?",
            "yes_price": 0.43,
            "final_price": 0.96,
            "volume": 185_000,
        },
        "spread": 0.12,
        "similarity": 0.945,
        "expected_profit": 68.00,
        "recommended_size": 500.0,
        "confidence": 0.88,
    },
    {
        "pair_id": "demo-pair-003",
        "kalshi": {
            "market_id": "DEMO-K-003",
            "question": "Will Bitcoin exceed $100,000 by Jun 30, 2025?",
            "yes_price": 0.68,
            "final_price": 0.94,
            "volume": 340_000,
        },
        "poly": {
            "market_id": "demo-p-003",
            "question": "Will BTC price be above $100k on June 30?",
            "yes_price": 0.57,
            "final_price": 0.94,
            "volume": 290_000,
        },
        "spread": 0.11,
        "similarity": 0.931,
        "expected_profit": 55.00,
        "recommended_size": 400.0,
        "confidence": 0.82,
    },
    {
        "pair_id": "demo-pair-004",
        "kalshi": {
            "market_id": "DEMO-K-004",
            "question": "Will the S&P 500 close above 5,500 in June 2025?",
            "yes_price": 0.81,
            "final_price": 0.97,
            "volume": 175_000,
        },
        "poly": {
            "market_id": "demo-p-004",
            "question": "Will SPX finish June above 5500?",
            "yes_price": 0.73,
            "final_price": 0.97,
            "volume": 142_000,
        },
        "spread": 0.08,
        "similarity": 0.958,
        "expected_profit": 35.00,
        "recommended_size": 300.0,
        "confidence": 0.75,
    },
]


def _build_price_history(start_price: float, end_price: float, days: int = 14) -> list:
    """Generate daily price snapshots converging from start_price to end_price."""
    history = []
    base = TODAY - timedelta(days=days)
    for i in range(days):
        frac = i / max(days - 1, 1)
        price = round(start_price + (end_price - start_price) * frac, 4)
        history.append({
            "date": (base + timedelta(days=i)).isoformat(),
            "yes_price": price,
            "no_price": round(1 - price, 4),
        })
    return history


def seed(db) -> None:
    markets_col = db["markets"]
    pairs_col = db["candidate_pairs"]
    signals_col = db["signals"]
    validated_col = db["validated_opportunities"]

    # Clear demo documents
    for col in (markets_col, pairs_col, signals_col, validated_col):
        col.delete_many({"market_id": {"$regex": "^DEMO-"}} if col.name == "markets"
                        else {"pair_id": {"$regex": "^demo-pair-"}} if col.name in ("signals", "validated_opportunities")
                        else {"id": {"$regex": "^demo-pair-"}})

    for p in PAIRS:
        k = p["kalshi"]
        poly = p["poly"]

        # Kalshi market doc — price_history converges to final_price (>= 0.8 → resolves YES)
        markets_col.replace_one(
            {"market_id": k["market_id"]},
            {
                "platform": "kalshi",
                "market_id": k["market_id"],
                "question": k["question"],
                "yes_price": k["final_price"],
                "no_price": round(1 - k["final_price"], 4),
                "end_date": END_DATE,
                "volume": k["volume"],
                "price_history": _build_price_history(k["yes_price"], k["final_price"]),
            },
            upsert=True,
        )

        # Polymarket market doc — converges to same final_price
        markets_col.replace_one(
            {"market_id": poly["market_id"]},
            {
                "platform": "polymarket",
                "market_id": poly["market_id"],
                "question": poly["question"],
                "yes_price": poly["final_price"],
                "no_price": round(1 - poly["final_price"], 4),
                "end_date": END_DATE,
                "volume": poly["volume"],
                "price_history": _build_price_history(poly["yes_price"], poly["final_price"]),
            },
            upsert=True,
        )

        # Candidate pair doc
        pairs_col.replace_one(
            {"id": p["pair_id"]},
            {
                "id": p["pair_id"],
                "text_a": k["question"],
                "text_b": poly["question"],
                "market_a": "kalshi",
                "market_b": "polymarket",
                "market_a_id": k["market_id"],
                "market_b_id": poly["market_id"],
                "price_a": k["yes_price"],
                "price_b": poly["yes_price"],
                "price_spread": p["spread"],
                "similarity_score": p["similarity"],
            },
            upsert=True,
        )

        # Signal doc
        signal_doc = {
            "pair_id": p["pair_id"],
            "market_a_id": k["market_id"],
            "market_b_id": poly["market_id"],
            "platform_a": "kalshi",
            "platform_b": "polymarket",
            "price_a": k["yes_price"],
            "price_b": poly["yes_price"],
            "direction": "buy_b_sell_a",
            "raw_spread": p["spread"],
            "expected_profit": p["expected_profit"],
            "recommended_size_usd": p["recommended_size"],
            "confidence": p["confidence"],
            "generated_at": TODAY.isoformat(),
        }
        signals_col.replace_one({"pair_id": p["pair_id"]}, signal_doc, upsert=True)

        # Validated opportunity doc
        validated_col.replace_one(
            {"pair_id": p["pair_id"]},
            {
                "pair_id": p["pair_id"],
                "executable": True,
                "signal": signal_doc,
                "validation_notes": "Spread confirmed liquid on both legs. EV positive.",
                "validated_at": TODAY.isoformat(),
            },
            upsert=True,
        )

    print(f"Seeded {len(PAIRS)} market pairs into '{MONGO_DB}':")
    print(f"  markets              : {markets_col.count_documents({})}")
    print(f"  candidate_pairs      : {pairs_col.count_documents({})}")
    print(f"  signals              : {signals_col.count_documents({})}")
    print(f"  validated_opportunities: {validated_col.count_documents({})}")


if __name__ == "__main__":
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Auto-discover or use env DB
    preferred = ["arbit", "Arbit", "prediction_markets", "arbsignal"]
    available = set(client.list_database_names())
    db_name = MONGO_DB
    if db_name not in available:
        for name in preferred:
            if name in available:
                db_name = name
                break
    print(f"Using MongoDB database: {db_name}")
    seed(client[db_name])
    client.close()
