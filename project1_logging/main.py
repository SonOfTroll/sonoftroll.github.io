"""CLI for tamper-evident logging system."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from hash_chain_logger import TamperEvidentLogger


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Tamper-evident logging CLI")
    parser.add_argument(
        "--storage",
        default=str(Path(__file__).with_name("logs.json")),
        help="Path to JSON storage file (default: project1_logging/logs.json)",
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    add_parser = subparsers.add_parser("add", help="Add a log entry")
    add_parser.add_argument("event_type", help="Type/category of event")
    add_parser.add_argument("description", help="Event details")

    subparsers.add_parser("view", help="View all logs")
    subparsers.add_parser("verify", help="Verify integrity")

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    logger = TamperEvidentLogger(args.storage)

    try:
        if args.command == "add":
            entry = logger.add_log(args.event_type, args.description)
            print("[+] Log added successfully")
            print(entry)
        elif args.command == "view":
            logs = logger.view_logs()
            if not logs:
                print("No logs found.")
                return 0
            for idx, entry in enumerate(logs):
                print(
                    f"#{idx} | {entry.timestamp} | {entry.event_type} | "
                    f"{entry.description} | prev={entry.previous_hash[:12]}... | "
                    f"hash={entry.current_hash[:12]}..."
                )
        elif args.command == "verify":
            ok, message = logger.verify_logs()
            print("[OK]" if ok else "[ALERT]", message)
            return 0 if ok else 2
    except ValueError as exc:
        print(f"[ERROR] {exc}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
