import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  };

  if (!show || !user) return null;

  return (
    <div className="fixed inset-0 bg-symbol-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="symbol-card p-8 w-full max-w-2xl shadow-xl max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="brand-heading text-xl text-symbol-black">
            Editar Usuário
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Nome Completo</Label>
              <Input
                id="name"
                value={editUser.name}
                onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={editUser.email}
                onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salonName" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Nome do Salão/Profissional</Label>
              <Input
                id="salonName"
                value={editUser.salonName}
                onChange={(e) => setEditUser({...editUser, salonName: e.target.value})}
                className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="phone" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Telefone</Label>
              <Input
                id="phone"
                value={editUser.phone}
                onChange={(e) => setEditUser({...editUser, phone: e.target.value})}
                className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="nomeSalao" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Nome do Salão (Opcional)</Label>
            <Input
              id="nomeSalao"
              value={editUser.nomeSalao}
              onChange={(e) => setEditUser({...editUser, nomeSalao: e.target.value})}
              className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="descricaoSalao" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Descrição do Salão (Opcional)</Label>
            <Input
              id="descricaoSalao"
              value={editUser.descricaoSalao}
              onChange={(e) => setEditUser({...editUser, descricaoSalao: e.target.value})}
              className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="endereco" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Endereço (Opcional)</Label>
            <Input
              id="endereco"
              value={editUser.endereco}
              onChange={(e) => setEditUser({...editUser, endereco: e.target.value})}
              className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>  
              <Label htmlFor="cidade" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Cidade (Opcional)</Label>
              <Input
                id="cidade"
                value={editUser.cidade}
                onChange={(e) => setEditUser({...editUser, cidade: e.target.value})}
                className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="estado" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Estado (Opcional)</Label>
              <Input
                id="estado"
                value={editUser.estado}
                onChange={(e) => setEditUser({...editUser, estado: e.target.value})}
                className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-symbol-gray-300 text-symbol-gray-700 hover:bg-symbol-gray-50"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-symbol-black hover:bg-symbol-gray-800 text-symbol-white"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
