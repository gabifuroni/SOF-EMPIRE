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
    if (location.pathname === '/admin/login') {
      setLoginType('admin');
    }
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
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        const userRole = profileData?.role || 'professional';

        if (loginType === 'admin' && userRole !== 'admin') {
          toast({
            title: 'Acesso Negado',
            description: 'Você não tem permissão para acessar o painel administrativo.',
            variant: 'destructive',
          });
          await signOut();
          return;
        }

        const userData = {
          id: data.user.id,
          email: data.user.email,
          role: userRole,
          name: data.user.user_metadata?.nome_profissional_ou_salao || data.user.email?.split('@')[0] || 'Usuário',
        };
        localStorage.setItem('user', JSON.stringify(userData));

        toast({
          title: 'Login realizado com sucesso!',
          description: userRole === 'admin'
            ? 'Redirecionando para o painel administrativo...'
            : 'Redirecionando para o dashboard...',
        });

        setTimeout(() => {
          navigate(userRole === 'admin' ? '/admin' : '/dashboard');
        }, 500);
      }
    } catch {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado durante o login.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      fontFamily: "'Inter', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        .login-input {
          width: 100%; background: #13131a; border: 1px solid #2a2a38;
          border-radius: 10px; padding: 14px 16px;
          font-family: 'Inter', sans-serif; font-size: 15px;
          color: #f0f0f8; outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .login-input:focus { border-color: #c9a84c; box-shadow: 0 0 0 3px rgba(201,168,76,0.15); }
        .login-input::placeholder { color: #606078; }
        .role-btn { flex: 1; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; color: #9090a8; background: none; border: none; border-radius: 7px; padding: 10px; cursor: pointer; transition: all 0.2s; letter-spacing: 0.02em; }
        .role-btn.active { background: #c9a84c; color: #0a0a0f; font-weight: 600; }
        .role-btn:hover:not(.active) { color: #f0f0f8; }
        .btn-login { width: 100%; background: linear-gradient(135deg, #c9a84c 0%, #8a6520 100%); color: #0a0a0f; font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 600; border: none; border-radius: 12px; padding: 16px; cursor: pointer; margin-top: 8px; transition: opacity 0.2s; box-shadow: 0 4px 20px rgba(201,168,76,0.3); letter-spacing: 0.02em; }
        .btn-login:hover:not(:disabled) { opacity: 0.9; }
        .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }
        .feat-item { display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: rgba(255,255,255,0.03); border: 1px solid #2a2a38; border-radius: 12px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 18px; height: 18px; border: 2px solid rgba(10,10,15,0.3); border-top-color: #0a0a0f; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .fade-up-2 { animation: fadeUp 0.5s 0.1s ease both; }
        .fade-up-3 { animation: fadeUp 0.5s 0.2s ease both; }
        @media (max-width: 768px) {
          .login-left { display: none !important; }
          .login-right { grid-column: 1 / -1 !important; }
        }
      `}</style>

      {/* LEFT PANEL */}
      <div className="login-left" style={{
        background: 'linear-gradient(145deg, #0d0d14 0%, #13131f 60%, #1a1520 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', padding: '60px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div className="fade-up" style={{ position: 'relative', textAlign: 'center', marginBottom: '52px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #c9a84c 0%, #8a6520 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px',
            boxShadow: '0 8px 32px rgba(201,168,76,0.35)',
          }}>
            <img
              src="/lovable-uploads/2c89b6d0-0654-4a70-9721-8febacad65fd.png"
              alt="SOF Empire"
              style={{ width: '44px', height: '44px', objectFit: 'contain' }}
            />
          </div>
          <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '26px', fontWeight: 600, color: '#f0f0f8', letterSpacing: '0.06em' }}>
            SOF EMPIRE
          </div>
          <div style={{ fontSize: '12px', color: '#9090a8', marginTop: '6px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Sistema de Organização Financeira
          </div>
        </div>

        {/* Features */}
        <div className="fade-up-2" style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '320px', position: 'relative' }}>
          {[
            { icon: '📊', title: 'Relatórios em tempo real', sub: 'Acompanhe seu faturamento ao vivo' },
            { icon: '🎯', title: 'Metas inteligentes', sub: 'Financeira e de atendimentos' },
            { icon: '💳', title: 'Controle de despesas', sub: 'Diretas, indiretas e depreciação' },
          ].map((f, i) => (
            <div key={i} className="feat-item">
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', flexShrink: 0,
              }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#f0f0f8', marginBottom: '2px' }}>{f.title}</div>
                <div style={{ fontSize: '11px', color: '#9090a8', fontWeight: 300 }}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right" style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', padding: '60px', background: '#0a0a0f',
      }}>
        <div className="fade-up-3" style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '26px', fontWeight: 600, color: '#f0f0f8', marginBottom: '8px' }}>
              Bem-vinda de volta 👋
            </h2>
            <p style={{ fontSize: '13px', color: '#9090a8', fontWeight: 300 }}>
              Acesse sua conta para continuar
            </p>
          </div>

          {/* Role Toggle */}
          <div style={{
            display: 'flex', background: '#13131a', border: '1px solid #2a2a38',
            borderRadius: '10px', padding: '4px', marginBottom: '28px', gap: '4px',
          }}>
            <button className={`role-btn ${loginType === 'professional' ? 'active' : ''}`} onClick={() => setLoginType('professional')}>
              👤 Profissional
            </button>
            <button className={`role-btn ${loginType === 'admin' ? 'active' : ''}`} onClick={() => setLoginType('admin')}>
              🛡️ Administrador
            </button>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: '8px', display: 'block' }}>
                E-mail
              </label>
              <input
                className="login-input"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: '8px', display: 'block' }}>
                Senha
              </label>
              <input
                className="login-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="btn-login" type="submit" disabled={isLoading}>
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <div className="spinner" />
                  Entrando...
                </div>
              ) : (
                loginType === 'admin' ? '🛡️ Acessar como Admin' : 'Entrar'
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#606078' }}>
            Problemas para acessar?{' '}
            <span style={{ color: '#c9a84c', cursor: 'pointer' }}>Fale com o suporte</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
