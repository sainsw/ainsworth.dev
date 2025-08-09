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

        // Detect dark mode
        const isDark = document.documentElement.classList.contains('dark') || 
                      window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Initialize mermaid with theme-aware configuration
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
          themeVariables: isDark ? {
            fontFamily: "'Geist Mono', ui-monospace, monospace",
            fontSize: "13px",
            primaryColor: "#374151",
            primaryTextColor: "#f9fafb",
            primaryBorderColor: "#6b7280",
            lineColor: "#9ca3af",
            secondaryColor: "#4b5563",
            tertiaryColor: "#1f2937",
            background: "#111827",
            mainBkg: "#374151",
            secondBkg: "#4b5563",
            tertiaryBkg: "#6b7280",
            // Additional colors for various node types
            cScale0: "#1f2937",
            cScale1: "#374151", 
            cScale2: "#4b5563",
            cScale3: "#6b7280",
            cScale4: "#9ca3af",
            cScale5: "#d1d5db",
            // Specific colors for different states
            errorBkgColor: "#7f1d1d",
            errorTextColor: "#fecaca",
            fillType0: "#1f2937",
            fillType1: "#374151",
            fillType2: "#4b5563",
            fillType3: "#6b7280",
            fillType4: "#9ca3af",
            fillType5: "#d1d5db",
            fillType6: "#1f2937",
            fillType7: "#374151",
            // Node class colors
            classText: "#f9fafb",
            nodeBkg: "#374151",
            nodeTextColor: "#f9fafb",
            // Flowchart specific colors
            clusterBkg: "#1f2937",
            clusterBorder: "#6b7280",
            defaultLinkColor: "#9ca3af",
            titleColor: "#f9fafb",
            edgeLabelBackground: "#1f2937",
            // Class diagram colors
            altBackground: "#4b5563",
            // Additional node fill colors for different classes
            pie1: "#374151",
            pie2: "#4b5563", 
            pie3: "#6b7280",
            pie4: "#9ca3af",
            pie5: "#d1d5db",
            pie6: "#1f2937",
            pie7: "#374151",
            pie8: "#4b5563",
            pie9: "#6b7280",
            pie10: "#9ca3af",
            pie11: "#d1d5db",
            pie12: "#1f2937",
          } : {
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

              // Set explicit dimensions and positioning
              svgElement.style.width = "auto";
              svgElement.style.height = "auto";
              svgElement.style.maxWidth = "none";
              svgElement.style.marginLeft = "0";
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
                svgElement.style.transformOrigin = "left top";
                
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
        className={`mermaid-diagram flex justify-start ${!isLoaded ? "hidden" : ""}`}
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
