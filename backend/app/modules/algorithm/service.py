from datetime import datetime, timezone
from typing import List

from app.modules.algorithm.schemas import AlgorithmLogEntry, AlgorithmSummary


def get_algorithm_summary() -> AlgorithmSummary:
    return AlgorithmSummary(
        objective="Maintain observables above utility cutoff with minimal interventions",
        status="stable",
        version="0.1.0",
    )


def list_algorithm_logs() -> List[AlgorithmLogEntry]:
    now = datetime.now(timezone.utc).isoformat()
    return [
        AlgorithmLogEntry(id=1, level="INFO", message="Optimizer idle", timestamp=now),
        AlgorithmLogEntry(
            id=2,
            level="INFO",
            message="Monitoring utility drift across observables",
            timestamp=now,
        ),
    ]
