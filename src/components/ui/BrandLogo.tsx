"use client";

import Link from "next/link";
import Image from "next/image";

interface BrandLogoProps {
  className?: string;
  variant?: "full" | "mark";
  size?: "sm" | "md" | "lg";
}

export function BrandLogo({ className = "", variant = "full", size = "md" }: BrandLogoProps) {
  const heightClasses = {
    sm: "h-7",
    md: "h-9",
    lg: "h-14",
  }[size];

  return (
    <Link href="/" className={`inline-flex items-center gap-2 group transition-transform active:scale-95 ${className}`}>
      {variant === "mark" ? (
        <div className={`relative ${heightClasses} aspect-square flex items-center justify-center`}>
          <Image
            src="/brand/astrox-mark.svg"
            alt="Astrox Astral Mark"
            width={48}
            height={48}
            className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(245,199,26,0.35)]"
          />
        </div>
      ) : (
        <div className={`relative ${heightClasses} aspect-[3.7/1] flex items-center`}>
          <Image
            src="/brand/astrox-logo.svg"
            alt="Astrox Luxury Brand"
            width={185}
            height={50}
            className="w-full h-full object-contain filter drop-shadow-[0_0_14px_rgba(245,199,26,0.25)]"
            priority
          />
        </div>
      )}
    </Link>
  );
}
