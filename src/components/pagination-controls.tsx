import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buildListHref, type ListHrefParams } from "@/lib/list-params";
import type { Paginated } from "@/lib/paginate";

type PaginationControlsProps = {
  path: string;
  paginated: Pick<Paginated<unknown>, "page" | "totalPages" | "from" | "to" | "total">;
  params?: Omit<ListHrefParams, "page">;
};

export function PaginationControls({ path, paginated, params = {} }: PaginationControlsProps) {
  const { page, totalPages, from, to, total } = paginated;
  if (total === 0 || totalPages <= 1) return null;

  const prevHref = buildListHref(path, { ...params, page: page - 1 });
  const nextHref = buildListHref(path, { ...params, page: page + 1 });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Mostrando {from}–{to} de {total}
        <span className="text-muted-foreground/80">
          {" "}
          · Página {page} de {totalPages}
        </span>
      </p>
      <div className="flex gap-2">
        {page <= 1 ? (
          <Button variant="outline" className="h-11 flex-1 sm:h-9 sm:flex-none" disabled>
            Anterior
          </Button>
        ) : (
          <Button asChild variant="outline" className="h-11 flex-1 sm:h-9 sm:flex-none">
            <Link href={prevHref}>Anterior</Link>
          </Button>
        )}
        {page >= totalPages ? (
          <Button variant="outline" className="h-11 flex-1 sm:h-9 sm:flex-none" disabled>
            Próxima
          </Button>
        ) : (
          <Button asChild variant="outline" className="h-11 flex-1 sm:h-9 sm:flex-none">
            <Link href={nextHref}>Próxima</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
