'use client';

import { sendEmail } from 'app/db/actions';
import React, { useState, FormEvent, useRef } from 'react'
import { useFormStatus } from 'react-dom';

export default function Page() {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const formRef = useRef<HTMLFormElement>(null);

    return (
        <div>
            
            <form
                className="relative max-w-[500px]"
                ref={formRef}
                action={async (formData) => {
                    try {
                        let response = await sendEmail(formData);
                        formRef.current?.reset();
                        if (!response.ok) {
                            throw new Error('Failed to submit the data. Please try again.')
                        }
                    } catch (error) {
                        // Capture the error message to display to the user
                        setError(error.message)
                        console.error(error)
                    }
                }}
            >
                <input
                    aria-label="Your email address"
                    placeholder="email address (if you want a response)"
                    type="email"
                    name="email"
                    className="pl-4 pr-32 py-2 mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full border-neutral-300 rounded-md bg-gray-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
                <textarea
                    aria-label="Your message"
                    placeholder="your message..."
                    name="message"
                    required
                    className="h-64 pl-4 pr-32 py-2 mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full border-neutral-300 rounded-md bg-gray-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
                <SubmitButton />
            </form>
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </div>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            className="flex items-center justify-center absolute right-1 bottom-1 px-2 py-1 font-medium h-8 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded w-16"
            disabled={pending}
            type="submit"
        >
            Send
        </button>
    );
}