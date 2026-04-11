import { cn } from '@/6_shared/lib/utils';

export const pageStyles = {
  surface: 'bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 h-full overflow-y-auto',
  title: 'text-3xl font-bold text-slate-900 mb-6',
  sectionTitle: 'text-xl font-bold text-slate-900 mb-4',
  tableWrap: 'overflow-x-auto',
  table: 'w-full',
  thead: 'bg-slate-100 border-b-2 border-slate-300',
  th: 'text-left px-4 py-3 font-semibold text-slate-900',
  row: 'border-b border-slate-200 hover:bg-slate-50 transition-colors',
  td: 'px-4 py-3 text-sm text-slate-700',
  tdMono: 'px-4 py-3 font-mono text-sm text-slate-900',
  card: 'bg-white rounded-xl border border-slate-200/80 shadow-sm p-5',
  metricGrid: 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-8',
  metricCard:
    'bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group transition-shadow hover:shadow-md',
  metricOrb:
    'absolute top-0 right-0 w-24 h-24 rounded-bl-full z-0 transition-transform duration-500 ease-out origin-top-right group-hover:scale-125',
  metricLabel: 'text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2 relative z-10',
  metricValue: 'text-4xl font-black text-slate-900 transition-transform duration-300 group-hover:-translate-y-0.5',
  metricHint: 'text-xs font-bold mt-2',
} as const;

export type BadgeVariant = 'primary' | 'warning' | 'success' | 'danger' | 'neutral';
type ActionButtonVariant = 'primary' | 'danger' | 'neutral';
type ProgressVariant = 'primary' | 'warning' | 'success' | 'neutral';
type ProgressSize = 'sm' | 'md';

const badgeVariants: Record<BadgeVariant, string> = {
  primary: 'bg-blue-100 text-blue-700',
  warning: 'bg-amber-100 text-amber-700',
  success: 'bg-green-100 text-green-700',
  danger: 'bg-red-100 text-red-700',
  neutral: 'bg-slate-100 text-slate-700',
};

type MetricTone = 'primary' | 'warning' | 'neutral' | 'success';

const metricToneMap: Record<
  MetricTone,
  { orb: string; iconWrap: string; iconColor: string; hint: string }
> = {
  primary: {
    orb: 'bg-blue-50/40 group-hover:bg-blue-100/60',
    iconWrap: 'bg-blue-50',
    iconColor: 'text-blue-600',
    hint: 'text-blue-700',
  },
  warning: {
    orb: 'bg-orange-50/30 group-hover:bg-orange-100/50',
    iconWrap: 'bg-orange-50',
    iconColor: 'text-orange-700',
    hint: 'text-orange-700',
  },
  neutral: {
    orb: 'bg-slate-50 group-hover:bg-slate-100/80',
    iconWrap: 'bg-slate-100',
    iconColor: 'text-slate-600',
    hint: 'text-slate-500',
  },
  success: {
    orb: 'bg-green-50/40 group-hover:bg-green-100/60',
    iconWrap: 'bg-green-50',
    iconColor: 'text-green-700',
    hint: 'text-green-700',
  },
};

export const badgeClass = (variant: BadgeVariant) =>
  cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold', badgeVariants[variant]);

export const metricToneClass = (tone: MetricTone) => metricToneMap[tone];

const actionButtonVariants: Record<ActionButtonVariant, string> = {
  primary: 'bg-[#003b8e] hover:bg-[#002f70] text-white shadow-md',
  danger: 'bg-[#9b3c00] hover:bg-[#7f3000] text-white shadow-md',
  neutral: 'bg-slate-200 hover:bg-slate-300 text-slate-800',
};

export const actionButtonClass = (variant: ActionButtonVariant = 'primary') =>
  cn(
    'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-all active:scale-95',
    actionButtonVariants[variant]
  );

const progressTrackSizes: Record<ProgressSize, string> = {
  sm: 'h-2',
  md: 'h-3',
};

const progressFillVariants: Record<ProgressVariant, string> = {
  primary: 'bg-blue-600',
  warning: 'bg-amber-500',
  success: 'bg-green-600',
  neutral: 'bg-slate-500',
};

export const progressTrackClass = (size: ProgressSize = 'sm') =>
  cn('w-full rounded-full bg-slate-200', progressTrackSizes[size]);

export const progressFillClass = (variant: ProgressVariant = 'primary', size: ProgressSize = 'sm') =>
  cn('rounded-full transition-all duration-300', progressTrackSizes[size], progressFillVariants[variant]);
