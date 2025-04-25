import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";

type SectionCardProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "subtle";
};

export function SectionCard({
  title,
  description,
  icon,
  actions,
  children,
  className,
  variant = "default",
}: SectionCardProps) {
  return (
    <Card
      className={cn(
        "h-full",
        variant === "subtle" && "bg-muted/40 border-muted",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xl font-semibold">
              {icon && <span className="text-muted-foreground">{icon}</span>}
              {title}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      </CardHeader>

      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}
