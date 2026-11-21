/* eslint-disable @next/next/no-img-element */
interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <span className={className ? `brand-mark ${className}` : 'brand-mark'} aria-hidden="true">
      <img
        className="brand-mark__img brand-mark__img--dark"
        src="/logo-mark-dark.webp"
        alt=""
        width="256"
        height="256"
        decoding="async"
      />
      <img
        className="brand-mark__img brand-mark__img--light"
        src="/logo-mark-light.webp"
        alt=""
        width="256"
        height="256"
        decoding="async"
      />
    </span>
  );
}
