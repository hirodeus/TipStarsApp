"""
tipstars_prediction.py
======================

This module provides simple predictive tools to enhance the TipStars app.  It
implements a Poisson–based model for soccer match outcomes, calculates fair
decimal odds, and evaluates expected value (EV) of a bet given bookmaker odds.

The functions here are intended as a starting point for more advanced
analytics.  In practice you'd replace the hard‑coded offensive/defensive
strengths with estimates derived from historical match data (e.g. via ELO
ratings or regression models).  However, this module demonstrates the core
math behind probability‑based betting evaluation and can be integrated into
the existing FastAPI backend to replace the purely random bet generation.

Example usage::

    from tipstars_prediction import poisson_probabilities, fair_odds, expected_value

    # average goals for home and away teams (could come from historical data)
    lamb_home = 1.5
    lamb_away = 1.0

    probs = poisson_probabilities(lamb_home, lamb_away)
    print("Probabilities", probs)
    print("Fair odds", fair_odds(probs))

    bookmaker_odds = {"home": 2.0, "draw": 3.5, "away": 3.5}
    ev = expected_value(probs, bookmaker_odds)
    print("Expected values", ev)

"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Dict, Tuple


def poisson_probabilities(lambda_home: float, lambda_away: float, max_goals: int = 10) -> Dict[str, float]:
    """Compute probabilities of home win, draw and away win using a Poisson model.

    Args:
        lambda_home: expected goals scored by the home team.
        lambda_away: expected goals scored by the away team.
        max_goals: maximum number of goals to consider in the summation.  The
            default of 10 is usually sufficient because probabilities beyond
            this are negligible for typical football scores.

    Returns:
        A dictionary with keys ``"home"``, ``"draw"`` and ``"away"`` mapping to
        the probability of each outcome.
    """
    p_home = 0.0
    p_draw = 0.0
    p_away = 0.0

    # compute joint Poisson probabilities for goals scored by each team
    for home_goals in range(max_goals + 1):
        for away_goals in range(max_goals + 1):
            # probability that home team scores home_goals
            p_h = math.exp(-lambda_home) * (lambda_home ** home_goals) / math.factorial(home_goals)
            # probability that away team scores away_goals
            p_a = math.exp(-lambda_away) * (lambda_away ** away_goals) / math.factorial(away_goals)
            prob = p_h * p_a

            if home_goals > away_goals:
                p_home += prob
            elif home_goals < away_goals:
                p_away += prob
            else:
                p_draw += prob

    # normalise so they sum to 1 (in case of truncated tail)
    total = p_home + p_draw + p_away
    return {"home": p_home / total, "draw": p_draw / total, "away": p_away / total}


def fair_odds(probabilities: Dict[str, float]) -> Dict[str, float]:
    """Convert probabilities into fair decimal odds (without bookmaker margin).

    Args:
        probabilities: a dict mapping outcomes to probabilities.

    Returns:
        A dict mapping outcomes to decimal odds (1 / probability).
    """
    return {outcome: (1.0 / prob if prob > 0 else float("inf")) for outcome, prob in probabilities.items()}


def expected_value(probabilities: Dict[str, float], bookmaker_odds: Dict[str, float]) -> Dict[str, float]:
    """Calculate expected value of a $1 stake on each outcome.

    The expected value (EV) is computed as ``probability * odds − 1``.

    Args:
        probabilities: probabilities of outcomes (keys must match those in bookmaker_odds).
        bookmaker_odds: the odds offered by the bookmaker.

    Returns:
        A dict mapping outcomes to expected value per $1 stake.  A positive
        value indicates a bet with a mathematical edge.
    """
    evs: Dict[str, float] = {}
    for outcome, prob in probabilities.items():
        odds = bookmaker_odds.get(outcome)
        if odds is None:
            raise ValueError(f"Bookmaker odds missing for outcome '{outcome}'")
        evs[outcome] = prob * odds - 1.0
    return evs


def select_value_bets(
    probabilities: Dict[str, float],
    bookmaker_odds: Dict[str, float],
    threshold: float = 0.0,
    top_n: int | None = None,
) -> Dict[str, Tuple[float, float]]:
    """Identify bets with expected value above a given threshold.

    Args:
        probabilities: dict of event outcome probabilities.
        bookmaker_odds: dict of odds offered by bookmaker.
        threshold: only outcomes whose EV >= threshold will be returned.
        top_n: if provided, return only the top_n outcomes with highest EV.

    Returns:
        A dict mapping each qualifying outcome to a tuple ``(ev, fair_odds)``.
    """
    evs = expected_value(probabilities, bookmaker_odds)
    # compute fair odds once
    fair = fair_odds(probabilities)
    # filter by threshold
    filtered = {outcome: (ev, fair[outcome]) for outcome, ev in evs.items() if ev >= threshold}
    # sort by EV descending
    sorted_items = sorted(filtered.items(), key=lambda x: x[1][0], reverse=True)
    if top_n is not None:
        sorted_items = sorted_items[:top_n]
    return dict(sorted_items)


__all__ = [
    "poisson_probabilities",
    "fair_odds",
    "expected_value",
    "select_value_bets",
]
