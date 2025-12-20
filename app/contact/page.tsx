'use client';

import React, { useEffect, useRef, useActionState, useState, useCallback } from 'react';
import { useFormStatus } from 'react-dom';
import { submitContact } from 'app/db/actions';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Turnstile, TurnstileRef } from '../components/turnstile';
import { cn } from '../../lib/utils';

export default function Page() {
    const formRef = useRef<HTMLFormElement>(null);
    const turnstileRef = useRef<TurnstileRef>(null);
    const [state, formAction] = useActionState(submitContact, undefined);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setError(null);
            setIsVerifying(true);

            try {
                // Trigger invisible Turnstile verification
                const token = await turnstileRef.current?.execute();
                if (!token) {
                    setError('Verification failed. Please try again.');
                    setIsVerifying(false);
                    return;
                }

                // Create form data with the token
                const formData = new FormData(formRef.current!);
                formData.set('cf-turnstile-response', token);

                // Submit via server action
                formAction(formData);
            } catch (err) {
                setError('Verification failed. Please try again.');
                turnstileRef.current?.reset();
            } finally {
                setIsVerifying(false);
            }
        },
        [formAction]
    );

    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset();
            turnstileRef.current?.reset();
        }
    }, [state?.success]);

    const displayMessage = error || state?.message;
    const isError = error || (state && !state.success);

    return (
        <div>
            <form
                className="max-w-[500px] space-y-4"
                ref={formRef}
                onSubmit={handleSubmit}
            >
                <div className="space-y-2">
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input
                        id="email"
                        placeholder="email address (if you want a response)"
                        type="email"
                        name="email"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                        id="message"
                        placeholder="your message..."
                        name="message"
                        required
                        className="min-h-64"
                    />
                </div>
                <div className="flex items-center justify-end gap-4 pt-1">
                    <Turnstile ref={turnstileRef} invisible />
                    <SubmitButton isVerifying={isVerifying} />
                </div>
            </form>
            {displayMessage && (
                <p className={cn('py-2 text-sm', isError ? 'text-destructive' : 'text-foreground')}>
                    {displayMessage}
                </p>
            )}
        </div>
    );
}

function SubmitButton({ isVerifying }: { isVerifying?: boolean }) {
    const { pending } = useFormStatus();
    const isLoading = pending || isVerifying;

    return (
        <Button
            className="w-20 justify-center"
            disabled={isLoading}
            type="submit"
        >
            {isLoading ? '...' : 'Send'}
        </Button>
    );
}
