import { resend } from './client';
import { EmailTemplate } from './templates';

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
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: template.subject,
      react: template.component, // If using React components
      html: template.html // If using HTML strings
    });

    if (error) {
      console.error('Failed to send email:', error);
      throw error;
    }

    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}