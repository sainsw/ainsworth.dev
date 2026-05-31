'use server';

import { sql } from './postgres';
import { connection } from 'next/server';

export async function increment(slug: string) {
  if (!process.env.DATABASE_URL) {
    return;
  }

  try {
    await connection();
    await sql`
      INSERT INTO views (slug, count)
      VALUES (${slug}, 1)
      ON CONFLICT (slug)
      DO UPDATE SET count = views.count + 1
    `;
  } catch (error) {
    console.error('Failed to increment view count:', error);
    // Don't throw error - just log it so page doesn't crash
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendEmail(formData: FormData) {
  const entry = formData.get('message')?.toString() || '';
  const email = formData.get('email')?.toString() || '';
  const body = escapeHtml(entry.slice(0, 4000));
  const em = escapeHtml(email.slice(0, 100));

  const data = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'form@contact.ainsworth.dev',
      to: 's@ainsworth.dev',
      subject: 'New Message',
      html: `<p>Email: ${em}</p><p>Message: ${body}</p>`,
    }),
  });

  const response = await data.json();
  console.log('Email sent', response);

  if (response.statusCode > 0) {
    throw new Error(response.message);
  }

  return response;
}

async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error('Turnstile secret key not configured');
    return false;
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
      },
    );

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Turnstile verification failed:', error);
    return false;
  }
}

// Server action compatible with React useFormState API
export async function submitContact(
  _prevState: { success: boolean; message: string } | undefined,
  formData: FormData,
) {
  try {
    // Verify Turnstile token
    const turnstileToken = formData.get('cf-turnstile-response')?.toString();
    if (!turnstileToken) {
      return {
        success: false,
        message: 'please complete the verification challenge.',
      };
    }

    const isValid = await verifyTurnstileToken(turnstileToken);
    if (!isValid) {
      return {
        success: false,
        message: 'verification failed. please try again.',
      };
    }

    await sendEmail(formData);
    return { success: true, message: 'you sent me a message. nicely done!' };
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'something went wrong';
    const msg = `${reason.toLowerCase()}. how embarrassing.`;
    return { success: false, message: msg };
  }
}
