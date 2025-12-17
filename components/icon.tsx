interface IconProps extends React.SVGProps<SVGSVGElement> {
  id: string;
  size?: number;
  decorative?: boolean; // When true, makes icon decorative (empty alt)
}

// Logos that should use PNG/WebP files instead of sprite
const PNG_LOGOS = new Set(["westhill", "whsmith"]);

// Logos that should use SVG files with theme support instead of sprite
const THEME_SVG_LOGOS: Record<string, { light: string; dark: string }> = {
  uol: {
    light: "/images/logos/uol_light_mode.svg",
    dark: "/images/logos/uol_dark_mode.svg",
  },
};

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
  const svgClassName = className;
  // Use PNG/WebP fallback for certain logos
  if (PNG_LOGOS.has(id)) {
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
  const themeLogo = THEME_SVG_LOGOS[id];
  if (themeLogo) {
    const targetHeight = heightProp ?? widthProp ?? size;
    const targetWidth = widthProp ?? heightProp ?? size;
    const roundedHeight =
      typeof targetHeight === "number" ? Math.round(targetHeight) : targetHeight;
    const roundedWidth =
      typeof targetWidth === "number" ? Math.round(targetWidth) : targetWidth;

    return (
      <picture>
        <source
          srcSet={themeLogo.dark}
          media="(prefers-color-scheme: dark)"
        />
        <img
          src={themeLogo.light}
          alt={altText}
          width={roundedWidth}
          height={roundedHeight}
          className={className}
          style={{
            objectFit: "contain",
            width: roundedWidth,
            height: roundedHeight,
          }}
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
      className={svgClassName}
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
    default:
      return id;
  }
}

export default Icon;
