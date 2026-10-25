import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CtPhoto } from "./ct-photo";

export function HomeCtIntro() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Conheça o CT</h2>
      <CtPhoto />
      <p className="max-w-2xl leading-relaxed text-muted-foreground">
        O CT Beach Sports é um centro de treinamento de vôlei de praia para todos os níveis, do
        primeiro contato com a areia ao jogo competitivo. Durante a temporada, os alunos disputam
        um circuito próprio de etapas e acompanham o ranking aqui.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button asChild>
          <Link href="/contato">Fale com a gente</Link>
        </Button>
        <Link
          href="/sobre"
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Saiba mais sobre o CT
        </Link>
      </div>
    </section>
  );
}
