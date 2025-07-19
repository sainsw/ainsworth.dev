interface IconProps extends React.SVGProps<SVGSVGElement> {
  id: string;
  size?: number;
}

export function Icon({ id, size = 16, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <use href={`/sprite.svg#${id}`} />
    </svg>
  );
}

export default Icon;