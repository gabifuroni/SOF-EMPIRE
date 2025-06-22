import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Lock, Phone, MapPin, Building, Save, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface AdminProfileData {
  nome_profissional_ou_salao: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  nome_salao: string;
  descricao_salao: string;
}

const AdminProfile = () => {
  const [profileData, setProfileData] = useState<AdminProfileData>({
    nome_profissional_ou_salao: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    nome_salao: '',
    descricao_salao: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });  const { toast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não encontrado');

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setProfileData({
          nome_profissional_ou_salao: profile.nome_profissional_ou_salao || '',
          email: profile.email || user.email || '',
          telefone: profile.telefone || '',
          endereco: profile.endereco || '',
          cidade: profile.cidade || '',
          estado: profile.estado || '',
          nome_salao: profile.nome_salao || '',
          descricao_salao: profile.descricao_salao || ''
        });
      } catch (error: unknown) {
        console.error('Erro ao carregar perfil:', error);
        toast({
          title: "Erro ao carregar perfil",
          description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
          variant: "destructive",
        });
      }
    };

    loadProfile();
  }, [toast]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não encontrado');

      // Atualizar perfil no banco
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nome_profissional_ou_salao: profileData.nome_profissional_ou_salao,
          telefone: profileData.telefone || null,
          endereco: profileData.endereco || null,
          cidade: profileData.cidade || null,
          estado: profileData.estado || null,
          nome_salao: profileData.nome_salao || null,
          descricao_salao: profileData.descricao_salao || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Atualizar email se foi alterado
      if (profileData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileData.email
        });

        if (emailError) throw emailError;

        // Também atualizar no perfil
        const { error: profileEmailError } = await supabase
          .from('profiles')
          .update({ email: profileData.email })
          .eq('id', user.id);

        if (profileEmailError) throw profileEmailError;

        toast({
          title: "Perfil atualizado!",
          description: "Verifique seu novo email para confirmar a alteração.",
        });
      } else {
        toast({
          title: "Perfil atualizado com sucesso!",
          description: "Suas informações foram salvas.",
        });
      }
    } catch (error: unknown) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPassword(true);

    try {
      // Validações
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        throw new Error('Todos os campos de senha são obrigatórios');
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('A nova senha e a confirmação não coincidem');
      }

      if (passwordData.newPassword.length < 6) {
        throw new Error('A nova senha deve ter pelo menos 6 caracteres');
      }

      // Tentar fazer login com a senha atual para validar
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('Email do usuário não encontrado');

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword
      });

      if (signInError) {
        throw new Error('Senha atual incorreta');
      }

      // Atualizar senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) throw updateError;

      // Limpar formulário
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi alterada com sucesso.",
      });
    } catch (error: unknown) {
      console.error('Erro ao atualizar senha:', error);
      toast({
        title: "Erro ao alterar senha",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Meu Perfil</h2>
        <p className="text-gray-600">Gerencie suas informações pessoais e configurações da conta</p>
      </div>

      {/* Informações do Perfil */}
      <Card className="border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>
            Atualize suas informações básicas e dados de contato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome_profissional_ou_salao" className="text-sm font-medium text-gray-700">
                  Nome *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="nome_profissional_ou_salao"
                    value={profileData.nome_profissional_ou_salao}
                    onChange={(e) => setProfileData({...profileData, nome_profissional_ou_salao: e.target.value})}
                    className="pl-10 border-gray-300 focus:border-gray-900 bg-white focus:ring-gray-900"
                    placeholder="Seu nome"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="pl-10 border-gray-300 focus:border-gray-900 bg-white focus:ring-gray-900"
                    placeholder="seu@email.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-sm font-medium text-gray-700">
                  Telefone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="telefone"
                    value={profileData.telefone}
                    onChange={(e) => setProfileData({...profileData, telefone: e.target.value})}
                    className="pl-10 border-gray-300 focus:border-gray-900 bg-white focus:ring-gray-900"
                    placeholder="(11) 99999-9999"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco" className="text-sm font-medium text-gray-700">
                  Endereço
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="endereco"
                    value={profileData.endereco}
                    onChange={(e) => setProfileData({...profileData, endereco: e.target.value})}
                    className="pl-10 border-gray-300 focus:border-gray-900 bg-white focus:ring-gray-900"
                    placeholder="Seu endereço"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade" className="text-sm font-medium text-gray-700">
                  Cidade
                </Label>
                <Input
                  id="cidade"
                  value={profileData.cidade}
                  onChange={(e) => setProfileData({...profileData, cidade: e.target.value})}
                  className="border-gray-300 focus:border-gray-900 bg-white focus:ring-gray-900"
                  placeholder="Sua cidade"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado" className="text-sm font-medium text-gray-700">
                  Estado
                </Label>
                <Input
                  id="estado"
                  value={profileData.estado}
                  onChange={(e) => setProfileData({...profileData, estado: e.target.value})}
                  className="border-gray-300 focus:border-gray-900 bg-white focus:ring-gray-900"
                  placeholder="UF"
                  maxLength={2}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Informações do Estabelecimento</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_salao" className="text-sm font-medium text-gray-700">
                    Nome do Estabelecimento
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="nome_salao"
                      value={profileData.nome_salao}
                      onChange={(e) => setProfileData({...profileData, nome_salao: e.target.value})}
                      className="pl-10 border-gray-300 focus:border-gray-900 bg-white focus:ring-gray-900"
                      placeholder="Nome do seu estabelecimento"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao_salao" className="text-sm font-medium text-gray-700">
                    Descrição
                  </Label>
                  <Input
                    id="descricao_salao"
                    value={profileData.descricao_salao}
                    onChange={(e) => setProfileData({...profileData, descricao_salao: e.target.value})}
                    className="border-gray-300 focus:border-gray-900 bg-white focus:ring-gray-900"
                    placeholder="Descrição dos seus serviços"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-gray-900 hover:bg-gray-800 text-white px-6"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Salvando...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Alterar Senha */}
      <Card className="border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Alterar Senha
          </CardTitle>
          <CardDescription className='text-gray-600'>
            Atualize sua senha para manter sua conta segura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                Senha Atual *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="pl-10 pr-10 border-gray-300 focus:border-gray-900 bg-white focus:ring-gray-900"
                  placeholder="Digite sua senha atual"
                  disabled={loadingPassword}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                  Nova Senha *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="pl-10 pr-10 border-gray-300 focus:border-gray-900 bg-white focus:ring-gray-900"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    disabled={loadingPassword}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmar Nova Senha *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="pl-10 pr-10 border-gray-300 focus:border-gray-900 bg-white focus:ring-gray-900"
                    placeholder="Confirme a nova senha"
                    minLength={6}
                    disabled={loadingPassword}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-gray-900 hover:bg-gray-800 text-white px-6"
                disabled={loadingPassword}
              >
                {loadingPassword ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Alterando...
                  </div>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Alterar Senha
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfile;
