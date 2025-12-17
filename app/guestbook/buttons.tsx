'use client';

import { signIn, signOut } from 'next-auth/react';
import { Icon } from '../../components/icon';
import { Button } from '../../components/ui/button';

export function SignOut() {
  return (
    <Button size="xs" variant="ghost" type="button" onClick={() => signOut()}>
      Sign out
    </Button>
  );
}

export function SignIn() {
  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-2 mb-8"
      type="button"
      onClick={() => signIn('github')}
    >
      <Icon id="github" size={16} decorative={true} />
      <span>Sign in with GitHub</span>
    </Button>
  );
}
