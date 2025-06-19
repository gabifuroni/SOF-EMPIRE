
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';

interface AddUserModalProps {
  show: boolean;
  onClose: () => void;
  onAddUser: (user: Omit<User, 'id'>) => void;
}

const AddUserModal = ({ show, onClose, onAddUser }: AddUserModalProps) => {
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    salonName: '',
    phone: '',
    password: '',
    nomeSalao: '',
    descricaoSalao: '',
    endereco: '',
    cidade: '',
    estado: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          salonName: newUser.salonName,
          phone: newUser.phone,
          nomeSalao: newUser.nomeSalao,
          descricaoSalao: newUser.descricaoSalao,
          endereco: newUser.endereco,
          cidade: newUser.cidade,
          estado: newUser.estado
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
        name: newUser.name,
        email: newUser.email,
        role: 'professional' as const,
        salonName: newUser.salonName,
        phone: newUser.phone,
        status: 'active' as const,
        createdAt: new Date(),
        monthlyRevenue: 0,
        nomeSalao: newUser.nomeSalao,
        descricaoSalao: newUser.descricaoSalao,
        endereco: newUser.endereco,
        cidade: newUser.cidade,
        estado: newUser.estado
      };
      
      onAddUser(user);
      setNewUser({ 
        name: '', 
        email: '', 
        salonName: '', 
        phone: '', 
        password: '',
        nomeSalao: '',
        descricaoSalao: '',
        endereco: '',
        cidade: '',
        estado: ''
      });
      onClose();

      toast({
        title: "Usuário criado com sucesso!",
        description: `${newUser.name} foi adicionado ao sistema.`,
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
    <div className="fixed inset-0 bg-symbol-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="symbol-card p-8 w-full max-w-md shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="brand-heading text-xl text-symbol-black">
            Adicionar Novo Usuário
          </h3>
          
          <div>
            <Label htmlFor="name" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Nome Completo</Label>
            <Input
              id="name"
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
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
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="password" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Senha</Label>
            <Input
              id="password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
              required
              disabled={loading}
              minLength={6}
            />
          </div>
          
          <div>
            <Label htmlFor="salonName" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Nome do Salão</Label>
            <Input
              id="salonName"
              value={newUser.salonName}
              onChange={(e) => setNewUser({...newUser, salonName: e.target.value})}
              className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="phone" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Telefone</Label>
            <Input
              id="phone"
              value={newUser.phone}
              onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
              className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="nomeSalao" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Nome do Salão (Opcional)</Label>
            <Input
              id="nomeSalao"
              value={newUser.nomeSalao}
              onChange={(e) => setNewUser({...newUser, nomeSalao: e.target.value})}
              className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="descricaoSalao" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Descrição do Salão (Opcional)</Label>
            <Input
              id="descricaoSalao"
              value={newUser.descricaoSalao}
              onChange={(e) => setNewUser({...newUser, descricaoSalao: e.target.value})}
              className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="endereco" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Endereço (Opcional)</Label>
            <Input
              id="endereco"
              value={newUser.endereco}
              onChange={(e) => setNewUser({...newUser, endereco: e.target.value})}
              className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>  
              <Label htmlFor="cidade" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Cidade (Opcional)</Label>
              <Input
                id="cidade"
                value={newUser.cidade}
                onChange={(e) => setNewUser({...newUser, cidade: e.target.value})}
                className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="estado" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">Estado (Opcional)</Label>
              <Input
                id="estado"
                value={newUser.estado}
                onChange={(e) => setNewUser({...newUser, estado: e.target.value})}
                className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
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
              {loading ? 'Criando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
