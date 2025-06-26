
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import UsageTermsPage from "./pages/UsageTermsPage";
import AIDisclaimerPage from "./pages/AIDisclaimerPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router>
          <Routes>
            {/* Landing Page como página inicial */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Página de Login/Cadastro */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Dashboard e páginas internas */}
            <Route path="/dashboard/*" element={<Index />} />
            
            {/* Páginas legais */}
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/usage-terms" element={<UsageTermsPage />} />
            <Route path="/ai-disclaimer" element={<AIDisclaimerPage />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
