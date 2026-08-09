import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStages } from "@/features/ranking/queries";

export const metadata = {
  title: "Etapas",
};

export default async function StagesPage() {
  const stages = await getStages();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Etapas 2026</h1>
        <p className="text-muted-foreground">
          Acompanhe o calendário e o ranking de cada etapa.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {stages.map((stage) => (
          <Link key={stage.id} href={`/etapas/${stage.id}`}>
            <Card className="h-full transition hover:border-primary/40">
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                <CardTitle className="text-lg">{stage.title}</CardTitle>
                <Badge variant={stage.status === "completed" ? "default" : "secondary"}>
                  {stage.status === "completed" ? "Realizada" : "Agendada"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>{format(parseISO(stage.date), "dd 'de' MMMM", { locale: ptBR })}</p>
                {stage.location && <p>{stage.location}</p>}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {stages.length === 0 && (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          Nenhuma etapa cadastrada. Rode o seed SQL ou cadastre no admin.
        </p>
      )}
    </div>
  );
}
