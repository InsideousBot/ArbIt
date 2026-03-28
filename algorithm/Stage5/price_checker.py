"""Live price re-checking for Stage 5.

Stage 4 computed signals using prices that may be seconds or minutes
stale.  Before executing a trade we must confirm the spread still exists
at the live market price.
"""

from __future__ import annotations
from loguru import logger

from backend.common.models import ArbitrageSignal, Platform
from backend.stage1_ingestion.polymarket_client import PolymarketClient
from backend.stage1_ingestion.kalshi_client import KalshiClient
from backend.stage1_ingestion.manifold_client import ManifoldClient
from backend.common.config import POLYMARKET_API_KEY, KALSHI_API_KEY, KALSHI_API_SECRET, MANIFOLD_API_KEY


def fetch_live_price(platform: Platform, market_id: str) -> float | None:
    """Fetch the current YES price for a single market.

    Returns None if the fetch fails (network error, market closed, etc.).
    """
    try:
        if platform == Platform.POLYMARKET:
            client = PolymarketClient(api_key=POLYMARKET_API_KEY)
            try:
                markets = client.fetch_markets(limit=1)
                # In production, you'd hit the single-market endpoint.
                # For now, return the midpoint if available.
                price = client._get_midpoint(market_id)
                return price
            finally:
                client.close()

        elif platform == Platform.KALSHI:
            client = KalshiClient(api_key=KALSHI_API_KEY, api_secret=KALSHI_API_SECRET)
            try:
                markets = client.fetch_markets(limit=1)
                for m in markets:
                    if m.market_id == market_id:
                        return m.yes_price
                return None
            finally:
                client.close()

        elif platform == Platform.MANIFOLD:
            client = ManifoldClient(api_key=MANIFOLD_API_KEY)
            try:
                import httpx
                resp = httpx.get(f"https://api.manifold.markets/v0/market/{market_id}", timeout=15)
                resp.raise_for_status()
                data = resp.json()
                return float(data.get("probability", 0.5))
            finally:
                client.close()

    except Exception as exc:
        logger.warning(f"Live price fetch failed for {platform.value}/{market_id}: {exc}")
        return None


def check_spread_still_exists(
    signal: ArbitrageSignal,
    live_a: float,
    live_b: float,
    min_spread: float = 0.02,
) -> tuple[float, bool]:
    """Compare live prices to see if the spread is still actionable.

    Returns (live_spread, still_exists).
    """
    live_spread = abs(live_a - live_b)
    still_exists = live_spread >= min_spread
    if not still_exists:
        logger.info(f"Spread vanished for {signal.pair_id}: "
                     f"was {signal.raw_spread:.4f}, now {live_spread:.4f}")
    return round(live_spread, 6), still_exists
