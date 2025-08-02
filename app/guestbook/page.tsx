import { auth } from 'app/auth';
import { getGuestbookEntries } from 'app/db/queries';
import { SignIn, SignOut } from './buttons';
import { Suspense } from 'react';
import Form from './form';

export const metadata = {
  title: 'Guestbook',
  description: 'Sign my guestbook and leave your mark.',
};

export default function GuestbookPage() {
  return (
    <section>
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">
        sign my guestbook
      </h1>
      <Suspense>
        <GuestbookForm />
        <GuestbookEntries />
      </Suspense>
    </section>
  );
}

async function GuestbookForm() {
  let session = await auth();

  return session?.user ? (
    <>
      <Form />
      <div className="flex items-center space-x-4 mt-4">
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          Signed in as: <span className="font-medium text-neutral-900 dark:text-neutral-100">{session.user.name || session.user.email}</span>
        </span>
        <SignOut />
      </div>
    </>
  ) : (
    <SignIn />
  );
}

async function GuestbookEntries() {
  let entries = await getGuestbookEntries();

  if (entries.length === 0) {
    return null;
  }

  return entries.map((entry) => (
    <div key={entry.id} className="flex flex-col space-y-1 mb-4">
      <div className="w-full text-sm break-words">
        <span className="text-neutral-600 dark:text-neutral-400 mr-1">
          {entry.created_by}:
        </span>
        {entry.body}
      </div>
    </div>
  ));
}
