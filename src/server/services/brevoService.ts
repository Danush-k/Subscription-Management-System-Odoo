interface BrevoEmail {
  to: string;
  toName: string;
  subject: string;
  htmlContent: string;
}

export async function sendBrevoEmail({ to, toName, subject, htmlContent }: BrevoEmail): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.FROM_EMAIL;
  const senderName = process.env.FROM_NAME ?? "Brightloop";

  if (!apiKey || !senderEmail) return false;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: to, name: toName }],
      subject,
      htmlContent,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Brevo email failed (${response.status}): ${detail}`);
  }

  return true;
}
