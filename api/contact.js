export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { email, message } = await req.json();

  if (!email || !message) {
    return new Response("Invalid input", { status: 400 });
  }

  // Example using Resend (works perfectly on Vercel)
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Portfolio <onboarding@resend.dev>",
      to: ["your@email.com"],
      subject: "Portfolio Contact",
      html: `<p><b>${email}</b></p><p>${message}</p>`
    })
  });

  if (!res.ok) {
    return new Response("Failed", { status: 500 });
  }

  return new Response("Sent", { status: 200 });
}
