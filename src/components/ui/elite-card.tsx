
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EliteCardProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
  hover?: boolean;
}

const EliteCard = ({ children, className, gradient = false, hover = true }: EliteCardProps) => {
  return (
    <div className={cn(
      "elite-card p-6 transition-all duration-300",
      gradient && "elite-gradient",
      hover && "hover:shadow-lg hover:scale-[1.02]",
      className
    )}>
      {children}
    </div>
  );
};

export default EliteCard;
