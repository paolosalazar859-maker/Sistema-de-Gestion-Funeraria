/**
 * offlineQueue.ts
 * Cola de operaciones pendientes para modo offline.
 * Usa IndexedDB para persistir operaciones que no pudieron enviarse a Supabase.
 */

export type QueueOperation = {
  id: string;
  type: "upsert" | "delete";
  payload: unknown;
  timestamp: number;
  retries: number;
};

const DB_NAME = "aura_offline_db";
const DB_VERSION = 1;
const STORE_NAME = "pending_ops";

// ── Abrir / inicializar IndexedDB ─────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ── Encolar una operación ──────────────────────────────────────────────────���──

export async function enqueueOperation(op: Omit<QueueOperation, "timestamp" | "retries">): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put({ ...op, timestamp: Date.now(), retries: 0 });
    db.close();
  } catch (err) {
    console.error(`offlineQueue.enqueueOperation error: ${err}`);
  }
}

// ── Obtener todas las operaciones pendientes ──────────────────────────────────

export async function getPendingOperations(): Promise<QueueOperation[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const index = store.index("timestamp");
      const req = index.getAll();
      req.onsuccess = () => {
        db.close();
        resolve(req.result as QueueOperation[]);
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    });
  } catch (err) {
    console.error(`offlineQueue.getPendingOperations error: ${err}`);
    return [];
  }
}

// ── Contar operaciones pendientes ─────────────────────────────────────────────

export async function countPendingOperations(): Promise<number> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.count();
      req.onsuccess = () => {
        db.close();
        resolve(req.result);
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    });
  } catch {
    return 0;
  }
}

// ── Eliminar una operación de la cola ─────────────────────────────────────────

export async function dequeueOperation(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    db.close();
  } catch (err) {
    console.error(`offlineQueue.dequeueOperation error: ${err}`);
  }
}

// ── Actualizar reintentos ─────────────────────────────────────────────────────

export async function incrementRetries(op: QueueOperation): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put({ ...op, retries: op.retries + 1 });
    db.close();
  } catch (err) {
    console.error(`offlineQueue.incrementRetries error: ${err}`);
  }
}

// ── Limpiar toda la cola ──────────────────────────────────────────────────────

export async function clearQueue(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).clear();
    db.close();
  } catch (err) {
    console.error(`offlineQueue.clearQueue error: ${err}`);
  }
}
