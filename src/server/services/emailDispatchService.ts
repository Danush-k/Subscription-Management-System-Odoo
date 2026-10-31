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
}): Promise<{ sent: boolean; channel?: string; messageId?: string; error?: string }> {
  try {
    const result = await sendBrevoEmail({
      to: params.to,
      toName: params.toName,
      subject: params.subject,
      htmlContent: params.htmlContent,
      attachments: params.attachment ? [params.attachment] : undefined,
    });

    if (!result.sent) {
      await prisma.auditLog.create({
        data: {
          action: "EMAIL_DELIVERY_FAILED",
          entityType: params.entityType,
          entityId: params.entityId,
          newValues: {
            to: params.to,
            subject: params.subject,
            error: result.error || "Email delivery failed",
            channel: result.channel,
          },
        },
      });

      return { sent: false, channel: result.channel, error: result.error };
    }

    // Record verified email delivery in AuditLog
    await prisma.auditLog.create({
      data: {
        action: "EMAIL_SENT",
        entityType: params.entityType,
        entityId: params.entityId,
        newValues: {
          to: params.to,
          toName: params.toName,
          subject: params.subject,
          channel: result.channel,
          messageId: result.messageId,
          attachmentName: params.attachment?.name,
          attachmentSize: params.attachment ? params.attachment.content.length : 0,
          deliveredAt: new Date().toISOString(),
          status: "DELIVERED",
        },
      },
    });

    return { sent: true, channel: result.channel, messageId: result.messageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email delivery failed";
    console.error("[Email Delivery Error]:", message);

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
