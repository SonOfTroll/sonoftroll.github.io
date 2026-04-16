"""CLI entrypoint for deception-based honeypot login simulator."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from honeypot import HoneypotSystem


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Honeypot security CLI")
    parser.add_argument(
        "--log-file",
        default=str(Path(__file__).with_name("honeypot_logs.json")),
        help="Path to honeypot logs JSON",
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    login_parser = subparsers.add_parser("login", help="Simulate login attempt")
    login_parser.add_argument("username", help="Attempted username")
    login_parser.add_argument("password", help="Attempted password")
    login_parser.add_argument("--ip", help="Source IP (optional mock IP if omitted)")

    subparsers.add_parser("logs", help="Display all captured honeypot attempts")

    interactive_parser = subparsers.add_parser("interactive", help="Run interactive fake login prompt")
    interactive_parser.add_argument("--ip", help="Fixed IP for the interactive session")

    return parser


def run_interactive(honeypot: HoneypotSystem, fixed_ip: str | None) -> int:
    print("Honeypot interactive mode. Type 'exit' to quit.")
    while True:
        username = input("username: ").strip()
        if username.lower() == "exit":
            return 0

        password = input("password: ").strip()
        if password.lower() == "exit":
            return 0

        try:
            status, alerts = honeypot.login(username, password, ip=fixed_ip)
            print(f"[LOGIN STATUS] {status}")
            for alert in alerts:
                print(f"[ALERT] {alert}")
        except ValueError as exc:
            print(f"[ERROR] {exc}")


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    honeypot = HoneypotSystem(args.log_file)

    try:
        if args.command == "login":
            status, alerts = honeypot.login(args.username, args.password, ip=args.ip)
            print(f"[LOGIN STATUS] {status}")
            for alert in alerts:
                print(f"[ALERT] {alert}")
        elif args.command == "logs":
            for idx, entry in enumerate(honeypot.view_logs()):
                print(
                    f"#{idx} | {entry.timestamp} | user={entry.username} | "
                    f"pass={entry.password} | ip={entry.ip} | status={entry.status}"
                )
        elif args.command == "interactive":
            return run_interactive(honeypot, args.ip)
    except ValueError as exc:
        print(f"[ERROR] {exc}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
