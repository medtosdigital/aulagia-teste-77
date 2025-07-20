import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string, metadata?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Se é um novo usuário, criar perfil automaticamente
        if (event === 'SIGNED_IN' && session?.user) {
          await createUserProfile(session.user);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Função para criar perfil do usuário
  const createUserProfile = async (user: User) => {
    try {
      console.log('👤 Criando perfil para usuário:', user.id);
      
      // Verificar se o perfil já existe
      const { data: existingProfile, error: checkError } = await supabase
        .from('perfis')
        .select('user_id')
        .eq('user_id', user.id)
        .single();
      
      if (existingProfile) {
        console.log('✅ Perfil já existe para usuário:', user.id);
        return;
      }
      
      // Criar perfil básico
      const { error: insertError } = await supabase
        .from('perfis')
        .insert({
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email,
          plano_ativo: 'gratuito',
          billing_type: 'gratuito'
        });
      
      if (insertError) {
        console.error('❌ Erro ao criar perfil:', insertError);
      } else {
        console.log('✅ Perfil criado com sucesso para usuário:', user.id);
      }
    } catch (error) {
      console.error('❌ Erro ao criar perfil:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string, metadata?: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || email,
          ...(metadata || {})
        }
      }
    });
    
    // Se o registro foi bem-sucedido, criar perfil manualmente
    if (!error) {
      console.log('✅ Registro bem-sucedido, perfil será criado automaticamente');
    }
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
