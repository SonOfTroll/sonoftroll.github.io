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
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders
    });
  }

  let data;
  try {
    data = await req.json();
  } catch {
    return new Response("Invalid JSON", {
      status: 400,
      headers: corsHeaders
    });
  }

  const { email, message } = data;

  if (!email || !message) {
    return new Response("Missing fields", {
      status: 400,
      headers: corsHeaders
    });
  }

  // ===== CAPTURE IP (EDGE SAFE) =====
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  // ===== ISP / ASN LOOKUP =====
  let ispInfo = "Unavailable";
  try {
    const lookup = await fetch(`https://ipapi.co/${ip}/json/`);
    const info = await lookup.json();

    ispInfo = `
ISP: ${info.org || "N/A"}
ASN: ${info.asn || "N/A"}
Country: ${info.country_name || "N/A"}
City: ${info.city || "N/A"}
`;
  } catch {
    ispInfo = "Lookup failed";
  }

  // ===== SEND EMAIL VIA RESEND =====
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Good Grief <onboarding@resend.dev>",
      to: [process.env.RECEIVER_EMAIL],
      subject: "⚠️ Portfolio Contact Message",
      html: `
        <h3>New Contact Form Message</h3>
        <p><strong>Sender Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <pre>${message}</pre>
        <hr/>
        <p><strong>IP Address:</strong> ${ip}</p>
        <pre>${ispInfo}</pre>
      `
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("RESEND ERROR:", errText);

    return new Response("Email failed", {
      status: 500,
      headers: corsHeaders
    });
  }

  return new Response(
    JSON.stringify({ status: "success" }),
    {
      status: 200,
      headers: corsHeaders
    }
  );
}
