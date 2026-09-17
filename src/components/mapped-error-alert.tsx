import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { messageForErrorParam } from "@/lib/flash-errors";

export function MappedErrorAlert({
  error,
  title,
}: {
  error?: string;
  title?: string;
}) {
  const description = messageForErrorParam(error);
  if (!description) return null;

  return (
    <Alert variant="destructive">
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
