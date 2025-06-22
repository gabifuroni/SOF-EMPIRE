import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, User as UserIcon, Mail, Building, Phone, MapPin, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';

interface EditUserModalProps {
  show: boolean;
  onClose: () => void;
  onUpdateUser: (user: User) => void;
  user: User | null;
}

const EditUserModal = ({ show, onClose, onUpdateUser, user }: EditUserModalProps) => {
  const [editUser, setEditUser] = useState({
    name: '',
    email: '',
    salonName: '',
    phone: '',
    nomeSalao: '',
    descricaoSalao: '',
    endereco: '',
    cidade: '',
    estado: ''
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

  useEffect(() => {
    if (user) {
      setEditUser({
        name: user.name || '',
        email: user.email || '',
        salonName: user.salonName || '',
        phone: user.phone || '',
        nomeSalao: user.nomeSalao || '',
        descricaoSalao: user.descricaoSalao || '',
        endereco: user.endereco || '',
        cidade: user.cidade || '',
        estado: user.estado || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);

    try {
      // Update the user profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          nome_profissional_ou_salao: editUser.name,
          email: editUser.email,
          telefone: editUser.phone,
          endereco: editUser.endereco,
          nome_salao: editUser.nomeSalao,
          descricao_salao: editUser.descricaoSalao,
          cidade: editUser.cidade,
          estado: editUser.estado
        })
        .eq('id', user.id);

      if (error) throw error;

      // Create updated user object for UI update
      const updatedUser: User = {
        ...user,
        name: editUser.name,
        email: editUser.email,
        salonName: editUser.nomeSalao || editUser.salonName,
        phone: editUser.phone,
        nomeSalao: editUser.nomeSalao,
        descricaoSalao: editUser.descricaoSalao,
        endereco: editUser.endereco,
        cidade: editUser.cidade,
        estado: editUser.estado
      };
      
      onUpdateUser(updatedUser);
      onClose();

      toast({
        title: "Usuário atualizado com sucesso!",
        description: `${editUser.name} foi atualizado no sistema.`,
      });

    } catch (error: unknown) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro ao atualizar usuário",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };  if (!show || !user) return null;
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
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <Edit className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Editar Usuário</h2>
              <p className="text-sm text-gray-600">Atualize as informações do usuário</p>
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
          <Card className="border-symbol-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserIcon className="h-4 w-4 text-symbol-gray-600" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Dados básicos do usuário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Nome Profissional/Salão *
                  </Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      value={editUser.name}
                      onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                      className="pl-10 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                      placeholder="Digite o nome do profissional ou salão"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-symbol-gray-700">
                    Telefone
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-symbol-gray-400" />
                    <Input
                      id="phone"
                      value={editUser.phone}
                      onChange={(e) => setEditUser({...editUser, phone: e.target.value})}
                      className="pl-10 border-symbol-gray-300 focus:border-symbol-black focus:ring-symbol-black"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-symbol-gray-700">
                  E-mail *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-symbol-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                    className="pl-10 border-symbol-gray-300 focus:border-symbol-black focus:ring-symbol-black"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Salão */}
          <Card className="border-symbol-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building className="h-4 w-4 text-symbol-gray-600" />
                Informações do Salão
              </CardTitle>
              <CardDescription>
                Dados do estabelecimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salonName" className="text-sm font-medium text-symbol-gray-700">
                    Nome do Salão/Profissional
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-symbol-gray-400" />
                    <Input
                      id="salonName"
                      value={editUser.salonName}
                      onChange={(e) => setEditUser({...editUser, salonName: e.target.value})}
                      className="pl-10 border-symbol-gray-300 focus:border-symbol-black focus:ring-symbol-black"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomeSalao" className="text-sm font-medium text-symbol-gray-700">
                    Nome Fantasia
                  </Label>
                  <Input
                    id="nomeSalao"
                    value={editUser.nomeSalao}
                    onChange={(e) => setEditUser({...editUser, nomeSalao: e.target.value})}
                    className="border-symbol-gray-300 focus:border-symbol-black focus:ring-symbol-black"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricaoSalao" className="text-sm font-medium text-symbol-gray-700">
                  Descrição do Salão
                </Label>
                <Input
                  id="descricaoSalao"
                  value={editUser.descricaoSalao}
                  onChange={(e) => setEditUser({...editUser, descricaoSalao: e.target.value})}
                  className="border-symbol-gray-300 focus:border-symbol-black focus:ring-symbol-black"
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Informações de Localização */}
          <Card className="border-symbol-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-symbol-gray-600" />
                Localização
              </CardTitle>
              <CardDescription>
                Endereço do estabelecimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="endereco" className="text-sm font-medium text-symbol-gray-700">
                  Endereço Completo
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-symbol-gray-400" />
                  <Input
                    id="endereco"
                    value={editUser.endereco}
                    onChange={(e) => setEditUser({...editUser, endereco: e.target.value})}
                    className="pl-10 border-symbol-gray-300 focus:border-symbol-black focus:ring-symbol-black"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade" className="text-sm font-medium text-symbol-gray-700">
                    Cidade
                  </Label>
                  <Input
                    id="cidade"
                    value={editUser.cidade}
                    onChange={(e) => setEditUser({...editUser, cidade: e.target.value})}
                    className="border-symbol-gray-300 focus:border-symbol-black focus:ring-symbol-black"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-sm font-medium text-symbol-gray-700">
                    Estado
                  </Label>
                  <Input
                    id="estado"
                    value={editUser.estado}
                    onChange={(e) => setEditUser({...editUser, estado: e.target.value})}
                    className="border-symbol-gray-300 focus:border-symbol-black focus:ring-symbol-black"
                    maxLength={2}
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>          {/* Footer com botões */}
          </form>
        </div>
        
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-white flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6"
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
                Salvando...
              </div>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
