'use client';

import { useRef } from 'react';
import { saveGuestbookEntry } from '../db/actions';
import { useFormStatus } from 'react-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

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
      <Input
        aria-label="Your message"
        placeholder="Your message..."
        name="entry"
        type="text"
        required
        className="pl-4 pr-32 py-2 h-10"
      />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="absolute right-1 top-1 h-8 px-4 w-20 justify-center"
      disabled={pending}
      type="submit"
    >
      Sign
    </Button>
  );
}
