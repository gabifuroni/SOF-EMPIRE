
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick?: () => void;
  color?: 'orange' | 'purple' | 'pink';
}

const ActionCard = ({ title, description, icon, onClick, color = 'orange' }: ActionCardProps) => {
  const colorClasses = {
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-200',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200',
    pink: 'bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 hover:from-pink-100 hover:to-pink-200'
  };

  const iconColorClasses = {
    orange: 'text-orange-600',
    purple: 'text-purple-600',
    pink: 'text-pink-600'
  };

  return (
    <div 
      className={cn(
        'p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02]',
        colorClasses[color]
      )}
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center space-y-3">
        <div className={cn('p-3 rounded-full bg-white shadow-sm', iconColorClasses[color])}>
          {icon}
        </div>
        <div>
          <h3 className="brand-subheading text-symbol-black font-medium">
            {title}
          </h3>
          <p className="brand-body text-symbol-gray-600 text-sm mt-1">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActionCard;
