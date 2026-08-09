import Link from "next/link";
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
];

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
        <p className="text-muted-foreground">Área restrita — CT Beach Sports</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="h-full transition hover:border-primary/40">
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
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
