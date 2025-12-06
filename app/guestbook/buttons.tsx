'use client';

import { signIn, signOut } from 'next-auth/react';
import { Icon } from '../../components/icon';
import { Button } from '../../components/ui/button';

export function SignOut() {
  return (
    <Button size="sm" type="button" onClick={() => signOut()}>
      Sign out
    </Button>
  );
}

export function SignIn() {
  return (
    <Button
      size="sm"
      className="gap-2 mb-8"
      type="button"
      onClick={() => signIn('github')}
    >
      <Icon id="github" size={20} decorative={true} />
      <div>Sign in with GitHub</div>
    </Button>
  );
}
