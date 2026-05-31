'use client';

import { useEffect } from 'react';

export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch(`/api/views/${encodeURIComponent(slug)}`, {
      method: 'POST',
      keepalive: true,
    }).catch(() => {
      // View tracking must never interfere with reading an article.
    });
  }, [slug]);

  return null;
}
