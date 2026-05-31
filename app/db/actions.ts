'use server';

import { cookies } from 'next/headers';
import { sendContactEmail } from '@/lib/contact/delivery';
import { verifyTurnstileToken } from '@/lib/contact/turnstile';
import { validateContactForm } from '@/lib/contact/validation';

const CONTACT_COOLDOWN_SECONDS = 60;

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
    await sendContactEmail(contact);
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
