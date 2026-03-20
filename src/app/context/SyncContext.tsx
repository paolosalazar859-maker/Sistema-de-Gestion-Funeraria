/**
 * SyncContext.tsx
 * Contexto global para manejo de sincronización offline/online.
 * - Detecta cambios de conectividad
 * - Procesa la cola de operaciones pendientes al reconectarse
 * - Expone estado de conexión y conteo de pendientes
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import {
  getPendingOperations,
  dequeueOperation,
  incrementRetries,
  countPendingOperations,
  QueueOperation,
} from "../utils/offlineQueue";
import { apiPersistService, apiDeleteService } from "../data/serviceApi";
import { FuneralService } from "../data/mockData";

export type SyncStatus = "online" | "offline" | "syncing" | "error";

interface SyncContextValue {
  isOnline: boolean;
  syncStatus: SyncStatus;
  pendingCount: number;
  lastSyncAt: Date | null;
  forceSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextValue>({
  isOnline: navigator.onLine,
  syncStatus: "online",
  pendingCount: 0,
  lastSyncAt: null,
  forceSync: async () => {},
});

const MAX_RETRIES = 5;

export function SyncProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    navigator.onLine ? "online" : "offline"
  );
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const isSyncing = useRef(false);

  // ── Actualizar conteo de pendientes ────────────────────────────────────────
  const refreshPendingCount = useCallback(async () => {
    const count = await countPendingOperations();
    setPendingCount(count);
  }, []);

  // ── Procesar una operación de la cola ─────────────────────────────────────
  const processOperation = async (op: QueueOperation): Promise<boolean> => {
    try {
      if (op.type === "upsert") {
        const ok = await apiPersistService(op.payload as FuneralService);
        return ok;
      } else if (op.type === "delete") {
        const ok = await apiDeleteService(op.payload as string);
        return ok;
      }
      return false;
    } catch {
      return false;
    }
  };

  // ── Sincronizar toda la cola ───────────────────────────────────────────────
  const forceSync = useCallback(async () => {
    if (isSyncing.current || !navigator.onLine) return;
    isSyncing.current = true;
    setSyncStatus("syncing");

    try {
      const ops = await getPendingOperations();
      if (ops.length === 0) {
        setSyncStatus("online");
        setLastSyncAt(new Date());
        isSyncing.current = false;
        return;
      }

      let allOk = true;
      for (const op of ops) {
        if (op.retries >= MAX_RETRIES) {
          // Demasiados reintentos, descartar
          await dequeueOperation(op.id);
          console.warn(`SyncContext: operación ${op.id} descartada tras ${MAX_RETRIES} reintentos.`);
          continue;
        }

        const ok = await processOperation(op);
        if (ok) {
          await dequeueOperation(op.id);
        } else {
          await incrementRetries(op);
          allOk = false;
        }
      }

      await refreshPendingCount();
      setLastSyncAt(new Date());
      setSyncStatus(allOk ? "online" : "error");
    } catch (err) {
      console.error(`SyncContext.forceSync error: ${err}`);
      setSyncStatus("error");
    } finally {
      isSyncing.current = false;
    }
  }, [refreshPendingCount]);

  // ── Listeners de conectividad ──────────────────────────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus("syncing");
      // Pequeño delay para asegurar que la red esté lista
      setTimeout(() => forceSync(), 1500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Sincronizar al montar si hay pendientes
    if (navigator.onLine) {
      refreshPendingCount().then((count) => {
        if (typeof count === "number" && count > 0) {
          forceSync();
        }
      });
      // Verificar pendientes al inicio sin número de retorno
      countPendingOperations().then((c) => {
        setPendingCount(c);
        if (c > 0) forceSync();
      });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [forceSync, refreshPendingCount]);

  // ── Actualizar conteo periódicamente ──────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(refreshPendingCount, 5000);
    return () => clearInterval(interval);
  }, [refreshPendingCount]);

  return (
    <SyncContext.Provider
      value={{ isOnline, syncStatus, pendingCount, lastSyncAt, forceSync }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  return useContext(SyncContext);
}
