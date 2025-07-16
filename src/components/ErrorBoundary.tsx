import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Você pode logar o erro em um serviço externo aqui
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
          <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Ocorreu um erro inesperado</h2>
            <p className="text-gray-700 mb-4">Desculpe, algo deu errado ao carregar esta página.<br/>Tente recarregar ou entre em contato com o suporte se o problema persistir.</p>
            <button
              onClick={this.handleReload}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Recarregar Página
            </button>
            <pre className="text-xs text-gray-400 mt-4 text-left overflow-x-auto max-h-40">{String(this.state.error)}</pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 