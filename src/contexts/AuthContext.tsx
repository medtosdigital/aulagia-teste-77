
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { userDataService } from '@/services/userDataService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string, metadata?: Record<string, unknown>) => Promise<{ error: Error | null }>;
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
        
        // Se é um novo usuário, garantir que o perfil seja criado
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('👤 Usuário logado, verificando perfil...');
          await ensureUserProfile(session.user);
        }
      }
    );

    // THEN check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔍 Verificando sessão existente:', session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Se há uma sessão, garantir que o perfil existe
        if (session?.user) {
          console.log('👤 Sessão encontrada, verificando perfil...');
          await ensureUserProfile(session.user);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Erro ao verificar sessão:', error);
        setLoading(false);
      }
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  // Função para garantir que o perfil do usuário existe
  const ensureUserProfile = async (user: User) => {
    try {
      console.log('👤 Verificando/criando perfil para usuário:', user.id);
      
      // Usar o novo serviço para garantir dados completos
      const userData = await userDataService.ensureUserData(user.id, user.email || '');
      
      if (userData) {
        console.log('✅ Perfil do usuário verificado/criado com sucesso:', userData);
      } else {
        console.error('❌ Erro ao verificar/criar perfil do usuário');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar/criar perfil:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string, metadata?: Record<string, unknown>) => {
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
