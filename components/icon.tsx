interface IconProps extends React.SVGProps<SVGSVGElement> {
  id: string;
  size?: number;
}

// Logos that should use PNG/WebP files instead of sprite
const PNG_LOGOS = new Set(['westhill', 'whsmith', 'asfc']);

// Logos that should use SVG files with theme support instead of sprite
const SVG_THEME_LOGOS = new Set(['uol']);

import { SPRITE_VERSION } from '../lib/version';

export function Icon({ id, size = 16, className = '', ...props }: IconProps) {
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
            alt={id}
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
          alt={id}
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
          alt={id}
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