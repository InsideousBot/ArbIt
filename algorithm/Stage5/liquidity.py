"""Liquidity validation for Stage 5.

Before executing a trade, we check whether the order books on both
platforms can absorb our recommended position size without excessive
slippage.
"""

from __future__ import annotations
from dataclasses import dataclass
from loguru import logger


@dataclass
class LiquidityCheck:
    platform_a_liquidity: float
    platform_b_liquidity: float
    required_size: float
    max_slippage_pct: float = 0.02  # 2 % max acceptable slippage
    sufficient: bool = True
    reason: str = ""


def check_liquidity(
    liquidity_a: float,
    liquidity_b: float,
    recommended_size: float,
    max_fraction: float = 0.10,
) -> LiquidityCheck:
    """Validate that both platforms have enough liquidity.

    Rules:
    - Our position should not exceed max_fraction (10 %) of the
      available liquidity on either side.
    - Both platforms must have non-zero liquidity.

    Parameters
    ----------
    liquidity_a : total liquidity / open interest on platform A
    liquidity_b : total liquidity / open interest on platform B
    recommended_size : how much $ Stage 4 wants to deploy
    max_fraction : max % of platform liquidity we'll consume
    """
    issues: list[str] = []

    if liquidity_a <= 0:
        issues.append("Platform A has zero liquidity")
    if liquidity_b <= 0:
        issues.append("Platform B has zero liquidity")

    min_liquidity = min(liquidity_a, liquidity_b) if min(liquidity_a, liquidity_b) > 0 else 0

    if min_liquidity > 0 and recommended_size > min_liquidity * max_fraction:
        issues.append(
            f"Position ${recommended_size:.0f} exceeds {max_fraction*100:.0f}% "
            f"of min liquidity ${min_liquidity:.0f}"
        )

    return LiquidityCheck(
        platform_a_liquidity=liquidity_a,
        platform_b_liquidity=liquidity_b,
        required_size=recommended_size,
        sufficient=len(issues) == 0,
        reason="; ".join(issues) if issues else "OK",
    )


def adjust_size_for_liquidity(
    recommended_size: float,
    liquidity_a: float,
    liquidity_b: float,
    max_fraction: float = 0.10,
) -> float:
    """Scale down position size to fit available liquidity."""
    if liquidity_a <= 0 or liquidity_b <= 0:
        return 0.0
    max_allowed = min(liquidity_a, liquidity_b) * max_fraction
    return round(min(recommended_size, max_allowed), 2)
