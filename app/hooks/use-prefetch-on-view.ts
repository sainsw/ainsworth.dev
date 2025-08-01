import { useEffect, useRef, useState } from 'react';

export function usePrefetchOnView(url: string, options?: IntersectionObserverInit) {
  const containerRef = useRef<HTMLLIElement>(null);
  const hasPrefetched = useRef(false);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: '50px', // Start prefetching 50px before element enters viewport
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [options, url]);

  useEffect(() => {
    if (isIntersecting && !hasPrefetched.current) {
      hasPrefetched.current = true;
      
      // Use fetch() for PDFs as browsers may not handle <link rel="prefetch"> for PDFs reliably
      fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'force-cache', // Use cache if available
        priority: 'low' // Low priority prefetch
      })
      .then(response => {
        // Response is cached automatically by browser
      })
      .catch(() => {
        // Silently handle prefetch failures
      });

      // Also add the link element as fallback for browsers that support it
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    }
  }, [isIntersecting, url]);

  return containerRef;
}