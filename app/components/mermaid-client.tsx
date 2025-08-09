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
          theme: "base",
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
            fontFamily: "'Geist Mono', ui-monospace, monospace",
            fontSize: "13px",
            primaryColor: "#ffffff",
            primaryTextColor: "#000000",
            primaryBorderColor: "#cccccc",
            lineColor: "#333333",
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

                // Apply scaling to fit container width
                // Account for container padding (12px on each side = 24px total)
                const containerWidth = (elementRef.current?.offsetWidth || 800) - 24;
                
                // Get the actual width including all elements, with special focus on edge labels
                let maxWidth = 0;
                
                // Check all text elements, including edge labels
                const textElements = svgElement.querySelectorAll('text, tspan, textPath, .edgeLabel');
                textElements.forEach((el: any) => {
                  try {
                    const bbox = el.getBBox();
                    const rightEdge = bbox.x + bbox.width;
                    maxWidth = Math.max(maxWidth, rightEdge);
                  } catch (e) {
                    // Some elements might not support getBBox
                  }
                });
                
                // Also check all other elements
                const allElements = svgElement.querySelectorAll('*');
                allElements.forEach((el: any) => {
                  if (el.getBBox && el.tagName !== 'text' && el.tagName !== 'tspan') {
                    try {
                      const bbox = el.getBBox();
                      const rightEdge = bbox.x + bbox.width;
                      maxWidth = Math.max(maxWidth, rightEdge);
                    } catch (e) {
                      // Some elements might not support getBBox
                    }
                  }
                });
                
                // Fallback to SVG getBBox if no elements found
                if (maxWidth === 0) {
                  maxWidth = svgElement.getBBox().width;
                }
                
                // Add generous padding to ensure edge labels aren't cut off
                const svgWidth = maxWidth + 40;
                const scale = Math.min(1, containerWidth / svgWidth);
                svgElement.style.transform = `scale(${scale})`;
                svgElement.style.transformOrigin = "center top";
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
        className={`mermaid-diagram overflow-x-auto flex justify-center ${!isLoaded ? "hidden" : ""}`}
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
