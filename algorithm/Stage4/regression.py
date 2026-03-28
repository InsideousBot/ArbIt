"""Regression model for predicting spread convergence.

Given a historical time-series of spreads between two matched markets,
we train a simple model to predict whether the current spread will
converge (shrink toward zero) within a lookahead window.

Features used:
    1. current_spread          — the spread right now
    2. mean_spread             — rolling mean of recent spreads
    3. spread_velocity         — rate of change (first derivative)
    4. spread_volatility       — rolling std-dev
    5. volume_ratio            — relative activity on the two platforms
    6. time_to_close_days      — days until market resolution
    7. spread_z_score          — how unusual the current spread is
    8. max_spread_lookback     — max spread in the lookback window

Target: binary — did the spread shrink by ≥50 % within the next N hours?
"""

from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime, timedelta

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from loguru import logger

from backend.common.config import LOOKBACK_DAYS


# ── Feature extraction ───────────────────────────────────────────────

@dataclass
class SpreadFeatures:
    current_spread: float
    mean_spread: float
    spread_velocity: float
    spread_volatility: float
    volume_ratio: float
    time_to_close_days: float
    spread_z_score: float
    max_spread_lookback: float

    def to_array(self) -> np.ndarray:
        return np.array([
            self.current_spread,
            self.mean_spread,
            self.spread_velocity,
            self.spread_volatility,
            self.volume_ratio,
            self.time_to_close_days,
            self.spread_z_score,
            self.max_spread_lookback,
        ]).reshape(1, -1)


def extract_features(
    spread_series: np.ndarray,
    timestamps: np.ndarray | list[datetime],
    volume_a: float,
    volume_b: float,
    close_date: datetime | None,
    lookback: int = LOOKBACK_DAYS,
) -> SpreadFeatures:
    """Build the feature vector from raw spread history.

    Parameters
    ----------
    spread_series : 1-D array of historical spread values (oldest → newest)
    timestamps    : corresponding datetime objects
    volume_a/b    : recent 24 h volume on each platform
    close_date    : when the market resolves (None → use 365 days)
    """
    if len(spread_series) < 3:
        # Not enough data — return neutral features
        return SpreadFeatures(
            current_spread=float(spread_series[-1]) if len(spread_series) else 0.0,
            mean_spread=float(np.mean(spread_series)) if len(spread_series) else 0.0,
            spread_velocity=0.0,
            spread_volatility=0.01,
            volume_ratio=1.0,
            time_to_close_days=365.0,
            spread_z_score=0.0,
            max_spread_lookback=float(np.max(np.abs(spread_series))) if len(spread_series) else 0.0,
        )

    current = float(spread_series[-1])
    mean = float(np.mean(spread_series))
    std = float(np.std(spread_series)) or 0.01

    # Velocity: average change per step over the last 5 observations
    recent = spread_series[-min(5, len(spread_series)):]
    velocity = float(np.mean(np.diff(recent))) if len(recent) > 1 else 0.0

    # Volume ratio (clamped)
    vr = (volume_a / volume_b) if volume_b > 0 else 10.0
    vr = min(vr, 10.0)

    # Time to close
    if close_date and isinstance(timestamps[-1], datetime):
        ttc = (close_date - datetime.utcnow()).total_seconds() / 86400
        ttc = max(ttc, 0.0)
    else:
        ttc = 365.0

    z = (current - mean) / std

    return SpreadFeatures(
        current_spread=current,
        mean_spread=mean,
        spread_velocity=velocity,
        spread_volatility=std,
        volume_ratio=round(vr, 4),
        time_to_close_days=round(ttc, 2),
        spread_z_score=round(z, 4),
        max_spread_lookback=float(np.max(np.abs(spread_series))),
    )


# ── Model ────────────────────────────────────────────────────────────

class SpreadConvergenceModel:
    """Logistic regression that predicts P(spread converges within window).

    In production you'd persist this with joblib.  Here we support both
    training from historical data and a heuristic fallback when no
    training data is available.
    """

    def __init__(self):
        self.model = LogisticRegression(max_iter=1000, C=1.0)
        self.scaler = StandardScaler()
        self._is_fitted = False

    # ── Training ─────────────────────────────────────────────────────
    def fit(self, X: np.ndarray, y: np.ndarray):
        """Train on historical feature / label pairs.

        X : (N, 8) feature matrix
        y : (N,)   binary labels — 1 if spread converged
        """
        if len(X) < 10:
            logger.warning("Too few samples to train regression — using heuristic")
            return
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        self._is_fitted = True
        logger.info(f"Convergence model fitted on {len(X)} samples, "
                     f"train accuracy = {self.model.score(X_scaled, y):.3f}")

    # ── Prediction ───────────────────────────────────────────────────
    def predict_convergence_prob(self, features: SpreadFeatures) -> float:
        """Return P(spread converges) ∈ [0, 1]."""
        if self._is_fitted:
            X = self.scaler.transform(features.to_array())
            return float(self.model.predict_proba(X)[0, 1])
        return self._heuristic(features)

    @staticmethod
    def _heuristic(f: SpreadFeatures) -> float:
        """Rule-based fallback when we have no trained model.

        Intuition:
        - Large spreads are more likely to converge (mean-reversion).
        - High z-scores signal anomalous spread → likely to revert.
        - Negative velocity means the spread is already shrinking.
        - More time to close = more opportunity for convergence.
        """
        score = 0.5  # base

        # Spread magnitude effect (bigger spread → more room to converge)
        if f.current_spread > 0.10:
            score += 0.15
        elif f.current_spread > 0.05:
            score += 0.08

        # Z-score effect (anomalous spread → likely to revert)
        if abs(f.spread_z_score) > 2.0:
            score += 0.12
        elif abs(f.spread_z_score) > 1.0:
            score += 0.06

        # Velocity effect (already converging?)
        if f.spread_velocity < -0.005:
            score += 0.10
        elif f.spread_velocity > 0.005:
            score -= 0.08

        # Time to close effect
        if f.time_to_close_days < 7:
            score += 0.05  # tight deadline forces convergence
        elif f.time_to_close_days > 180:
            score -= 0.05

        # Volume balance (balanced volume = better price discovery)
        if 0.3 <= f.volume_ratio <= 3.0:
            score += 0.05

        return round(max(0.01, min(0.99, score)), 4)


# ── Labelling helper for building training data ──────────────────────

def label_convergence(
    spread_series: np.ndarray,
    lookahead: int = 24,
    threshold_pct: float = 0.50,
) -> np.ndarray:
    """Generate binary labels from spread history.

    For each time step t, label = 1 if the spread at t + lookahead
    is ≤ (1 − threshold_pct) × spread[t].

    Parameters
    ----------
    spread_series : 1-D array of spreads
    lookahead     : number of time steps to look forward
    threshold_pct : fraction by which spread must shrink (0.50 = 50 %)

    Returns
    -------
    labels : 1-D array of length len(spread_series) − lookahead
    """
    n = len(spread_series) - lookahead
    labels = np.zeros(n, dtype=int)
    for i in range(n):
        current = abs(spread_series[i])
        future = abs(spread_series[i + lookahead])
        if current > 0 and future <= current * (1 - threshold_pct):
            labels[i] = 1
    return labels
