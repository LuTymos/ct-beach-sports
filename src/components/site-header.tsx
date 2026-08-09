import Link from "next/link";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Ranking" },
  { href: "/etapas", label: "Etapas" },
];

export function SiteHeader() {
  return (
    <header className="border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <div>
          <Link href="/" className="text-lg font-semibold tracking-tight">
            CT Beach Sports
          </Link>
          <p className="text-xs text-muted-foreground">Ranking Torneio 2026</p>
        </div>
        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <Button key={link.href} asChild variant="ghost" size="sm">
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">Admin</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
