
import { ReactNode } from 'react';
import EliteCard from '@/components/ui/elite-card';
import { cn } from '@/lib/utils';

interface Trend {
  value: number;
  isPositive: boolean;
}

interface MetricCardProps {
  title: string;
  value: number;
  trend?: Trend;
  icon?: ReactNode;
  color?: 'champagne' | 'rose' | 'gold' | 'pearl' | 'emerald' | 'red';
}

const MetricCard = ({ 
  title, 
  value, 
  trend, 
  icon, 
  color = 'champagne' 
}: MetricCardProps) => {
  const colorClasses = {
    champagne: 'from-elite-champagne-50 to-elite-champagne-100 border-elite-champagne-200',
    rose: 'from-elite-rose-50 to-elite-rose-100 border-elite-rose-200',
    gold: 'from-elite-gold-50 to-elite-gold-100 border-elite-gold-200',
    pearl: 'from-elite-pearl-50 to-elite-pearl-100 border-elite-pearl-200',
    emerald: 'from-emerald-50 to-emerald-100 border-emerald-200',
    red: 'from-red-50 to-red-100 border-red-200'
  };

  const formatValue = (val: number) => {
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  return (
    <EliteCard className={cn('bg-gradient-to-br', colorClasses[color])}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-elite-charcoal-700">{title}</h3>
          {icon && (
            <div className="p-2 bg-white/50 rounded-lg">
              {icon}
            </div>
          )}
        </div>
        
        <div>
          <p className="text-2xl font-bold text-elite-charcoal-900 font-playfair">
            {formatValue(value)}
          </p>
          
          {trend && (
            <p className={cn('text-sm font-medium mt-1', 
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </p>
          )}
        </div>
      </div>
    </EliteCard>
  );
};

export default MetricCard;
