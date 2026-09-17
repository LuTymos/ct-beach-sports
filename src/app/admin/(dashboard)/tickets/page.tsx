import Link from "next/link";
import { markTicketDoneAction } from "@/features/contact/actions";
import { getContactTickets } from "@/features/contact/queries";
import { TICKET_REASON_LABELS, type TicketReason } from "@/features/contact/reasons";
import { ListSearch } from "@/components/list-search";
import { PaginationControls } from "@/components/pagination-controls";
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
import { buildListHref, matchesSearch, parsePage, parseSearch } from "@/lib/list-params";
import { paginate } from "@/lib/paginate";
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{ error?: string; q?: string; page?: string; status?: string }>;
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

function parseStatus(value?: string): "open" | "all" {
  return value === "open" ? "open" : "all";
}

export default async function AdminTicketsPage({ searchParams }: PageProps) {
  const { error, q: qRaw, page: pageRaw, status: statusRaw } = await searchParams;
  const q = parseSearch(qRaw);
  const page = parsePage(pageRaw);
  const status = parseStatus(statusRaw);
  const tickets = await getContactTickets();
  const openCount = tickets.filter((t) => t.status === "open").length;

  const statusFiltered =
    status === "open" ? tickets.filter((t) => t.status === "open") : tickets;
  const filtered = q
    ? statusFiltered.filter(
        (ticket) => matchesSearch(ticket.name, q) || matchesSearch(ticket.message, q)
      )
    : statusFiltered;
  const paginated = paginate(filtered, page);

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

      <div className="flex flex-wrap gap-2" role="navigation" aria-label="Status">
        {(
          [
            { value: "all", label: "Todos" },
            { value: "open", label: `Abertos (${openCount})` },
          ] as const
        ).map((tab) => {
          const active = status === tab.value;
          return (
            <Link
              key={tab.value}
              href={buildListHref("/admin/tickets", {
                status: tab.value === "all" ? undefined : tab.value,
                q,
              })}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full border px-3.5 text-sm transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <ListSearch
        action="/admin/tickets"
        q={q}
        placeholder="Buscar por nome ou mensagem…"
        preserve={status === "open" ? { status: "open" } : undefined}
      />

      {paginated.total === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          {q || status === "open" ? "Nenhum ticket encontrado." : "Nenhum ticket ainda."}
        </p>
      ) : (
        <>
          <ul className="space-y-2 md:hidden">
            {paginated.items.map((ticket) => (
              <li key={ticket.id} className="space-y-3 rounded-xl border bg-card p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{ticket.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(ticket.created_at)} · {reasonLabel(ticket.reason)}
                    </p>
                  </div>
                  <Badge variant={ticket.status === "open" ? "default" : "secondary"}>
                    {ticket.status === "open" ? "Aberto" : "Feito"}
                  </Badge>
                </div>
                <p className="whitespace-pre-wrap text-sm">{ticket.message}</p>
                {ticket.status === "open" ? (
                  <form action={markTicketDoneAction}>
                    <input type="hidden" name="id" value={ticket.id} />
                    <Button type="submit" variant="outline" className="h-11 w-full">
                      Fechar
                    </Button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>

          <div className="hidden rounded-xl border bg-card md:block">
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
                {paginated.items.map((ticket) => (
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
                ))}
              </TableBody>
            </Table>
          </div>

          <PaginationControls
            path="/admin/tickets"
            paginated={paginated}
            params={{ q, status: status === "open" ? "open" : undefined }}
          />
        </>
      )}
    </div>
  );
}
