import { resend } from './client';
import { EmailTemplate } from './templates';
import nodemailer from 'nodemailer';

// Create nodemailer transporter
const nodemailerTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  from = process.env.RESEND_FROM || 'EmotiTutor AI <no-reply@your-domain.com>',
  template
}: {
  to: string;
  from?: string;
  template: EmailTemplate;
}) {
  try {
    // First attempt with Resend
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: template.subject,
      react: template.component,
      html: template.html
    });

    if (error) {
      throw error;
    }

    return { success: true, messageId: data.id, provider: 'resend' };
  } catch (resendError) {
    console.warn('Resend delivery failed, attempting Nodemailer fallback:', resendError);

    try {
      // Fallback to Nodemailer
      const info = await nodemailerTransport.sendMail({
        from,
        to,
        subject: template.subject,
        html: template.html,
      });

      return { success: true, messageId: info.messageId, provider: 'nodemailer' };
    } catch (nodemailerError) {
      console.error('Both email delivery attempts failed:', {
        resendError,
        nodemailerError
      });
      throw new Error('Email delivery failed with both providers');
    }
  }
}