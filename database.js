/**
 * Módulo de Base de Datos SQLite para AURA
 * Maneja toda la persistencia local de la aplicación
 */

let Database;
try {
  const module = await import('better-sqlite3');
  Database = module.default;
} catch (error) {
  console.warn('⚠️  better-sqlite3 no disponible, usando modo sin BD');
}

import path from 'path';
import { app } from 'electron';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

/**
 * Inicializa la base de datos SQLite
 */
function initDatabase() {
  if (!Database) {
    console.warn('⚠️  better-sqlite3 no disponible, iniciando sin base de datos');
    return false;
  }
  
  try {
    // Ubicación de la base de datos en la carpeta de usuario
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'aura-database.db');

    console.log(`📁 Inicializando base de datos en: ${dbPath}`);

    // Crear base de datos
    db = new Database(dbPath, { verbose: console.log });

    // Habilitar foreign keys
    db.pragma('foreign_keys = ON');

    // Crear tablas
    createTables();

    // Migraciones rápidas (añadir columnas si no existen)
    migrateDatabase();

    console.log('✅ Base de datos SQLite inicializada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    return false;
  }
}

/**
 * Migraciones rápidas para añadir columnas nuevas
 */
function migrateDatabase() {
  try {
    const tableInfo = db.prepare("PRAGMA table_info(services)").all();
    const columns = tableInfo.map(c => c.name);

    if (!columns.includes('is_deleted')) {
      db.exec("ALTER TABLE services ADD COLUMN is_deleted INTEGER DEFAULT 0");
      console.log("➕ Columna is_deleted añadida a services");
    }
    if (!columns.includes('deleted_at')) {
      db.exec("ALTER TABLE services ADD COLUMN deleted_at TEXT");
      console.log("➕ Columna deleted_at añadida a services");
    }
  } catch (error) {
    console.error("❌ Error en migración de base de datos:", error);
  }
}

/**
 * Crear estructura de tablas
 */
