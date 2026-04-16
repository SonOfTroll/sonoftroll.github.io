# Cybersecurity Python Mini-Projects

This repository contains two runnable, security-focused Python mini-projects:

- `project1_logging`: Tamper-evident hash-chained logging system.
- `project2_honeypot`: Deception-based honeypot login monitor.

Both projects use only the Python standard library.

---

## Project 1: Tamper-Evident Logging System

### Features
- Hash-chained log entries with SHA-256.
- Each entry stores:
  - `timestamp`
  - `event_type`
  - `description`
  - `previous_hash`
  - `current_hash`
- Tamper detection for:
  - content modification
  - deletion
  - reordering
- CLI commands:
  - add log
  - view logs
  - verify integrity

### Run

```bash
python3 project1_logging/main.py add LOGIN_SUCCESS "User alice logged in"
python3 project1_logging/main.py add FILE_ACCESS "Read /etc/passwd"
python3 project1_logging/main.py view
python3 project1_logging/main.py verify
```

### Example output

```text
[+] Log added successfully
LogEntry(timestamp='2026-04-16T10:05:00.000000+00:00', event_type='LOGIN_SUCCESS', description='User alice logged in', previous_hash='0000...', current_hash='a1b2...')

#0 | 2026-04-16T10:05:00.000000+00:00 | LOGIN_SUCCESS | User alice logged in | prev=000000000000... | hash=a1b2c3d4e5f6...
#1 | 2026-04-16T10:05:08.000000+00:00 | FILE_ACCESS | Read /etc/passwd | prev=a1b2c3d4e5f6... | hash=f6e5d4c3b2a1...

[OK] Integrity verified. 2 log entries are intact.
```

---

## Project 2: Deception-Based Security System (Honeypot)

### Features
- Fake login system exposed via CLI.
- Fake credentials are intentionally stored inside the app.
- Every login attempt is logged with:
  - `timestamp`
  - `username`
  - `password`
  - `ip`
  - `status`
- Suspicious activity alerts:
  - unknown usernames
  - repeated failed attempts from the same IP
- Separate log file: `project2_honeypot/honeypot_logs.json`

### Run

```bash
python3 project2_honeypot/main.py login admin wrongpass --ip 10.10.10.7
python3 project2_honeypot/main.py login root toor --ip 10.10.10.7
python3 project2_honeypot/main.py login root toor --ip 10.10.10.7
python3 project2_honeypot/main.py login root toor --ip 10.10.10.7
python3 project2_honeypot/main.py logs
```

### Example output

```text
[LOGIN STATUS] failed_bad_password

[LOGIN STATUS] failed_unknown_user
[ALERT] Unknown-user login attempt detected from 10.10.10.7: 'root'

[LOGIN STATUS] failed_unknown_user
[ALERT] Unknown-user login attempt detected from 10.10.10.7: 'root'
[ALERT] Brute-force pattern: 3 failed attempts observed from 10.10.10.7
```

---

## Notes
- For demo realism, the honeypot logs attempted passwords in plaintext to emulate adversary telemetry collection.
- Do **not** reuse this behavior in production systems.
