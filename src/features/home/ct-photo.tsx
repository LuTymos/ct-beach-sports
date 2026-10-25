import { cn } from "@/lib/utils";

/**
 * Faixa decorativa no lugar da foto do CT.
 * Único ponto a trocar quando houver foto real.
 */
export function CtPhoto({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "aspect-[16/7] w-full rounded-xl border border-border bg-[repeating-linear-gradient(135deg,var(--muted)_0_16px,var(--accent)_16px_32px)]",
        className,
      )}
    />
  );
}
