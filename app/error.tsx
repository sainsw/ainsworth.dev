'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <p>Oh no, something went wrong... maybe refresh?</p>
      <button
        type="button"
        className="mt-4 underline underline-offset-2"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
