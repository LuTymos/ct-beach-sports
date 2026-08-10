import { markTicketDoneAction } from "@/features/contact/actions";
import { getContactTickets } from "@/features/contact/queries";
import { TICKET_REASON_LABELS, type TicketReason } from "@/features/contact/reasons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

function reasonLabel(reason: string) {
  return TICKET_REASON_LABELS[reason as TicketReason] ?? reason;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default async function AdminTicketsPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const tickets = await getContactTickets();
  const openCount = tickets.filter((t) => t.status === "open").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Tickets</h1>
        <p className="text-sm text-muted-foreground">
          Mensagens do formulário público de contato
          {openCount > 0 ? ` — ${openCount} aberto${openCount === 1 ? "" : "s"}` : ""}.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quando</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Mensagem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[1%]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  Nenhum ticket ainda.
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(ticket.created_at)}
                  </TableCell>
                  <TableCell className="font-medium">{ticket.name}</TableCell>
                  <TableCell>{reasonLabel(ticket.reason)}</TableCell>
                  <TableCell className="max-w-md whitespace-pre-wrap text-sm">
                    {ticket.message}
                  </TableCell>
                  <TableCell>
                    <Badge variant={ticket.status === "open" ? "default" : "secondary"}>
                      {ticket.status === "open" ? "Aberto" : "Feito"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ticket.status === "open" && (
                      <form action={markTicketDoneAction}>
                        <input type="hidden" name="id" value={ticket.id} />
                        <Button type="submit" variant="outline" size="sm">
                          Fechar
                        </Button>
                      </form>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
