import type { ReactNode } from "react";

interface WorkspaceHeadingProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export function WorkspaceHeading({ title, description, actions }: WorkspaceHeadingProps) {
  return (
    <header className="flex min-w-0 flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 [overflow-wrap:anywhere]">
        <h1 className="text-[1.75rem] leading-tight font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-prose text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex max-w-full flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
