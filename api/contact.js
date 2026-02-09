export const config = {
  runtime: "edge"
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  let data;
  try {
    data = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
  }

  const { email, message } = data;
  if (!email || !message) {
    return new Response("Missing fields", { status: 400, headers: corsHeaders });
  }

  // 🔍 Capture metadata
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  const userAgent = req.headers.get("user-agent") || "unknown";
  const country = req.headers.get("cf-ipcountry") || "unknown";

  const text = `
📨 *Portfolio Contact*

✉️ *Email:* ${email}

💬 *Message:*
${message}

🌍 *IP:* ${ip}
🏳️ *Country:* ${country}
🖥️ *User-Agent:*
${userAgent}
`;

  const telegramRes = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: "Markdown"
      })
    }
  );

  if (!telegramRes.ok) {
    return new Response("Telegram send failed", {
      status: 500,
      headers: corsHeaders
    });
  }

  return new Response(
    JSON.stringify({ status: "success" }),
    { status: 200, headers: corsHeaders }
  );
}
