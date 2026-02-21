import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
  }>;
}

export interface EmailProvider {
  sendEmail(options: EmailOptions): Promise<any>;
}

export class NodemailerProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;

  constructor(config: {
    host: string;
    port: number;
    secure?: boolean;
    auth: { user: string; pass: string };
  }) {
    this.transporter = nodemailer.createTransport(config);
  }

  async sendEmail(options: EmailOptions): Promise<any> {
    const mailOptions = {
      from: options.from || process.env.EMAIL_FROM,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    };
    return await this.transporter.sendMail(mailOptions);
  }
}

export class ResendProvider implements EmailProvider {
  private resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async sendEmail(options: EmailOptions): Promise<any> {
    const { data, error } = await this.resend.emails.send({
      from: options.from || process.env.RESEND_FROM || 'noreply@yourdomain.com',
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments?.map(a => ({
        filename: a.filename,
        content: a.content?.toString('base64'),
        path: a.path,
      })),
    });
    if (error) throw error;
    return data;
  }
}

export class EmailService {
  private provider: EmailProvider;

  constructor(provider: EmailProvider) {
    this.provider = provider;
  }

  async sendEmail(options: EmailOptions): Promise<any> {
    try {
      const result = await this.provider.sendEmail(options);
      console.log(`Email sent successfully to ${options.to}`);
      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
}

// Helper to create a configured email service based on environment
export function createEmailService(): EmailService {
  const providerType = process.env.EMAIL_PROVIDER || 'nodemailer';

  if (providerType === 'nodemailer') {
    const nodemailerConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };
    const provider = new NodemailerProvider(nodemailerConfig);
    return new EmailService(provider);
  } else if (providerType === 'resend') {
    const apiKey = process.env.RESEND_API_KEY || '';
    const provider = new ResendProvider(apiKey);
    return new EmailService(provider);
  } else {
    throw new Error(`Unknown email provider: ${providerType}`);
  }
}

export default EmailService;
