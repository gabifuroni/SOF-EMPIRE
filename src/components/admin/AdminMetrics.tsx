
import MetricCard from '@/components/dashboard/MetricCard';
import { User, Calendar, FileText } from 'lucide-react';
import { User as UserType } from '@/types';

interface AdminMetricsProps {
  users: UserType[];
}

const AdminMetrics = ({ users }: AdminMetricsProps) => {
  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalRevenue = users.reduce((sum, u) => sum + (u.monthlyRevenue || 0), 0);
  const avgRevenue = users.length > 0 ? totalRevenue / users.length : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        title="Usuários Ativos"
        value={activeUsers}
        trend={{ value: 12, isPositive: true }}
        icon={<User className="text-elite-champagne-600" size={20} />}
        color="champagne"
      />
      
      <MetricCard
        title="Faturamento Total"
        value={totalRevenue}
        trend={{ value: 8, isPositive: true }}
        icon={<Calendar className="text-elite-rose-600" size={20} />}
        color="rose"
      />
      
      <MetricCard
        title="Faturamento Médio"
        value={avgRevenue}
        trend={{ value: 5, isPositive: true }}
        icon={<FileText className="text-elite-gold-600" size={20} />}
        color="gold"
      />
    </div>
  );
};

export default AdminMetrics;
