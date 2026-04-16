"""Deception-based security honeypot (CLI).

This module emulates a login endpoint, records all attempts, and raises
alerts for suspicious behavior.
"""

from __future__ import annotations

import json
import random
from collections import defaultdict, deque
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Deque, Dict, List, Tuple


@dataclass
class LoginAttempt:
    timestamp: str
    username: str
    password: str
    ip: str
    status: str


class HoneypotSystem:
    """Fake login service for attacker observation and telemetry collection."""

    def __init__(self, log_file: str = "honeypot_logs.json") -> None:
        self.log_path = Path(log_file)
        self.credentials: Dict[str, str] = {
            "admin": "Winter2026!",
            "service": "svcAccount#1",
            "analyst": "BlueTeam@123",
        }
        # Sliding windows for suspicious behavior detection.
        self.failed_attempts_by_ip: Dict[str, Deque[str]] = defaultdict(deque)
        self._ensure_storage_exists()
        self._rebuild_behavior_state_from_logs()

    def _ensure_storage_exists(self) -> None:
        if not self.log_path.exists():
            self.log_path.write_text("[]", encoding="utf-8")

    def _load_attempts(self) -> List[LoginAttempt]:
        try:
            raw = json.loads(self.log_path.read_text(encoding="utf-8"))
            return [LoginAttempt(**item) for item in raw]
        except json.JSONDecodeError as exc:
            raise ValueError("Invalid honeypot log JSON file") from exc
        except TypeError as exc:
            raise ValueError("Invalid honeypot log schema") from exc

    def _save_attempts(self, attempts: List[LoginAttempt]) -> None:
        self.log_path.write_text(
            json.dumps([asdict(item) for item in attempts], indent=2), encoding="utf-8"
        )

    @staticmethod
    def _random_mock_ip() -> str:
        return ".".join(str(random.randint(1, 254)) for _ in range(4))

    def _rebuild_behavior_state_from_logs(self) -> None:
        """Warm in-memory detection state from persisted attempts."""
        for attempt in self._load_attempts():
            if attempt.status != "success":
                self.failed_attempts_by_ip[attempt.ip].append(attempt.timestamp)

    def _evaluate_suspicion(self, username: str, ip: str, status: str) -> List[str]:
        """Return alert messages for suspicious behavior patterns."""
        alerts: List[str] = []

        # Rule 1: attempted username does not exist in fake credential set.
        if username not in self.credentials:
            alerts.append(f"Unknown-user login attempt detected from {ip}: '{username}'")

        # Rule 2: repeated failures from same IP.
        if status != "success":
            history = self.failed_attempts_by_ip[ip]
            history.append(datetime.now(timezone.utc).isoformat())
            # Keep only recent fixed-size window for compact state.
            while len(history) > 10:
                history.popleft()
            if len(history) >= 3:
                alerts.append(
                    f"Brute-force pattern: {len(history)} failed attempts observed from {ip}"
                )

        return alerts

    def login(self, username: str, password: str, ip: str | None = None) -> Tuple[str, List[str]]:
        """Process a fake login request and return status + alerts."""
        if not username.strip() or not password.strip():
            raise ValueError("username and password are required")

        source_ip = ip or self._random_mock_ip()

        if username in self.credentials and self.credentials[username] == password:
            status = "success"
        elif username in self.credentials:
            status = "failed_bad_password"
        else:
            status = "failed_unknown_user"

        attempt = LoginAttempt(
            timestamp=datetime.now(timezone.utc).isoformat(),
            username=username.strip(),
            password=password,
            ip=source_ip,
            status=status,
        )

        attempts = self._load_attempts()
        attempts.append(attempt)
        self._save_attempts(attempts)

        alerts = self._evaluate_suspicion(attempt.username, source_ip, status)
        return status, alerts

    def view_logs(self) -> List[LoginAttempt]:
        return self._load_attempts()
