"use client";

import { useEffect, useRef, useState } from "react";

interface MermaidClientProps {
  chart: string;
  className?: string;
}

export default function MermaidClient({
  chart,
  className = "",
}: MermaidClientProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  // Effect to detect theme changes
  useEffect(() => {
    const checkDarkMode = () => {
      const darkMode = document.documentElement.classList.contains('dark') || 
                      window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(darkMode);
    };

    // Initial check
    checkDarkMode();

    // Watch for class changes on html element
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Watch for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkDarkMode);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function renderMermaid() {
      try {
        // Dynamically import mermaid to avoid SSR issues
        const mermaid = (await import("mermaid")).default;

        if (!mounted) return;

        // Use the isDark state

        // Initialize mermaid with explicit theme variables for robust light/dark styling
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          securityLevel: "loose",
          fontFamily: "'Geist Mono', ui-monospace, monospace",
          maxTextSize: 90000,
          flowchart: {
            useMaxWidth: false,
            htmlLabels: true,
            curve: "basis",
            padding: 12,
            nodeSpacing: 30,
            rankSpacing: 50,
            diagramPadding: 12,
          },
          themeVariables: {
            darkMode: isDark,
            fontFamily: "'Geist Mono', ui-monospace, monospace",
            fontSize: "13px",
            // Base colours
            background: 'transparent',
            primaryColor: isDark ? '#111827' : '#ffffff',
            primaryTextColor: isDark ? '#e5e7eb' : '#111827',
            primaryBorderColor: isDark ? '#374151' : '#d1d5db',
            secondaryColor: isDark ? '#1f2937' : '#f9fafb',
            secondaryTextColor: isDark ? '#e5e7eb' : '#111827',
            tertiaryColor: isDark ? '#374151' : '#e5e7eb',
            tertiaryTextColor: isDark ? '#e5e7eb' : '#111827',
            lineColor: isDark ? '#6b7280' : '#9ca3af',
            textColor: isDark ? '#e5e7eb' : '#111827',
            // Cluster and label styling
            clusterBkg: isDark ? '#0b1220' : '#ffffff',
            clusterBorder: isDark ? '#374151' : '#d1d5db',
            noteBkgColor: isDark ? '#0f172a' : '#f9fafb',
            noteTextColor: isDark ? '#e5e7eb' : '#111827',
            edgeLabelBackground: isDark ? '#000000cc' : '#ffffffcc',
          },
        });

        if (elementRef.current) {
          // Clear any existing content
          elementRef.current.innerHTML = "";

          // Generate unique ID for this diagram
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

          // Render the diagram
          const { svg } = await mermaid.render(id, chart);

          if (mounted && elementRef.current) {
            elementRef.current.innerHTML = svg;

            // Fix SVG viewBox to prevent text clipping
            const svgElement = elementRef.current.querySelector("svg");
            if (svgElement) {
              // Remove viewBox constraint
              svgElement.removeAttribute("viewBox");

              // Set explicit dimensions and positioning
              svgElement.style.width = "auto";
              svgElement.style.height = "auto";
              svgElement.style.maxWidth = "none";
              svgElement.style.marginLeft = "auto";
              svgElement.style.marginRight = "auto";
              svgElement.style.display = "block";

              // Fix text elements that might be clipped
              const textElements = svgElement.querySelectorAll(
                "text, tspan, foreignObject",
              );
              textElements.forEach((el: any) => {
                el.style.overflow = "visible";
                if (el.style.textOverflow) {
                  el.style.textOverflow = "clip";
                }
              });

              // Force recreate text positioning
              setTimeout(() => {
                const labels =
                  svgElement.querySelectorAll(".label, .nodeLabel");
                labels.forEach((label: any) => {
                  const textEl = label.querySelector("text") || label;
                  if (textEl.tagName === "text") {
                    // Get current x position and adjust slightly left
                    const currentX = parseFloat(
                      textEl.getAttribute("x") || "0",
                    );
                    textEl.setAttribute("x", (currentX - 3).toString());
                    textEl.style.textAnchor = "middle";
                  }
                });

                // Apply scaling to fit container width with modest buffer for labels
                const containerWidth = elementRef.current?.offsetWidth || 800;
                
                // Use a modest buffer for edge labels - 10% should be sufficient
                const svgBBox = svgElement.getBBox();
                const estimatedWidth = svgBBox.width * 1.1;
                
                const scale = Math.min(1, (containerWidth - 24) / estimatedWidth);
                svgElement.style.transform = `scale(${scale})`;
                svgElement.style.transformOrigin = "center top";
                
                // Set container height to match scaled SVG height
                const scaledHeight = svgBBox.height * scale;
                if (elementRef.current) {
                  elementRef.current.style.height = `${scaledHeight + 24}px`; // +24 for padding
                }
                
                // Ensure no clipping occurs
                svgElement.style.overflow = "visible";
              }, 100);
            }

            setIsLoaded(true);
          }
        }
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to render diagram",
          );
        }
      }
    }

    renderMermaid();

    return () => {
      mounted = false;
    };
  }, [chart, isDark]);

  if (error) {
    return (
      <div
        className={`p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg ${className}`}
      >
        <p className="text-red-600 dark:text-red-400 text-sm">
          Failed to render diagram: {error}
        </p>
        <details className="mt-2">
          <summary className="text-xs text-red-500 cursor-pointer">
            Show source
          </summary>
          <pre className="mt-2 text-xs text-red-400 overflow-auto">
            <code>{chart}</code>
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div className={`my-6 ${className}`}>
      {!isLoaded && (
        <div className="flex items-center justify-center p-8 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
            <span className="text-sm">Rendering diagram...</span>
          </div>
        </div>
      )}
      <div
        ref={elementRef}
        className={`mermaid-diagram flex justify-center ${!isLoaded ? "hidden" : ""}`}
        style={{
          width: "100%",
          minWidth: "400px",
          padding: "12px",
          overflow: "visible",
        }}
      />
    </div>
  );
}
