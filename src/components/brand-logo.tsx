import Image from "next/image";

type BrandLogoProps = {
  priority?: boolean;
  className?: string;
};

export function BrandLogo({
  priority = false,
  className = "size-8 sm:size-9",
}: BrandLogoProps) {
  return (
    <span className={`relative block shrink-0 overflow-hidden rounded-lg ${className}`}>
      <Image
        src="/logo.png"
        alt=""
        fill
        quality={100}
        priority={priority}
        sizes="(max-width: 640px) 32px, 36px"
        className="object-contain"
      />
    </span>
  );
}
