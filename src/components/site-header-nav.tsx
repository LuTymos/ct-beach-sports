"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const primaryLinks = [
  { href: "/", label: "Ranking" },
  { href: "/etapas", label: "Etapas" },
  { href: "/contato", label: "Contato" },
  { href: "/sobre", label: "Sobre" },
  { href: "/conta/login", label: "Conta" },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/conta/login") {
    return pathname === "/conta" || pathname.startsWith("/conta/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeaderNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
        {primaryLinks.map((link) => (
          <Button
            key={link.href}
            asChild
            variant="ghost"
            size="sm"
            className={cn(isActivePath(pathname, link.href) && "bg-accent text-accent-foreground")}
          >
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
        <Button asChild variant="outline" size="sm">
          <Link href="/admin">Admin</Link>
        </Button>
      </nav>

      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11 shrink-0"
              aria-label="Abrir menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex w-[min(100%,20rem)] flex-col gap-0 p-0">
            <SheetHeader className="border-b px-4 py-4 text-left">
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>CT Beach Sports — Ranking Torneio 2026</SheetDescription>
            </SheetHeader>
            <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Principal">
              {primaryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex min-h-11 items-center rounded-md px-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActivePath(pathname, link.href) && "bg-accent text-accent-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto border-t p-3">
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Admin
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
