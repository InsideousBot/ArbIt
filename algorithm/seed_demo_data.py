"""
Seed MongoDB with large-scale realistic demo data for ArbIt.

Generates:
  - 200  markets     (100 Kalshi + 100 Polymarket)
  - 10 000 candidate_pairs   (raw pipeline output)
  -    500 signals            (high-confidence arb opportunities)
  -    350 validated_opportunities
  - Price history: 60 daily snapshots per market (12 000 price points)
  - Trades spread across a full 365-day window → real day-by-day P&L playback
"""
from __future__ import annotations

import os
import random
import math
from datetime import datetime, timedelta, timezone, date as _date
from typing import Any

from dotenv import load_dotenv
from pymongo import MongoClient, InsertOne

load_dotenv()

MONGO_URI = os.getenv("DATABASE_URL") or os.getenv("MONGO_URI", "mongodb://localhost:27017")

# ── RNG ──────────────────────────────────────────────────────────────────────
rng = random.Random(42)

# ── Date range: past 365 days aligned with system clock ──────────────────────
TODAY = _date.today()
YEAR_AGO = TODAY - timedelta(days=365)


# ── Question templates (Kalshi phrasing → Polymarket phrasing) ───────────────

QUESTION_TEMPLATES = [
    # Macro / Fed
    ("Will the Fed cut rates at the {month} {year} meeting?",
     "Will the Federal Reserve lower interest rates at the {month} {year} FOMC?",
     "kalshi", "polymarket", (0.30, 0.65)),
    ("Will Fed funds rate be below {rate}% by end of {month} {year}?",
     "Will the US benchmark rate fall under {rate}% before {month} ends?",
     "kalshi", "polymarket", (0.25, 0.70)),
    ("Will CPI exceed {pct}% YoY in {month} {year}?",
     "Will US inflation be above {pct}% in {month}?",
     "kalshi", "polymarket", (0.35, 0.75)),
    ("Will Powell mention 'soft landing' at the {month} press conference?",
     "Will Jerome Powell say 'soft landing' during the {month} FOMC presser?",
     "kalshi", "polymarket", (0.40, 0.72)),
    ("Will the 10-year Treasury yield exceed {rate}% in {month} {year}?",
     "Will 10Y US yields break above {rate}% during {month}?",
     "kalshi", "polymarket", (0.45, 0.78)),
    # Crypto
    ("Will Bitcoin exceed ${price}k by end of {month} {year}?",
     "Will BTC price surpass ${price},000 before {month} closes?",
     "kalshi", "polymarket", (0.30, 0.70)),
    ("Will Ethereum exceed ${price}k in {month} {year}?",
     "Will ETH break ${price}k in {month}?",
     "kalshi", "polymarket", (0.35, 0.68)),
    ("Will Bitcoin market cap exceed {cap}T by {month} {year}?",
     "Will BTC market cap top ${cap} trillion in {month}?",
     "kalshi", "polymarket", (0.28, 0.62)),
    ("Will Solana exceed ${price} in {month} {year}?",
     "Will SOL price be above ${price} in {month}?",
     "kalshi", "polymarket", (0.32, 0.71)),
    ("Will a spot Bitcoin ETF see >$1B inflows in {month} {year}?",
     "Will BTC ETFs attract over $1 billion in {month}?",
     "kalshi", "polymarket", (0.55, 0.80)),
    # Equities
    ("Will the S&P 500 close above {level} in {month} {year}?",
     "Will SPX finish {month} above {level}?",
     "kalshi", "polymarket", (0.40, 0.82)),
    ("Will the Nasdaq exceed {level} by end of {month} {year}?",
     "Will the Nasdaq 100 be above {level} in {month}?",
     "kalshi", "polymarket", (0.38, 0.76)),
    ("Will the Dow Jones close above {level} in {month} {year}?",
     "Will DJIA stay above {level} at {month} end?",
     "kalshi", "polymarket", (0.42, 0.80)),
    ("Will VIX fall below {level} in {month} {year}?",
     "Will the volatility index drop under {level} during {month}?",
     "kalshi", "polymarket", (0.35, 0.70)),
    ("Will {ticker} stock exceed ${price} in {month} {year}?",
     "Will {ticker} share price break ${price} in {month}?",
     "kalshi", "polymarket", (0.30, 0.68)),
    # Geopolitics / elections
    ("Will {country} hold elections before end of {year}?",
     "Will {country} conduct national elections in {year}?",
     "kalshi", "polymarket", (0.50, 0.85)),
    ("Will the US impose new tariffs on {country} in {month} {year}?",
     "Will the US add tariffs targeting {country} during {month}?",
     "kalshi", "polymarket", (0.25, 0.60)),
    ("Will a ceasefire be announced in {region} by {month} {year}?",
     "Will fighting in {region} pause under a ceasefire deal in {month}?",
     "kalshi", "polymarket", (0.20, 0.55)),
    # Tech / AI
    ("Will OpenAI release a new major model in {month} {year}?",
     "Will OpenAI launch a new flagship model during {month}?",
     "kalshi", "polymarket", (0.45, 0.75)),
    ("Will {company} stock gain over 10% in {month} {year}?",
     "Will {company} shares rise more than 10% in {month}?",
     "kalshi", "polymarket", (0.22, 0.55)),
    ("Will the EU pass new AI regulation in {month} {year}?",
     "Will the European Union enact AI legislation during {month}?",
     "kalshi", "polymarket", (0.18, 0.50)),
    # Sports
    ("Will {team} win the {league} championship in {year}?",
     "Will {team} be crowned {league} champions in {year}?",
     "kalshi", "polymarket", (0.15, 0.45)),
    ("Will {athlete} win the {tournament} in {year}?",
     "Will {athlete} claim victory at the {tournament} this year?",
     "kalshi", "polymarket", (0.20, 0.55)),
    # Commodities
    ("Will oil prices exceed ${price}/barrel in {month} {year}?",
     "Will WTI crude oil surpass ${price} per barrel in {month}?",
     "kalshi", "polymarket", (0.35, 0.70)),
    ("Will gold exceed ${price}/oz by {month} {year}?",
     "Will gold price break ${price} per ounce during {month}?",
     "kalshi", "polymarket", (0.40, 0.75)),
    # Weather / climate
    ("Will a major hurricane hit the US Gulf Coast in {year}?",
     "Will there be a Gulf Coast hurricane landfall in {year}?",
     "kalshi", "polymarket", (0.45, 0.72)),
    # Corporate
    ("Will {company} report earnings above analyst estimates in Q{quarter} {year}?",
     "Will {company} beat EPS consensus in Q{quarter} {year}?",
     "kalshi", "polymarket", (0.52, 0.78)),
    ("Will {company} announce a stock buyback in {month} {year}?",
     "Will {company} launch a share repurchase program in {month}?",
     "kalshi", "polymarket", (0.30, 0.62)),
    ("Will {company} announce layoffs exceeding 5% of staff in {year}?",
     "Will {company} cut more than 5% of employees in {year}?",
     "kalshi", "polymarket", (0.28, 0.60)),
    # Housing
    ("Will US 30-year mortgage rates fall below {rate}% in {month} {year}?",
     "Will 30Y mortgage rates dip under {rate}% during {month}?",
     "kalshi", "polymarket", (0.32, 0.65)),
    ("Will US existing home sales exceed {num}M units in {month} {year}?",
     "Will monthly US home sales top {num} million in {month}?",
     "kalshi", "polymarket", (0.38, 0.70)),
]

MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
YEARS  = [2024, 2025]
TICKERS = ["AAPL","NVDA","TSLA","MSFT","AMZN","GOOGL","META","AMD","NFLX","PLTR"]
COMPANIES = ["Apple","Nvidia","Tesla","Microsoft","Amazon","Google","Meta","AMD","Netflix","Palantir","OpenAI","Anthropic"]
TEAMS = ["Kansas City Chiefs","Golden State Warriors","LA Dodgers","Real Madrid","Manchester City","Boston Celtics","Miami Heat"]
ATHLETES = ["Novak Djokovic","Carlos Alcaraz","Iga Swiatek","LeBron James","Tiger Woods","Serena Williams"]
TOURNAMENTS = ["US Open","Wimbledon","French Open","Masters","NBA Finals","World Series"]
LEAGUES = ["NFL","NBA","MLB","Premier League","Champions League","NHL"]
COUNTRIES = ["Japan","Germany","France","India","Brazil","Canada","South Korea","UK","Australia"]
REGIONS = ["Ukraine","Gaza","Sudan","Yemen","Taiwan Strait"]


def _fill(template: str) -> str:
    """Fill template placeholders with random realistic values."""
    t = template
    replacements = {
        "{month}":    rng.choice(MONTHS),
        "{year}":     str(rng.choice(YEARS)),
        "{quarter}":  str(rng.randint(1, 4)),
        "{rate}":     str(round(rng.uniform(3.5, 7.5), 1)),
        "{pct}":      str(round(rng.uniform(2.0, 5.5), 1)),
        "{price}":    str(rng.choice([50, 75, 80, 90, 100, 110, 120, 150, 200, 250, 300])),
        "{cap}":      str(rng.choice([1, 2, 3])),
        "{level}":    str(rng.choice([4000, 4200, 4500, 4800, 5000, 5200, 5500, 5800, 6000,
                                      14000, 15000, 16000, 17000, 18000,
                                      33000, 35000, 38000, 40000])),
        "{ticker}":   rng.choice(TICKERS),
        "{company}":  rng.choice(COMPANIES),
        "{country}":  rng.choice(COUNTRIES),
        "{region}":   rng.choice(REGIONS),
        "{team}":     rng.choice(TEAMS),
        "{athlete}":  rng.choice(ATHLETES),
        "{tournament}": rng.choice(TOURNAMENTS),
        "{league}":   rng.choice(LEAGUES),
        "{num}":      str(round(rng.uniform(3.5, 6.5), 1)),
    }
    for k, v in replacements.items():
        t = t.replace(k, v, 1)
    return t


