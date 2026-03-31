import type { AdapterConfigFieldsProps } from "../types";

export function PollConfigFields(_props: AdapterConfigFieldsProps) {
  return (
    <p className="text-sm text-muted-foreground">
      This agent polls for tasks via the Paperclip API and manages its own
      execution lifecycle. No adapter configuration is needed.
    </p>
  );
}
