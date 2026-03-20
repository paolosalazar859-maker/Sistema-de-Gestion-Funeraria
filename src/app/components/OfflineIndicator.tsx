/**
 * OfflineIndicator.tsx
 * Banner/badge que muestra el estado de conexión y operaciones pendientes.
 */

import { useState } from "react";
import { Wifi, WifiOff, RefreshCw, CloudOff, CheckCircle2, X } from "lucide-react";
import { useSync } from "../context/SyncContext";

export function OfflineIndicator() {
  const { isOnline, syncStatus, pendingCount, lastSyncAt, forceSync } = useSync();
  const [dismissed, setDismissed] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Si está online y sin pendientes y fue descartado → no mostrar nada
  if (isOnline && pendingCount === 0 && dismissed && syncStatus === "online") {
    return null;
  }

  // Si está online, sin pendientes y sin errores → no mostrar (no molestar)
  if (isOnline && pendingCount === 0 && syncStatus === "online") {
    return null;
  }

  const handleSync = async () => {
    setSyncing(true);
    await forceSync();
    setSyncing(false);
  };

  // ── Configuración por estado ───────────────────────────────────────────────
  const config = {
    offline: {
      bg: "rgba(30, 10, 10, 0.95)",
      border: "rgba(239,68,68,0.5)",
      icon: <WifiOff size={15} className="shrink-0" style={{ color: "#fca5a5" }} />,
      text: "Sin conexión — Los datos se guardan localmente",
      textColor: "#fca5a5",
      dot: "#ef4444",
    },
    syncing: {
      bg: "rgba(10, 20, 40, 0.95)",
      border: "rgba(201,168,76,0.5)",
      icon: <RefreshCw size={15} className="shrink-0 animate-spin" style={{ color: "#e8c97a" }} />,
      text: `Sincronizando ${pendingCount > 0 ? `${pendingCount} cambio${pendingCount > 1 ? "s" : ""}` : ""}...`,
      textColor: "#e8c97a",
      dot: "#c9a84c",
    },
    error: {
      bg: "rgba(30, 15, 5, 0.95)",
      border: "rgba(251,146,60,0.5)",
      icon: <CloudOff size={15} className="shrink-0" style={{ color: "#fdba74" }} />,
      text: `${pendingCount} cambio${pendingCount > 1 ? "s" : ""} pendiente${pendingCount > 1 ? "s" : ""} — Error al sincronizar`,
      textColor: "#fdba74",
      dot: "#f97316",
    },
    online: {
      bg: "rgba(5, 25, 10, 0.95)",
      border: "rgba(34,197,94,0.5)",
      icon: <CheckCircle2 size={15} className="shrink-0" style={{ color: "#86efac" }} />,
      text: `Sincronizado${lastSyncAt ? ` · ${lastSyncAt.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}` : ""}`,
      textColor: "#86efac",
      dot: "#22c55e",
    },
  };

  // Cuando está online con pendientes → mostrar como error
  const displayStatus =
    isOnline && pendingCount > 0 && syncStatus === "online" ? "error" : syncStatus;
  const c = config[displayStatus];

  return (
    <div
      className="fixed bottom-4 left-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-2xl"
      style={{
        transform: "translateX(-50%)",
        background: c.bg,
        border: `1px solid ${c.border}`,
        backdropFilter: "blur(16px)",
        minWidth: "280px",
        maxWidth: "calc(100vw - 2rem)",
        animation: "slideUp 0.3s ease-out",
      }}
    >
      {/* Dot pulsante */}
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{
          background: c.dot,
          boxShadow: `0 0 6px ${c.dot}`,
          animation: displayStatus === "offline" ? "pulse 2s infinite" : "none",
        }}
      />

      {/* Ícono */}
      {c.icon}

      {/* Texto */}
      <span className="text-xs flex-1" style={{ color: c.textColor, fontWeight: 500 }}>
        {c.text}
      </span>

      {/* Botón reintentar (solo en error o con pendientes) */}
      {(displayStatus === "error" || (pendingCount > 0 && isOnline)) && (
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all"
          style={{
            background: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
        >
          <RefreshCw size={11} className={syncing ? "animate-spin" : ""} />
          {syncing ? "..." : "Reintentar"}
        </button>
      )}

      {/* Botón cerrar (solo en online con éxito) */}
      {displayStatus === "online" && (
        <button
          onClick={() => setDismissed(true)}
          className="ml-1 opacity-40 hover:opacity-80 transition-opacity"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          <X size={13} />
        </button>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(20px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
