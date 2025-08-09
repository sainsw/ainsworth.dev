"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

  // Transform chart for theme-aware custom node fills
  const themedChart = useMemo(() => {
    // Only transform known pastel fills used in content
    // Light mode: ensure readable dark text; Dark mode: use darker fills and light text
    const mappingsLight: Record<string, { fill: string; color: string; stroke?: string }> = {
      // sky-50
      "#e1f5fe": { fill: "#e1f5fe", color: "#111827", stroke: "#93c5fd" },
      // green-50
      "#e8f5e8": { fill: "#e8f5e8", color: "#111827", stroke: "#86efac" },
      // amber-50
      "#fff3e0": { fill: "#fff3e0", color: "#111827", stroke: "#fcd34d" },
      // fuchsia-50
      "#f3e5f5": { fill: "#f3e5f5", color: "#111827", stroke: "#f0abfc" },
      // hot pink highlight
      "#ff69b4": { fill: "#ff69b4", color: "#111827", stroke: "#f472b6" },
    };

    const mappingsDark: Record<string, { fill: string; color: string; stroke?: string }> = {
      // sky-900
      "#e1f5fe": { fill: "#0c4a6e", color: "#e5e7eb", stroke: "#38bdf8" },
      // emerald-900
      "#e8f5e8": { fill: "#064e3b", color: "#e5e7eb", stroke: "#34d399" },
      // amber-900
      "#fff3e0": { fill: "#713f12", color: "#e5e7eb", stroke: "#fbbf24" },
      // fuchsia-900
      "#f3e5f5": { fill: "#6d28d9", color: "#f3f4f6", stroke: "#c084fc" },
      // hot pink highlight → fuchsia-800
      "#ff69b4": { fill: "#86198f", color: "#f5f3ff", stroke: "#e879f9" },
    };

    const source = chart;
    const replacer = (hex: string, map: Record<string, { fill: string; color: string; stroke?: string }>) => {
      // Replace lines like: style A fill:#e1f5fe
      const regex = new RegExp(`(style\\s+[^\\n]*?)fill:${hex}`, "gi");
      return source
        .replace(regex, (_, pre) => `${pre}fill:${map[hex].fill},color:${map[hex].color}${map[hex].stroke ? `,stroke:${map[hex].stroke}` : ""}`)
        // Also handle multiline style blocks if any
        .replace(new RegExp(`(style\\s+[^\\n]*?fill:${hex}[^\\n]*)`, "gi"), (m) => {
          // If color not already present, append it
          if (!/color:/i.test(m)) {
            const { color } = map[hex];
            return `${m},color:${color}`;
          }
          return m;
        });
    };

    // Apply mapping
    const palette = isDark ? mappingsDark : mappingsLight;
    let out = source;
    Object.keys(palette).forEach((hex) => {
      out = out.replace(new RegExp(`fill:${hex}`, "gi"), (m) => {
        const { fill } = palette[hex];
        return `fill:${fill}`;
      });
      // Ensure text colour for that style line
      out = out.replace(new RegExp(`(style\\s+[^\\n]*?fill:${palette[hex].fill})(?![^\\n]*color:)`, "gi"), `$1,color:${palette[hex].color}`);
    });

    return out;
  }, [chart, isDark]);

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
          // Use built-in dark theme when dark mode is active
          theme: isDark ? "dark" : "neutral",
          securityLevel: "loose",
          fontFamily: "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace",
          maxTextSize: 90000,
          flowchart: {
            useMaxWidth: false,
            // Use SVG labels; they render reliably and keep edge labels intact
            htmlLabels: false,
            curve: "basis",
            padding: 12,
            nodeSpacing: 30,
            rankSpacing: 50,
            diagramPadding: 12,
          },
          themeVariables: {
            fontFamily: "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace",
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
            edgeLabelBackground: 'transparent',
          },
        });

        if (elementRef.current) {
          // Clear any existing content
          elementRef.current.innerHTML = "";

          // Generate unique ID for this diagram
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

          // Ensure fonts are loaded before measuring/laying out labels
          const ensureFontsLoaded = async () => {
            try {
              const fonts: any = (document as any).fonts;
              if (fonts?.ready) {
                await fonts.ready;
                await Promise.all([
                  fonts.load("13px var(--font-geist-mono)"),
                  fonts.load("13px 'Geist Mono'"),
                  fonts.load("700 13px var(--font-geist-mono)"),
                ]);
              } else {
                await new Promise((r) => setTimeout(r, 50));
              }
            } catch {
              // ignore font load errors; fall back to default
            }
          };

          await ensureFontsLoaded();

          // Render the diagram with theme-aware chart
          const { svg } = await mermaid.render(id, themedChart);

          if (mounted && elementRef.current) {
            elementRef.current.innerHTML = svg;

            // Fix SVG viewBox to prevent text clipping
            const svgElement = elementRef.current.querySelector("svg");
            if (svgElement) {
              // Ensure viewBox exists so internal coordinates/centres are accurate
              if (!svgElement.getAttribute("viewBox")) {
                const bb = svgElement.getBBox();
                svgElement.setAttribute("viewBox", `${bb.x} ${bb.y} ${bb.width} ${bb.height}`);
              }
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

              // Apply scaling to fit container width with small buffer
              setTimeout(() => {
                const containerWidth = elementRef.current?.offsetWidth || 800;
                const svgBBox = svgElement.getBBox();
                const estimatedWidth = svgBBox.width * 1.06; // small buffer
                const scale = Math.min(1, (containerWidth - 24) / estimatedWidth);
                svgElement.style.transform = `scale(${scale})`;
                svgElement.style.transformOrigin = "center top";

                const scaledHeight = svgBBox.height * scale;
                if (elementRef.current) {
                  elementRef.current.style.height = `${scaledHeight + 24}px`;
                }
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
  }, [themedChart, isDark]);

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
