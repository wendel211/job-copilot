import nodemailer from "nodemailer";

export class SmtpEmailStrategy {
  private transporter;

  constructor(provider: {
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpUser: string;
    smtpPassEnc: string;
    fromEmail: string;
    fromName: string;
  }) {
    this.transporter = nodemailer.createTransport({
      host: provider.smtpHost,
      port: provider.smtpPort,
      secure: provider.smtpSecure,
      auth: {
        user: provider.smtpUser,
        pass: provider.smtpPassEnc,
      },
    });
  }

  async send(params: {
    toEmail: string;
    subject: string;
    bodyText: string;
    fromEmail: string;
    fromName: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      await this.transporter.sendMail({
        from: `"${params.fromName}" <${params.fromEmail}>`,
        to: params.toEmail,
        subject: params.subject,
        text: params.bodyText,
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
