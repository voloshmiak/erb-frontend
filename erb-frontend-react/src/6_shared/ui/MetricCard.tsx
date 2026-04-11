import type { ReactNode } from 'react';
import { cn } from '@/6_shared/lib/utils';
import { metricToneClass, pageStyles } from '@/6_shared/ui/pageStyles';

type MetricTone = 'primary' | 'warning' | 'neutral' | 'success';

interface MetricCardProps {
  label: string;
  value: string | number;
  hint: string;
  icon: ReactNode;
  tone?: MetricTone;
  className?: string;
}

export const MetricCard = ({
  label,
  value,
  hint,
  icon,
  tone = 'primary',
  className,
}: MetricCardProps) => {
  const toneClasses = metricToneClass(tone);

  return (
    <div className={cn(pageStyles.metricCard, className)}>
      <div className={cn(pageStyles.metricOrb, toneClasses.orb)} />
      <div className={pageStyles.metricLabel}>
        <div className={cn('p-1.5 rounded-md', toneClasses.iconWrap, toneClasses.iconColor)}>{icon}</div>
        {label}
      </div>
      <div className="relative z-10">
        <div className={pageStyles.metricValue}>{value}</div>
        <div className={cn(pageStyles.metricHint, toneClasses.hint)}>{hint}</div>
      </div>
    </div>
  );
};
