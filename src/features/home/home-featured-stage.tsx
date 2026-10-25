import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowRight, CalendarDays, MapPin, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Stage } from "@/types";

export function HomeFeaturedStage({ stage }: { stage: Stage }) {
  const completed = stage.status === "completed";

  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
        {stage.status === "scheduled" ? "Próxima etapa" : "Destaque da última etapa"}
      </h2>
      <Link href={`/etapas/${stage.id}`} className="block">
        <Card className="border-border shadow-sm transition hover:border-primary/40">
          <CardContent className="space-y-3 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3 text-primary">
                <Trophy className="h-7 w-7 shrink-0" aria-hidden="true" />
                <h3 className="min-w-0 text-xl font-bold text-foreground">{stage.title}</h3>
              </div>
              <Badge variant={completed ? "default" : "secondary"}>
                {completed ? "Realizada" : "Agendada"}
              </Badge>
            </div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
              {format(parseISO(stage.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            {stage.location ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                {stage.location}
              </p>
            ) : null}
            <p className="pt-1 text-sm font-medium text-primary">
              Ver etapa <ArrowRight className="inline h-4 w-4" aria-hidden="true" />
            </p>
          </CardContent>
        </Card>
      </Link>
    </section>
  );
}
