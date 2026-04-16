import { useState, useEffect } from 'react';
import { User, Camera, Shield, Save, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';

interface ProfileUpdateData {
  nome_profissional_ou_salao?: string; telefone?: string; endereco?: string;
  cidade?: string; estado?: string; nome_salao?: string; descricao_salao?: string; foto_perfil?: string;
}

const Profile = () => {
  const { toast } = useToast();
  const { profile, updateProfile, isLoading } = useProfile();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', salonName: '', phone: '', email: '', address: '', city: '', state: '', description: '', currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (profile) {
      setFormData({ name: profile.nome_profissional_ou_salao || '', salonName: profile.nome_salao || '', phone: profile.telefone || '', email: profile.email || '', address: profile.endereco || '', city: profile.cidade || '', state: profile.estado || '', description: profile.descricao_salao || '', currentPassword: '', newPassword: '', confirmPassword: '' });
      setProfileImage(profile.foto_perfil || null);
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'newPassword') {
      setPasswordStrength(value.length < 4 ? 'Fraca' : value.length < 8 ? 'Média' : 'Forte');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onload = e => setProfileImage(e.target?.result as string); reader.readAsDataURL(file); }
  };

  const handlePasswordChange = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) throw new Error('Todos os campos de senha são obrigatórios');
    if (formData.newPassword !== formData.confirmPassword) throw new Error('A nova senha e a confirmação não coincidem');
    if (formData.newPassword.length < 6) throw new Error('A nova senha deve ter pelo menos 6 caracteres');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) throw new Error('Email não encontrado');
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: formData.currentPassword });
    if (signInError) throw new Error('Senha atual incorreta');
    const { error: updateError } = await supabase.auth.updateUser({ password: formData.newPassword });
    if (updateError) throw updateError;
  };

  const handleSaveProfile = async () => {
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) { toast({ title: 'Erro', description: 'As senhas não coincidem', variant: 'destructive' }); return; }
    setIsSaving(true);
    try {
      const updateData: ProfileUpdateData = { nome_profissional_ou_salao: formData.name, telefone: formData.phone, endereco: formData.address, cidade: formData.city, estado: formData.state, nome_salao: formData.salonName, descricao_salao: formData.description };
      if (profileImage && profileImage !== profile?.foto_perfil) updateData.foto_perfil = profileImage;
      await updateProfile.mutateAsync(updateData);
      if (formData.newPassword && formData.currentPassword) {
        try { await handlePasswordChange(); toast({ title: 'Sucesso!', description: 'Perfil e senha atualizados!' }); }
        catch (e) { toast({ title: 'Perfil salvo, erro na senha', description: e instanceof Error ? e.message : 'Erro', variant: 'destructive' }); return; }
      } else { toast({ title: 'Sucesso!', description: 'Perfil atualizado com sucesso!' }); }
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch { toast({ title: 'Erro', description: 'Erro ao salvar perfil.', variant: 'destructive' }); }
    finally { setIsSaving(false); }
  };

  const pwColor = passwordStrength === 'Forte' ? '#00c896' : passwordStrength === 'Média' ? '#fbbf24' : '#ff4d6a';
  const pwWidth = passwordStrength === 'Forte' ? '100%' : passwordStrength === 'Média' ? '66%' : '33%';

  const inputStyle: React.CSSProperties = { width: '100%', background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 8, padding: '11px 14px', color: '#f0f0f8', fontSize: 14, outline: 'none', fontFamily: 'Sora, sans-serif', boxSizing: 'border-box', transition: 'border-color 0.15s' };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 8, display: 'block' };
  const cardStyle: React.CSSProperties = { background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, padding: '24px 28px' };

  return (
    <div style={{ padding: '24px 28px', background: '#0f0f17', minHeight: '100%' }}>
      <style>{`
        .prof-input:focus { border-color: #c9a84c !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.1); }
        .prof-input:disabled { opacity: 0.5; cursor: not-allowed; }
        .prof-textarea { width:100%; background:#1c1c26; border:1px solid #2a2a38; border-radius:8px; padding:11px 14px; color:#f0f0f8; font-size:14px; outline:none; font-family:Sora, sans-serif; box-sizing:border-box; resize:vertical; min-height:80px; }
        .prof-textarea:focus { border-color:#c9a84c; }
        .save-btn { background:linear-gradient(135deg,#c9a84c,#8a6520); color:#0a0a0f; border:none; borderRadius:12px; padding:14px 32px; font-size:14px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:10px; font-family:Sora, sans-serif; transition:opacity 0.15s; }
        .save-btn:hover:not(:disabled) { opacity:0.9; }
        .save-btn:disabled { opacity:0.6; cursor:not-allowed; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 600, color: '#f0f0f8', marginBottom: 6 }}>Meu Perfil</h1>
        <div style={{ width: 36, height: 2, background: 'linear-gradient(90deg,#c9a84c,transparent)', borderRadius: 2, marginBottom: 6 }} />
        <p style={{ fontSize: 13, color: '#9090a8' }}>Gerencie suas informações pessoais e segurança</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { icon: <User size={16} style={{ color: '#4d9fff' }} />, bg: 'rgba(77,159,255,0.08)', label: 'Profissional', value: formData.name || '—' },
          { icon: <Camera size={16} style={{ color: '#a78bfa' }} />, bg: 'rgba(167,139,250,0.08)', label: 'Estabelecimento', value: formData.salonName || '—' },
          { icon: <MapPin size={16} style={{ color: '#00c896' }} />, bg: 'rgba(0,200,150,0.08)', label: 'Localização', value: [formData.city, formData.state].filter(Boolean).join(', ') || '—' },
        ].map((item, i) => (
          <div key={i} style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>{item.icon}</div>
            <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 600, color: '#f0f0f8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 20 }}>
        {/* Dados Cadastrais */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <User size={18} style={{ color: '#9090a8' }} />
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 600, color: '#f0f0f8' }}>Dados Cadastrais</h2>
          </div>
          <div style={{ width: 28, height: 2, background: 'linear-gradient(90deg,#c9a84c,transparent)', borderRadius: 2, marginBottom: 24 }} />

          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingBottom: 20, borderBottom: '1px solid #2a2a38', marginBottom: 20 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 80, height: 80, borderRadius: 16, background: profileImage ? 'transparent' : 'linear-gradient(135deg,#c9a84c,#8a6520)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid rgba(201,168,76,0.3)' }}>
                {profileImage ? <img src={profileImage} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 28, fontWeight: 700, color: '#0a0a0f', fontFamily: 'Sora, sans-serif' }}>{formData.name?.charAt(0)?.toUpperCase() || 'U'}</span>}
              </div>
              <label htmlFor="profile-image" style={{ position: 'absolute', bottom: -4, right: -4, background: '#c9a84c', borderRadius: 8, padding: '5px', cursor: 'pointer', display: 'flex' }}>
                <Camera size={13} style={{ color: '#0a0a0f' }} />
              </label>
              <input id="profile-image" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            </div>
            <p style={{ fontSize: 12, color: '#606078', textAlign: 'center' }}>Clique no ícone para alterar sua foto</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            {[
              { label: 'Nome do Profissional', field: 'name' },
              { label: 'Nome do Salão', field: 'salonName' },
              { label: 'Telefone / WhatsApp', field: 'phone' },
              { label: 'Email de Acesso', field: 'email', disabled: true },
            ].map(f => (
              <div key={f.field}>
                <label style={labelStyle}>{f.label}</label>
                <input className="prof-input" style={{ ...inputStyle }} type="text" value={(formData as any)[f.field]} onChange={e => handleInputChange(f.field, e.target.value)} disabled={f.disabled} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Endereço</label>
            <input className="prof-input" style={inputStyle} type="text" value={formData.address} onChange={e => handleInputChange('address', e.target.value)} placeholder="Rua, número, bairro" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div><label style={labelStyle}>Cidade</label><input className="prof-input" style={inputStyle} value={formData.city} onChange={e => handleInputChange('city', e.target.value)} /></div>
            <div><label style={labelStyle}>Estado</label><input className="prof-input" style={inputStyle} value={formData.state} onChange={e => handleInputChange('state', e.target.value)} /></div>
          </div>
          <div>
            <label style={labelStyle}>Sobre o negócio</label>
            <textarea className="prof-textarea" value={formData.description} onChange={e => handleInputChange('description', e.target.value)} placeholder="Descreva seu salão e especialidades..." />
          </div>
        </div>

        {/* Segurança */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Shield size={18} style={{ color: '#9090a8' }} />
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 600, color: '#f0f0f8' }}>Segurança</h2>
          </div>
          <div style={{ width: 28, height: 2, background: 'linear-gradient(90deg,#c9a84c,transparent)', borderRadius: 2, marginBottom: 24 }} />

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Senha Atual</label>
            <input className="prof-input" style={inputStyle} type="password" value={formData.currentPassword} onChange={e => handleInputChange('currentPassword', e.target.value)} placeholder="Digite sua senha atual" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Nova Senha</label>
            <input className="prof-input" style={inputStyle} type="password" value={formData.newPassword} onChange={e => handleInputChange('newPassword', e.target.value)} placeholder="Digite a nova senha" />
            {formData.newPassword && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 4, background: '#1c1c26', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: pwWidth, background: pwColor, borderRadius: 99, transition: 'width 0.3s,background 0.3s' }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: pwColor }}>{passwordStrength}</span>
              </div>
            )}
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Confirmar Nova Senha</label>
            <input className="prof-input" style={inputStyle} type="password" value={formData.confirmPassword} onChange={e => handleInputChange('confirmPassword', e.target.value)} placeholder="Confirme a nova senha" />
            {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
              <div style={{ fontSize: 12, color: '#ff4d6a', marginTop: 6 }}>As senhas não coincidem</div>
            )}
          </div>

          <div style={{ background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 10, padding: '16px 18px' }}>
            <h4 style={{ fontSize: 12, fontWeight: 600, color: '#f0f0f8', marginBottom: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Requisitos da Senha</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Mínimo de 8 caracteres', 'Incluir letras e números', 'Recomendado: símbolos especiais'].map((r, i) => (
                <li key={i} style={{ fontSize: 12, color: '#9090a8', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#c9a84c' }}>·</span> {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
        <button className="save-btn" onClick={handleSaveProfile} disabled={isSaving || isLoading} style={{ background: 'linear-gradient(135deg,#c9a84c,#8a6520)', color: '#0a0a0f', border: 'none', borderRadius: 12, padding: '14px 32px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Sora, sans-serif', opacity: (isSaving || isLoading) ? 0.6 : 1 }}>
          <Save size={18} />
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
};

export default Profile;
