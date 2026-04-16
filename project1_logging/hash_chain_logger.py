"""Tamper-evident logging system using hash chaining.

Each log entry includes:
- timestamp
- event_type
- description
- previous_hash
- current_hash

The chain allows detection of tampering, deletion, and reordering.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Tuple


@dataclass
class LogEntry:
    """Represents one immutable log entry in the chain."""

    timestamp: str
    event_type: str
    description: str
    previous_hash: str
    current_hash: str


class TamperEvidentLogger:
    """Hash-chained logger with persistence to JSON.

    Notes on scalability:
    - Loading/writing JSON keeps implementation simple for mini-project use.
    - Design separates hashing, storage, and verification logic so the storage
      backend can be swapped for SQLite/PostgreSQL later.
    """

    GENESIS_HASH = "0" * 64

    def __init__(self, storage_file: str = "logs.json") -> None:
        self.storage_path = Path(storage_file)
        self._ensure_storage_exists()

    def _ensure_storage_exists(self) -> None:
        """Create an empty JSON array file if it doesn't exist yet."""
        if not self.storage_path.exists():
            self.storage_path.write_text("[]", encoding="utf-8")

    def _load_entries(self) -> List[LogEntry]:
        """Read log entries from disk with basic error handling."""
        try:
            raw = json.loads(self.storage_path.read_text(encoding="utf-8"))
            return [LogEntry(**item) for item in raw]
        except json.JSONDecodeError as exc:
            raise ValueError(
                f"Storage file {self.storage_path} contains invalid JSON"
            ) from exc
        except TypeError as exc:
            raise ValueError(
                "Storage file has invalid log entry schema; expected keys: "
                "timestamp, event_type, description, previous_hash, current_hash"
            ) from exc

    def _save_entries(self, entries: List[LogEntry]) -> None:
        """Persist entries atomically-ish (single write for mini-project)."""
        payload = [asdict(entry) for entry in entries]
        self.storage_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    @staticmethod
    def _compute_hash(
        timestamp: str, event_type: str, description: str, previous_hash: str
    ) -> str:
        """Generate SHA-256 digest for the log payload and chain link."""
        digest = hashlib.sha256()
        digest.update(f"{timestamp}|{event_type}|{description}|{previous_hash}".encode("utf-8"))
        return digest.hexdigest()

    def add_log(self, event_type: str, description: str) -> LogEntry:
        """Append a new log record and return it."""
        if not event_type.strip():
            raise ValueError("event_type cannot be empty")
        if not description.strip():
            raise ValueError("description cannot be empty")

        entries = self._load_entries()
        previous_hash = entries[-1].current_hash if entries else self.GENESIS_HASH
        timestamp = datetime.now(timezone.utc).isoformat()
        current_hash = self._compute_hash(timestamp, event_type.strip(), description.strip(), previous_hash)

        entry = LogEntry(
            timestamp=timestamp,
            event_type=event_type.strip(),
            description=description.strip(),
            previous_hash=previous_hash,
            current_hash=current_hash,
        )
        entries.append(entry)
        self._save_entries(entries)
        return entry

    def verify_logs(self) -> Tuple[bool, str]:
        """Verify chain integrity.

        Returns:
            (True, message) if valid
            (False, message) if tampering/deletion/reordering detected, with index.
        """
        entries = self._load_entries()

        previous_hash = self.GENESIS_HASH
        for index, entry in enumerate(entries):
            # Detect link manipulation, deletion, or reordering.
            if entry.previous_hash != previous_hash:
                return (
                    False,
                    (
                        f"Integrity check failed at index {index}: previous_hash "
                        f"mismatch (expected {previous_hash}, got {entry.previous_hash})"
                    ),
                )

            expected_current = self._compute_hash(
                entry.timestamp, entry.event_type, entry.description, entry.previous_hash
            )
            if entry.current_hash != expected_current:
                return (
                    False,
                    (
                        f"Integrity check failed at index {index}: current_hash "
                        "does not match recalculated value"
                    ),
                )

            previous_hash = entry.current_hash

        return True, f"Integrity verified. {len(entries)} log entries are intact."

    def view_logs(self) -> List[LogEntry]:
        """Return all log entries."""
        return self._load_entries()
