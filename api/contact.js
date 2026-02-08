export const config = {
  runtime: "edge"
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default async function handler(req) {
  // ✅ Handle preflight
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

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Portfolio <onboarding@resend.dev>",
      to: [process.env.RECEIVER_EMAIL],
      subject: "Portfolio Contact",
      html: `<p><b>${email}</b></p><p>${message}</p>`
    })
  });

  if (!res.ok) {
    return new Response("Email failed", {
      status: 500,
      headers: corsHeaders
    });
  }

  return new Response("Sent", {
    status: 200,
    headers: corsHeaders
  });
}
