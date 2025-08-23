interface IconProps extends React.SVGProps<SVGSVGElement> {
  id: string;
  size?: number;
  decorative?: boolean; // When true, makes icon decorative (empty alt)
}

// Logos that should use PNG/WebP files instead of sprite
const PNG_LOGOS = new Set(["westhill", "whsmith", "asfc"]);

// Logos that should use SVG files with theme support instead of sprite
const SVG_THEME_LOGOS = new Set(["uol"]);

// Logos that should use image files with brand colours instead of sprite
const BRAND_COLOR_LOGOS = new Set(["dotnet", "azure"]);

import { SPRITE_VERSION } from "../lib/version";

export function Icon({
  id,
  size = 16,
  className = "",
  decorative = false,
  ...props
}: IconProps) {
  // Allow callers to specify only height or only width; if neither provided, use size for both.
  const { width: widthProp, height: heightProp, ...restProps } = props as {
    width?: number | string;
    height?: number | string;
  } & React.SVGProps<SVGSVGElement>;

  const widthAttr = widthProp !== undefined ? widthProp : heightProp !== undefined ? undefined : size;
  const heightAttr = heightProp !== undefined ? heightProp : widthProp !== undefined ? undefined : size;

  const altText = decorative ? "" : `${id} logo`;
  // Use PNG/WebP fallback for certain logos
  if (PNG_LOGOS.has(id)) {
    // Special handling for ASFC logo with theme support
    if (id === "asfc") {
      return (
        <picture>
          <source
            srcSet="/images/logos/asfc_white.webp"
            media="(prefers-color-scheme: dark)"
            type="image/webp"
          />
          <source
            srcSet="/images/logos/asfc_black.webp"
            media="(prefers-color-scheme: light)"
            type="image/webp"
          />
          <source
            srcSet="/images/logos/asfc_white.png"
            media="(prefers-color-scheme: dark)"
          />
          <img
            src="/images/logos/asfc_black.png"
            alt={altText}
            width={widthAttr}
            height={heightAttr}
            className={className}
            style={{ objectFit: "contain" }}
          />
        </picture>
      );
    }

    return (
      <picture>
        <source
          srcSet={`/images/logos/${getLogoFilename(id)}.webp`}
          type="image/webp"
        />
        <img
          src={`/images/logos/${getLogoFilename(id)}.png`}
          alt={altText}
          width={widthAttr}
          height={heightAttr}
          className={className}
          style={{ objectFit: "contain" }}
        />
      </picture>
    );
  }

  // Use SVG files with theme support for certain logos
  if (SVG_THEME_LOGOS.has(id)) {
    return (
      <picture>
        <source
          srcSet={`/images/logos/${id}_white.svg`}
          media="(prefers-color-scheme: dark)"
        />
        <img
          src={`/images/logos/${id}_colour.svg`}
          alt={altText}
          width={widthAttr}
          height={heightAttr}
          className={className}
          style={{ objectFit: "contain" }}
        />
      </picture>
    );
  }

  // Use brand colour images for certain logos (instead of currentColor sprites)
  if (BRAND_COLOR_LOGOS.has(id)) {
    const fileExtension = id === "azure" ? "ico" : "jpg";
    return (
      <picture>
        <source srcSet={`/images/logos/${id}.webp`} type="image/webp" />
        <img
          src={`/images/logos/${id}.${fileExtension}`}
          alt={altText}
          width={widthAttr}
          height={heightAttr}
          className={className}
          style={{ objectFit: "contain" }}
        />
      </picture>
    );
  }

  // Use sprite system for SVG logos with cache-busting
  // For sprite-based SVGs, compute width/height to preserve aspect ratio when only one is provided.
  const ratio = getSpriteAspectRatio(id);
  let svgWidth: number | string | undefined = widthAttr;
  let svgHeight: number | string | undefined = heightAttr;

  if (ratio) {
    if (svgWidth === undefined && typeof svgHeight === "number") {
      svgWidth = svgHeight * ratio;
    } else if (svgHeight === undefined && typeof svgWidth === "number") {
      svgHeight = svgWidth / ratio;
    }
  }

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      className={className}
      aria-label={decorative ? undefined : altText}
      role={decorative ? "presentation" : "img"}
      {...(restProps as React.SVGProps<SVGSVGElement>)}
    >
      <use href={`/sprite.svg?v=${SPRITE_VERSION}#${id}`} />
    </svg>
  );
}

// Aspect ratios for specific sprite symbols (viewBox width / height)
function getSpriteAspectRatio(id: string): number | undefined {
  switch (id) {
    case "ibm":
      return 58 / 23;
    case "musicmagpie":
      return 91 / 91; // square viewBox
    case "bott":
      return 244.8 / 244.8; // square viewBox
    default:
      return undefined;
  }
}

function getLogoFilename(id: string): string {
  switch (id) {
    case "westhill":
      return "wh";
    case "whsmith":
      return "whs";
    case "asfc":
      return "asfc_black";
    default:
      return id;
  }
}

export default Icon;
