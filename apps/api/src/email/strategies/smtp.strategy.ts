import nodemailer from "nodemailer";

export class SmtpEmailStrategy {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async send(params: {
    toEmail: string;
    subject: string;
    bodyText: string;
    fromName: string;
    fromEmail: string;
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
