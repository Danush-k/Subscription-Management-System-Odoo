import nodemailer from "nodemailer";

interface BrevoEmail {
  to: string;
  toName: string;
  subject: string;
  htmlContent: string;
  attachments?: Array<{ name: string; content: Buffer }>;
}

export async function sendBrevoEmail({
  to,
  toName,
  subject,
  htmlContent,
  attachments,
}: BrevoEmail): Promise<{ sent: boolean; channel: string; messageId?: string; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY || "";
  const senderEmail = process.env.FROM_EMAIL || "billing@brightloopsoftware.com";
  const senderName = process.env.FROM_NAME ?? "Brightloop Enterprise";

  // Check if an SMTP configuration or Brevo SMTP key is provided
  const smtpLogin = process.env.BREVO_SMTP_LOGIN || process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS || apiKey;
  const smtpHost = process.env.SMTP_HOST || "smtp-relay.brevo.com";
  const smtpPort = Number(process.env.SMTP_PORT) || 587;

  const isSmtpKey = apiKey.startsWith("xsmtpsib-");

  // MODE 1: Brevo REST API v3 (Preferred if xkeysib- or standard API key)
  if (apiKey && !isSmtpKey && !apiKey.startsWith("your-")) {
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        signal: AbortSignal.timeout(6000), // 6 second max network timeout to prevent hanging
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
          ...(attachments?.length
            ? {
                attachment: attachments.map((att) => ({
                  name: att.name,
                  content: att.content.toString("base64"),
                })),
              }
            : {}),
        }),
      });

      if (response.ok) {
        const result = (await response.json().catch(() => ({}))) as { messageId?: string };
        return {
          sent: true,
          channel: "BREVO_API_V3",
          messageId: result.messageId || `brevo_${Date.now()}`,
        };
      } else {
        const errText = await response.text();
        console.warn(`[Brevo REST API Failed] ${response.status}: ${errText}`);
        return {
          sent: false,
          channel: "BREVO_API_V3_FAILED",
          error: `Brevo API error ${response.status}: ${errText}`,
        };
      }
    } catch (err: any) {
      console.warn("[Brevo REST API Request Error]:", err.message);
      return {
        sent: false,
        channel: "BREVO_API_V3_ERROR",
        error: `Brevo request failed: ${err.message}`,
      };
    }
  }

  // MODE 2: Nodemailer with SMTP Relay (Brevo SMTP or Custom SMTP)
  if (smtpPass && (smtpLogin || isSmtpKey)) {
    const userToTry = smtpLogin || senderEmail;
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
        auth: {
          user: userToTry,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        to: `"${toName}" <${to}>`,
        subject,
        html: htmlContent,
        attachments: attachments?.map((att) => ({
          filename: att.name,
          content: att.content,
        })),
      });

      return {
        sent: true,
        channel: "SMTP_RELAY",
        messageId: info.messageId,
      };
    } catch (smtpErr: any) {
      console.warn("[SMTP Relay Delivery Error]:", smtpErr.message);
      return {
        sent: false,
        channel: "SMTP_RELAY_FAILED",
        error: `SMTP delivery failed: ${smtpErr.message}`,
      };
    }
  }

  // If apiKey is xsmtpsib- but no SMTP login username was provided
  if (isSmtpKey) {
    const errorMsg =
      "Brevo configuration error: The BREVO_API_KEY in .env is an SMTP key (starts with 'xsmtpsib-'). Brevo's REST API requires an API key (starts with 'xkeysib-').";
    return {
      sent: false,
      channel: "CONFIG_ERROR",
      error: errorMsg,
    };
  }

  return {
    sent: false,
    channel: "UNCONFIGURED",
    error: "No active email credentials configured in .env",
  };
}
