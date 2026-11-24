import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  suffix?: string;
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  large?: boolean;
}

const colorClasses = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
};

export function MetricCard({ icon: Icon, label, value, suffix, color = 'primary', large = false }: MetricCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-border p-4 ${large ? 'p-6' : ''}`}>
      <div className="flex items-center gap-3 mb-2">
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        <span className="text-sm text-text-secondary font-medium">{label}</span>
      </div>
      <div className={`font-bold text-text-primary ${large ? 'text-3xl' : 'text-2xl'}`}>
        {value}
        {suffix && <span className="text-lg font-normal text-text-secondary ml-1">{suffix}</span>}
      </div>
    </div>
  );
}
