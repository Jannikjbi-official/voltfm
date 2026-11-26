import Image from "next/image";
import { cn } from "@heroui/react";
import type { PartnerDTO } from "@/services/content/partners";

/**
 * Das Logo, quadratisch und mit Kante. Ohne Logo steht der Anfangsbuchstabe
 * auf einem kleinen Display — ehrlich leer statt eines erfundenen Bildes.
 */
export function PartnerLogo({
  partner,
  size,
  className,
  alt = "",
}: {
  partner: PartnerDTO;
  size: number;
  className?: string;
  alt?: string;
}) {
  if (partner.logo) {
    return (
      <Image
        src={partner.logo}
        alt={alt}
        width={size}
        height={size}
        sizes={`${size}px`}
        className={cn("rounded-[var(--radius)] bg-surface object-cover shadow-[var(--surface-shadow)]", className)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn("display-panel display-dots grid place-items-center rounded-[var(--radius)] font-dot text-5xl text-volt", className)}
    >
      {partner.name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
