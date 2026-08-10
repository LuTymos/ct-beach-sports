import { submitContactTicketAction } from "@/features/contact/actions";
import { TICKET_REASON_LABELS, TICKET_REASONS } from "@/features/contact/reasons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{ error?: string; ok?: string }>;
};

const selectClassName = cn(
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
);

export default async function ContatoPage({ searchParams }: PageProps) {
  const { error, ok } = await searchParams;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Contato</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Envie um ticket sobre pontuação, sugestão, bug ou outro assunto do ranking.
        </p>
      </div>

      {ok && (
        <Alert>
          <AlertTitle>Ticket enviado</AlertTitle>
          <AlertDescription>
            Recebemos sua mensagem. O professor vai revisar quando puder.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível enviar</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Abrir ticket</CardTitle>
          <CardDescription>Nome, motivo e a mensagem com o máximo de detalhe.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={submitContactTicketAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" required maxLength={120} autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo</Label>
              <select id="reason" name="reason" required className={selectClassName} defaultValue="">
                <option value="" disabled>
                  Selecione
                </option>
                {TICKET_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {TICKET_REASON_LABELS[reason]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                name="message"
                required
                maxLength={4000}
                rows={6}
                placeholder="Descreva o que aconteceu, etapa, atleta, etc."
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Enviar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
