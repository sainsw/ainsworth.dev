export function validateContactForm(formData: FormData) {
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
