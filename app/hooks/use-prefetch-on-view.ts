import { useEffect, useRef, useState } from 'react';

export function usePrefetchOnView(url: string, options?: IntersectionObserverInit) {
  const containerRef = useRef<HTMLLIElement>(null);
  const hasPrefetched = useRef(false);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      console.log('usePrefetchOnView: No element found for', url);
      return;
    }

    console.log('usePrefetchOnView: Setting up observer for', url);

    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log(`usePrefetchOnView: Intersection change for ${url}:`, {
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio
        });
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
      
      console.log(`usePrefetchOnView: Starting prefetch for ${url}`);
      
      // Use fetch() for PDFs as browsers may not handle <link rel="prefetch"> for PDFs reliably
      fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'force-cache', // Use cache if available
        priority: 'low' // Low priority prefetch
      })
      .then(response => {
        if (response.ok) {
          console.log(`✅ PDF prefetch completed: ${url} (${response.status})`);
          // Response is cached automatically by browser
        } else {
          console.warn(`⚠️ PDF prefetch response not OK: ${url} (${response.status})`);
        }
      })
      .catch(error => {
        console.warn(`❌ PDF prefetch failed: ${url}`, error);
      });

      // Also add the link element as fallback for browsers that support it
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
      console.log(`usePrefetchOnView: Added both fetch() and <link> prefetch for ${url}`);
    }
  }, [isIntersecting, url]);

  return containerRef;
}