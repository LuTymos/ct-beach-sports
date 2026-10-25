import { Metadata } from "next";
import Link from "next/link";
import { Trophy, Medal, Award, CheckCircle2, ArrowRight, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  PARTICIPATION_POINTS,
  PODIUM_SERIES,
  SERIES_LABELS,
  calculatePoints,
  getPodiumTable,
  type Placement,
  type PodiumSeries,
} from "@/lib/scoring";

export const metadata: Metadata = {
  title: "Como Pontua | CT Beach Sports",
  description:
    "Entenda como funciona o sistema de pontuação e ranking dos torneios do CT Beach Sports. Veja as pontuações por Série e Colocação.",
};

const PODIUM_TABLE = getPodiumTable();
const BRONZINHO_POINTS = calculatePoints("bronzinho", 1);

const PLACEMENT_LABELS: Record<Placement, { card: string; table: string }> = {
  1: { card: "🏆 Campeões (1º)", table: "1º Lugar (Campeão)" },
  2: { card: "🥈 Vice-campeões (2º)", table: "2º Lugar (Vice)" },
  3: { card: "🥉 Terceiro Lugar (3º)", table: "3º Lugar" },
  4: { card: "Quarto Lugar (4º)", table: "4º Lugar" },
};

const SERIES_STYLE: Record<
  PodiumSeries,
  {
    Icon: typeof Trophy;
    description: string;
    card: string;
    iconWrap: string;
    title: string;
    highlight: string;
    head: string;
  }
> = {
  ouro: {
    Icon: Trophy,
    description: "A divisão principal do torneio",
    card: "border-amber-500/30 bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-950/20 dark:to-transparent shadow-sm",
    iconWrap: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400",
    title: "text-amber-600 dark:text-amber-400",
    highlight: "text-amber-600 dark:text-amber-400",
    head: "text-amber-600 dark:text-amber-400",
  },
  prata: {
    Icon: Medal,
    description: "Disputa acirrada na chave Prata",
    card: "border-slate-300 dark:border-slate-800 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm",
    iconWrap: "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
    title: "text-slate-700 dark:text-slate-300",
    highlight: "text-slate-700 dark:text-slate-300",
    head: "text-slate-600 dark:text-slate-300",
  },
  bronze: {
    Icon: Award,
    description: "Evolução e experiência em quadra",
    card: "border-amber-900/20 dark:border-amber-900/40 bg-gradient-to-b from-amber-900/5 to-transparent dark:from-amber-950/10 dark:to-transparent shadow-sm",
    iconWrap: "bg-amber-900/10 dark:bg-amber-900/30 text-amber-800 dark:text-amber-500",
    title: "text-amber-800 dark:text-amber-500",
    highlight: "text-amber-800 dark:text-amber-500",
    head: "text-amber-800 dark:text-amber-500",
  },
};

export default function ComoPontuaPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-12">
      {/* Header */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Como Funciona a <span className="text-amber-600 dark:text-amber-500">Pontuação</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Confira como os pontos são distribuídos em cada etapa do nosso circuito e como você acumula pontos no Ranking Geral 2026.
        </p>
      </section>

      {/* Cards das Séries */}
      <section className="grid md:grid-cols-3 gap-6">
        {PODIUM_SERIES.map((series) => {
          const style = SERIES_STYLE[series];
          return (
            <Card key={series} className={style.card}>
              <CardHeader className="text-center pb-2">
                <div
                  className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${style.iconWrap}`}
                >
                  <style.Icon className="h-6 w-6" />
                </div>
                <CardTitle className={`text-2xl ${style.title}`}>{SERIES_LABELS[series]}</CardTitle>
                <CardDescription>{style.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {PODIUM_TABLE.map(({ placement, points }) => (
                  <div
                    key={placement}
                    className={`flex justify-between items-center text-sm py-1.5 ${
                      placement === 4 ? "" : "border-b"
                    }`}
                  >
                    <span
                      className={
                        placement === 1
                          ? "font-semibold text-slate-900 dark:text-slate-100"
                          : undefined
                      }
                    >
                      {PLACEMENT_LABELS[placement].card}
                    </span>
                    <span className={placement === 1 ? `font-bold ${style.highlight}` : "font-semibold"}>
                      {points[series]} pts
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Tabela Resumo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Tabela Resumida de Pontuação</h2>
        <div className="border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-900">
                <TableHead className="font-bold">Colocação</TableHead>
                {PODIUM_SERIES.map((series) => (
                  <TableHead key={series} className={`text-center font-bold ${SERIES_STYLE[series].head}`}>
                    {SERIES_LABELS[series]}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {PODIUM_TABLE.map(({ placement, points }) => (
                <TableRow key={placement}>
                  <TableCell className="font-semibold">{PLACEMENT_LABELS[placement].table}</TableCell>
                  {PODIUM_SERIES.map((series) => (
                    <TableCell key={series} className="text-center font-bold">
                      {points[series]} pts
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Regras Especiais e Pontos Extra */}
      <section className="grid md:grid-cols-2 gap-6">
        <Card className="border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/10">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
              <h3 className="text-lg font-bold">Pontos de Participação</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Todos os atletas inscritos que disputarem a etapa recebem <strong>{PARTICIPATION_POINTS} pontos de participação</strong>, independentemente de se classificarem para as fases finais. Entrar em quadra já garante pontos no seu ranking!
            </p>
          </CardContent>
        </Card>

        <Card className="border-sky-500/20 bg-sky-50/30 dark:bg-sky-950/10">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center space-x-3 text-sky-600 dark:text-sky-400">
              <HelpCircle className="h-6 w-6" />
              <h3 className="text-lg font-bold">Série Bronzinho</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Em etapas com chaveamento estendido (Bronzinho), as duplas classificadas do 1º ao 4º lugar recebem pontuação fixa de <strong>{BRONZINHO_POINTS} pontos</strong>, mantendo a igualdade e incentivando a rodagem dos atletas.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Call to Action */}
      <section className="text-center space-y-6 pt-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Pronto para subir no Ranking?</h2>
          <p className="text-muted-foreground">
            Confira como está a classificação geral dos atletas do CT Beach Sports.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700 text-white">
            <Link href="/ranking" className="flex items-center gap-2">
              Ver Ranking Geral <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}