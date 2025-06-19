
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { Shield, User } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<'professional' | 'admin'>('professional');
  const { signIn } = useSupabaseAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: "Erro de Login",
          description: error.message === 'Invalid login credentials' 
            ? "Credenciais inválidas. Verifique email e senha."
            : error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Login realizado com sucesso!",
        description: loginType === 'admin' 
          ? "Redirecionando para o painel administrativo..." 
          : "Redirecionando para o dashboard...",
      });

      // Aguardar um momento para o estado de auth ser atualizado
      setTimeout(() => {
        if (loginType === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 500);

    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado durante o login.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (type: 'admin' | 'professional') => {
    if (type === 'admin') {
      setEmail('admin@gestao.com');
      setPassword('admin123');
      setLoginType('admin');
    } else {
      setEmail('profissional@salon.com');
      setPassword('profissional123');
      setLoginType('professional');
    }
  };

  return (
    <div className="min-h-screen symbol-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-12 animate-minimal-fade">
          <div className="mb-8">
            {/* Geometric Symbol */}
            <div className="mb-2 flex justify-center">
              <img src="/lovable-uploads/2c89b6d0-0654-4a70-9721-8febacad65fd.png" alt="Geometric Symbol" className="w-20 transition-all duration-300" />
            </div>
            <h1 className="brand-heading text-2xl text-symbol-black mb-2 font-bold tracking-wider">
              SOF IMPIRE
            </h1>
            <p className="brand-subheading text-symbol-gray-600 text-sm uppercase tracking-wider">
              Sistema de Organização Financeira
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="symbol-card p-8 animate-minimal-fade" style={{ animationDelay: '0.2s' }}>
          <div className="mb-8 text-center">
            <h2 className="brand-heading text-2xl text-symbol-black mb-2">
              Acesso ao Sistema
            </h2>
            <div className="w-8 h-px bg-symbol-beige mx-auto"></div>
          </div>

          {/* Login Type Toggle */}
          <div className="mb-6 flex gap-2 p-1 bg-symbol-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setLoginType('professional')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                loginType === 'professional'
                  ? 'bg-symbol-white text-symbol-black shadow-sm'
                  : 'text-symbol-gray-600 hover:text-symbol-black'
              }`}
            >
              <User size={16} />
              Profissional
            </button>
            <button
              type="button"
              onClick={() => setLoginType('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                loginType === 'admin'
                  ? 'bg-symbol-white text-symbol-black shadow-sm'
                  : 'text-symbol-gray-600 hover:text-symbol-black'
              }`}
            >
              <Shield size={16} />
              Administrador
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-6">
              <div>
                <Label 
                  htmlFor="email" 
                  className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide"
                >
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={loginType === 'admin' ? 'admin@gestao.com' : 'seu@email.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-gold focus:ring-symbol-gold/20 h-12 text-symbol-black placeholder:text-symbol-gray-400"
                />
              </div>

              <div>
                <Label 
                  htmlFor="password" 
                  className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide"
                >
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-gold focus:ring-symbol-gold/20 h-12 text-symbol-black placeholder:text-symbol-gray-400"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-symbol-black hover:bg-symbol-gray-800 text-symbol-white font-light py-4 h-12 transition-all duration-300 uppercase tracking-widest text-sm"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-symbol-white/30 border-t-symbol-white rounded-full animate-spin"></div>
                  Entrando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {loginType === 'admin' ? <Shield size={16} /> : <User size={16} />}
                  {loginType === 'admin' ? 'Acessar como Admin' : 'Entrar'}
                </div>
              )}
            </Button>

            <div className="text-center">
              <a 
                href="#" 
                className="text-sm text-symbol-gray-500 hover:text-symbol-gold transition-colors brand-body"
              >
                Esqueci minha senha
              </a>
            </div>

            {/* Demo Credentials */}
            <div className="pt-6 border-t border-symbol-gray-200 text-center text-sm text-symbol-gray-500 brand-body">
              <p className="mb-4 uppercase tracking-wide">Acesso de demonstração</p>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemoCredentials('admin')}
                    className="flex-1 text-xs"
                  >
                    <Shield size={14} className="mr-1" />
                    Admin Demo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemoCredentials('professional')}
                    className="flex-1 text-xs"
                  >
                    <User size={14} className="mr-1" />
                    Profissional Demo
                  </Button>
                </div>
                <div className="text-xs text-symbol-gray-400 space-y-1">
                  <p>Admin: admin@gestao.com / admin123</p>
                  <p>Profissional: profissional@salon.com / profissional123</p>
                </div>
              </div>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;
