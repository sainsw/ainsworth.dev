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
      const prefersDark = (typeof window !== 'undefined' && typeof window.matchMedia === 'function')
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false;
      const darkMode = document.documentElement.classList.contains('dark') || prefersDark;
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
    let mediaQuery: MediaQueryList | null = null;
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', checkDarkMode);
    }

    return () => {
      observer.disconnect();
      mediaQuery?.removeEventListener('change', checkDarkMode);
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
            // Base colours tuned to match site palette
            background: 'transparent',
            primaryColor: isDark ? '#111827' : '#e7e1d8', // hsl(43,19%,90%)
            primaryTextColor: isDark ? '#e5e7eb' : '#181512',
            primaryBorderColor: isDark ? '#374151' : '#d8d0c4',
            secondaryColor: isDark ? '#1f2937' : '#ece6de',
            secondaryTextColor: isDark ? '#e5e7eb' : '#181512',
            tertiaryColor: isDark ? '#374151' : '#f1ebe3',
            tertiaryTextColor: isDark ? '#e5e7eb' : '#181512',
            lineColor: isDark ? '#6b7280' : '#b7aa9a',
            textColor: isDark ? '#e5e7eb' : '#181512',
            // Cluster and label styling
            clusterBkg: isDark ? '#0b1220' : '#ece6de',
            clusterBorder: isDark ? '#374151' : '#d8d0c4',
            noteBkgColor: isDark ? '#0f172a' : '#f1ebe3',
            noteTextColor: isDark ? '#e5e7eb' : '#181512',
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
              // Safari-specific sizing improvements for full container width usage
              const ua = navigator.userAgent.toLowerCase();
              const isSafari = ua.includes("safari") &&
                !ua.includes("chrome") &&
                !ua.includes("crios") &&
                !ua.includes("android") &&
                !ua.includes("edg") &&
                !ua.includes("opr");

              // Get the current viewBox to maintain aspect ratio
              const viewBox = svgElement.getAttribute("viewBox");
              if (viewBox && isSafari) {
                const [, , width, height] = viewBox.split(" ").map(Number);
                const aspectRatio = height / width;
                
                // Force Safari to use the full container width
                svgElement.style.width = "100%";
                svgElement.style.height = `${aspectRatio * 100}vw`;
                svgElement.style.maxHeight = `${height}px`;
                svgElement.style.minWidth = "100%";
                svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
              } else {
                // Standard responsive sizing for other browsers
                svgElement.setAttribute("preserveAspectRatio", "xMidYMin meet");
                svgElement.style.width = "100%";
                svgElement.style.height = "auto";
              }
              
              svgElement.style.maxWidth = "100%";
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

              // No CSS transform scaling; let viewBox handle responsiveness
              svgElement.style.transform = "none";
              svgElement.style.overflow = "visible";

              // Safari-specific label centre correction without CSS scaling

              if (isSafari) {
                const nodes = svgElement.querySelectorAll<SVGGElement>(".node");
                nodes.forEach((node) => {
                  const text = node.querySelector<SVGTextElement>(".label text, text");
                  const shape = node.querySelector<SVGGraphicsElement>(
                    "rect, polygon, ellipse, circle, path",
                  );
                  if (!text || !shape) return;

                  const b = shape.getBBox();
                  const cx = b.x + b.width / 2;
                  const cy = b.y + b.height / 2;

                  text.removeAttribute("transform");
                  text.removeAttribute("dx");
                  text.removeAttribute("dy");
                  text.setAttribute("x", `${cx}`);
                  text.setAttribute("y", `${cy}`);
                  text.setAttribute("text-anchor", "middle");
                  text.setAttribute("dominant-baseline", "middle");
                  (text.style as any).textAnchor = "middle";
                });
              }
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
        className={`p-4 border border-destructive/30 bg-destructive/10 ${className}`}
      >
        <p className="text-destructive text-sm">
          Failed to render diagram: {error}
        </p>
        <details className="mt-2">
          <summary className="text-xs text-destructive/80 cursor-pointer">
            Show source
          </summary>
          <pre className="mt-2 text-xs text-destructive/70 overflow-auto">
            <code>{chart}</code>
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div className={`my-6 ${className}`}>
      {!isLoaded && (
        <div className="flex items-center justify-center p-8 border border-border">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent"></div>
            <span className="text-sm">Rendering diagram...</span>
          </div>
        </div>
      )}
      <div
        ref={elementRef}
        className={`mermaid-diagram flex justify-center ${!isLoaded ? "hidden" : ""}`}
        data-testid="mermaid"
        // Expose chart source as a data attribute for tests (TS-safe)
        data-chart={chart as any}
        style={{
          width: "100%",
          padding: "12px",
          overflow: "visible",
        }}
      />
    </div>
  );
}
