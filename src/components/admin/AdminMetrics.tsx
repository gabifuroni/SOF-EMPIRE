
import MetricCard from '@/components/dashboard/MetricCard';
import EliteCard from '@/components/ui/elite-card';
import { User, Calendar, FileText, MapPin, Building } from 'lucide-react';
import { User as UserType } from '@/types';

interface AdminMetricsProps {
  users: UserType[];
}

const AdminMetrics = ({ users }: AdminMetricsProps) => {
  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalRevenue = users.reduce((sum, u) => sum + (u.monthlyRevenue || 0), 0);
  const avgRevenue = users.length > 0 ? totalRevenue / users.length : 0;
  
  // New metrics using expanded profile data
  const usersWithSalons = users.filter(u => u.nomeSalao).length;
  const citiesCount = new Set(users.filter(u => u.cidade).map(u => u.cidade)).size;
  const statesCount = new Set(users.filter(u => u.estado).map(u => u.estado)).size;
  
  // Get top cities
  const citiesStats = users
    .filter(u => u.cidade)
    .reduce((acc, user) => {
      const city = `${user.cidade}${user.estado ? `, ${user.estado}` : ''}`;
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  const topCities = Object.entries(citiesStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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

        <MetricCard
          title="Cidades Atendidas"
          value={citiesCount}
          icon={<MapPin className="text-elite-champagne-600" size={20} />}
          color="champagne"
        />
      </div>

      {topCities.length > 0 && (
        <EliteCard className="bg-gradient-to-br from-elite-pearl-50 to-elite-pearl-100 border-elite-pearl-200">
          <div className="space-y-4">
            <h3 className="font-playfair text-lg font-semibold text-elite-charcoal-900">
              Principais Cidades
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topCities.map(([city, count], index) => (
                <div key={city} className="flex items-center justify-between p-3 bg-white rounded-lg border border-elite-pearl-300">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-elite-champagne-100 text-elite-champagne-700 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-elite-charcoal-800 font-medium">{city}</span>
                  </div>
                  <span className="text-elite-charcoal-600 text-sm">
                    {count} usuário{count > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </EliteCard>
      )}
    </div>
  );
};

export default AdminMetrics;
