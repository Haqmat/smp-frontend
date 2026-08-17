import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendUp, TrendDown } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number; // percent value (e.g. 12.5 or -5.4)
  trendLabel?: string;
  icon?: React.FC<{ className?: string }>;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  trendLabel = 'vs last period',
  icon: Icon,
  accentColor = 'border-l-4 border-l-[#5A3E2B]',
}) => {
  const hasTrend = trend !== undefined;
  const isPositive = hasTrend && trend! >= 0;

  return (
    <Card className={cn('rounded-2xl border-border shadow-sm overflow-hidden bg-card text-card-foreground', accentColor)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-base font-medium text-muted-foreground">
              {title}
            </p>
            <h3 className="text-3xl font-bold text-foreground">
              {value}
            </h3>
          </div>
          {Icon && (
            <div className="w-12 h-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
              <Icon className="w-6 h-6 text-[#5A3E2B]" />
            </div>
          )}
        </div>

        {hasTrend && (
          <div className="flex items-center gap-1.5 mt-4">
            <span
              className={cn(
                'flex items-center text-sm font-semibold rounded-lg px-2 py-0.5',
                isPositive
                  ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
              )}
            >
              {isPositive ? (
                <TrendUp className="w-4 h-4 mr-0.5 inline-block" />
              ) : (
                <TrendDown className="w-4 h-4 mr-0.5 inline-block" />
              )}
              {isPositive ? '+' : ''}
              {trend?.toFixed(1)}%
            </span>
            <span className="text-sm text-muted-foreground">
              {trendLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
