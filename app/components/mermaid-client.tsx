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

  useEffect(() => {
    let mounted = true;

    async function renderMermaid() {
      try {
        // Dynamically import mermaid to avoid SSR issues
        const mermaid = (await import("mermaid")).default;

        if (!mounted) return;

        // Initialize mermaid with configuration
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          securityLevel: "loose",
          fontFamily: "inherit",
          maxTextSize: 90000,
          flowchart: {
            useMaxWidth: false,
            htmlLabels: false,
            curve: "basis",
            padding: 20,
            nodeSpacing: 50,
            rankSpacing: 80,
            diagramPadding: 20,
          },
          themeVariables: {
            fontFamily: "inherit",
            fontSize: "14px",
            primaryColor: "#f9f9f9",
            primaryTextColor: "#333",
            primaryBorderColor: "#666",
            lineColor: "#666",
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

              // Set explicit dimensions to prevent clipping
              svgElement.style.width = "auto";
              svgElement.style.height = "auto";
              svgElement.style.maxWidth = "none";

              // Fix text elements that might be clipped
              const textElements = svgElement.querySelectorAll(
                "text, tspan, foreignObject",
              );
              textElements.forEach((el: any) => {
                el.style.overflow = "visible";
                if (el.style.textOverflow) {
                  el.style.textOverflow = "clip";
                }
                // Ensure proper text centering
                if (el.tagName === "text") {
                  el.setAttribute("text-anchor", "middle");
                  el.setAttribute("dominant-baseline", "central");
                  el.setAttribute("alignment-baseline", "middle");
                }
              });
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
  }, [chart]);

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
        className={`mermaid-diagram overflow-x-auto ${!isLoaded ? "hidden" : ""}`}
        style={{
          width: "100%",
          minWidth: "600px",
          padding: "20px",
          overflow: "visible",
        }}
      />
    </div>
  );
}
