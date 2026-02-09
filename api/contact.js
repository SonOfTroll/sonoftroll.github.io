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
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: corsHeaders }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400, headers: corsHeaders }
    );
  }

  const { email, message } = body;
  if (!email || !message) {
    return new Response(
      JSON.stringify({ error: "Missing fields" }),
      { status: 400, headers: corsHeaders }
    );
  }

  // ===== IP CAPTURE (EDGE SAFE) =====
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  const country =
    req.headers.get("x-vercel-ip-country") || "unknown";

  const asn =
    req.headers.get("x-vercel-ip-asn") || "unknown";

  // ===== SEND EMAIL =====
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: `Portfolio <${process.env.RESEND_FROM}>`,
      to: [process.env.RECEIVER_EMAIL],
      subject: "Portfolio Contact Message",
      html: `
        <h3>New Message</h3>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b></p>
        <pre>${message}</pre>
        <hr/>
        <p><b>IP:</b> ${ip}</p>
        <p><b>Country:</b> ${country}</p>
        <p><b>ASN:</b> ${asn}</p>
      `
    })
  });

  if (!res.ok) {
    return new Response(
      JSON.stringify({ status: "blocked" }),
      { status: 200, headers: corsHeaders }
    );
  }

  return new Response(
    JSON.stringify({ status: "success" }),
    { status: 200, headers: corsHeaders }
  );
}
