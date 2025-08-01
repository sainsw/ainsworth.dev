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
      
      // Create prefetch link element
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      // For PDFs, don't specify 'as' attribute as it might not be supported by all browsers
      // link.as = 'document'; 
      
      // Add to head
      document.head.appendChild(link);
      console.log(`usePrefetchOnView: Added prefetch link to head for ${url}`);
      
      // Optional: Clean up after prefetch completes
      link.onload = () => {
        console.log(`✅ Prefetch completed: ${url}`);
      };
      
      link.onerror = () => {
        console.warn(`❌ Prefetch failed: ${url}`);
      };

      // Additional debugging - check if link was actually added
      setTimeout(() => {
        const addedLink = document.querySelector(`link[href="${url}"]`);
        if (addedLink) {
          console.log(`usePrefetchOnView: Confirmed link exists in DOM for ${url}`);
        } else {
          console.warn(`usePrefetchOnView: Link not found in DOM for ${url}`);
        }
      }, 100);
    }
  }, [isIntersecting, url]);

  return containerRef;
}