
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, User, Mail, Lock, Building, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User as UserType } from '@/types';

interface AddUserModalProps {
  show: boolean;
  onClose: () => void;
  onAddUser: (user: Omit<UserType, 'id'>) => void;
}

const AddUserModal = ({ show, onClose, onAddUser }: AddUserModalProps) => {
  const [newUser, setNewUser] = useState({
    nome_profissional_ou_salao: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    nome_salao: '',
    descricao_salao: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Controlar scroll do body quando modal está aberto
  useEffect(() => {
    if (show) {
      // Bloquear scroll do body
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
    } else {
      // Restaurar scroll do body
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    // Cleanup ao desmontar
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Não autenticado');
      }

      // Call the edge function to create the user
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          name: newUser.nome_profissional_ou_salao,
          email: newUser.email,
          password: newUser.password,
          telefone: newUser.telefone,
          endereco: newUser.endereco,
          cidade: newUser.cidade,
          estado: newUser.estado,
          nomeSalao: newUser.nome_salao,
          descricaoSalao: newUser.descricao_salao
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      // Create user object for UI update
      const user = {
        name: newUser.nome_profissional_ou_salao,
        email: newUser.email,
        role: 'professional' as const,
        salonName: newUser.nome_salao,
        phone: newUser.telefone,
        status: 'active' as const,
        createdAt: new Date(),
        monthlyRevenue: 0,
        nomeSalao: newUser.nome_salao,
        descricaoSalao: newUser.descricao_salao,
        endereco: newUser.endereco,
        cidade: newUser.cidade,
        estado: newUser.estado
      };
      
      onAddUser(user);
      setNewUser({ 
        nome_profissional_ou_salao: '', 
        email: '', 
        telefone: '', 
        endereco: '',
        cidade: '',
        estado: '',
        nome_salao: '',
        descricao_salao: '',
        password: ''
      });
      onClose();

      toast({
        title: "Usuário criado com sucesso!",
        description: `${newUser.nome_profissional_ou_salao} foi adicionado ao sistema.`,
      });

    } catch (error: unknown) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "Erro ao criar usuário",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 modal-overlay"
      onClick={onClose}
      style={{ overflowY: 'auto' }}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Adicionar Novo Usuário</h2>
              <p className="text-sm text-gray-600">Preencha as informações do novo profissional</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Informações Básicas */}
            <Card className="border-gray-200 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4 text-gray-600" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription className='text-gray-700'>
                  Dados básicos do usuário
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome_profissional_ou_salao" className="text-sm font-medium text-gray-700">
                      Nome Profissional/Salão *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="nome_profissional_ou_salao"
                        value={newUser.nome_profissional_ou_salao}
                        onChange={(e) => setNewUser({...newUser, nome_profissional_ou_salao: e.target.value})}
                        className="pl-10 border-gray-300 bg-white focus:border-gray-900 focus:ring-gray-900"
                        placeholder="Digite o nome do profissional ou salão"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="text-sm font-medium text-gray-700">
                      Telefone
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="telefone"
                        value={newUser.telefone}
                        onChange={(e) => setNewUser({...newUser, telefone: e.target.value})}
                        className="pl-10 border-gray-300 bg-white focus:border-gray-900 focus:ring-gray-900"
                        placeholder="(11) 99999-9999"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      E-mail *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        className="pl-10 border-gray-300 bg-white focus:border-gray-900 focus:ring-gray-900"
                        placeholder="usuario@email.com"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Senha *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        className="pl-10 border-gray-300 bg-white focus:border-gray-900 focus:ring-gray-900"
                        placeholder="Mínimo 6 caracteres"
                        required
                        disabled={loading}
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações do Salão */}
            <Card className="border-gray-200 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building className="h-4 w-4 text-gray-600" />
                  Informações do Salão
                </CardTitle>
                <CardDescription className='text-gray-700'>
                  Dados do estabelecimento (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_salao" className="text-sm font-medium text-gray-700">
                    Nome do Salão
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="nome_salao"
                      value={newUser.nome_salao}
                      onChange={(e) => setNewUser({...newUser, nome_salao: e.target.value})}
                      className="pl-10 border-gray-300 bg-white focus:border-gray-900 focus:ring-gray-900"
                      placeholder="Nome do estabelecimento"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao_salao" className="text-sm font-medium text-gray-700">
                    Descrição do Estabelecimento
                  </Label>
                  <Input
                    id="descricao_salao"
                    value={newUser.descricao_salao}
                    onChange={(e) => setNewUser({...newUser, descricao_salao: e.target.value})}
                    className="border-gray-300 bg-white focus:border-gray-900 focus:ring-gray-900"
                    placeholder="Breve descrição dos serviços oferecidos"
                    disabled={loading}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Informações de Localização */}
            <Card className="border-gray-200 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  Localização
                </CardTitle>
                <CardDescription className='text-gray-700'>
                  Endereço do estabelecimento (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="endereco" className="text-sm font-medium text-gray-700">
                    Endereço Completo
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="endereco"
                      value={newUser.endereco}
                      onChange={(e) => setNewUser({...newUser, endereco: e.target.value})}
                      className="pl-10 border-gray-300 bg-white focus:border-gray-900 focus:ring-gray-900"
                      placeholder="Rua, número, bairro"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cidade" className="text-sm font-medium text-gray-700">
                      Cidade
                    </Label>
                    <Input
                      id="cidade"
                      value={newUser.cidade}
                      onChange={(e) => setNewUser({...newUser, cidade: e.target.value})}
                      className="border-gray-300 bg-white focus:border-gray-900 focus:ring-gray-900"
                      placeholder="Nome da cidade"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado" className="text-sm font-medium text-gray-700">
                      Estado
                    </Label>
                    <Input
                      id="estado"
                      value={newUser.estado}
                      onChange={(e) => setNewUser({...newUser, estado: e.target.value})}
                      className="border-gray-300 bg-white focus:border-gray-900 focus:ring-gray-900"
                      placeholder="UF"
                      maxLength={2}
                      disabled={loading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Footer com botões */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-white flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-6"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gray-900 hover:bg-gray-800 text-white px-6"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Criando...
              </div>
            ) : (
              'Adicionar Usuário'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
