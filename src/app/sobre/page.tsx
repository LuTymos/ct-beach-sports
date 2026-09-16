import { Metadata } from "next";
import Link from "next/link";
import { Trophy, Users, Heart, Award, ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sobre Nós | CT Beach Sports",
  description:
    "Conheça a história e a estrutura do CT Beach Sports, o centro de treinamento focado na evolução do seu vôlei de praia.",
};

export default function SobrePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-black">
          Sobre o <span className="text-amber-600 dark:text-amber-500">CT Beach Sports</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Paixão pela areia, evolução constante e uma comunidade unida pelo esporte.
        </p>
      </section>

      {/* Nossa História / Missão */}
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Mais do que treinar, vivemos o vôlei de praia
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            O <strong>CT Beach Sports</strong> nasceu com a missão de transformar a experiência do vôlei de praia. 
            Acreditamos que o esporte vai além do rendimento físico: é sobre superação pessoal, criação de amizades 
            e momentos inesquecíveis dentro e fora das quadras.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Desenvolvemos um método de treinamento adaptado para todos os níveis — do iniciante que está dando seus 
            primeiros passos na areia ao atleta avançado que busca aperfeiçoamento tático e alta performance.
          </p>
        </div>

        {/* Card Ilustrativo do Circuito / Ranking */}
        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-slate-900 dark:to-slate-900/50 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center space-x-3 text-amber-600 dark:text-amber-500">
              <Trophy className="h-8 w-8" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                O Ranking Interno 2026
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed text-white">
              Para incentivar a prática saudável e a competição entre nossos alunos, mantemos um circuito próprio de torneios! 
              Acumule pontos em cada etapa, dispute as Séries Ouro, Prata e Bronze, e acompanhe sua evolução no nosso ranking oficial em tempo real.
            </p>
            <div className="pt-2">
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/ranking" className="flex items-center gap-2">
                  Ver Ranking Atual <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Valores / Pilares */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold">Nossos Pilares</h2>
          <p className="text-muted-foreground">O que nos move diariamente na areia</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="p-3 w-fit rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">Evolução Técnica</h3>
              <p className="text-sm text-muted-foreground">
                Treinos estruturados para aprimorar fundamentos, táticas de jogo e condicionamento físico específico para a areia.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="p-3 w-fit rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">Comunidade e Respeito</h3>
              <p className="text-sm text-muted-foreground">
                Promovemos um ambiente acolhedor, inclusivo e integrado onde todos se apoiam e evoluem juntos.
              </p>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardContent className="p-6 space-y-3">
              <div className="p-3 w-fit rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">Paixão pelo Esporte</h3>
              <p className="text-sm text-muted-foreground">
                A energia da praia e o amor pelo vôlei transformam cada treino em um momento único de lazer e saúde.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Categorias de Treinamento */}
      <section className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Turmas e Níveis</h2>
          <p className="text-white">
            Oferecemos turmas divididas por níveis para garantir um aprendizado equilibrado e dinâmico:
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-background p-4 rounded-xl border space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Iniciante
            </span>
            <h4 className="font-semibold text-base">Adaptação e Base</h4>
            <p className="text-xs text-muted-foreground">
              Foco no aprendizado das regras, movimentação na areia, manchete, toque e saque.
            </p>
          </div>

          <div className="bg-background p-4 rounded-xl border space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Intermediário
            </span>
            <h4 className="font-semibold text-base">Consolidação e Tática</h4>
            <p className="text-xs text-muted-foreground">
              Aprimoramento de ataque, bloqueio, defesa e leitura de jogo em situações reais.
            </p>
          </div>

          <div className="bg-background p-4 rounded-xl border space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Avançado
            </span>
            <h4 className="font-semibold text-base">Alta Performance</h4>
            <p className="text-xs text-muted-foreground">
              Refinamento tático, ritmo de jogo intenso e preparação focada para competições.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action (Inscrição e Contato) */}
      <section className="text-center space-y-6 py-6">
        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="text-3xl font-bold">Quer fazer parte da nossa família?</h2>
          <p className="text-muted-foreground">
            Fale conosco, tire suas dúvidas ou inscreva sua dupla para as próximas etapas do nosso circuito.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700 text-white">
            <Link href="/etapas">Ver Próximas Etapas</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contato">Fale Conosco</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}