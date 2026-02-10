export const config = {
  runtime: "edge"
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

/* ================= EMAIL VALIDATION ================= */

function isValidEmailSyntax(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isAllowedGmailDomain(email) {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain === "gmail.com" || domain === "googlemail.com";
}

async function hasMXRecord(domain) {
  try {
    const res = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
    const data = await res.json();
    return Array.isArray(data.Answer) && data.Answer.length > 0;
  } catch {
    return false;
  }
}

/* ================= DEVICE DETECTION ================= */

function detectDevice(ua) {
  ua = ua.toLowerCase();
  if (ua.includes("android")) return "Android phone";
  if (ua.includes("iphone")) return "iPhone";
  if (ua.includes("ipad")) return "iPad";
  if (ua.includes("windows")) return "Windows desktop / laptop";
  if (ua.includes("linux")) return "Linux desktop / laptop";
  return "Unknown device";
}

/* ================= FINGERPRINT ================= */

async function generateFingerprint(input) {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = [...new Uint8Array(hashBuffer)];
  return "fp_" + hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join("");
}

/* ================= MAIN HANDLER ================= */

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

  const {
    email,
    message,
    screen,
    timezone,
    locale,
    cores,
    memory
  } = data;

  /* 🚫 EMAIL HARD BLOCK */
  if (!email || !message) {
    return new Response("Missing fields", { status: 400, headers: corsHeaders });
  }

  if (!isValidEmailSyntax(email)) {
    return new Response("Invalid email format", { status: 400, headers: corsHeaders });
  }

  if (!isAllowedGmailDomain(email)) {
    return new Response("Only Gmail allowed", { status: 403, headers: corsHeaders });
  }

  const domain = email.split("@")[1];
  if (!(await hasMXRecord(domain))) {
    return new Response("Email domain invalid", { status: 403, headers: corsHeaders });
  }

  /* ================= METADATA ================= */

  const ua = req.headers.get("user-agent") || "unknown";
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const device = detectDevice(ua);

  const fingerprint = await generateFingerprint(
    `${ua}|${locale}|${timezone}|${screen}|${cores}|${memory}`
  );

  /* ================= TELEGRAM ================= */

  const telegramText = `
Hey brother got a new message for you

Email:
${email}

Device:
${device}

Message:
${message}

Fingerprint:
${fingerprint}

IP:
${ip}

Timezone:
${timezone || "unknown"}

Locale:
${locale || "unknown"}

Screen:
${screen || "unknown"}

CPU Cores:
${cores ?? "unknown"}

Device Memory:
${memory ?? "unknown"} GB

User-Agent:
${ua}
`;

  const tgRes = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: telegramText
      })
    }
  );

  if (!tgRes.ok) {
    return new Response("Telegram failed", { status: 500, headers: corsHeaders });
  }

  return new Response("Sent", { status: 200, headers: corsHeaders });
}
