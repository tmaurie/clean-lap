import React from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

export function PageHeader({
  title,
  description,
  icon,
  actions,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <h1 className="flex gap-2 text-2xl font-bold tracking-tight">
          {icon && <span className="text-muted-foreground">{icon}</span>}{" "}
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {actions && <div>{actions}</div>}
      {children}
    </div>
  );
}
