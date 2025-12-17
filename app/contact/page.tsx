'use client';

import React, { useEffect, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitContact } from 'app/db/actions';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { cn } from '../../lib/utils';

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
                className="max-w-[500px] space-y-4"
                ref={formRef}
                action={formAction}
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
                <div className="flex justify-end pt-1">
                    <SubmitButton />
                </div>
            </form>
            {state?.message && (
                <p className={cn('py-2 text-sm', state.success ? 'text-foreground' : 'text-destructive')}>
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
