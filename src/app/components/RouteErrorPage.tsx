import { useRouteError, Link } from "react-router";
import { AlertTriangle, Home } from "lucide-react";

export function RouteErrorPage() {
  const error = useRouteError() as any;

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
          {error?.status === 404 ? 'Página no encontrada' : 'Error inesperado'}
        </h1>

        {/* Description */}
        <p
          className="text-sm mb-6"
          style={{ color: '#6b7280', lineHeight: 1.6 }}
        >
          {error?.status === 404
            ? 'La página que buscas no existe o ha sido movida.'
            : error?.statusText || error?.message || 'Ocurrió un error al cargar esta página.'}
        </p>

        {/* Action */}
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all"
          style={{
            background: 'linear-gradient(135deg, #c9a84c, #e8c97a)',
            color: '#0d1b3e',
            fontWeight: 600,
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '1';
          }}
        >
          <Home size={16} />
          <span className="text-sm">Volver al inicio</span>
        </Link>

        {/* Footer */}
        <p
          className="text-xs mt-6"
          style={{ color: '#9ca3af' }}
        >
          Sistema de Gestión Funeraria AURA
        </p>
      </div>
    </div>
  );
}
