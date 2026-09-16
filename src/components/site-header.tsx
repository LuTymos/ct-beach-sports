import Link from "next/link";
import { SiteHeaderNav } from "@/components/site-header-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:py-4">
        <div className="min-w-0">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            CT Beach Sports
          </Link>
          <p className="text-xs text-muted-foreground">Ranking Torneio 2026</p>
        </div>
        <SiteHeaderNav />
      </div>
    </header>
  );
}
