import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/admin/actions";

const adminLinks = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/atletas", label: "Atletas" },
  { href: "/admin/etapas", label: "Etapas" },
  { href: "/admin/resultados", label: "Resultados" },
  { href: "/admin/importacao", label: "Importar" },
  { href: "/admin/tickets", label: "Tickets" },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
        <nav className="flex flex-wrap gap-1">
          {adminLinks.map((link) => (
            <Button key={link.href} asChild variant="ghost" size="sm">
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm">
            Sair
          </Button>
        </form>
      </div>
      {children}
    </div>
  );
}
