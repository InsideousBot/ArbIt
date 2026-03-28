"""ARBX FastAPI backend — serves arbitrage data from MongoDB to the frontend."""
from __future__ import annotations

import os
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient, DESCENDING

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "prediction_markets")
SIMILARITY_THRESHOLD = float(os.getenv("SIMILARITY_THRESHOLD", "0.70"))
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-mpnet-base-v2")

app = FastAPI(title="ARBX API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

_client: Optional[MongoClient] = None


def get_db():
    global _client
    if _client is None:
        _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    return _client[MONGO_DB]


def db_status() -> str:
    try:
        get_db().command("ping")
        return "connected"
    except Exception:
        return "error"


@app.get("/api/candidates")
def get_candidates(
    min_score: float = Query(default=0.70, ge=0.0, le=1.0),
    limit: int = Query(default=200, ge=1, le=1000),
) -> List[Dict[str, Any]]:
    try:
        db = get_db()
        docs = list(
            db["candidate_pairs"]
            .find({"similarity_score": {"$gte": min_score}}, {"_id": 0})
            .sort("similarity_score", DESCENDING)
            .limit(limit)
        )
        for doc in docs:
            if "created_at" in doc and hasattr(doc["created_at"], "isoformat"):
                doc["created_at"] = doc["created_at"].isoformat()
        return docs
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": str(e)})


@app.get("/api/questions")
def get_questions(market: Optional[str] = Query(default=None)) -> List[Dict[str, Any]]:
    try:
        db = get_db()
        query = {"market": market} if market else {}
        projection = {"_id": 0, "id": 1, "text": 1, "market": 1, "price": 1}
        return list(db["questions"].find(query, projection))
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": str(e)})


@app.get("/api/pipeline-status")
def get_pipeline_status() -> Dict[str, Any]:
    STEPS = [
        (1, "SCRAPE", "Market Scraper"),
        (2, "VECTOR DB", "Embedding & Vector DB"),
        (3, "LLM VERIFY", "LLM Verifier"),
        (4, "ARB CALC", "Arbitrage Calculator"),
        (5, "TIMING", "Timing Localizer"),
        (6, "SIM", "Simulator"),
        (7, "DISP", "Display"),
    ]
    try:
        db = get_db()
        stored: Dict[int, Any] = {}
        logs: List[str] = []
        last_run = None
        total_runtime_ms = 0
        try:
            status_doc = db["pipeline_status"].find_one({}, {"_id": 0})
            if status_doc:
                stored = {s["number"]: s for s in status_doc.get("steps", [])}
                logs = status_doc.get("logs", [])
                last_run = status_doc.get("last_run")
                total_runtime_ms = status_doc.get("total_runtime_ms", 0)
                if last_run and hasattr(last_run, "isoformat"):
                    last_run = last_run.isoformat()
        except Exception:
            pass

        steps = []
        for number, short_label, full_label in STEPS:
            s = stored.get(number, {})
            steps.append({
                "number": number,
                "short_label": s.get("short_label", short_label),
                "full_label": s.get("full_label", full_label),
                "status": s.get("status", "pending"),
                "elapsed_ms": s.get("elapsed_ms"),
                "message": s.get("message"),
            })

        return {
            "last_run": last_run,
            "total_runtime_ms": total_runtime_ms,
            "steps": steps,
            "logs": logs[-20:],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": str(e)})


@app.get("/api/config")
def get_config() -> Dict[str, Any]:
    return {
        "embedding_model": EMBEDDING_MODEL,
        "similarity_threshold": SIMILARITY_THRESHOLD,
        "db_status": db_status(),
        "markets": ["polymarket", "kalshi", "manifold"],
        "last_run": None,
    }