def _rand_spread() -> float:
    """Realistic arb spread: mostly 4–14pp, occasional 3pp or 18pp."""
    return round(rng.triangular(0.03, 0.18, 0.08), 3)


def _rand_end_date() -> _date:
    """Random market end date uniformly spread across the past 365-day backtest window."""
    offset = rng.randint(0, 364)
    return YEAR_AGO + timedelta(days=offset)


def _build_price_history(start_price: float, final_price: float, days: int = 60) -> list:
    """Smooth stochastic convergence from start to final over `days` daily bars.
    Returns list of dicts with 'yes_price' key (required by backend _price_to_resolution).
    """
    entries = []
    p = start_price
    target = final_price
    for i in range(days):
        frac = i / max(days - 1, 1)
        drift = (target - p) * (0.07 + frac * 0.15)
        noise = rng.gauss(0, 0.008) * (1 - frac * 0.6)
        p = max(0.01, min(0.99, p + drift + noise))
        entries.append({"yes_price": round(p, 4)})
    # Force final value
    entries[-1]["yes_price"] = round(final_price, 4)
    return entries


def _price_resolves_yes(p: float) -> bool:
    return p >= 0.80


def _outcome(res_a: str | None, res_b: str | None) -> tuple[str, float | None]:
    if res_a == res_b and res_a is not None:
        return "WIN", None   # actual pnl computed separately
    if res_a is None or res_b is None:
        return "UNKNOWN", None
    return "UNKNOWN", None   # different resolutions → not true arb


# ── Main seeder ───────────────────────────────────────────────────────────────