function createTables() {
  // Tabla de servicios funerarios
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      service_category TEXT NOT NULL DEFAULT 'Servicio Funerario',
      engraving_text TEXT,
      date TEXT NOT NULL,
      cemetery TEXT NOT NULL,
      service_type TEXT NOT NULL,
      service_value REAL NOT NULL,
      deceased_name TEXT NOT NULL,
      deceased_rut TEXT NOT NULL,
      transfer_from TEXT NOT NULL,
      transfer_cost REAL NOT NULL,
      contractor_name TEXT NOT NULL,
      contractor_rut TEXT NOT NULL,
      contractor_address TEXT NOT NULL,
      contractor_phone TEXT NOT NULL,
      contractor_email TEXT NOT NULL,
      municipal_contribution REAL NOT NULL,
      mortuary_fee REAL NOT NULL,
      discount REAL NOT NULL,
      initial_payment REAL NOT NULL,
      installments_enabled INTEGER DEFAULT 0,
      total_installments INTEGER DEFAULT 0,
      installment_amount REAL DEFAULT 0,
      paid_installments INTEGER DEFAULT 0,
      total_service REAL NOT NULL,
      total_paid REAL NOT NULL,
      pending_balance REAL NOT NULL,
      status TEXT NOT NULL,
      last_payment_date TEXT NOT NULL,
      is_deleted INTEGER DEFAULT 0,
      deleted_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de pagos/abonos
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      service_id TEXT NOT NULL,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      method TEXT NOT NULL,
      balance REAL NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    )
  `);

  // Tabla de usuarios (para autenticación local)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Oficina',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_login TEXT
    )
  `);

  // Tabla de configuración
  db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Índices para mejorar rendimiento
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_services_date ON services(date);
    CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
    CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at);
    CREATE INDEX IF NOT EXISTS idx_payments_service_id ON payments(service_id);
    CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);
  `);

  console.log('✅ Tablas creadas correctamente');
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICIOS - CRUD
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtener todos los servicios
 */
function getAllServices() {
  try {
    const stmt = db.prepare(`
      SELECT * FROM services 
      ORDER BY created_at DESC
    `);
    const services = stmt.all();

    // Obtener pagos para cada servicio
    const servicesWithPayments = services.map(service => {
      const payments = getPaymentsByServiceId(service.id);
      return serviceFromDB(service, payments);
    });

    return { success: true, data: servicesWithPayments };
  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener un servicio por ID
 */
function getServiceById(id) {
  try {
    const stmt = db.prepare('SELECT * FROM services WHERE id = ?');
    const service = stmt.get(id);

    if (!service) {
      return { success: false, error: 'Servicio no encontrado' };
    }

    const payments = getPaymentsByServiceId(id);
    return { success: true, data: serviceFromDB(service, payments) };
  } catch (error) {
    console.error('Error obteniendo servicio:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Crear o actualizar un servicio
 */
function upsertService(serviceData) {
  try {
    const now = new Date().toISOString();
    const payments = serviceData.payments || [];

    // Preparar datos del servicio
    const serviceDB = {
      id: serviceData.id,
      service_category: serviceData.serviceCategory || 'Servicio Funerario',
      engraving_text: serviceData.engravingText || null,
      date: serviceData.date,
      cemetery: serviceData.cemetery,
      service_type: serviceData.serviceType,
      service_value: serviceData.serviceValue,
      deceased_name: serviceData.deceasedName,
      deceased_rut: serviceData.deceasedRut,
      transfer_from: serviceData.transferFrom,
      transfer_cost: serviceData.transferCost,
      contractor_name: serviceData.contractorName,
      contractor_rut: serviceData.contractorRut,
      contractor_address: serviceData.contractorAddress,
      contractor_phone: serviceData.contractorPhone,
      contractor_email: serviceData.contractorEmail,
      municipal_contribution: serviceData.municipalContribution,
      mortuary_fee: serviceData.mortuaryFee,
      discount: serviceData.discount,
      initial_payment: serviceData.initialPayment,
      installments_enabled: serviceData.installments?.enabled ? 1 : 0,
      total_installments: serviceData.installments?.totalInstallments || 0,
      installment_amount: serviceData.installments?.installmentAmount || 0,
      paid_installments: serviceData.installments?.paidInstallments || 0,
      total_service: serviceData.totalService,
      total_paid: serviceData.totalPaid,
      pending_balance: serviceData.pendingBalance,
      status: serviceData.status,
      last_payment_date: serviceData.lastPaymentDate,
      is_deleted: serviceData.isDeleted ? 1 : 0,
      deleted_at: serviceData.deletedAt || null,
      created_at: serviceData.createdAt || now,
      updated_at: now
    };

    // Verificar si el servicio existe
    const existingService = db.prepare('SELECT id FROM services WHERE id = ?').get(serviceData.id);

    if (existingService) {
      // Actualizar servicio existente
      const updateStmt = db.prepare(`
        UPDATE services SET
          service_category = ?,
          engraving_text = ?,
          date = ?,
          cemetery = ?,
          service_type = ?,
          service_value = ?,
          deceased_name = ?,
          deceased_rut = ?,
          transfer_from = ?,
          transfer_cost = ?,
          contractor_name = ?,
          contractor_rut = ?,
          contractor_address = ?,
          contractor_phone = ?,
          contractor_email = ?,
          municipal_contribution = ?,
          mortuary_fee = ?,
          discount = ?,
          initial_payment = ?,
          installments_enabled = ?,
          total_installments = ?,
          installment_amount = ?,
          paid_installments = ?,
          total_service = ?,
          total_paid = ?,
          pending_balance = ?,
          status = ?,
          last_payment_date = ?,
          is_deleted = ?,
          deleted_at = ?,
          updated_at = ?
        WHERE id = ?
      `);

      updateStmt.run(
        serviceDB.service_category,
        serviceDB.engraving_text,
        serviceDB.date,
        serviceDB.cemetery,
        serviceDB.service_type,
        serviceDB.service_value,
        serviceDB.deceased_name,
        serviceDB.deceased_rut,
        serviceDB.transfer_from,
        serviceDB.transfer_cost,
        serviceDB.contractor_name,
        serviceDB.contractor_rut,
        serviceDB.contractor_address,
        serviceDB.contractor_phone,
        serviceDB.contractor_email,
        serviceDB.municipal_contribution,
        serviceDB.mortuary_fee,
        serviceDB.discount,
        serviceDB.initial_payment,
        serviceDB.installments_enabled,
        serviceDB.total_installments,
        serviceDB.installment_amount,
        serviceDB.paid_installments,
        serviceDB.total_service,
        serviceDB.total_paid,
        serviceDB.pending_balance,
        serviceDB.status,
        serviceDB.last_payment_date,
        serviceDB.is_deleted,
        serviceDB.deleted_at,
        serviceDB.updated_at,
        serviceDB.id
      );
    } else {
      // Insertar nuevo servicio
      const insertStmt = db.prepare(`
        INSERT INTO services (
          id, service_category, engraving_text, date, cemetery, service_type,
          service_value, deceased_name, deceased_rut, transfer_from, transfer_cost,
          contractor_name, contractor_rut, contractor_address, contractor_phone,
          contractor_email, municipal_contribution, mortuary_fee, discount,
          initial_payment, installments_enabled, total_installments,
          installment_amount, paid_installments, total_service, total_paid,
          pending_balance, status, last_payment_date, is_deleted, deleted_at,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertStmt.run(
        serviceDB.id,
        serviceDB.service_category,
        serviceDB.engraving_text,
        serviceDB.date,
        serviceDB.cemetery,
        serviceDB.service_type,
        serviceDB.service_value,
        serviceDB.deceased_name,
        serviceDB.deceased_rut,
        serviceDB.transfer_from,
        serviceDB.transfer_cost,
        serviceDB.contractor_name,
        serviceDB.contractor_rut,
        serviceDB.contractor_address,
        serviceDB.contractor_phone,
        serviceDB.contractor_email,
        serviceDB.municipal_contribution,
        serviceDB.mortuary_fee,
        serviceDB.discount,
        serviceDB.initial_payment,
        serviceDB.installments_enabled,
        serviceDB.total_installments,
        serviceDB.installment_amount,
        serviceDB.paid_installments,
        serviceDB.total_service,
        serviceDB.total_paid,
        serviceDB.pending_balance,
        serviceDB.status,
        serviceDB.last_payment_date,
        serviceDB.is_deleted,
        serviceDB.deleted_at,
        serviceDB.created_at,
        serviceDB.updated_at
      );
    }

    // Actualizar pagos
    // Primero eliminar pagos existentes
    db.prepare('DELETE FROM payments WHERE service_id = ?').run(serviceData.id);

    // Insertar nuevos pagos
    if (payments.length > 0) {
      const insertPaymentStmt = db.prepare(`
        INSERT INTO payments (id, service_id, date, amount, method, balance, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const payment of payments) {
        insertPaymentStmt.run(
          payment.id,
          serviceData.id,
          payment.date,
          payment.amount,
          payment.method,
          payment.balance,
          payment.notes || null,
          now
        );
      }
    }

    return { success: true, data: serviceData };
  } catch (error) {
    console.error('Error guardando servicio:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Eliminar un servicio
 */
function deleteService(id) {
  try {
    // Los pagos se eliminarán automáticamente por CASCADE
    const stmt = db.prepare('DELETE FROM services WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return { success: false, error: 'Servicio no encontrado' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error eliminando servicio:', error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtener pagos de un servicio
 */
function getPaymentsByServiceId(serviceId) {
  try {
    const stmt = db.prepare(`
      SELECT * FROM payments 
      WHERE service_id = ? 
      ORDER BY date ASC
    `);
    return stmt.all(serviceId);
  } catch (error) {
    console.error('Error obteniendo pagos:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MIGRACIÓN DESDE LOCALSTORAGE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Migrar datos desde localStorage a SQLite
 */
function migrateFromLocalStorage(servicesData) {
  try {
    console.log(`🔄 Iniciando migración de ${servicesData.length} servicios...`);

    // Usar transacción para mayor velocidad y consistencia
    const migrate = db.transaction((services) => {
      for (const service of services) {
        upsertService(service);
      }
    });

    migrate(servicesData);

    console.log('✅ Migración completada exitosamente');
    return { success: true, count: servicesData.length };
  } catch (error) {
    console.error('❌ Error en migración:', error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BACKUP Y RESTAURACIÓN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Crear backup de la base de datos
 */
function createBackup(backupPath) {
  try {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'aura-database.db');

    // Crear carpeta de backups si no existe
    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Copiar archivo de base de datos
    fs.copyFileSync(dbPath, backupPath);

    console.log(`✅ Backup creado en: ${backupPath}`);
    return { success: true, path: backupPath };
  } catch (error) {
    console.error('Error creando backup:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Restaurar desde backup
 */
function restoreBackup(backupPath) {
  try {
    if (!fs.existsSync(backupPath)) {
      return { success: false, error: 'Archivo de backup no encontrado' };
    }

    // Cerrar base de datos actual
    if (db) {
      db.close();
    }

    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'aura-database.db');

    // Crear backup de la BD actual antes de restaurar
    const tempBackup = path.join(userDataPath, 'aura-database.backup.db');
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, tempBackup);
    }

    // Copiar backup sobre la BD actual
    fs.copyFileSync(backupPath, dbPath);

    // Reabrir base de datos
    initDatabase();

    console.log(`✅ Base de datos restaurada desde: ${backupPath}`);
    return { success: true };
  } catch (error) {
    console.error('Error restaurando backup:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener información de la base de datos
 */
function getDatabaseInfo() {
  try {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'aura-database.db');

    const stats = fs.statSync(dbPath);
    const servicesCount = db.prepare('SELECT COUNT(*) as count FROM services').get();
    const paymentsCount = db.prepare('SELECT COUNT(*) as count FROM payments').get();

    return {
      success: true,
      data: {
        path: dbPath,
        size: stats.size,
        sizeFormatted: formatBytes(stats.size),
        servicesCount: servicesCount.count,
        paymentsCount: paymentsCount.count,
        lastModified: stats.mtime
      }
    };
  } catch (error) {
    console.error('Error obteniendo info de BD:', error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtener valor de configuración
 */
function getConfig(key) {
  try {
    const stmt = db.prepare('SELECT * FROM config WHERE key = ?');
    const result = stmt.get(key);
    
    if (!result) {
      return { success: false, error: 'Config key not found' };
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Establecer valor de configuración
 */
function setConfig(key, value) {
  try {
    const stmt = db.prepare(`
      INSERT INTO config (key, value, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = datetime('now')
    `);
    
    stmt.run(key, value);
    return { success: true };
  } catch (error) {
    console.error('Error guardando configuración:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Convertir registro de BD a objeto de servicio
 */
function serviceFromDB(serviceDB, payments) {
  return {
    id: serviceDB.id,
    serviceCategory: serviceDB.service_category,
    engravingText: serviceDB.engraving_text,
    date: serviceDB.date,
    cemetery: serviceDB.cemetery,
    serviceType: serviceDB.service_type,
    serviceValue: serviceDB.service_value,
    deceasedName: serviceDB.deceased_name,
    deceasedRut: serviceDB.deceased_rut,
    transferFrom: serviceDB.transfer_from,
    transferCost: serviceDB.transfer_cost,
    contractorName: serviceDB.contractor_name,
    contractorRut: serviceDB.contractor_rut,
    contractorAddress: serviceDB.contractor_address,
    contractorPhone: serviceDB.contractor_phone,
    contractorEmail: serviceDB.contractor_email,
    municipalContribution: serviceDB.municipal_contribution,
    mortuaryFee: serviceDB.mortuary_fee,
    discount: serviceDB.discount,
    initialPayment: serviceDB.initial_payment,
    installments: serviceDB.installments_enabled ? {
      enabled: true,
      totalInstallments: serviceDB.total_installments,
      installmentAmount: serviceDB.installment_amount,
      paidInstallments: serviceDB.paid_installments
    } : undefined,
    totalService: serviceDB.total_service,
    totalPaid: serviceDB.total_paid,
    pendingBalance: serviceDB.pending_balance,
    status: serviceDB.status,
    lastPaymentDate: serviceDB.last_payment_date,
    isDeleted: serviceDB.is_deleted === 1,
    deletedAt: serviceDB.deleted_at || undefined,
    payments: payments.map(p => ({
      id: p.id,
      date: p.date,
      amount: p.amount,
      method: p.method,
      balance: p.balance,
      notes: p.notes
    })),
    createdAt: serviceDB.created_at
  };
}

/**
 * Formatear bytes a tamaño legible
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Cerrar base de datos
 */
function closeDatabase() {
  if (db) {
    db.close();
    console.log('✅ Base de datos cerrada');
  }
}

// Exportar funciones
export {
  initDatabase,
  closeDatabase,
  getAllServices,
  getServiceById,
  upsertService,
  deleteService,
  migrateFromLocalStorage,
  createBackup,
  restoreBackup,
  getDatabaseInfo,
  getConfig,
  setConfig
};

export default {
  initDatabase,
  closeDatabase,
  getAllServices,
  getServiceById,
  upsertService,
  deleteService,
  migrateFromLocalStorage,
  createBackup,
  restoreBackup,
  getDatabaseInfo,
  getConfig,
  setConfig
};