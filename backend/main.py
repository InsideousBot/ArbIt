"""ARBX FastAPI backend — serves arbitrage data from MongoDB to the frontend."""
from __future__ import annotations

import os
import sys
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient, DESCENDING

# Make simulation package importable when running from backend/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from simulation.run_backtest import run_backtest
from simulation.analytics.reports import summary_dict
from simulation.config import SimulationConfig
from simulation.models import RealismMode

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "prediction_markets")
SIMILARITY_THRESHOLD = float(os.getenv("SIMILARITY_THRESHOLD", "0.70"))
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-mpnet-base-v2")

app = FastAPI(title="ARBX API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_methods=["GET", "POST"],
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


class SimRunRequest(BaseModel):
    realism_mode: str = "realistic"
    initial_capital: float = 10000.0


@app.post("/api/simulation/run")
def run_simulation(req: SimRunRequest) -> Dict[str, Any]:
    try:
        mode_map = {
            "optimistic": RealismMode.OPTIMISTIC,
            "realistic": RealismMode.REALISTIC,
            "pessimistic": RealismMode.PESSIMISTIC,
        }
        realism = mode_map.get(req.realism_mode.lower(), RealismMode.REALISTIC)
        config = SimulationConfig(
            initial_capital=req.initial_capital,
            realism_mode=realism,
        )
        result = run_backtest(config=config, verbose=False)
        summary = summary_dict(result)
        equity_curve = [
            {"t": ts, "equity": eq}
            for ts, eq in result.metrics.equity_curve
        ]
        trade_log = [
            {
                "market_id": f.market_id,
                "platform": f.platform,
                "side": f.side,
                "price": round(f.fill_price, 4),
                "size": round(f.fill_size, 2),
                "status": f.status,
                "fee": round(f.fee_paid, 4),
                "timestamp": f.filled_at.isoformat() if f.filled_at else None,
            }
            for f in result.trade_log[:50]
        ]
        return {
            "summary": summary,
            "equity_curve": equity_curve,
            "trade_log": trade_log,
            "realism_mode": req.realism_mode,
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
