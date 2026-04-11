import type { ElementType } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ElementType;
  trendText?: string;
  trendIcon?: ElementType;
  subtitle?: string;
  colorTheme: 'primary' | 'tertiary' | 'secondary';
}

const themeClasses = {
  primary: {
    circle: 'bg-primary/5',
    iconBg: 'bg-primary-fixed',
    iconText: 'text-primary',
    trendText: 'text-primary',
  },
  tertiary: {
    circle: 'bg-tertiary-container/5',
    iconBg: 'bg-tertiary-fixed',
    iconText: 'text-tertiary',
    trendText: 'text-tertiary',
  },
  secondary: {
    circle: 'bg-secondary-container/10',
    iconBg: 'bg-secondary-fixed',
    iconText: 'text-secondary',
    trendText: 'text-on-surface-variant',
  },
};

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trendText,
  trendIcon: TrendIcon,
  subtitle,
  colorTheme,
}: StatCardProps) => {
  const theme = themeClasses[colorTheme];

  return (
    <div className="bg-surface-container-lowest dark:bg-slate-900 p-6 rounded-xl relative overflow-hidden group shadow-sm">
      <div
        className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110 ${theme.circle}`}
      ></div>

      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className={`p-2 rounded-lg ${theme.iconBg}`}>
          <Icon className={`w-6 h-6 ${theme.iconText}`} />
        </div>
        <span className="text-on-surface-variant font-medium text-xs uppercase tracking-wider">
          {title}
        </span>
      </div>

      <div className="text-4xl font-extrabold text-on-surface mb-1 relative z-10">
        {value}
      </div>

      <div className="relative z-10">
        {trendText && TrendIcon ? (
          <div className={`flex items-center font-bold text-xs ${theme.trendText}`}>
            <TrendIcon className="w-4 h-4 mr-1" />
            {trendText}
          </div>
        ) : (
          <div className="text-on-surface-variant font-bold text-xs">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};