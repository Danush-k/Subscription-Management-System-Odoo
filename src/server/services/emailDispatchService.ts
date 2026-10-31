import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "./brevoService";

export async function dispatchEmail(params: {
  to: string;
  toName: string;
  subject: string;
  htmlContent: string;
  entityType: string;
  entityId: string;
  attachment?: { name: string; content: Buffer };
}): Promise<{ sent: boolean; error?: string }> {
  try {
    const sent = await sendBrevoEmail({
      to: params.to,
      toName: params.toName,
      subject: params.subject,
      htmlContent: params.htmlContent,
      attachments: params.attachment ? [params.attachment] : undefined,
    });
    await prisma.auditLog.create({
      data: {
        action: sent ? "EMAIL_SENT" : "EMAIL_SKIPPED_NOT_CONFIGURED",
        entityType: params.entityType,
        entityId: params.entityId,
        newValues: { to: params.to, subject: params.subject, sent },
      },
    });
    return { sent };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email delivery failure";
    await prisma.auditLog.create({
      data: {
        action: "EMAIL_DELIVERY_FAILED",
        entityType: params.entityType,
        entityId: params.entityId,
        newValues: { to: params.to, subject: params.subject, error: message },
      },
    });
    return { sent: false, error: message };
  }
}
