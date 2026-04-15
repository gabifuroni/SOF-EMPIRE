import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<'professional' | 'admin'>('professional');
  const { signIn, signOut } = useSupabaseAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/admin/login') setLoginType('admin');
  }, [location.pathname]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await signIn(email, password);
      if (error) {
        toast({
          title: 'Erro de Login',
          description: error.message === 'Invalid login credentials'
            ? 'Credenciais inválidas. Verifique email e senha.'
            : error.message,
          variant: 'destructive',
        });
        return;
      }
      if (data?.user) {
        const { data: profileData } = await supabase
          .from('profiles').select('role').eq('id', data.user.id).single();
        const userRole = profileData?.role || 'professional';
        if (loginType === 'admin' && userRole !== 'admin') {
          toast({ title: 'Acesso Negado', description: 'Você não tem permissão para acessar o painel administrativo.', variant: 'destructive' });
          await signOut();
          return;
        }
        localStorage.setItem('user', JSON.stringify({
          id: data.user.id, email: data.user.email, role: userRole,
          name: data.user.user_metadata?.nome_profissional_ou_salao || data.user.email?.split('@')[0] || 'Usuário',
        }));
        toast({ title: 'Login realizado com sucesso!', description: userRole === 'admin' ? 'Redirecionando para o painel administrativo...' : 'Redirecionando para o dashboard...' });
        setTimeout(() => navigate(userRole === 'admin' ? '/admin' : '/dashboard'), 500);
      }
    } catch {
      toast({ title: 'Erro', description: 'Ocorreu um erro inesperado durante o login.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0a0a0f', fontFamily: "'Inter', sans-serif" }}>
      {/* LEFT */}
      <div className="hidden lg:flex flex-col justify-center items-center flex-1 px-16 relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #0d0d14 0%, #13131f 60%, #1a1520 100%)' }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        </div>
        <div className="relative text-center mb-14">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c9a84c, #8a6520)', boxShadow: '0 8px 32px rgba(201,168,76,0.35)' }}>
            <img src="/lovable-uploads/2c89b6d0-0654-4a70-9721-8febacad65fd.png" alt="SOF" className="w-12 h-12 object-contain" />
          </div>
          <div style={{ fontFamily: 'serif', fontSize: 28, fontWeight: 600, color: '#f0f0f8', letterSpacing: '0.06em' }}>SOF EMPIRE</div>
          <div style={{ fontSize: 11, color: '#9090a8', marginTop: 6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sistema de Organização Financeira</div>
        </div>
        <div className="relative flex flex-col gap-4 w-full max-w-xs">
          {[
            { icon: '📊', title: 'Relatórios em tempo real', sub: 'Acompanhe seu faturamento ao vivo' },
            { icon: '🎯', title: 'Metas inteligentes', sub: 'Financeira e de atendimentos' },
            { icon: '💳', title: 'Controle de despesas', sub: 'Diretas, indiretas e depreciação' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl px-5 py-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a38' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#f0f0f8', marginBottom: 2 }}>{f.title}</div>
                <div style={{ fontSize: 11, color: '#9090a8' }}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex flex-col justify-center items-center flex-1 px-8" style={{ background: '#0a0a0f' }}>
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c9a84c, #8a6520)' }}>
              <img src="/lovable-uploads/2c89b6d0-0654-4a70-9721-8febacad65fd.png" alt="SOF" className="w-10 h-10 object-contain" />
            </div>
            <div style={{ fontFamily: 'serif', fontSize: 22, color: '#f0f0f8', letterSpacing: '0.06em' }}>SOF EMPIRE</div>
          </div>

          <div className="mb-8">
            <h2 style={{ fontFamily: 'serif', fontSize: 26, fontWeight: 600, color: '#f0f0f8', marginBottom: 8 }}>Bem-vinda de volta 👋</h2>
            <p style={{ fontSize: 13, color: '#9090a8' }}>Acesse sua conta para continuar</p>
          </div>

          {/* Toggle */}
          <div className="flex rounded-xl p-1 mb-7 gap-1" style={{ background: '#13131a', border: '1px solid #2a2a38' }}>
            {(['professional', 'admin'] as const).map(type => (
              <button key={type} onClick={() => setLoginType(type)} className="flex-1 rounded-lg py-2 text-sm font-medium transition-all" style={{
                background: loginType === type ? '#c9a84c' : 'transparent',
                color: loginType === type ? '#0a0a0f' : '#9090a8',
                border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              }}>
                {type === 'professional' ? '👤 Profissional' : '🛡️ Administrador'}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin}>
            {[
              { label: 'E-mail', id: 'email', type: 'email', value: email, placeholder: 'seu@email.com', onChange: setEmail },
              { label: 'Senha', id: 'password', type: 'password', value: password, placeholder: '••••••••', onChange: setPassword },
            ].map(f => (
              <div key={f.id} className="mb-4">
                <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 8, display: 'block' }}>{f.label}</label>
                <input
                  type={f.type} value={f.value} placeholder={f.placeholder} required
                  onChange={e => f.onChange(e.target.value)}
                  style={{ width: '100%', background: '#13131a', border: '1px solid #2a2a38', borderRadius: 10, padding: '14px 16px', fontSize: 15, color: '#f0f0f8', outline: 'none', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = '#c9a84c'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = '#2a2a38'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            ))}

            <button type="submit" disabled={isLoading} style={{
              width: '100%', background: 'linear-gradient(135deg, #c9a84c 0%, #8a6520 100%)',
              color: '#0a0a0f', fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600,
              border: 'none', borderRadius: 12, padding: 16, cursor: isLoading ? 'not-allowed' : 'pointer',
              marginTop: 8, opacity: isLoading ? 0.7 : 1, boxShadow: '0 4px 20px rgba(201,168,76,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              {isLoading ? (
                <>
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(10,10,15,0.3)', borderTopColor: '#0a0a0f', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Entrando...
                </>
              ) : loginType === 'admin' ? '🛡️ Acessar como Admin' : 'Entrar'}
            </button>
          </form>

          <div className="text-center mt-5" style={{ fontSize: 12, color: '#606078' }}>
            Problemas para acessar?{' '}
            <span style={{ color: '#c9a84c', cursor: 'pointer' }}>Fale com o suporte</span>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Login;
