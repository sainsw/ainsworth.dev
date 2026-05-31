'use server';

import { cookies } from 'next/headers';

const CONTACT_COOLDOWN_SECONDS = 60;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function validateContactForm(formData: FormData) {
  const message = formData.get('message')?.toString().trim() ?? '';
  const email = formData.get('email')?.toString().trim() ?? '';

  if (!message) {
    throw new Error('please enter a message');
  }
  if (message.length > 4000) {
    throw new Error('please keep your message under 4000 characters');
  }
  if (email.length > 254) {
    throw new Error('please enter a valid email address');
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('please enter a valid email address');
  }

  return { message, email };
}

async function sendEmail({
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

  const body = escapeHtml(message);
  const em = escapeHtml(email);

  const data = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'form@contact.ainsworth.dev',
      to: 's@ainsworth.dev',
      subject: 'New Message',
      html: `<p>Email: ${em}</p><p>Message: ${body}</p>`,
    }),
  });

  const response = await data.json().catch(() => null);

  if (!data.ok) {
    throw new Error(response?.message || 'email delivery failed');
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

    if (!response.ok) {
      return false;
    }

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

    const cookieStore = await cookies();
    if (cookieStore.has('contact-submitted')) {
      return {
        success: false,
        message: 'please wait a minute before sending another message.',
      };
    }

    const contact = validateContactForm(formData);
    await sendEmail(contact);
    cookieStore.set('contact-submitted', '1', {
      httpOnly: true,
      maxAge: CONTACT_COOLDOWN_SECONDS,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    return { success: true, message: 'you sent me a message. nicely done!' };
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'something went wrong';
    const msg = `${reason.toLowerCase()}. how embarrassing.`;
    return { success: false, message: msg };
  }
}
