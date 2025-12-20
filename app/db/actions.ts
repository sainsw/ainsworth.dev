'use server';

import { auth } from 'app/auth';
import { type Session } from 'next-auth';
import { sql } from './postgres';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';

export async function increment(slug: string) {
  if (!process.env.DATABASE_URL) {
    return;
  }
  
  try {
    noStore();
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

async function getSession(): Promise<Session> {
  let session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  return session;
}

export async function saveGuestbookEntry(formData: FormData) {
  let session = await getSession();
  let email = session.user?.email as string;
  let created_by = session.user?.name as string;

  if (!session.user) {
    throw new Error('Unauthorized');
  }

  let entry = formData.get('entry')?.toString() || '';
  let body = entry.slice(0, 500);

  await sql`
    INSERT INTO guestbook (email, body, created_by, created_at)
    VALUES (${email}, ${body}, ${created_by}, NOW())
  `;

  revalidatePath('/guestbook');

  let data = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'guestbook@contact.ainsworth.dev',
      to: 's@ainsworth.dev',
      subject: 'New Guestbook Entry',
      html: `<p>Email: ${email}</p><p>Message: ${body}</p>`,
    }),
  });

  let response = await data.json();
  console.log('Email sent', response);
}

export async function sendEmail(formData: FormData) {
  
  let entry = formData.get('message')?.toString() || '';
  let email = formData.get('email')?.toString() || '';
  let body = entry.slice(0, 4000);
  let em = email.slice(0, 100);
 
  let data = await fetch('https://api.resend.com/emails', {
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

  let response = await data.json();
  console.log('Email sent', response);

  if(response.statusCode > 0){
    throw new Error(response.message)
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
      }
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
  formData: FormData
) {
  try {
    // Verify Turnstile token
    const turnstileToken = formData.get('cf-turnstile-response')?.toString();
    if (!turnstileToken) {
      return { success: false, message: 'please complete the verification challenge.' };
    }

    const isValid = await verifyTurnstileToken(turnstileToken);
    if (!isValid) {
      return { success: false, message: 'verification failed. please try again.' };
    }

    await sendEmail(formData);
    return { success: true, message: 'you sent me a message. nicely done!' };
  } catch (err: any) {
    const msg = (err?.message || 'something went wrong').toString().toLowerCase() + '. how embarrassing.';
    return { success: false, message: msg };
  }
}

export async function deleteGuestbookEntries(selectedEntries: string[]) {
  let session = await getSession();
  let email = session.user?.email as string;

  if (email !== 's.ainsworth@me.com') {
    throw new Error('Unauthorized');
  }

  let selectedEntriesAsNumbers = selectedEntries.map(Number);
  let arrayLiteral = `{${selectedEntriesAsNumbers.join(',')}}`;

  await sql`
    DELETE FROM guestbook
    WHERE id = ANY(${arrayLiteral}::int[])
  `;

  revalidatePath('/admin');
  revalidatePath('/guestbook');
}
