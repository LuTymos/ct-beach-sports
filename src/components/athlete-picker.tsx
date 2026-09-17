"use client";

import { useId, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type AthleteOption = {
  id: string;
  name: string;
  team?: string | null;
};

type AthletePickerProps = {
  name: string;
  id?: string;
  label: string;
  athletes: AthleteOption[];
  required?: boolean;
  defaultValue?: string;
  className?: string;
};

const selectClassName = cn(
  "flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-9"
);

export function AthletePicker({
  name,
  id: idProp,
  label,
  athletes,
  required,
  defaultValue = "",
  className,
}: AthletePickerProps) {
  const reactId = useId();
  const id = idProp ?? `athlete-${reactId}`;
  const filterId = `${id}-filter`;
  const [filter, setFilter] = useState("");
  const [value, setValue] = useState(defaultValue);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return athletes;
    return athletes.filter(
      (athlete) =>
        athlete.name.toLowerCase().includes(q) ||
        (athlete.team ?? "").toLowerCase().includes(q)
    );
  }, [athletes, filter]);

  const selectedStillVisible = filtered.some((athlete) => athlete.id === value);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={filterId}
        type="search"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        placeholder="Filtrar lista…"
        className="h-11 md:h-9"
        autoComplete="off"
      />
      <select
        id={id}
        name={name}
        required={required}
        value={selectedStillVisible ? value : ""}
        onChange={(event) => setValue(event.target.value)}
        className={selectClassName}
      >
        <option value="" disabled>
          {filtered.length === 0 ? "Nenhum atleta encontrado" : "Selecione"}
        </option>
        {filtered.map((athlete) => (
          <option key={athlete.id} value={athlete.id}>
            {athlete.name}
            {athlete.team ? ` (${athlete.team})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
