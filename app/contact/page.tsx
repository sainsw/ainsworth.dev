'use client';

import React, { useEffect, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitContact } from 'app/db/actions';
import { Button } from '../../components/ui/button';

export default function Page() {
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction] = useActionState(submitContact, undefined);

    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset();
        }
    }, [state?.success]);

    return (
        <div>
            <form
                className="max-w-[500px] space-y-3"
                ref={formRef}
                action={formAction}
            >
                <input
                    aria-label="Your email address"
                    placeholder="email address (if you want a response)"
                    type="email"
                    name="email"
                    className="pl-4 pr-4 py-2 focus:ring-blue-500 focus:border-blue-500 block w-full border-neutral-300 rounded-md bg-gray-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
                <textarea
                    aria-label="Your message"
                    placeholder="your message..."
                    name="message"
                    required
                    className="h-64 pl-4 pr-4 py-2 focus:ring-blue-500 focus:border-blue-500 block w-full border-neutral-300 rounded-md bg-gray-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
                <div className="flex justify-end pt-1">
                    <SubmitButton />
                </div>
            </form>
            {state?.message && (
                <p className='py-2' style={{ color: state.success ? 'inherit' : '#e02518' }}>
                    {state.message}
                </p>
            )}
        </div>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            className="w-20 justify-center"
            disabled={pending}
            type="submit"
        >
            {pending ? '...' : 'Send'}
        </Button>
    );
}
