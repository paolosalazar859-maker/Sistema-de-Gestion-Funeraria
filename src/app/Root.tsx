import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { Layout } from "./components/Layout";
import { LoginScreen } from "./components/LoginScreen";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { UserProvider, useUser } from "./context/UserContext";
import { SyncProvider } from "./context/SyncContext";
import { apiLoadServices, apiMigrateServices } from "./data/serviceApi";
import { setLocalCache, loadServices, isMigrated, markMigrated, recalculateAllStatuses } from "./data/serviceStore";

// Routes accessible by 'oficina' role
const OFICINA_ALLOWED = ["/registro", "/cobros"];

type SyncState = "loading" | "ready";

// ── Inner content: uses router hooks safely (inside RouterProvider) ───────────
function RootContent() {
  const { role } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [syncState, setSyncState] = useState<SyncState>("loading");
  const [syncError, setSyncError] = useState("");

  // Redirect oficina away from forbidden routes
  useEffect(() => {
    if (role === "oficina" && !OFICINA_ALLOWED.includes(location.pathname)) {
      navigate("/registro", { replace: true });
    }
  }, [role, location.pathname, navigate]);

  // Supabase sync on mount (only when logged in)
  useEffect(() => {
    if (!role) {
      setSyncState("ready");
      return;
    }
    async function init() {
      try {
        if (!isMigrated()) {
          const local = loadServices();
          if (local.length > 0) await apiMigrateServices(local);
          markMigrated();
        }

        // SQLite Migration (Electron only)
        try {
          const { isSQLiteMigrated, migrateToSQLite, loadServicesAsync, setLocalCache, loadServices } = await import("./data/serviceStore");
          
          // 1. Prioridad: Cargar desde SQLite si estamos en Electron
          const localFromDB = await loadServicesAsync();
          if (localFromDB.length > 0) {
            setLocalCache(localFromDB);
          }

          if (!isSQLiteMigrated()) {
            await migrateToSQLite();
          }

          // 2. Sincronizar con Supabase pero SIN sobrescribir el estado de borrado local
          if (navigator.onLine) {
            const remote = await apiLoadServices();
            if (remote.length > 0) {
              const current = loadServices();
              // Mezclamos: Conservamos el flag de borrado si existe localmente
              const merged = remote.map(rSrv => {
                const localMatch = current.find(l => l.id === rSrv.id);
                if (localMatch && localMatch.isDeleted) {
                  return { ...rSrv, isDeleted: true, deletedAt: localMatch.deletedAt };
                }
                return rSrv;
              });
              setLocalCache(merged);
            }
          }
        } catch (e) {
          console.log("No estamos en entorno Electron o error en inicio:", e);
          // Fallback normal fuera de Electron
          if (navigator.onLine) {
            const remote = await apiLoadServices();
            if (remote.length > 0) setLocalCache(remote);
          }
        }
        recalculateAllStatuses();
        setSyncState("ready");
      } catch (err) {
        console.error(`Error en sincronización inicial: ${err}`);
        setSyncError(`${err}`);
        setSyncState("ready");
      }
    }
    init();
  }, [role]);

  // Not logged in → show login screen
  if (!role) return <LoginScreen />;

  // Loading / syncing with Supabase
  if (syncState === "loading") {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center gap-6"
        style={{ background: "linear-gradient(135deg, #0d1b3e 0%, #1a2f5a 100%)" }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"
            style={{ background: "linear-gradient(135deg, #c9a84c, #e8c97a)" }}
          >
            <span style={{ fontSize: 28 }}>⚱</span>
          </div>
          <h1 className="text-xl" style={{ color: "#ffffff", fontWeight: 700 }}>
            Sistema de Gestión Funeraria
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            {navigator.onLine ? "Conectando con la base de datos…" : "Cargando datos locales…"}
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-4 animate-spin"
            style={{ borderColor: "rgba(201,168,76,0.3)", borderTopColor: "#c9a84c" }}
          />
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            {navigator.onLine ? "Sincronizando datos con Supabase…" : "Usando datos en caché local…"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      {syncError && (
        <div
          className="mb-4 px-4 py-3 rounded-xl flex items-center gap-2 text-sm"
          style={{ background: "#fef9c3", border: "1px solid #fde047", color: "#854d0e" }}
        >
          <span>⚠️</span>
          <span>
            No se pudo conectar con Supabase — operando con datos locales.{" "}
            <span style={{ fontWeight: 500 }}>Los cambios se guardarán localmente.</span>
          </span>
          <button
            onClick={() => setSyncError("")}
            className="ml-auto text-xs opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}
      <Outlet />
    </Layout>
  );
}

// ── Root: providers live here, safely inside RouterProvider ──────────────────
export default function Root() {
  return (
    <UserProvider>
      <SyncProvider>
        <RootContent />
        <PWAInstallPrompt />
        <OfflineIndicator />
      </SyncProvider>
    </UserProvider>
  );
}