# Portfolio Contact API

Lightweight Flask backend for contact form submissions. Sends emails via Gmail SMTP.

## Setup

1. **Create virtual environment (recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   - `EMAIL_USER` — Your Gmail address
   - `EMAIL_PASSWORD` — Gmail App Password ([create one](https://support.google.com/accounts/answer/185833))
   - `RECEIVER_EMAIL` — Where to receive messages (default: progb4atys@gmail.com)

## Run

```bash
python server.py
```

Backend runs at **http://localhost:5000**

## API

**POST /api/contact**

```json
{
  "email": "visitor@example.com",
  "message": "Hello, I'd like to connect..."
}
```

**Success (200):**
```json
{
  "status": "success",
  "message": "Message sent successfully"
}
```

**Error (4xx/5xx):**
```json
{
  "status": "error",
  "message": "Error description"
}
```

## Development

Run frontend and backend together:

1. Terminal 1 — Backend:
   ```bash
   cd backend && python server.py
   ```

2. Terminal 2 — Frontend (static files):
   ```bash
   python -m http.server 8765
   ```
   Open http://localhost:8765

## Security

- Rate limiting: 5 requests per 60 seconds
- Spam cooldown: 10 seconds between submissions
- Input sanitization and validation
- CORS restricted to localhost and portfolio domain
