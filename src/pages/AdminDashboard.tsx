
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { User as UserType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';
import AdminMetrics from '@/components/admin/AdminMetrics';
import UserTable from '@/components/admin/UserTable';
import AddUserModal from '@/components/admin/AddUserModal';
import EditUserModal from '@/components/admin/EditUserModal';

const AdminDashboard = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar perfis dos usuários
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      // Converter dados do Supabase para o formato esperado
      const usersData: UserType[] = profiles?.map(profile => ({
        id: profile.id,
        name: profile.nome_profissional_ou_salao || 'Usuário',
        email: profile.email || '',
        role: profile.role === 'admin' ? 'admin' : 'professional',
        salonName: profile.nome_salao || profile.endereco || '',
        phone: profile.telefone || '',
        status: (profile.status as 'active' | 'inactive') || 'active',
        createdAt: new Date(profile.created_at),
        monthlyRevenue: Number(profile.faturamento_total_acumulado) || 0,
        nomeSalao: profile.nome_salao || '',
        descricaoSalao: profile.descricao_salao || '',
        endereco: profile.endereco || '',
        cidade: profile.cidade || '',
        estado: profile.estado || '',
        fotoPerfil: profile.foto_perfil || '',
        currentPatenteId: profile.current_patente_id || ''
      })) || [];

      setUsers(usersData);
    } catch (error: unknown) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleAddUser = async (userData: Omit<UserType, 'id'>) => {
    // Recarregar a lista de usuários para mostrar o novo usuário
    await loadUsers();
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setShowEditUser(true);
  };

  const handleUpdateUser = (updatedUser: UserType) => {
    setUsers(users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
    setShowEditUser(false);
    setEditingUser(null);
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      
      // Update status in database
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, status: newStatus }
          : user
      ));

      toast({
        title: "Status do usuário atualizado",
        description: `Usuário ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso.`,
      });
    } catch (error: unknown) {
      console.error('Erro ao alterar status do usuário:', error);
      toast({
        title: "Erro ao alterar status",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
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
    } catch (error: unknown) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: "Erro ao fazer logout",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
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

      <EditUserModal
        show={showEditUser}
        onClose={() => setShowEditUser(false)}
        onUpdateUser={handleUpdateUser}
        user={editingUser}
      />

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-elite-champagne-300 border-t-elite-champagne-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <UserTable 
          users={users} 
          onToggleUserStatus={toggleUserStatus}
          onEditUser={handleEditUser}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
