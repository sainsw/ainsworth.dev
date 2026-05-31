import 'server-only';
import { SITE_AUTHOR_EMAIL, SITE_CONTACT_FROM } from '@/lib/site';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendContactEmail({
  message,
  email,
}: {
  message: string;
  email: string;
}) {
  const secret = process.env.RESEND_SECRET;
  if (!secret) {
    throw new Error('email delivery is not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: SITE_CONTACT_FROM,
      to: SITE_AUTHOR_EMAIL,
      subject: 'New Message',
      html: `<p>Email: ${escapeHtml(email)}</p><p>Message: ${escapeHtml(message)}</p>`,
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    console.error('Resend API error:', data?.message);
    throw new Error('email delivery failed');
  }

  return data;
}
