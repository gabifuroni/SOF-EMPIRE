import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Camera, Shield, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';

interface ProfileUpdateData {
  nome_profissional_ou_salao?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  nome_salao?: string;
  descricao_salao?: string;
  foto_perfil?: string;
}

const Profile = () => {
  const { toast } = useToast();
  const { profile, updateProfile, isLoading } = useProfile();
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    salonName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    description: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Sincronizar dados do perfil com o formulário
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.nome_profissional_ou_salao || '',
        salonName: profile.nome_salao || '',
        phone: profile.telefone || '',
        email: profile.email || '',
        address: profile.endereco || '',
        city: profile.cidade || '',
        state: profile.estado || '',
        description: profile.descricao_salao || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Definir foto de perfil se existir
      if (profile.foto_perfil) {
        setProfileImage(profile.foto_perfil);
      } else {
        setProfileImage(null);
      }
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Verificar força da senha
    if (field === 'newPassword') {
      if (value.length < 4) {
        setPasswordStrength('Fraca');
      } else if (value.length < 8) {
        setPasswordStrength('Média');
      } else {
        setPasswordStrength('Forte');
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    // Validação básica
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Erro de Validação",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Preparar dados para atualização (usando os nomes corretos das colunas do banco)
      const updateData: ProfileUpdateData = {
        nome_profissional_ou_salao: formData.name || '',
        telefone: formData.phone || '',
        endereco: formData.address || '',
        cidade: formData.city || '',
        estado: formData.state || '',
        nome_salao: formData.salonName || '',
        descricao_salao: formData.description || '',
      };

      // Adicionar foto de perfil se foi alterada
      if (profileImage && profileImage !== profile?.foto_perfil) {
        updateData.foto_perfil = profileImage;
      }

      console.log('Dados para atualização:', updateData);

      // Chamar a função de atualização do hook
      await updateProfile.mutateAsync(updateData);

      // Limpar campos de senha após salvamento bem-sucedido
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      toast({
        title: "Sucesso!",
        description: "Perfil atualizado com sucesso!",
        variant: "default"
      });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar perfil. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'Forte': return 'bg-green-500';
      case 'Média': return 'bg-yellow-500';
      case 'Fraca': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-8 p-6 animate-minimal-fade">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="brand-heading text-3xl text-symbol-black mb-2">
          Meu Perfil
        </h1>
        <div className="w-12 h-px bg-symbol-gold mb-4"></div>
        <p className="brand-body text-symbol-gray-600">
          Gerencie suas informações pessoais e configurações de segurança
        </p>
      </div>

      {/* Profile Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-blue-50/50 to-blue-100/30 border-blue-200/50">
          <div className="flex items-center justify-between mb-4">
            <User className="text-blue-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Profissional
            </h3>
          </div>
          <div className="brand-heading text-lg text-symbol-black">
            {formData.name}
          </div>
        </div>

        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-purple-50/50 to-purple-100/30 border-purple-200/50">
          <div className="flex items-center justify-between mb-4">
            <Camera className="text-purple-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Estabelecimento
            </h3>
          </div>
          <div className="brand-heading text-lg text-symbol-black">
            {formData.salonName}
          </div>
        </div>

        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border-emerald-200/50">
          <div className="flex items-center justify-between mb-4">
            <Shield className="text-emerald-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              Localização
            </h3>
          </div>
          <div className="brand-heading text-lg text-symbol-black">
            {formData.city}, {formData.state}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Seção 1: Dados Cadastrais */}
        <div className="symbol-card p-4 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="mb-6">
            <h2 className="brand-subheading text-symbol-black text-lg mb-2 flex items-center gap-3">
              <User size={20} className="text-symbol-gray-600" />
              Dados Cadastrais
            </h2>
            <div className="w-8 h-px bg-symbol-beige"></div>
          </div>
          
          <div className="space-y-6">
            {/* Upload de Imagem */}
            <div className="flex flex-col items-center space-y-4 pb-6 border-b border-symbol-gray-200">
              <div className="relative">
                <div className="w-24 h-24 bg-symbol-beige/30 flex items-center justify-center overflow-hidden rounded-lg">
                  {profileImage ? (
                    <img src={profileImage} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-symbol-gray-400" />
                  )}
                </div>
                <label htmlFor="profile-image" className="absolute -bottom-2 -right-2 bg-symbol-gold hover:bg-symbol-gold/80 p-2 cursor-pointer transition-colors rounded-lg">
                  <Camera size={16} className="text-symbol-black" />
                </label>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              <p className="brand-body text-symbol-gray-600 text-center text-sm">
                Clique no ícone para alterar sua foto de perfil
              </p>
            </div>

            {/* Campos de Dados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
                  Nome do Profissional
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-gold text-symbol-black"
                />
              </div>
              <div>
                <Label htmlFor="salonName" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
                  Nome do Salão
                </Label>
                <Input
                  id="salonName"
                  value={formData.salonName}
                  onChange={(e) => handleInputChange('salonName', e.target.value)}
                  className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-gold text-symbol-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="phone" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
                  Telefone / WhatsApp
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-gold text-symbol-black"
                />
              </div>
              <div>
                <Label htmlFor="email" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
                  Email de Acesso
                </Label>
                <Input
                  id="email"
                  value={formData.email}
                  disabled
                  className="mt-2 bg-elite-pearl-100"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
                Endereço
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-gold text-symbol-black"
                placeholder="Rua, número, bairro"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="city" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
                  Cidade
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-gold text-symbol-black"
                />
              </div>
              <div>
                <Label htmlFor="state" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
                  Estado
                </Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-gold text-symbol-black"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
                Sobre o seu negócio
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-gold text-symbol-black"
                rows={3}
                placeholder="Descreva brevemente seu salão e especialidades..."
              />
            </div>
          </div>
        </div>

        {/* Seção 2: Segurança */}
        <div className="symbol-card p-4 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="mb-6">
            <h2 className="brand-subheading text-symbol-black text-lg mb-2 flex items-center gap-3">
              <Shield size={20} className="text-symbol-gray-600" />
              Segurança
            </h2>
            <div className="w-8 h-px bg-symbol-beige"></div>
          </div>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="currentPassword" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
                Senha Atual
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-gold text-symbol-black"
                placeholder="Digite sua senha atual"
              />
            </div>

            <div>
              <Label htmlFor="newPassword" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
                Nova Senha
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-gold text-symbol-black"
                placeholder="Digite a nova senha"
              />
              {formData.newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-elite-pearl-300 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: passwordStrength === 'Forte' ? '100%' : passwordStrength === 'Média' ? '66%' : '33%' }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength === 'Forte' ? 'text-green-600' : 
                      passwordStrength === 'Média' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {passwordStrength}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
                Confirmar Nova Senha
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-gold text-symbol-black"
                placeholder="Confirme a nova senha"
              />
            </div>

            <div className="symbol-card p-6 bg-white border-symbol-gold/30">
              <h4 className="brand-subheading text-symbol-black text-sm uppercase tracking-wide mb-3">
                Requisitos da Senha
              </h4>
              <ul className="brand-body text-symbol-gray-600 space-y-1 text-sm">
                <li>• Mínimo de 8 caracteres</li>
                <li>• Incluir letras e números</li>
                <li>• Recomendado: símbolos especiais</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Salvar */}
      <div className="flex justify-center pt-8">
        <Button 
          onClick={handleSaveProfile}
          disabled={isSaving || isLoading}
          className="bg-symbol-black hover:bg-symbol-gray-800 text-symbol-white font-light py-4 px-8 transition-all duration-300 flex items-center gap-3 uppercase tracking-wider text-sm disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
};

export default Profile;
