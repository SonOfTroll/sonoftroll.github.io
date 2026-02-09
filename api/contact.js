export const config = {
  runtime: "edge"
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default async function handler(req) {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
  }

  const { email, message } = body;
  if (!email || !message) {
    return new Response("Missing fields", { status: 400, headers: corsHeaders });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return new Response("Telegram env vars missing", {
      status: 500,
      headers: corsHeaders
    });
  }

  // Extract IP + UA
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const ua = req.headers.get("user-agent") || "unknown";

  const text = `
📩 *Portfolio Contact*

👤 Email: ${email}
💬 Message:
${message}

🌍 IP: ${ip}
🧭 UA: ${ua}
`.trim();

  const tgRes = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown"
      })
    }
  );

  if (!tgRes.ok) {
    return new Response("Telegram failed", {
      status: 500,
      headers: corsHeaders
    });
  }

  return new Response(
    JSON.stringify({ status: "success" }),
    { status: 200, headers: corsHeaders }
  );
}
