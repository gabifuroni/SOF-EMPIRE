
import { Button } from '@/components/ui/button';
import EliteCard from '@/components/ui/elite-card';
import { User } from '@/types';

interface UserTableProps {
  users: User[];
  onToggleUserStatus: (userId: string) => void;
}

const UserTable = ({ users, onToggleUserStatus }: UserTableProps) => {
  const getPatenteName = (revenue: number) => {
    if (revenue >= 20000) return 'Imperatrizes Elite';
    if (revenue >= 15000) return 'Empire Queens';
    if (revenue >= 12000) return 'Luxury Creators';
    if (revenue >= 9000) return 'Elegance Experts';
    if (revenue >= 6000) return 'Glow Achievers';
    if (revenue >= 3000) return 'Beauty Starters';
    return 'Iniciante';
  };

  return (
    <EliteCard className="bg-gradient-to-br from-elite-pearl-50 to-elite-pearl-100 border-elite-pearl-200">
      <div className="space-y-4">
        <h3 className="font-playfair text-xl font-semibold text-elite-charcoal-900">
          Usuários do Sistema
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-elite-pearl-300">
                <th className="text-left py-3 px-2 font-medium text-elite-charcoal-700">Nome</th>
                <th className="text-left py-3 px-2 font-medium text-elite-charcoal-700">Email</th>
                <th className="text-left py-3 px-2 font-medium text-elite-charcoal-700">Salão</th>
                <th className="text-left py-3 px-2 font-medium text-elite-charcoal-700">Patente</th>
                <th className="text-left py-3 px-2 font-medium text-elite-charcoal-700">Status</th>
                <th className="text-left py-3 px-2 font-medium text-elite-charcoal-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-elite-pearl-200 hover:bg-elite-pearl-100/50">
                  <td className="py-3 px-2 text-elite-charcoal-800">{user.name}</td>
                  <td className="py-3 px-2 text-elite-charcoal-600">{user.email}</td>
                  <td className="py-3 px-2 text-elite-charcoal-600">{user.salonName}</td>
                  <td className="py-3 px-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-elite-champagne-100 text-elite-champagne-700 rounded-full text-sm">
                      {getPatenteName(user.monthlyRevenue || 0)}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onToggleUserStatus(user.id)}
                      className="text-xs"
                    >
                      {user.status === 'active' ? 'Desativar' : 'Ativar'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </EliteCard>
  );
};

export default UserTable;
