import os
import re
import smtplib
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, request, jsonify

app = Flask(__name__)

EMAIL_USER = os.environ.get("EMAIL_USER")
EMAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD")
RECEIVER_EMAIL = os.environ.get("RECEIVER_EMAIL")

EMAIL_MAX_LENGTH = 254
MESSAGE_MIN_LENGTH = 10
MESSAGE_MAX_LENGTH = 2000


def validate_email(email):
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


@app.route("/", methods=["POST"])
def contact():
    data = request.get_json() or {}

    email = data.get("email", "").strip()[:EMAIL_MAX_LENGTH]
    message = data.get("message", "").strip()[:MESSAGE_MAX_LENGTH]

    if not validate_email(email):
        return jsonify({"status": "error", "message": "Invalid email"}), 400

    if len(message) < MESSAGE_MIN_LENGTH:
        return jsonify({"status": "error", "message": "Message too short"}), 400

    msg = MIMEMultipart()
    msg["Subject"] = "[Portfolio Contact]"
    msg["From"] = EMAIL_USER
    msg["To"] = RECEIVER_EMAIL

    body = f"""
Sender: {email}

Message:
{message}

Time: {datetime.utcnow()} UTC
"""
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_USER, RECEIVER_EMAIL, msg.as_string())
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": "SMTP failure"}), 500
