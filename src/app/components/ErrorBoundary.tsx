import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.href = window.location.origin;
  };

  handleGoHome = () => {
    window.location.href = window.location.origin + '/#/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-6"
          style={{ background: 'linear-gradient(135deg, #0d1b3e 0%, #1a2f5a 100%)' }}
        >
          <div
            className="max-w-md w-full rounded-2xl shadow-2xl p-8 text-center"
            style={{ background: '#ffffff' }}
          >
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(239, 68, 68, 0.1)' }}
            >
              <AlertTriangle size={32} style={{ color: '#ef4444' }} />
            </div>

            {/* Title */}
            <h1
              className="text-xl mb-2"
              style={{ color: '#0d1b3e', fontWeight: 700 }}
            >
              Algo salió mal
            </h1>

            {/* Description */}
            <p
              className="text-sm mb-6"
              style={{ color: '#6b7280', lineHeight: 1.6 }}
            >
              La aplicación encontró un error inesperado. Intenta recargar la página
              o volver al inicio.
            </p>

            {/* Error details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div
                className="mb-6 p-4 rounded-lg text-left overflow-auto max-h-40"
                style={{ background: '#f3f4f6', fontSize: '12px' }}
              >
                <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: '8px' }}>
                  {this.state.error.name}: {this.state.error.message}
                </p>
                <pre style={{ color: '#6b7280', whiteSpace: 'pre-wrap', fontSize: '11px' }}>
                  {this.state.error.stack}
                </pre>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all"
                style={{ background: '#f0f2f5', color: '#374151', fontWeight: 500 }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#f0f2f5';
                }}
              >
                <Home size={16} />
                <span className="text-sm">Ir al inicio</span>
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all"
                style={{
                  background: 'linear-gradient(135deg, #c9a84c, #e8c97a)',
                  color: '#0d1b3e',
                  fontWeight: 600
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = '1';
                }}
              >
                <RefreshCw size={16} />
                <span className="text-sm">Recargar</span>
              </button>
            </div>

            {/* Footer */}
            <p
              className="text-xs mt-6"
              style={{ color: '#9ca3af' }}
            >
              Si el problema persiste, contacta al administrador del sistema
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
