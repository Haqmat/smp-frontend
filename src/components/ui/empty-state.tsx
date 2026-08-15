import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.FC<{ className?: string }>;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-border bg-card text-card-foreground rounded-2xl max-w-lg mx-auto my-6">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mb-6">
          <Icon className="w-8 h-8 text-[#a38413]" />
        </div>
      )}
      <h3 className="text-xl font-bold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-base text-muted-foreground mb-6 max-w-sm">
        {description}
      </p>
      {actionText && onAction && (
        <Button
          onClick={onAction}
          className="rounded-xl bg-[#a38413] hover:bg-[#85690F] text-white px-5 py-2.5 text-base shadow-sm hover:shadow-md transition-all font-medium"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};
