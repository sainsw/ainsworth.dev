'use client';

import { useRef } from 'react';
import { saveGuestbookEntry } from '../db/actions';
import { useFormStatus } from 'react-dom';
import { Button } from '../../components/ui/button';

export default function Form() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      className="relative max-w-[500px]"
      ref={formRef}
      action={async (formData) => {
        await saveGuestbookEntry(formData);
        formRef.current?.reset();
      }}
    >
      <input
        aria-label="Your message"
        placeholder="Your message..."
        name="entry"
        type="text"
        required
        className="pl-4 pr-32 py-2 mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full border-gray-300 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="absolute right-1 top-1 h-9 px-4 w-20 justify-center"
      disabled={pending}
      type="submit"
    >
      Sign
    </Button>
  );
}
