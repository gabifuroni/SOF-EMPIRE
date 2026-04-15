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

  // Force dark background on html and body
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlBg = html.style.backgroundColor;
    const prevBodyBg = body.style.backgroundColor;
    html.style.backgroundColor = '#0a0a0f';
    body.style.backgroundColor = '#0a0a0f';
    return () => {
      html.style.backgroundColor = prevHtmlBg;
      body.style.backgroundColor = prevBodyBg;
    };
  }, []);

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
    <div style={{
      position: 'fixed', inset: 0, display: 'flex',
      background: '#0a0a0f', fontFamily: "'Inter', sans-serif", zIndex: 9999,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .login-fade { animation: fadeUp 0.5s ease both; }
        .login-fade-2 { animation: fadeUp 0.5s 0.1s ease both; }
        .login-fade-3 { animation: fadeUp 0.5s 0.2s ease both; }
        .login-input {
          width: 100%; background: #13131a; border: 1.5px solid #2a2a38;
          border-radius: 10px; padding: 14px 16px; font-size: 15px;
          color: #f0f0f8; outline: none; box-sizing: border-box;
          font-family: 'Inter', sans-serif; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .login-input:focus { border-color: #c9a84c; box-shadow: 0 0 0 3px rgba(201,168,76,0.15); }
        .login-input::placeholder { color: #505068; }
        .feat-card {
          display: flex; align-items: center; gap: 14px; padding: 14px 18px;
          background: rgba(255,255,255,0.03); border: 1px solid #2a2a38; border-radius: 12px;
          margin-bottom: 10px;
        }
        .role-btn {
          flex: 1; padding: 10px; border: none; border-radius: 8px; cursor: pointer;
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500;
          transition: all 0.2s; letter-spacing: 0.01em;
        }
        .role-btn.active { background: #c9a84c; color: #0a0a0f; }
        .role-btn.inactive { background: transparent; color: #9090a8; }
        .btn-submit {
          width: 100%; padding: 15px; border: none; border-radius: 12px; cursor: pointer;
          background: linear-gradient(135deg, #c9a84c, #8a6520);
          color: #0a0a0f; font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 600;
          margin-top: 8px; box-shadow: 0 4px 20px rgba(201,168,76,0.3);
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: opacity 0.2s;
        }
        .btn-submit:hover { opacity: 0.9; }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      {/* LEFT PANEL */}
      <div style={{
        flex: 1, display: 'none', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', padding: '60px',
        background: 'linear-gradient(145deg, #0d0d14 0%, #13131f 60%, #1a1520 100%)',
        position: 'relative', overflow: 'hidden',
      }} className="login-left-panel">
        <style>{`.login-left-panel { display: none; } @media(min-width:1024px){ .login-left-panel { display: flex !important; } }`}</style>
        
        <div style={{ position: 'absolute', width: 500, height: 500, background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        
        <div className="login-fade" style={{ textAlign: 'center', marginBottom: 48, position: 'relative' }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: 'linear-gradient(135deg, #c9a84c, #8a6520)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 8px 32px rgba(201,168,76,0.35)' }}>
            <img src="/lovable-uploads/2c89b6d0-0654-4a70-9721-8febacad65fd.png" alt="SOF" style={{ width: 44, height: 44, objectFit: 'contain' }} />
          </div>
          <div style={{ fontFamily: "'Sora', serif", fontSize: 26, fontWeight: 600, color: '#f0f0f8', letterSpacing: '0.06em' }}>SOF EMPIRE</div>
          <div style={{ fontSize: 11, color: '#9090a8', marginTop: 6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sistema de Organização Financeira</div>
        </div>

        <div className="login-fade-2" style={{ width: '100%', maxWidth: 300, position: 'relative' }}>
          {[
            { icon: '📊', title: 'Relatórios em tempo real', sub: 'Acompanhe seu faturamento ao vivo' },
            { icon: '🎯', title: 'Metas inteligentes', sub: 'Financeira e de atendimentos' },
            { icon: '💳', title: 'Controle de despesas', sub: 'Diretas, indiretas e depreciação' },
          ].map((f, i) => (
            <div key={i} className="feat-card">
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#f0f0f8', marginBottom: 2 }}>{f.title}</div>
                <div style={{ fontSize: 11, color: '#9090a8' }}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 24px', background: '#0a0a0f', overflowY: 'auto' }}>
        <div className="login-fade-3" style={{ width: '100%', maxWidth: 380 }}>
          
          {/* Mobile logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #c9a84c, #8a6520)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 24px rgba(201,168,76,0.3)' }}>
              <img src="/lovable-uploads/2c89b6d0-0654-4a70-9721-8febacad65fd.png" alt="SOF" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            </div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 600, color: '#f0f0f8', letterSpacing: '0.04em' }}>SOF EMPIRE</div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 600, color: '#f0f0f8', marginBottom: 8 }}>Bem-vinda de volta 👋</h2>
            <p style={{ fontSize: 13, color: '#9090a8', fontWeight: 300 }}>Acesse sua conta para continuar</p>
          </div>

          {/* Role toggle */}
          <div style={{ display: 'flex', background: '#13131a', border: '1.5px solid #2a2a38', borderRadius: 12, padding: 4, marginBottom: 24, gap: 4 }}>
            <button className={`role-btn ${loginType === 'professional' ? 'active' : 'inactive'}`} onClick={() => setLoginType('professional')}>
              👤 Profissional
            </button>
            <button className={`role-btn ${loginType === 'admin' ? 'active' : 'inactive'}`} onClick={() => setLoginType('admin')}>
              🛡️ Administrador
            </button>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 8 }}>E-mail</label>
              <input className="login-input" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 8 }}>Senha</label>
              <input className="login-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="btn-submit" type="submit" disabled={isLoading}>
              {isLoading
                ? <><div style={{ width: 18, height: 18, border: '2px solid rgba(10,10,15,0.3)', borderTopColor: '#0a0a0f', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Entrando...</>
                : loginType === 'admin' ? '🛡️ Acessar como Admin' : 'Entrar'
              }
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#606078' }}>
            Problemas para acessar? <span style={{ color: '#c9a84c', cursor: 'pointer' }}>Fale com o suporte</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
