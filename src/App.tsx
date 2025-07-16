import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import TermosDeServico from "./pages/TermosDeServico";
import PoliticaDePrivacidade from "./pages/PoliticaDePrivacidade";
import TermosDeUso from "./pages/TermosDeUso";
import AvisoIA from "./pages/AvisoIA";
import CentralDeAjuda from './pages/CentralDeAjuda';
import Contato from './pages/Contato';
import { useEffect } from 'react';
import { PresentationProvider } from './contexts/PresentationContext';
import FullScreenSlideShow from './components/FullScreenSlideShow';
import { usePresentation } from './contexts/PresentationContext';
import Dashboard from './components/Dashboard';
import NotFound from './pages/NotFound';
import LandingPage from './pages/LandingPage';
import { useAuth } from '@/contexts/AuthContext';
import ErrorBoundary from "@/components/ErrorBoundary";

const queryClient = new QueryClient();

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    // Tenta scrollar para o topo de forma suave, mas garante o reset mesmo em navegação rápida
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    setTimeout(() => window.scrollTo(0, 0), 10); // fallback para garantir
  }, [location.pathname]);
  return null;
}

function PresentationPortal() {
  const { open, material, close } = usePresentation();
  if (!open || !material) return null;
  return (
    <FullScreenSlideShow
      material={material}
      onClose={() => {
        if (document.fullscreenElement) {
          document.exitFullscreen?.();
        } else if ((document as any).webkitFullscreenElement) {
          (document as any).webkitExitFullscreen?.();
        } else if ((document as any).msFullscreenElement) {
          (document as any).msExitFullscreen?.();
        }
        close();
      }}
    />
  );
}

function NotFoundRedirect() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    } else {
      navigate('/landing', { replace: true });
    }
  }, [user, navigate]);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <PresentationProvider>
            <Toaster />
            <PresentationPortal />
            <Router>
              <ScrollToTop />
              <ErrorBoundary>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/termos-de-servico" element={<TermosDeServico />} />
                  <Route path="/politica-de-privacidade" element={<PoliticaDePrivacidade />} />
                  <Route path="/termos-de-uso" element={<TermosDeUso />} />
                  <Route path="/aviso-ia" element={<AvisoIA />} />
                  <Route path="/central-de-ajuda" element={<CentralDeAjuda />} />
                  <Route path="/contato" element={<Contato />} />
                  <Route path="/landing" element={<LandingPage />} />
                  <Route path="/*" element={<Index />} />
                  <Route path="*" element={<NotFoundRedirect />} />
                </Routes>
              </ErrorBoundary>
            </Router>
          </PresentationProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
