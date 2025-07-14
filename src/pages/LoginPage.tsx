import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Mail, Lock, User, Eye, EyeOff, AlertCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    plano: '' 
  });
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(loginData.email, loginData.password);
    
    if (error) {
      setError(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } else {
      navigate('/dashboard', { replace: true });
    }
    
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    // Inclui plano_ativo no metadata se for grupo_escolar
    const metadata: any = { full_name: registerData.name };
    if (registerData.plano === 'grupo_escolar') {
      metadata.plano_ativo = 'grupo_escolar';
    }
    const { error } = await signUp(registerData.email, registerData.password, registerData.name, metadata);
    
    if (error) {
      if (error.message.includes('User already registered')) {
        setError('Este e-mail já está cadastrado. Tente fazer login.');
      } else {
        setError(error.message || 'Erro ao criar conta. Tente novamente.');
      }
    } else {
      setError('');
      navigate('/dashboard', { replace: true });
    }
    
    setLoading(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    setForgotSent(false);
    try {
      await supabase.auth.resetPasswordForEmail(forgotEmail, { redirectTo: window.location.origin + '/login' });
      setForgotSent(true);
      setForgotLoading(false);
    } catch (err: any) {
      setForgotError('Erro ao enviar e-mail. Tente novamente.');
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <div className="w-full max-w-5xl bg-white/0 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Lado esquerdo: destaque e benefícios */}
        <div className="hidden md:flex flex-col justify-center items-center bg-primary-500 text-white px-10 py-12 w-1/2 relative">
          <div className="absolute inset-0 bg-primary-500 opacity-95 z-0" />
          <div className="relative z-10 w-full">
            <h2 className="text-3xl font-extrabold mb-4 text-center">Seja Bem-vindo ao <span className='text-white drop-shadow'>AulagIA</span></h2>
            <p className="mb-8 text-lg text-center font-medium">Assuma o controle da sua experiência pedagógica e transforme sua rotina com tecnologia.</p>
            <ul className="space-y-5">
              <li className="flex items-center gap-3"><span className="bg-white/20 p-2 rounded-full"><BookOpen className="w-6 h-6 text-white" /></span> Acesse milhares de materiais prontos e crie os seus</li>
              <li className="flex items-center gap-3"><span className="bg-white/20 p-2 rounded-full"><User className="w-6 h-6 text-white" /></span> Gerencie professores e turmas facilmente</li>
              <li className="flex items-center gap-3"><span className="bg-white/20 p-2 rounded-full"><Lock className="w-6 h-6 text-white" /></span> Seus dados protegidos e acesso seguro</li>
              <li className="flex items-center gap-3"><span className="bg-white/20 p-2 rounded-full"><Mail className="w-6 h-6 text-white" /></span> Suporte rápido e dedicado</li>
            </ul>
          </div>
        </div>
        {/* Lado direito: formulário de login/cadastro ou recuperação */}
        <div className="flex-1 flex flex-col justify-center items-center bg-white px-6 py-10 md:py-12">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-primary-500 text-white p-3 rounded-2xl shadow-lg">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="logo-text text-4xl text-primary-600">AulagIA</h1>
                <p className="text-gray-500 text-sm font-normal -mt-1">Sua aula com toque mágico</p>
              </div>
            </div>
          </div>
          <Card className="shadow-xl border-0 w-full max-w-md mx-auto">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-800">Bem-vindo!</CardTitle>
              <CardDescription className="text-gray-600">
                Acesse sua conta ou crie uma nova para começar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && !showForgot && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              {/* Formulário de recuperação de senha */}
              {showForgot ? (
                <form onSubmit={handleForgot} className="space-y-6 animate-fade-in">
                  <div className="text-center mb-2">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Recuperar Senha</h2>
                    <p className="text-gray-500">Informe seu e-mail e enviaremos um código de verificação para redefinir sua senha.</p>
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Seu e-mail cadastrado"
                      className="h-12 text-base"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      required
                      disabled={forgotLoading || forgotSent}
                    />
                  </div>
                  {forgotError && <Alert className="mb-2 border-red-200 bg-red-50"><AlertCircle className="h-4 w-4 text-red-600" /><AlertDescription className="text-red-700">{forgotError}</AlertDescription></Alert>}
                  {forgotSent && <Alert className="mb-2 border-green-200 bg-green-50"><Send className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-700">E-mail enviado! Verifique sua caixa de entrada.</AlertDescription></Alert>}
                  <Button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white text-lg font-bold h-12" disabled={forgotLoading || forgotSent}>
                    <Send className="w-5 h-5 mr-2" /> {forgotLoading ? 'Enviando...' : 'Enviar Código de Verificação'}
                  </Button>
                  <div className="pt-2 border-t border-gray-100 text-center">
                    <button type="button" className="text-primary-600 hover:underline font-medium flex items-center justify-center gap-1 mx-auto mt-2" onClick={() => { setShowForgot(false); setForgotEmail(''); setForgotSent(false); setForgotError(''); }}>
                      <span className="text-base">&larr; Voltar ao Login</span>
                    </button>
                  </div>
                </form>
              ) : (
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Entrar</TabsTrigger>
                    <TabsTrigger value="register">Cadastrar</TabsTrigger>
                  </TabsList>
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            className="pl-10"
                            value={loginData.email}
                            onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Sua senha"
                            className="pl-10 pr-10"
                            value={loginData.password}
                            onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                            required
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            disabled={loading}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full btn-magic"
                        disabled={loading}
                      >
                        {loading ? 'Entrando...' : 'Entrar'}
                      </Button>
                      <div className="text-center mt-2">
                        <button type="button" className="text-primary-600 hover:underline font-medium" onClick={() => setShowForgot(true)}>
                          Esqueci minha senha
                        </button>
                      </div>
                    </form>
                  </TabsContent>
                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome completo</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="name"
                            type="text"
                            placeholder="Seu nome completo"
                            className="pl-10"
                            value={registerData.name}
                            onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email">E-mail</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="seu@email.com"
                            className="pl-10"
                            value={registerData.email}
                            onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Sua senha (mín. 6 caracteres)"
                            className="pl-10 pr-10"
                            value={registerData.password}
                            onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                            required
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            disabled={loading}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="confirm-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirme sua senha"
                            className="pl-10"
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full btn-magic"
                        disabled={loading}
                      >
                        {loading ? 'Criando conta...' : 'Criar conta'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Ao continuar, você concorda com nossos{' '}
              <a href="/termos-de-servico" className="text-primary-600 hover:underline">
                Termos de Serviço
              </a>{' '}
              e{' '}
              <a href="/politica-de-privacidade" className="text-primary-600 hover:underline">
                Política de Privacidade
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
