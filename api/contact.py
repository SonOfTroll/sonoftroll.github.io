import os
import re
import smtplib
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

EMAIL_USER = os.environ.get("EMAIL_USER")
EMAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD")
RECEIVER_EMAIL = os.environ.get("RECEIVER_EMAIL")

EMAIL_MAX_LENGTH = 254
MESSAGE_MIN_LENGTH = 10
MESSAGE_MAX_LENGTH = 2000


def validate_email(email):
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def handler(request):
    if request.method != "POST":
        return {
            "statusCode": 405,
            "body": "Method Not Allowed"
        }

    try:
        data = request.json or {}
    except Exception:
        return {
            "statusCode": 400,
            "body": "Invalid JSON"
        }

    email = (data.get("email") or "").strip()[:EMAIL_MAX_LENGTH]
    message = (data.get("message") or "").strip()[:MESSAGE_MAX_LENGTH]

    if not validate_email(email):
        return {
            "statusCode": 400,
            "body": "Invalid email"
        }

    if len(message) < MESSAGE_MIN_LENGTH:
        return {
            "statusCode": 400,
            "body": "Message too short"
        }

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
    except Exception as e:
        return {
            "statusCode": 500,
            "body": f"SMTP error: {str(e)}"
        }

    return {
        "statusCode": 200,
        "body": "Message sent"
    }
