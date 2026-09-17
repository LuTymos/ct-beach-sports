import Link from "next/link";
import { getContactTickets } from "@/features/contact/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const cards = [
  {
    href: "/admin/atletas",
    title: "Atletas",
    description: "Cadastrar e gerenciar atletas do torneio.",
  },
  {
    href: "/admin/etapas",
    title: "Etapas",
    description: "Datas, locais e links de auditoria.",
  },
  {
    href: "/admin/resultados",
    title: "Resultados",
    description: "Lançar série + colocação; pontos calculados automaticamente.",
  },
  {
    href: "/admin/importacao",
    title: "Importar CSV",
    description: "Importar resultados de uma etapa a partir da planilha.",
  },
  {
    href: "/admin/tickets",
    title: "Tickets",
    description: "Mensagens do formulário de contato (público).",
  },
] as const;

export default async function AdminHomePage() {
  const tickets = await getContactTickets();
  const openTickets = tickets.filter((ticket) => ticket.status === "open").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
        <p className="text-muted-foreground">Área restrita — CT Beach Sports</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="h-full transition hover:border-primary/40">
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                <CardTitle>{card.title}</CardTitle>
                {card.href === "/admin/tickets" && openTickets > 0 ? (
                  <Badge>{openTickets} aberto{openTickets === 1 ? "" : "s"}</Badge>
                ) : null}
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {card.description}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
