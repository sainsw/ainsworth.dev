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
    const [clientMessage, setClientMessage] = useState<{ text: string; isError: boolean } | null>(null);

    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setClientMessage(null);
            setIsVerifying(true);

            try {
                // Trigger invisible Turnstile verification
                const token = await turnstileRef.current?.execute();
                if (!token) {
                    setClientMessage({ text: 'Verification failed. Please try again.', isError: true });
                    setIsVerifying(false);
                    return;
                }

                // Create form data with the token
                const formData = new FormData(formRef.current!);
                formData.set('cf-turnstile-response', token);

                // Submit via server action
                formAction(formData);
            } catch (err) {
                setClientMessage({ text: 'Verification failed. Please try again.', isError: true });
                turnstileRef.current?.reset();
            } finally {
                setIsVerifying(false);
            }
        },
        [formAction]
    );

    // Sync server state to client message
    useEffect(() => {
        if (state?.message) {
            setClientMessage({ text: state.message, isError: !state.success });
        }
        if (state?.success) {
            formRef.current?.reset();
            turnstileRef.current?.reset();
        }
    }, [state]);

    return (
        <div className="max-w-[500px]">
            <form
                className="space-y-4"
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
                <div className="flex items-center justify-between gap-4 pt-1">
                    <Turnstile ref={turnstileRef} invisible />
                    <div className="flex items-center gap-4">
                        {clientMessage && (
                            <p className={cn('text-sm', clientMessage.isError ? 'text-destructive' : 'text-foreground')}>
                                {clientMessage.text}
                            </p>
                        )}
                        <SubmitButton isVerifying={isVerifying} />
                    </div>
                </div>
            </form>
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
