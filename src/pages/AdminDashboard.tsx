import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User as UserType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';
import AdminMetrics from '@/components/admin/AdminMetrics';
import UserTable from '@/components/admin/UserTable';
import AddUserModal from '@/components/admin/AddUserModal';

const AdminDashboard = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Buscar perfis dos usuários
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          nome_profissional_ou_salao,
          email,
          telefone,
          endereco,
          role,
          faturamento_total_acumulado,
          created_at
        `);

      if (error) throw error;

      // Converter dados do Supabase para o formato esperado
      const usersData: UserType[] = profiles?.map(profile => ({
        id: profile.id,
        name: profile.nome_profissional_ou_salao || 'Usuário',
        email: profile.email || '',
        role: profile.role === 'admin' ? 'admin' : 'professional',
        salonName: profile.endereco || '',
        phone: profile.telefone || '',
        status: 'active' as const,
        createdAt: new Date(profile.created_at),
        monthlyRevenue: Number(profile.faturamento_total_acumulado) || 0
      })) || [];

      setUsers(usersData);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (userData: Omit<UserType, 'id'>) => {
    // Recarregar a lista de usuários para mostrar o novo usuário
    await loadUsers();
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      // Aqui você pode implementar a lógica para ativar/desativar usuários
      // Por enquanto, apenas atualizamos localmente
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive' }
          : user
      ));

      toast({
        title: "Status do usuário atualizado",
        description: "O status foi alterado com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao alterar status do usuário:', error);
      toast({
        title: "Erro ao alterar status",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: "Erro ao fazer logout",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Header with logout */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-elite-charcoal-200 pb-4">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-elite-charcoal-900">
            Painel Administrativo
          </h1>
          <p className="text-elite-charcoal-600 mt-1">
            Gerencie usuários e monitore o sistema
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowAddUser(true)}
            className="bg-elite-champagne-500 hover:bg-elite-champagne-600 text-elite-charcoal-900"
          >
            Adicionar Usuário
          </Button>
          
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
          >
            <LogOut size={18} className="mr-2" />
            Sair
          </Button>
        </div>
      </div>

      <AdminMetrics users={users} />

      <AddUserModal
        show={showAddUser}
        onClose={() => setShowAddUser(false)}
        onAddUser={handleAddUser}
      />

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-elite-champagne-300 border-t-elite-champagne-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <UserTable users={users} onToggleUserStatus={toggleUserStatus} />
      )}
    </div>
  );
};

export default AdminDashboard;
