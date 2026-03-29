import { FuneralService, PaymentStatus } from "./mockData";
import { apiPersistService, apiDeleteService } from "./serviceApi";
import { enqueueOperation } from "../utils/offlineQueue";

const SERVICES_KEY = "funeral_services";
const MIGRATED_KEY = "funeral_supabase_migrated";
const SQLITE_MIGRATED_KEY = "funeral_sqlite_migrated";

// Verificar si estamos en Electron con SQLite disponible
const isElectronWithDB = () => {
  return typeof window !== 'undefined' && 
         window.electronAPI?.isElectron && 
         window.electronAPI?.db;
};

// ── Lectura local (síncrona, rápida) ─────────────────────────────────────────

export function loadServices(): FuneralService[] {
  try {
    const raw = localStorage.getItem(SERVICES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    // Migración y saneamiento de datos
    const migrated = (parsed as any[]).map((s) => {
      const service = { ...s };
      
      // 1. Asegurar categoría de servicio
      service.serviceCategory = service.serviceCategory || "Servicio Funerario";
      
      // 2. Migración de Plan de Cuotas (Estructura antigua -> Nueva)
      if (service.installments && service.installments.enabled) {
        const inst = { ...service.installments };
        
        // Si tiene el campo antiguo pero no los nuevos
        if (inst.installmentAmount !== undefined && inst.baseAmount === undefined) {
          inst.baseAmount = inst.installmentAmount;
          // Si son más de 5 cuotas, estimamos el recargo del 3% sobre el total financiado
          if (inst.totalInstallments > 5) {
            const totalToFinance = inst.baseAmount * inst.totalInstallments;
            inst.surchargeAmount = Math.ceil(totalToFinance * 0.03);
          } else {
            inst.surchargeAmount = 0;
          }
          delete inst.installmentAmount;
        }

        // Asegurar que paidInstallments existe y es número
        if (typeof inst.paidInstallments !== 'number') {
          inst.paidInstallments = 0;
        }
        
        // Asegurar que los nuevos campos tengan un valor por defecto
        if (inst.baseAmount === undefined) inst.baseAmount = 0;
        if (inst.surchargeAmount === undefined) inst.surchargeAmount = 0;

        service.installments = inst;
      }

      return service as FuneralService;
    });

    const now = new Date();
    let hasChanges = false;
    
    // Auto-completar eliminación lógica tras 30 días
    const cleanData = migrated.filter((s) => {
      if (s.isDeleted && s.deletedAt) {
        const deletedDate = new Date(s.deletedAt);
        const diffTime = Math.abs(now.getTime() - deletedDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 30) {
          hasChanges = true;
          return false; // Eliminate completely
        }
      }
      return true;
    });

    if (hasChanges) {
       localStorage.setItem(SERVICES_KEY, JSON.stringify(cleanData));
    }

    return cleanData;
  } catch (err) {

    console.error("Error cargando servicios:", err);
    return [];
  }
}

// ── Cargar servicios (SQLite o localStorage) ──────────────────────────────────

/**
 * Cargar servicios desde SQLite si está disponible, sino desde localStorage
 */
export async function loadServicesAsync(): Promise<FuneralService[]> {
  if (isElectronWithDB()) {
    try {
      const isAvailable = await window.electronAPI.db.isAvailable();
      if (isAvailable) {
        const response = await window.electronAPI.db.getAllServices();
        if (response.success) {
          console.log('✅ Servicios cargados desde SQLite:', response.data.length);
          return response.data;
        }
      }
    } catch (error) {
      console.error('Error cargando desde SQLite, usando localStorage:', error);
    }
  }
  
  // Fallback a localStorage
  return loadServices();
}

/** Sobreescribe el caché local completo (usado en la sincronización inicial). */
export function setLocalCache(services: FuneralService[]): void {
  localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
}

/** ¿Ya se migró el localStorage a Supabase? */
export function isMigrated(): boolean {
  return localStorage.getItem(MIGRATED_KEY) === "true";
}
export function markMigrated(): void {
  localStorage.setItem(MIGRATED_KEY, "true");
}

/** ¿Ya se migró el localStorage a SQLite? */
export function isSQLiteMigrated(): boolean {
  return localStorage.getItem(SQLITE_MIGRATED_KEY) === "true";
}
export function markSQLiteMigrated(): void {
  localStorage.setItem(SQLITE_MIGRATED_KEY, "true");
}

/**
 * Migrar datos de localStorage a SQLite
 */
export async function migrateToSQLite(): Promise<boolean> {
  if (!isElectronWithDB()) {
    console.log('⚠️  SQLite no disponible, saltando migración');
    return false;
  }

  if (isSQLiteMigrated()) {
    console.log('ℹ️  Ya se migró a SQLite anteriormente');
    return true;
  }

  try {
    const isAvailable = await window.electronAPI.db.isAvailable();
    if (!isAvailable) {
      console.log('⚠️  SQLite no está disponible');
      return false;
    }

    const localServices = loadServices();
    
    if (localServices.length === 0) {
      console.log('ℹ️  No hay servicios para migrar');
      markSQLiteMigrated();
      return true;
    }

    console.log(`🔄 Migrando ${localServices.length} servicios a SQLite...`);
    
    const response = await window.electronAPI.db.migrateFromLocalStorage(localServices);
    
    if (response.success) {
      console.log(`✅ Migración completada: ${response.count} servicios`);
      markSQLiteMigrated();
      return true;
    } else {
      console.error('❌ Error en migración:', response.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error migrando a SQLite:', error);
    return false;
  }
}

// ── Escritura: local inmediata + Supabase en background ──────────────────────

export function persistService(service: FuneralService): void {
  // Si estamos en Electron, usar SQLite
  if (isElectronWithDB()) {
    persistServiceElectron(service);
    return;
  }

  // Fallback a localStorage + Supabase
  persistServiceWeb(service);
}

/**
 * Persistir servicio en Electron (SQLite)
 */
async function persistServiceElectron(service: FuneralService): Promise<void> {
  try {
    const isAvailable = await window.electronAPI.db.isAvailable();
    if (!isAvailable) {
      console.warn('SQLite no disponible, usando localStorage');
      persistServiceWeb(service);
      return;
    }

    // Guardar en SQLite
    const response = await window.electronAPI.db.upsertService(service);
    
    if (response.success) {
      console.log(`✅ Servicio ${service.id} guardado en SQLite`);
      
      // También actualizar localStorage como caché
      const current = loadServices();
      const idx = current.findIndex((s) => s.id === service.id);
      if (idx >= 0) {
        current[idx] = service;
      } else {
        current.unshift(service);
      }
      localStorage.setItem(SERVICES_KEY, JSON.stringify(current));
    } else {
      console.error(`Error guardando en SQLite: ${response.error}`);
      // Fallback a localStorage
      persistServiceWeb(service);
    }
  } catch (error) {
    console.error('Error en persistServiceElectron:', error);
    persistServiceWeb(service);
  }
}

/**
 * Persistir servicio en web (localStorage + Supabase)
 */
function persistServiceWeb(service: FuneralService): void {
  // 1. Escribe localmente de inmediato (siempre funciona, online u offline)
  const current = loadServices();
  const idx = current.findIndex((s) => s.id === service.id);
  if (idx >= 0) {
    current[idx] = service;
  } else {
    current.unshift(service);
  }
  localStorage.setItem(SERVICES_KEY, JSON.stringify(current));

  // 2. Si hay red → sincroniza con Supabase directamente
  //    Si no hay red → encola para cuando vuelva la conexión
  if (navigator.onLine) {
    apiPersistService(service).catch(async (err) => {
      console.error(`Error sincronizando servicio ${service.id} con Supabase: ${err}`);
      // Si falla incluso con red, encolar igualmente
      await enqueueOperation({ id: service.id, type: "upsert", payload: service });
    });
  } else {
    // Sin red → encolar operación
    enqueueOperation({ id: service.id, type: "upsert", payload: service }).catch((err) =>
      console.error(`Error encolando servicio ${service.id}: ${err}`)
    );
  }
}

export function deleteService(id: string): void {
  // Si estamos en Electron, usar SQLite
  if (isElectronWithDB()) {
    deleteServiceElectron(id);
    return;
  }

  // Fallback a localStorage + Supabase
  deleteServiceWeb(id);
}

/**
 * Restaurar un servicio de la papelera
 */
export function restoreService(id: string): void {
  const current = loadServices();
  const idx = current.findIndex((s) => s.id === id);
  if (idx >= 0) {
    const updated = { ...current[idx], isDeleted: false };
    delete updated.deletedAt;
    persistService(updated);
  }
}

/**
 * Eliminación permanente de la base de datos
 */
export function hardDeleteService(id: string): void {
  // 1. Eliminar localmente
  const current = JSON.parse(localStorage.getItem(SERVICES_KEY) || "[]") as FuneralService[];
  const filtered = current.filter((s) => s.id !== id);
  localStorage.setItem(SERVICES_KEY, JSON.stringify(filtered));

  // 2. Sincronizar con Supabase (ya existe apiDeleteService)
  if (navigator.onLine) {
    apiDeleteService(id).catch(err => console.error("Error en hard delete:", err));
  }
  
  // 3. TODO: Electron/SQLite hard delete
}

/**
 * Eliminar servicio en Electron (SQLite)
 */
async function deleteServiceElectron(id: string): Promise<void> {
  try {
    const isAvailable = await window.electronAPI.db.isAvailable();
    if (!isAvailable) {
      console.warn('SQLite no disponible, usando localStorage');
      deleteServiceWeb(id);
      return;
    }

    // En SQLite lo tratamos como un Upsert con isDeleted: true
    const services = loadServices();
    const srv = services.find(s => s.id === id);
    if (srv) {
       const updated = { ...srv, isDeleted: true, deletedAt: new Date().toISOString() };
       const response = await window.electronAPI.db.upsertService(updated);
       if (response.success) {
          console.log(`✅ Servicio ${id} movido a papelera en SQLite`);
          // Actualizar localStorage
          const idx = services.findIndex(s => s.id === id);
          services[idx] = updated;
          localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
       }
    }
  } catch (error) {
    console.error('Error en deleteServiceElectron:', error);
    deleteServiceWeb(id);
  }
}

/**
 * Eliminar servicio en web (localStorage + Supabase)
 */
function deleteServiceWeb(id: string): void {
  // 1. Marca localmente como eliminado
  const current = loadServices();
  const idx = current.findIndex((s) => s.id === id);
  if (idx >= 0) {
    current[idx] = { 
      ...current[idx], 
      isDeleted: true, 
      deletedAt: new Date().toISOString() 
    };
    localStorage.setItem(SERVICES_KEY, JSON.stringify(current));

    // 2. Sincroniza con Supabase como un persist (upsert) para que el flag se guarde en la nube
    persistService(current[idx]); 
  }
}

// ── ID único ──────────────────────────────────────────────────────────────────

export function generateServiceId(): string {
  const services = loadServices();
  let max = 0;
  services.forEach((s) => {
    const match = s.id.match(/^SRV-(\d+)$/);
    if (match) max = Math.max(max, parseInt(match[1], 10));
  });
  return `SRV-${String(max + 1).padStart(3, "0")}`;
}

// ── Estado de pago ────────────────────────────────────────────────────────────

export function deriveStatus(totalPaid: number, pendingBalance: number): PaymentStatus {
  // Si no hay saldo pendiente → Pagado
  if (pendingBalance <= 0) return "Pagado";
  // Si tiene saldo pendiente pero ha pagado algo → Abonando
  if (totalPaid > 0) return "Abonando";
  // Si no ha pagado nada y tiene deuda → Deuda Total
  return "Deuda Total";
}

// ── Migración: recalcular estados incorrectos ─────────────────────────────────

export function recalculateAllStatuses(): void {
  const services = loadServices();
  let updated = false;
  
  services.forEach((service) => {
    const correctStatus = deriveStatus(service.totalPaid, service.pendingBalance);
    if (service.status !== correctStatus) {
      service.status = correctStatus;
      // Persistir cada servicio corregido (actualiza local + Supabase)
      persistService(service);
      updated = true;
    }
  });
  
  if (updated) {
    console.log("✅ Estados de servicios recalculados y sincronizados correctamente");
  }
}

// ── Estadísticas mensuales por Año ──────────────────────────────────────────

/**
 * Obtiene todos los años en los que hay registros (servicios o abonos)
 * Se asegura de incluir el año actual y cualquier año con actividad histórica.
 */
export function getAvailableYears(services: FuneralService[]): number[] {
  const years = new Set<number>();
  const now = new Date().getFullYear();
  years.add(now);

  services.forEach(s => {
    // Fecha de creación o de servicio
    const sDate = s.date || s.createdAt;
    if (sDate) {
      const y = new Date(sDate).getFullYear();
      if (!isNaN(y)) years.add(y);
    }
    // Fechas de pagos
    s.payments.forEach(p => {
      if (p.date) {
        const y = new Date(p.date).getFullYear();
        if (!isNaN(y)) years.add(y);
      }
    });
  });

  return Array.from(years).sort((a, b) => b - a);
}

/**
 * Retorna un conjunto de números (1-12) que representan los meses con actividad 
 * (servicios registrados o pagos recibidos) para un año específico.
 */
export function getMonthsWithData(services: FuneralService[], year: number): Set<number> {
  const months = new Set<number>();
  
  services.forEach(s => {
    // Verificar fecha del servicio
    const sDate = s.date || s.createdAt;
    if (sDate && sDate.startsWith(`${year}-`)) {
      const m = parseInt(sDate.split("-")[1], 10);
      if (!isNaN(m)) months.add(m);
    }
    
    // Verificar fechas de pagos
    s.payments.forEach(p => {
      if (p.date && p.date.startsWith(`${year}-`)) {
        const m = parseInt(p.date.split("-")[1], 10);
        if (!isNaN(m)) months.add(m);
      }
    });
  });

  return months;
}

/**
 * Calcula recaudación y deuda por mes para un año específico
 * A diferencia de la versión anterior, esta usa la fecha REAL de cada abono.
 */
export function computeMonthlyData(services: FuneralService[], year: number) {
  const monthsData = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = i + 1;
    const monthKey = `${year}-${String(monthIndex).padStart(2, "0")}`;
    const d = new Date(year, i, 1);
    const label = d.toLocaleDateString("es-CL", { month: "short" });
    
    return { 
      key: monthKey,
      month: label.charAt(0).toUpperCase() + label.slice(1), 
      recaudado: 0, 
      deuda: 0 
    };
  });

  services.forEach(service => {
    // 1. Recaudación: Sumar abonos realizados en este año/mes
    service.payments.forEach(payment => {
      if (payment.date && payment.date.startsWith(`${year}-`)) {
        const monthPart = payment.date.split("-")[1];
        const monthIdx = parseInt(monthPart, 10) - 1;
        if (monthIdx >= 0 && monthIdx < 12) {
          monthsData[monthIdx].recaudado += payment.amount;
        }
      }
    });

    // 2. Deuda: Atribuir la deuda pendiente al mes de creación del servicio 
    // (o al mes del servicio) si corresponde al año seleccionado.
    // Esto es una simplificación, pero es lo más lógico para proyecciones.
    const serviceDate = service.date || service.createdAt;
    if (serviceDate && serviceDate.startsWith(`${year}-`)) {
      const monthPart = serviceDate.split("-")[1];
      const monthIdx = parseInt(monthPart, 10) - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        monthsData[monthIdx].deuda += service.pendingBalance;
      }
    }
  });

  return monthsData;
}