import * as React from "react";
import { cn } from "@/lib/utils";

function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-2 rounded-lg border border-dashed border-border px-4 py-6",
        className,
      )}
    >
      <p className="text-[13px] font-medium text-foreground-muted">{title}</p>
      {description && (
        <p className="text-[13px] text-foreground-subtle">{description}</p>
      )}
      {action}
    </div>
  );
}

export { EmptyState };
