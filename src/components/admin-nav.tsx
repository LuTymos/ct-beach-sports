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
import { logoutAction } from "@/features/admin/actions";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/atletas", label: "Atletas" },
  { href: "/admin/etapas", label: "Etapas" },
  { href: "/admin/resultados", label: "Resultados" },
  { href: "/admin/importacao", label: "Importar" },
  { href: "/admin/tickets", label: "Tickets" },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="rounded-xl border bg-card px-3 py-3 sm:px-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium md:hidden">Admin</p>

        <nav className="hidden flex-wrap gap-1 md:flex" aria-label="Admin">
          {adminLinks.map((link) => (
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
        </nav>

        <div className="flex items-center gap-2">
          <form action={logoutAction} className="hidden md:block">
            <Button type="submit" variant="outline" size="sm">
              Sair
            </Button>
          </form>

          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-11 shrink-0"
                  aria-label="Abrir menu admin"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-[min(100%,20rem)] flex-col gap-0 p-0">
                <SheetHeader className="border-b px-4 py-4 text-left">
                  <SheetTitle>Admin</SheetTitle>
                  <SheetDescription>Área do professor</SheetDescription>
                </SheetHeader>
                <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Admin">
                  {adminLinks.map((link) => (
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
                  <form action={logoutAction}>
                    <Button type="submit" variant="outline" className="h-11 w-full">
                      Sair
                    </Button>
                  </form>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}
