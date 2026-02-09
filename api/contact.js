export const config = {
  runtime: "edge"
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

// --- utils ---
async function sha256(input) {
  const enc = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(hash)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

function getIP(req) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function ipSubnet(ip) {
  if (!ip.includes(".")) return "unknown";
  const parts = ip.split(".");
  return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
}

export default async function handler(req) {
  // CORS preflight
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
    return new Response("Invalid JSON", {
      status: 400,
      headers: corsHeaders
    });
  }

  const { email, message, screen, timezone, locale, cores, memory } = body;

  if (!email || !message) {
    return new Response("Missing fields", {
      status: 400,
      headers: corsHeaders
    });
  }

  // --- headers ---
  const ua = req.headers.get("user-agent") || "unknown";
  const lang = req.headers.get("accept-language") || "unknown";
  const secFetch = req.headers.get("sec-fetch-site") || "unknown";
  const https = req.headers.get("x-forwarded-proto") === "https";

  // --- IP ---
  const ip = getIP(req);
  const subnet = ipSubnet(ip);

  // --- fingerprint ---
  const fingerprintSource = [
    ua,
    lang,
    timezone,
    locale,
    screen,
    cores,
    memory,
    subnet
  ].join("|");

  const fingerprint = "fp_" + await sha256(fingerprintSource);

  // --- TELEGRAM PAYLOAD ---
  const text = `
📨 New Portfolio Message

👤 Email:
${email}

💬 Message:
${message}

🧬 Fingerprint:
${fingerprint}

🌐 IP:
${ip}

🧱 Subnet:
${subnet}

🕰 Timezone:
${timezone}

🗣 Locale:
${locale}

🖥 Screen:
${screen}

⚙️ CPU Cores:
${cores}

💾 Device Memory:
${memory} GB

🧭 User-Agent:
${ua}

🔐 HTTPS:
${https}

🔏 Sec-Fetch-Site:
${secFetch}
`;

  const tgRes = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text
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
