import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildListHref } from "@/lib/list-params";

type ListSearchProps = {
  action: string;
  q: string;
  placeholder?: string;
  /** Extra hidden fields preserved on submit (e.g. status, categoria). */
  preserve?: Record<string, string>;
};

export function ListSearch({
  action,
  q,
  placeholder = "Buscar por nome…",
  preserve,
}: ListSearchProps) {
  const clearHref = buildListHref(action, { ...preserve });

  return (
    <form action={action} method="get" className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {preserve
        ? Object.entries(preserve).map(([name, value]) =>
            value ? <input key={name} type="hidden" name={name} value={value} /> : null
          )
        : null}
      <Input
        type="search"
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        className="h-11 sm:max-w-sm md:h-9"
        aria-label="Buscar"
      />
      <div className="flex gap-2">
        <Button type="submit" className="h-11 md:h-9">
          Buscar
        </Button>
        {q ? (
          <Button asChild type="button" variant="outline" className="h-11 md:h-9">
            <Link href={clearHref}>Limpar</Link>
          </Button>
        ) : null}
      </div>
    </form>
  );
}
