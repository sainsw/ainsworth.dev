interface IconProps extends React.SVGProps<SVGSVGElement> {
  id: string;
  size?: number;
  decorative?: boolean; // When true, makes icon decorative (empty alt)
}

// Logos that should use PNG/WebP files instead of sprite
const PNG_LOGOS = new Set(['westhill', 'whsmith', 'asfc']);

// Logos that should use SVG files with theme support instead of sprite
const SVG_THEME_LOGOS = new Set(['uol']);

// Logos that should use image files with brand colors instead of sprite
const BRAND_COLOR_LOGOS = new Set(['dotnet', 'azure']);

import { SPRITE_VERSION } from '../lib/version';

export function Icon({ id, size = 16, className = '', decorative = false, ...props }: IconProps) {
  const altText = decorative ? '' : `${id} logo`;
  // Use PNG/WebP fallback for certain logos
  if (PNG_LOGOS.has(id)) {
    // Special handling for ASFC logo with theme support
    if (id === 'asfc') {
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
            width={size}
            height={size}
            className={className}
            style={{ objectFit: 'contain' }}
          />
        </picture>
      );
    }

    return (
      <picture>
        <source srcSet={`/images/logos/${getLogoFilename(id)}.webp`} type="image/webp" />
        <img 
          src={`/images/logos/${getLogoFilename(id)}.png`}
          alt={altText}
          width={size}
          height={size}
          className={className}
          style={{ objectFit: 'contain' }}
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
          width={size}
          height={size}
          className={className}
          style={{ objectFit: 'contain' }}
        />
      </picture>
    );
  }

  // Use brand color images for certain logos (instead of currentColor sprites)
  if (BRAND_COLOR_LOGOS.has(id)) {
    const fileExtension = id === 'azure' ? 'ico' : 'jpg';
    return (
      <picture>
        <source srcSet={`/images/logos/${id}.webp`} type="image/webp" />
        <img 
          src={`/images/logos/${id}.${fileExtension}`}
          alt={altText}
          width={size}
          height={size}
          className={className}
          style={{ objectFit: 'contain' }}
        />
      </picture>
    );
  }

  // Use sprite system for SVG logos with cache-busting
  return (
    <svg
      width={size}
      height={size}
      className={className}
      aria-label={decorative ? undefined : altText}
      role={decorative ? "presentation" : "img"}
      {...props}
    >
      <use href={`/sprite.svg?v=${SPRITE_VERSION}#${id}`} />
    </svg>
  );
}

function getLogoFilename(id: string): string {
  switch (id) {
    case 'westhill':
      return 'wh';
    case 'whsmith':
      return 'whs';
    case 'asfc':
      return 'asfc_black';
    default:
      return id;
  }
}

export default Icon;