def seed(db) -> None:
    print("Clearing old demo data…")
    db["markets"].delete_many({"_demo": True})
    db["candidate_pairs"].delete_many({"_demo": True})
    db["signals"].delete_many({"_demo": True})
    db["validated_opportunities"].delete_many({"_demo": True})

    # ── 1. Generate 200 markets (100 Kalshi + 100 Polymarket) ─────────────────
    print("Generating markets…")
    market_docs: list[dict[str, Any]] = []
    market_lookup: dict[str, dict] = {}  # market_id → doc

    pair_topics: list[dict] = []   # holds matched (k_id, p_id, end_date, k_final, p_final, spread)

    for i in range(100):
        tpl = QUESTION_TEMPLATES[i % len(QUESTION_TEMPLATES)]
        q_k = _fill(tpl[0])
        q_p = _fill(tpl[1])
        end_date = _rand_end_date()
        spread = _rand_spread()
        lo, hi = tpl[4]
        base_price = round(rng.uniform(lo, hi), 3)
        # Both markets resolve the same way with 78% probability
        resolves_yes = rng.random() < 0.78
        k_final = round(rng.uniform(0.91, 0.98), 3) if resolves_yes else round(rng.uniform(0.02, 0.09), 3)
        p_final = round(k_final + rng.gauss(0, 0.01), 3)
        p_final = max(0.01, min(0.99, p_final))

        k_id = f"DEMO-K-{i+1:04d}"
        p_id = f"demo-p-{i+1:04d}"
        k_start = base_price
        p_start = max(0.01, min(0.99, base_price - spread))

        days_until_end = max(7, (end_date - YEAR_AGO).days)
        ph_days = min(60, days_until_end)

        k_doc = {
            "_demo": True,
            "platform": "kalshi",
            "market_id": k_id,
            "question": q_k,
            "yes_price": k_final,
            "no_price": round(1 - k_final, 4),
            "end_date": datetime(end_date.year, end_date.month, end_date.day, 16, 0, 0, tzinfo=timezone.utc),
            "volume": rng.randint(40_000, 500_000),
            "price_history": _build_price_history(k_start, k_final, ph_days),
        }
        p_doc = {
            "_demo": True,
            "platform": "polymarket",
            "market_id": p_id,
            "question": q_p,
            "yes_price": p_final,
            "no_price": round(1 - p_final, 4),
            "end_date": datetime(end_date.year, end_date.month, end_date.day, 16, 0, 0, tzinfo=timezone.utc),
            "volume": rng.randint(30_000, 400_000),
            "price_history": _build_price_history(p_start, p_final, ph_days),
        }
        market_docs.append(k_doc)
        market_docs.append(p_doc)
        market_lookup[k_id] = k_doc
        market_lookup[p_id] = p_doc
        pair_topics.append({
            "k_id": k_id, "p_id": p_id,
            "q_k": q_k, "q_p": q_p,
            "end_date": end_date,
            "k_start": k_start, "p_start": p_start,
            "k_final": k_final, "p_final": p_final,
            "spread": spread, "base_price": base_price,
        })

    if market_docs:
        db["markets"].insert_many(market_docs)
    print(f"  Inserted {len(market_docs)} markets")

    # ── 2. Generate 10 000 candidate_pairs ────────────────────────────────────
    print("Generating 10 000 candidate pairs…")
    candidate_docs: list[dict] = []
    # First 100 are the real matched pairs (high similarity)
    for i, pt in enumerate(pair_topics):
        candidate_docs.append({
            "_demo": True,
            "id": f"demo-pair-{i+1:05d}",
            "text_a": pt["q_k"],
            "text_b": pt["q_p"],
            "market_a": "kalshi",
            "market_b": "polymarket",
            "market_a_id": pt["k_id"],
            "market_b_id": pt["p_id"],
            "price_a": pt["k_start"],
            "price_b": pt["p_start"],
            "price_spread": pt["spread"],
            "similarity_score": round(rng.uniform(0.82, 0.97), 4),
        })

    # Remaining ~9900: cross-pair near-misses with lower similarity
    for j in range(9900):
        tp_a = rng.choice(QUESTION_TEMPLATES)
        tp_b = rng.choice(QUESTION_TEMPLATES)
        sim = round(rng.triangular(0.55, 0.82, 0.65), 4)
        spread = round(rng.uniform(0.01, 0.22), 3)
        base = round(rng.uniform(0.25, 0.75), 3)
        candidate_docs.append({
            "_demo": True,
            "id": f"demo-near-{j+1:06d}",
            "text_a": _fill(tp_a[0]),
            "text_b": _fill(tp_b[1]),
            "market_a": rng.choice(["kalshi", "manifold"]),
            "market_b": rng.choice(["polymarket", "manifold"]),
            "market_a_id": f"NEAR-K-{j+1:06d}",
            "market_b_id": f"near-p-{j+1:06d}",
            "price_a": base,
            "price_b": round(base - spread, 3),
            "price_spread": spread,
            "similarity_score": sim,
        })

    # Bulk insert in chunks of 1000
    for chunk_start in range(0, len(candidate_docs), 1000):
        db["candidate_pairs"].insert_many(candidate_docs[chunk_start:chunk_start + 1000])
    print(f"  Inserted {len(candidate_docs)} candidate pairs")

    # ── 3. Generate 500 signals (one per matched pair, spread across exit dates) ─
    print("Generating 500 signals…")
    signal_docs: list[dict] = []
    for i, pt in enumerate(pair_topics):
        # Stagger exit dates: spread the 100 matched pairs across the year
        # then duplicate each ~5× with slightly varied parameters to hit 500
        for variant in range(5):
            # Vary price/spread slightly per variant
            var_spread = round(max(0.02, pt["spread"] + rng.gauss(0, 0.012)), 3)
            var_price_a = round(max(0.05, min(0.95, pt["k_start"] + rng.gauss(0, 0.03))), 3)
            var_price_b = round(max(0.05, min(0.95, pt["p_start"] + rng.gauss(0, 0.03))), 3)
            # Stagger exit dates evenly
            day_offset = ((i * 5 + variant) * 365 // 500) % 365
            exit_date = (YEAR_AGO + timedelta(days=day_offset + rng.randint(0, 3))).isoformat()
            size = round(rng.triangular(100, 800, 350), 0)
            ev = round(var_spread * size * rng.uniform(0.85, 1.05), 2)
            conf = round(rng.triangular(0.62, 0.96, 0.82), 3)
            pair_id = f"demo-pair-{i+1:05d}" if variant == 0 else f"demo-near-{(i*5+variant):06d}"
            # Always reference the real market ids for trade enrichment
            sig_id = f"sig-{i+1:04d}-v{variant}"
            signal_docs.append({
                "_demo": True,
                "signal_id": sig_id,
                "pair_id": candidate_docs[i]["id"],
                "market_a_id": pt["k_id"],
                "market_b_id": pt["p_id"],
                "platform_a": "kalshi",
                "platform_b": "polymarket",
                "price_a": var_price_a,
                "price_b": var_price_b,
                "direction": "buy_b_sell_a",
                "raw_spread": var_spread,
                "expected_profit": ev,
                "recommended_size_usd": size,
                "confidence": conf,
                "kelly_fraction": round(conf * var_spread * 2, 4),
                "regression_convergence_prob": round(rng.uniform(0.60, 0.92), 3),
                "generated_at": (YEAR_AGO + timedelta(days=day_offset)).isoformat(),
                # Store exit_date directly so backend can use it for simulation
                "_exit_date_override": exit_date,
            })

    for chunk_start in range(0, len(signal_docs), 500):
        db["signals"].insert_many(signal_docs[chunk_start:chunk_start + 500])
    print(f"  Inserted {len(signal_docs)} signals")

    # ── 4. Generate 350 validated opportunities ────────────────────────────────
    print("Generating validated opportunities…")
    validated_docs: list[dict] = []
    for sig in rng.sample(signal_docs, min(350, len(signal_docs))):
        validated_docs.append({
            "_demo": True,
            "pair_id": sig["pair_id"],
            "signal_id": sig.get("signal_id"),
            "executable": rng.random() < 0.88,
            "signal": {k: v for k, v in sig.items() if not k.startswith("_")},
            "validation_notes": rng.choice([
                "Spread confirmed liquid on both legs. EV positive.",
                "Both markets within 2% of mid. Entering at current prices.",
                "High-confidence convergence signal. Size approved.",
                "Timing risk low. Market closes within 14 days.",
                "Kelly fraction within risk limits. Trade approved.",
            ]),
            "validated_at": sig["generated_at"],
        })
    db["validated_opportunities"].insert_many(validated_docs)
    print(f"  Inserted {len(validated_docs)} validated opportunities")

    # ── Summary ───────────────────────────────────────────────────────────────
    print("\nSeed complete:")
    print(f"  markets                : {db['markets'].count_documents({'_demo': True})}")
    print(f"  candidate_pairs        : {db['candidate_pairs'].count_documents({'_demo': True})}")
    print(f"  signals                : {db['signals'].count_documents({'_demo': True})}")
    print(f"  validated_opportunities: {db['validated_opportunities'].count_documents({'_demo': True})}")


if __name__ == "__main__":
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
    # Auto-discover DB
    preferred = ["prediction_markets", "arbit", "Arbit", "arbsignal"]
    try:
        available = set(client.list_database_names())
    except Exception:
        available = set()
    db_name = os.getenv("MONGO_DB") or os.getenv("MONGO_DATABASE") or "prediction_markets"
    for name in preferred:
        if name in available:
            db_name = name
            break
    print(f"Using MongoDB database: '{db_name}'")
    seed(client[db_name])
    client.close()
