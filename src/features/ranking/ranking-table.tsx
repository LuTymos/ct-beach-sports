import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { RankingRow } from "@/types";

type RankingTableProps = {
  rows: RankingRow[];
  emptyMessage?: string;
};

export function RankingTable({
  rows,
  emptyMessage = "Nenhum resultado lançado ainda.",
}: RankingTableProps) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead>Atleta</TableHead>
            <TableHead>Equipe</TableHead>
            <TableHead className="text-right">Pontos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.athleteId}>
              <TableCell>
                {row.position <= 3 ? (
                  <Badge variant={row.position === 1 ? "default" : "secondary"}>
                    {row.position}º
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">{row.position}º</span>
                )}
              </TableCell>
              <TableCell className="font-medium">
                <Link href={`/atletas/${row.athleteId}`} className="hover:underline">
                  {row.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{row.team ?? "—"}</TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                {row.totalPoints}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
