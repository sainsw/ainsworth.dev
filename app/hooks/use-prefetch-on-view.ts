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
  }, [options]);

  useEffect(() => {
    if (isIntersecting && !hasPrefetched.current) {
      hasPrefetched.current = true;
      
      // Create prefetch link element
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = 'document'; // Specify resource type for PDF
      
      // Add to head
      document.head.appendChild(link);
      
      // Optional: Clean up after prefetch completes
      link.onload = () => {
        console.log(`Prefetched: ${url}`);
      };
      
      link.onerror = () => {
        console.warn(`Failed to prefetch: ${url}`);
      };
    }
  }, [isIntersecting, url]);

  return containerRef;
}