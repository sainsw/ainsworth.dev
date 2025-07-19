interface IconProps extends React.SVGProps<SVGSVGElement> {
  id: string;
  size?: number;
}

// Logos that should use PNG/WebP files instead of sprite
const PNG_LOGOS = new Set(['westhill', 'whsmith', 'asfc']);

import { SPRITE_VERSION } from '../lib/version';

export function Icon({ id, size = 16, className = '', ...props }: IconProps) {
  // Use PNG/WebP fallback for certain logos
  if (PNG_LOGOS.has(id)) {
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