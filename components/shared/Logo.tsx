import Link from "next/link";

/**
 * Official VisaSetGo logo.
 * Source files live in /public — `logo-full.png` (horizontal lockup with tagline)
 * and `logo-mark.png` (the V + plane mark, square).
 *
 * The mark's left stroke is dark navy, so on dark surfaces it is set on a white
 * tile (`onDark`) rather than reversed out.
 */

interface MarkProps {
  className?: string;
  onDark?: boolean;
}

export function LogoMark({ className = "h-9 w-9", onDark = false }: MarkProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl ${
        onDark ? "bg-white p-1 ring-1 ring-white/15" : ""
      } ${className}`}
    >
      <img src="/logo-mark.png" alt="" className="h-full w-full object-contain" />
    </span>
  );
}

/** Full horizontal lockup — use where there is room for the wordmark and tagline. */
export function LogoFull({ className = "h-9" }: { className?: string }) {
  return (
    <img
      src="/logo-full.png"
      alt="VisaSetGo — visas made simple"
      className={`${className} w-auto object-contain`}
    />
  );
}

/** Clickable lockup for headers. */
export function LogoLink({ className = "h-9", href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className="flex shrink-0 items-center transition-opacity hover:opacity-80">
      <LogoFull className={className} />
    </Link>
  );
}
