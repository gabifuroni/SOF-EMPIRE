
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { User as UserType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Plus, Users, TrendingUp, Building, MapPin, Calendar, Eye, Edit, MoreVertical, Settings, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddUserModal from '@/components/admin/AddUserModal';
import EditUserModal from '@/components/admin/EditUserModal';
import AdminProfile from '@/components/admin/AdminProfile';

const AdminDashboard = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
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

  // Calcular métricas
  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalUsers = users.length;
  const totalRevenue = users.reduce((sum, u) => sum + (u.monthlyRevenue || 0), 0);
  const avgRevenue = users.length > 0 ? totalRevenue / users.length : 0;
  const usersWithSalons = users.filter(u => u.nomeSalao).length;
  const citiesCount = new Set(users.filter(u => u.cidade).map(u => u.cidade)).size;
  
  // Usuários criados recentemente (últimos 30 dias)
  const recentUsers = users.filter(u => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return u.createdAt >= thirtyDaysAgo;
  }).length;

  // Top cidades
  const citiesStats = users
    .filter(u => u.cidade)
    .reduce((acc, user) => {
      const city = `${user.cidade}${user.estado ? `, ${user.estado}` : ''}`;
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  const topCities = Object.entries(citiesStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

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
  };  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-playfair text-4xl font-bold text-gray-900 mb-2">
              Painel Administrativo
            </h1>
            <p className="text-gray-600 text-lg">
              Gerencie usuários e monitore o sistema SOF Empire
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-300 text-red-600 bg-white hover:bg-red-50 hover:border-red-400 shadow-sm"
            >
              <LogOut size={18} className="mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Navegação por Abas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200">
            <TabsTrigger value="dashboard" className="flex items-center text-black gap-2 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center text-black gap-2 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <Settings className="h-4 w-4" />
              Meu Perfil
            </TabsTrigger>
          </TabsList>          {/* Conteúdo da Aba Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Botão Novo Usuário */}
            <div className="flex justify-end">
              <Button
                onClick={() => setShowAddUser(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg"
              >
                <Plus size={18} className="mr-2" />
                Novo Usuário
              </Button>
            </div>

            {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-symbol-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-symbol-gray-600">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-symbol-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-symbol-black">{totalUsers}</div>
              <p className="text-xs text-symbol-gray-500 mt-1">
                {activeUsers} ativos, {totalUsers - activeUsers} inativos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-symbol-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-symbol-gray-600">Faturamento Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-symbol-black">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
              </div>
              <p className="text-xs text-symbol-gray-500 mt-1">
                Média: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(avgRevenue)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-symbol-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-symbol-gray-600">Salões Cadastrados</CardTitle>
              <Building className="h-4 w-4 text-symbol-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-symbol-black">{usersWithSalons}</div>
              <p className="text-xs text-symbol-gray-500 mt-1">
                {((usersWithSalons / totalUsers) * 100).toFixed(1)}% dos usuários
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-symbol-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-symbol-gray-600">Novas Adesões</CardTitle>
              <Calendar className="h-4 w-4 text-symbol-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-symbol-black">{recentUsers}</div>
              <p className="text-xs text-symbol-gray-500 mt-1">
                Últimos 30 dias
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição Geográfica */}
        {topCities.length > 0 && (
          <Card className="bg-white border-symbol-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-symbol-black">
                <MapPin className="h-5 w-5" />
                Distribuição Geográfica
              </CardTitle>
              <CardDescription className="text-symbol-gray-600">
                Principais cidades com usuários cadastrados ({citiesCount} cidades no total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {topCities.map(([city, count], index) => (
                  <div key={city} className="flex items-center justify-between p-4 bg-symbol-gray-50 rounded-lg border border-symbol-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-symbol-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-symbol-black text-sm">{city}</p>
                        <p className="text-xs text-symbol-gray-500">
                          {count} usuário{count > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Usuários */}
        <Card className="bg-white border-symbol-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-symbol-black">
              <Users className="h-5 w-5" />
              Usuários Cadastrados
            </CardTitle>
            <CardDescription className="text-symbol-gray-600">
              Gerencie todos os usuários do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-symbol-gray-300 border-t-symbol-black rounded-full animate-spin"></div>
                  <span className="text-symbol-gray-600">Carregando usuários...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-symbol-gray-200 rounded-lg hover:bg-symbol-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.fotoPerfil} alt={user.name} />
                        <AvatarFallback className="bg-symbol-gray-200 text-symbol-black">
                          {user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-symbol-black truncate">{user.name}</h3>
                          <Badge 
                            variant={user.role === 'admin' ? 'default' : 'secondary'}
                            className={user.role === 'admin' ? 'bg-symbol-black text-white' : ''}
                          >
                            {user.role === 'admin' ? 'Admin' : 'Profissional'}
                          </Badge>
                          <Badge 
                            variant={user.status === 'active' ? 'default' : 'destructive'}
                            className={user.status === 'active' ? 'bg-green-600' : ''}
                          >
                            {user.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <p className="text-sm text-symbol-gray-600 truncate">{user.email}</p>
                        {user.nomeSalao && (
                          <p className="text-sm text-symbol-gray-500 truncate">{user.nomeSalao}</p>
                        )}
                        {user.cidade && (
                          <p className="text-xs text-symbol-gray-400">
                            {user.cidade}{user.estado && `, ${user.estado}`}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-symbol-black">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(user.monthlyRevenue || 0)}
                        </p>
                        <p className="text-xs text-symbol-gray-500">Faturamento</p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleUserStatus(user.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {user.status === 'active' ? 'Desativar' : 'Ativar'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>            )}
          </CardContent>
        </Card>
        </TabsContent>

        {/* Conteúdo da Aba Perfil */}
        <TabsContent value="profile">
          <AdminProfile />
        </TabsContent>
        </Tabs>

        {/* Modais */}
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
      </div>
    </div>
  );
};

export default AdminDashboard;
