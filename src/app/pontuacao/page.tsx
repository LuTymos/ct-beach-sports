import { Metadata } from "next";
import Link from "next/link";
import { Trophy, Medal, Award, CheckCircle2, ArrowRight, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Como Pontua | CT Beach Sports",
  description:
    "Entenda como funciona o sistema de pontuação e ranking dos torneios do CT Beach Sports. Veja as pontuações por Série e Colocação.",
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
        {/* Série Ouro */}
        <Card className="border-amber-500/30 bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-950/20 dark:to-transparent shadow-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2">
              <Trophy className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl text-amber-600 dark:text-amber-400">Série Ouro</CardTitle>
            <CardDescription>A divisão principal do torneio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="flex justify-between items-center text-sm py-1.5 border-b">
              <span className="font-semibold text-slate-900 dark:text-slate-100">🏆 Campeões (1º)</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">100 pts</span>
            </div>
            <div className="flex justify-between items-center text-sm py-1.5 border-b">
              <span>🥈 Vice-campeões (2º)</span>
              <span className="font-semibold">80 pts</span>
            </div>
            <div className="flex justify-between items-center text-sm py-1.5 border-b">
              <span>🥉 Terceiro Lugar (3º)</span>
              <span className="font-semibold">60 pts</span>
            </div>
            <div className="flex justify-between items-center text-sm py-1.5">
              <span>Quarto Lugar (4º)</span>
              <span className="font-semibold">50 pts</span>
            </div>
          </CardContent>
        </Card>

        {/* Série Prata */}
        <Card className="border-slate-300 dark:border-slate-800 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 mb-2">
              <Medal className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl text-slate-700 dark:text-slate-300">Série Prata</CardTitle>
            <CardDescription>Disputa acirrada na chave Prata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="flex justify-between items-center text-sm py-1.5 border-b">
              <span className="font-semibold text-slate-900 dark:text-slate-100">🏆 Campeões (1º)</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">50 pts</span>
            </div>
            <div className="flex justify-between items-center text-sm py-1.5 border-b">
              <span>🥈 Vice-campeões (2º)</span>
              <span className="font-semibold">40 pts</span>
            </div>
            <div className="flex justify-between items-center text-sm py-1.5 border-b">
              <span>🥉 Terceiro Lugar (3º)</span>
              <span className="font-semibold">30 pts</span>
            </div>
            <div className="flex justify-between items-center text-sm py-1.5">
              <span>Quarto Lugar (4º)</span>
              <span className="font-semibold">20 pts</span>
            </div>
          </CardContent>
        </Card>

        {/* Série Bronze */}
        <Card className="border-amber-900/20 dark:border-amber-900/40 bg-gradient-to-b from-amber-900/5 to-transparent dark:from-amber-950/10 dark:to-transparent shadow-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-900/10 dark:bg-amber-900/30 flex items-center justify-center text-amber-800 dark:text-amber-500 mb-2">
              <Award className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl text-amber-800 dark:text-amber-500">Série Bronze</CardTitle>
            <CardDescription>Evolução e experiência em quadra</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="flex justify-between items-center text-sm py-1.5 border-b">
              <span className="font-semibold text-slate-900 dark:text-slate-100">🏆 Campeões (1º)</span>
              <span className="font-bold text-amber-800 dark:text-amber-500">30 pts</span>
            </div>
            <div className="flex justify-between items-center text-sm py-1.5 border-b">
              <span>🥈 Vice-campeões (2º)</span>
              <span className="font-semibold">20 pts</span>
            </div>
            <div className="flex justify-between items-center text-sm py-1.5 border-b">
              <span>🥉 Terceiro Lugar (3º)</span>
              <span className="font-semibold">10 pts</span>
            </div>
            <div className="flex justify-between items-center text-sm py-1.5">
              <span>Quarto Lugar (4º)</span>
              <span className="font-semibold">5 pts</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Tabela Resumo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Tabela Resumida de Pontuação</h2>
        <div className="border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-900">
                <TableHead className="font-bold">Colocação</TableHead>
                <TableHead className="text-center font-bold text-amber-600 dark:text-amber-400">Série Ouro</TableHead>
                <TableHead className="text-center font-bold text-slate-600 dark:text-slate-300">Série Prata</TableHead>
                <TableHead className="text-center font-bold text-amber-800 dark:text-amber-500">Série Bronze</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold">1º Lugar (Campeão)</TableCell>
                <TableCell className="text-center font-bold">100 pts</TableCell>
                <TableCell className="text-center font-bold">50 pts</TableCell>
                <TableCell className="text-center font-bold">30 pts</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">2º Lugar (Vice)</TableCell>
                <TableCell className="text-center font-bold">80 pts</TableCell>
                <TableCell className="text-center font-bold">40 pts</TableCell>
                <TableCell className="text-center font-bold">20 pts</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">3º Lugar</TableCell>
                <TableCell className="text-center font-bold">60 pts</TableCell>
                <TableCell className="text-center font-bold">30 pts</TableCell>
                <TableCell className="text-center font-bold">10 pts</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">4º Lugar</TableCell>
                <TableCell className="text-center font-bold">50 pts</TableCell>
                <TableCell className="text-center font-bold">20 pts</TableCell>
                <TableCell className="text-center font-bold">5 pts</TableCell>
              </TableRow>
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
              Todos os atletas inscritos que disputarem a etapa recebem <strong>5 pontos de participação</strong>, independentemente de se classificarem para as fases finais. Entrar em quadra já garante pontos no seu ranking!
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
              Em etapas com chaveamento estendido (Bronzinho), as duplas classificadas do 1º ao 4º lugar recebem pontuação fixa de <strong>5 pontos</strong>, mantendo a igualdade e incentivando a rodagem dos atletas.
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