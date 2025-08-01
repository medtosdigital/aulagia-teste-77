
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
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

function PresentationPortal() {
  const { open, material, close } = usePresentation();
  if (!open || !material) return null;

  // Tipo auxiliar para suportar fullscreen em navegadores antigos
  type FullscreenDocument = Document & {
    webkitFullscreenElement?: Element;
    webkitExitFullscreen?: () => void;
    msFullscreenElement?: Element;
    msExitFullscreen?: () => void;
  };
  const doc = document as FullscreenDocument;

  return (
    <FullScreenSlideShow
      material={material}
      onClose={() => {
        if (document.fullscreenElement) {
          document.exitFullscreen?.();
        } else if (doc.webkitFullscreenElement) {
          doc.webkitExitFullscreen?.();
        } else if (doc.msFullscreenElement) {
          doc.msExitFullscreen?.();
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
