import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useLanguage } from "@/Contexts/LanguageContext";

interface EmptyStateProps {
  /**
   * Icon to display in the empty state
   */
  icon?: LucideIcon;
  /**
   * Main title text to display
   */
  title?: string;
  /**
   * Optional description text
   */
  description?: string;
  /**
   * Optional action component (like a button)
   */
  action?: React.ReactNode;
  /**
   * Optional custom className
   */
  className?: string;
  /**
   * Optional override for icon size
   */
  iconSize?: number;
  /**
   * Optional override for icon class name
   */
  iconClassName?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  iconSize = 24,
  iconClassName,
}: EmptyStateProps) {
  const { t } = useLanguage();

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-6 text-center",
      className
    )}>
      {Icon && (
        <div className="mb-4">
          <Icon
            className={cn("text-muted-foreground", iconClassName)}
            size={iconSize}
            aria-hidden="true"
          />
        </div>
      )}

      {title && (
        <h3 className="text-sm font-medium text-muted-foreground">
          {title}
        </h3>
      )}

      {description && (
        <p className="mt-1 text-xs text-muted-foreground">
          {description}
        </p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
