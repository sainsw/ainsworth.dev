import 'server-only';

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
      from: 'form@contact.ainsworth.dev',
      to: 's@ainsworth.dev',
      subject: 'New Message',
      html: `<p>Email: ${escapeHtml(email)}</p><p>Message: ${escapeHtml(message)}</p>`,
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || 'email delivery failed');
  }

  return data;
}
