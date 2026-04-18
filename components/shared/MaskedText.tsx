import { cn } from "@/lib/utils/cn";
interface MaskedTextProps { value: string; visibleChars?: number; className?: string; }
export function MaskedText({ value, visibleChars = 3, className }: MaskedTextProps) {
  if (!value) return null;
  const masked = value.length <= visibleChars ? "•".repeat(value.length) : "•".repeat(value.length - visibleChars) + value.slice(-visibleChars);
  return <span className={cn("font-mono text-sm tracking-wider text-slate-500", className)} aria-label="Masked identifier">{masked}</span>;
}
