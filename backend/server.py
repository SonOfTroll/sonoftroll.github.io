"""
Kishan Pandey — Portfolio Contact API
Lightweight Flask backend for contact form submissions.
Uses Gmail SMTP for email delivery.
"""

import os
import re
import smtplib
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from time import time

from flask import Flask, request, jsonify
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# ========== Configuration ==========
RECEIVER_EMAIL = os.getenv("RECEIVER_EMAIL", "progb4atys@gmail.com")
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

# Validation limits
MESSAGE_MIN_LENGTH = 10
MESSAGE_MAX_LENGTH = 2000
EMAIL_MAX_LENGTH = 254

# Rate limiting: max requests per window
RATE_LIMIT_REQUESTS = 5
RATE_LIMIT_WINDOW = 60  # seconds

# Spam protection: minimum seconds between submissions
SUBMISSION_COOLDOWN = 10

# In-memory store for rate limiting (use Redis in production)
_request_timestamps = []
_last_submission_time = 0


# ========== Security Helpers ==========


def sanitize_string(s: str, max_len: int) -> str:
    """Remove potentially harmful characters and truncate."""
    if not s or not isinstance(s, str):
        return ""
    # Strip whitespace, remove null bytes, limit length
    cleaned = s.strip().replace("\x00", "")[:max_len]
    return cleaned


def validate_email(email: str) -> bool:
    """Validate email format using regex."""
    if not email or len(email) > EMAIL_MAX_LENGTH:
        return False
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def rate_limit_exceeded() -> bool:
    """Check if rate limit is exceeded."""
    global _request_timestamps
    now = time()
    _request_timestamps = [t for t in _request_timestamps if now - t < RATE_LIMIT_WINDOW]
    if len(_request_timestamps) >= RATE_LIMIT_REQUESTS:
        return True
    _request_timestamps.append(now)
    return False


def cooldown_active() -> bool:
    """Check if submission cooldown is active."""
    global _last_submission_time
    now = time()
    if now - _last_submission_time < SUBMISSION_COOLDOWN:
        return True
    _last_submission_time = now
    return False


def add_cors_headers(response):
    """Add CORS headers. Allow portfolio domain and localhost for dev."""
    origin = request.headers.get("Origin", "")
    allowed = [
        "http://localhost:5000", "http://127.0.0.1:5000",
        "http://localhost:8765", "http://127.0.0.1:8765",
        "http://localhost:8080", "http://127.0.0.1:8080",
    ]
    if origin in allowed or origin.endswith(".github.io") or "localhost" in origin or "127.0.0.1" in origin:
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.after_request
def after_request(response):
    return add_cors_headers(response)


# ========== Email Sending ==========


def send_contact_email(sender_email: str, message_body: str) -> bool:
    """Send contact form email via Gmail SMTP."""
    if not EMAIL_USER or not EMAIL_PASSWORD:
        app.logger.error("EMAIL_USER or EMAIL_PASSWORD not set")
        return False

    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    msg = MIMEMultipart()
    msg["Subject"] = "[Portfolio Contact] New Message Received"
    msg["From"] = EMAIL_USER
    msg["To"] = RECEIVER_EMAIL

    body = f"""Portfolio Contact Form Submission
────────────────────────────────────

Sender Email: {sender_email}

Message:
{message_body}

────────────────────────────────────
Timestamp: {timestamp}
"""
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_USER, RECEIVER_EMAIL, msg.as_string())
        return True
    except smtplib.SMTPException as e:
        app.logger.error(f"SMTP error: {e}")
        return False


# ========== API Routes ==========


@app.route("/api/contact", methods=["POST", "OPTIONS"])
def contact():
    """
    POST /api/contact
    Body: { "email": "...", "message": "..." }
    Sends email to operator and returns JSON response.
    """
    if request.method == "OPTIONS":
        return "", 204

    origin = request.headers.get("Origin", "")

    # Rate limiting
    if rate_limit_exceeded():
        return jsonify({
            "status": "error",
            "message": "Too many requests. Please try again later."
        }), 429

    # Spam cooldown
    if cooldown_active():
        return jsonify({
            "status": "error",
            "message": "Please wait before sending another message."
        }), 429

    # Parse JSON
    try:
        data = request.get_json()
    except Exception:
        return jsonify({"status": "error", "message": "Invalid request body"}), 400

    if not data:
        return jsonify({"status": "error", "message": "Invalid request body"}), 400

    email = sanitize_string(data.get("email", ""), EMAIL_MAX_LENGTH)
    message = sanitize_string(data.get("message", ""), MESSAGE_MAX_LENGTH)

    # Validate email
    if not validate_email(email):
        return jsonify({"status": "error", "message": "Invalid email address"}), 400

    # Validate message length
    if len(message) < MESSAGE_MIN_LENGTH:
        return jsonify({
            "status": "error",
            "message": f"Message must be at least {MESSAGE_MIN_LENGTH} characters"
        }), 400

    if len(message) > MESSAGE_MAX_LENGTH:
        return jsonify({
            "status": "error",
            "message": f"Message must be at most {MESSAGE_MAX_LENGTH} characters"
        }), 400

    # Send email
    if send_contact_email(email, message):
        return jsonify({
            "status": "success",
            "message": "Message sent successfully"
        }), 200
    else:
        return jsonify({
            "status": "error",
            "message": "Failed to send message"
        }), 500


# ========== Run ==========


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
