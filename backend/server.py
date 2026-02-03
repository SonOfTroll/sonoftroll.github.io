"""
Kishan Pandey — Portfolio Contact API & Frontend Server
-----------------------------------------------------
This script performs two main functions:
1. Serves the static website (index.html, CSS, JS) from the parent directory.
2. Provides a secure API endpoint (/api/contact) to send emails via Gmail SMTP.

Directory Assumption:
Portfolio/ (Root)
├── index.html
├── css/
├── js/
└── backend/
    └── server.py  <-- This file is here
"""

import os
import re
import smtplib
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from time import time

# IMPORTANT: Added 'send_from_directory' to serve HTML/CSS/JS files
from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ========== App Initialization ==========
# We set static_folder to '../' because index.html is one level up from this script.
# static_url_path='' ensures we don't need a /static/ prefix in our URLs.
app = Flask(__name__, static_folder='../', static_url_path='')

# ========== Configuration ==========
# Email settings loaded from environment variables for security
RECEIVER_EMAIL = os.getenv("RECEIVER_EMAIL", "progb4atys@gmail.com")
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

# Validation limits to prevent abuse
MESSAGE_MIN_LENGTH = 10
MESSAGE_MAX_LENGTH = 2000
EMAIL_MAX_LENGTH = 254

# Rate limiting settings
RATE_LIMIT_REQUESTS = 5    # Max 5 requests...
RATE_LIMIT_WINDOW = 60     # ...per 60 seconds

# Spam protection settings
SUBMISSION_COOLDOWN = 10   # Seconds a user must wait between messages

# In-memory store for tracking request times (Not persistent across restarts)
_request_timestamps = []
_last_submission_time = 0


# ========== Security Helpers ==========

def sanitize_string(s: str, max_len: int) -> str:
    """
    Cleans input strings to prevent injection or format issues.
    Removes null bytes and trims whitespace.
    """
    if not s or not isinstance(s, str):
        return ""
    # Strip whitespace, remove null bytes, limit length
    cleaned = s.strip().replace("\x00", "")[:max_len]
    return cleaned


def validate_email(email: str) -> bool:
    """
    Validates email format using strict regex pattern.
    Checks for standard user@domain.com structure.
    """
    if not email or len(email) > EMAIL_MAX_LENGTH:
        return False
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def rate_limit_exceeded() -> bool:
    """
    Checks if the global rate limit has been hit.
    Returns True if too many requests are coming in quickly.
    """
    global _request_timestamps
    now = time()
    # Filter out timestamps older than the window
    _request_timestamps = [t for t in _request_timestamps if now - t < RATE_LIMIT_WINDOW]
    
    if len(_request_timestamps) >= RATE_LIMIT_REQUESTS:
        return True
    
    _request_timestamps.append(now)
    return False


def cooldown_active() -> bool:
    """
    Checks if the specific user (session-based logic simplified here)
    is sending messages too fast.
    """
    global _last_submission_time
    now = time()
    if now - _last_submission_time < SUBMISSION_COOLDOWN:
        return True
    _last_submission_time = now
    return False


def add_cors_headers(response):
    """
    Adds headers to allow the frontend to talk to this backend.
    Required because modern browsers block cross-origin requests by default.
    """
    origin = request.headers.get("Origin", "")
    allowed_domains = [
        "http://localhost:5000", "http://127.0.0.1:5000",
        "http://localhost:8765", "http://127.0.0.1:8765",
        "http://localhost:8080", "http://127.0.0.1:8080",
        # Add your Render domain here if needed explicitly, though wildcards cover it
    ]
    
    # Allow local development and GitHub Pages/Render domains
    if (origin in allowed_domains or 
        origin.endswith(".github.io") or 
        origin.endswith(".onrender.com") or
        "localhost" in origin or 
        "127.0.0.1" in origin):
        response.headers["Access-Control-Allow-Origin"] = origin
        
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS, GET"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.after_request
def after_request(response):
    """Applies the CORS headers to every response sent back."""
    return add_cors_headers(response)


# ========== Email Sending Function ==========

def send_contact_email(sender_email: str, message_body: str) -> bool:
    """
    Connects to Gmail's SMTP server securely (SSL) and sends the email.
    Returns True if successful, False if it fails.
    """
    if not EMAIL_USER or not EMAIL_PASSWORD:
        app.logger.error("Error: EMAIL_USER or EMAIL_PASSWORD environment variables not set.")
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
        # Connect to Gmail SMTP (Port 465 is for SSL)
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_USER, RECEIVER_EMAIL, msg.as_string())
        return True
    except smtplib.SMTPException as e:
        app.logger.error(f"SMTP error occurred: {e}")
        return False


# ========== FRONTEND SERVING ROUTES (NEW) ==========

@app.route('/')
def serve_index():
    """
    Serves the 'index.html' file from the parent directory.
    This makes the website load when you visit the root URL.
    """
    return send_from_directory('../', 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    """
    Serves all other files (like style.css, main.js, images) 
    from the parent directory.
    """
    return send_from_directory('../', path)


# ========== API ROUTES ==========

@app.route("/api/contact", methods=["POST", "OPTIONS"])
def contact():
    """
    API Endpoint: POST /api/contact
    Accepts JSON: { "email": "...", "message": "..." }
    """
    # Handle preflight CORS check
    if request.method == "OPTIONS":
        return "", 204

    # 1. Check Rate Limits
    if rate_limit_exceeded():
        return jsonify({
            "status": "error",
            "message": "Too many requests. Please try again later."
        }), 429

    if cooldown_active():
        return jsonify({
            "status": "error",
            "message": "Please wait a few seconds before sending another message."
        }), 429

    # 2. Parse Data
    try:
        data = request.get_json()
    except Exception:
        return jsonify({"status": "error", "message": "Invalid request body"}), 400

    if not data:
        return jsonify({"status": "error", "message": "No data provided"}), 400

    # 3. Sanitize Inputs
    email = sanitize_string(data.get("email", ""), EMAIL_MAX_LENGTH)
    message = sanitize_string(data.get("message", ""), MESSAGE_MAX_LENGTH)

    # 4. Validate Logic
    if not validate_email(email):
        return jsonify({"status": "error", "message": "Invalid email address format"}), 400

    if len(message) < MESSAGE_MIN_LENGTH:
        return jsonify({
            "status": "error",
            "message": f"Message must be at least {MESSAGE_MIN_LENGTH} characters long"
        }), 400

    if len(message) > MESSAGE_MAX_LENGTH:
        return jsonify({
            "status": "error",
            "message": f"Message is too long (Max {MESSAGE_MAX_LENGTH} characters)"
        }), 400

    # 5. Send Email
    if send_contact_email(email, message):
        return jsonify({
            "status": "success",
            "message": "Message sent successfully!"
        }), 200
    else:
        return jsonify({
            "status": "error",
            "message": "Server error: Failed to send email."
        }), 500


# ========== Application Entry Point ==========

if __name__ == "__main__":
    # Host='0.0.0.0' makes the server accessible externally (required for Docker/Render)
    app.run(host="0.0.0.0", port=5000, debug=False)
