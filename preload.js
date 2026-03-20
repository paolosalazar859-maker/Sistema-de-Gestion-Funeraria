/**
 * Preload Script
 * Expone APIs seguras al proceso de renderizado
 */

import { contextBridge, ipcRenderer } from 'electron';

// Exponer APIs seguras al proceso de renderizado
contextBridge.exposeInMainWorld('electronAPI', {
  // Información de la app
  getVersion: () => ipcRenderer.invoke('app-version'),
  
  // Control de ventana
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  
  // Verificar si está en Electron
  isElectron: true,
  
  // Platform info
  platform: process.platform,

  // ═════════════════════════════════════════════════════════════════════════
  // SQLite Database APIs
  // ═════════════════════════════════════════════════════════════════════════

  // Servicios
  db: {
    // Obtener todos los servicios
    getAllServices: () => ipcRenderer.invoke('db:get-all-services'),
    
    // Obtener servicio por ID
    getServiceById: (id) => ipcRenderer.invoke('db:get-service-by-id', id),
    
    // Crear o actualizar servicio
    upsertService: (service) => ipcRenderer.invoke('db:upsert-service', service),
    
    // Eliminar servicio
    deleteService: (id) => ipcRenderer.invoke('db:delete-service', id),
    
    // Migración desde localStorage
    migrateFromLocalStorage: (services) => ipcRenderer.invoke('db:migrate-from-localstorage', services),
    
    // Backup y restauración
    createBackup: (path) => ipcRenderer.invoke('db:create-backup', path),
    restoreBackup: (path) => ipcRenderer.invoke('db:restore-backup', path),
    
    // Información de la BD
    getDatabaseInfo: () => ipcRenderer.invoke('db:get-database-info'),

    // Verificar si SQLite está disponible
    isAvailable: () => ipcRenderer.invoke('db:is-available'),
  },

  // ═════════════════════════════════════════════════════════════════════════
  // Backup Manager APIs
  // ═════════════════════════════════════════════════════════════════════════

  backup: {
    // Obtener configuración
    getConfig: () => ipcRenderer.invoke('backup:get-config'),
    
    // Actualizar configuración
    updateConfig: (config) => ipcRenderer.invoke('backup:update-config', config),
    
    // Crear backup manual
    createManual: () => ipcRenderer.invoke('backup:create-manual'),
    
    // Listar backups
    list: () => ipcRenderer.invoke('backup:list'),
    
    // Abrir directorio de backups
    openDirectory: () => ipcRenderer.invoke('backup:open-directory'),
    
    // Cambiar ubicación de backups
    changeLocation: () => ipcRenderer.invoke('backup:change-location'),
    
    // Restaurar desde backup
    restore: (path) => ipcRenderer.invoke('backup:restore', path),
    
    // Escuchar notificaciones de backup
    onNotification: (callback) => {
      ipcRenderer.on('backup-notification', (event, data) => callback(data));
    },
  },

  // ═════════════════════════════════════════════════════════════════════════
  // Update Manager APIs
  // ═════════════════════════════════════════════════════════════════════════

  update: {
    // Verificar actualizaciones
    check: () => ipcRenderer.invoke('update:check'),
    
    // Descargar actualización
    download: () => ipcRenderer.invoke('update:download'),
    
    // Instalar actualización y reiniciar
    install: () => ipcRenderer.invoke('update:install'),
    
    // Obtener versión actual
    getVersion: () => ipcRenderer.invoke('update:get-version'),
    
    // Obtener configuración
    getConfig: () => ipcRenderer.invoke('update:get-config'),
    
    // Actualizar configuración
    updateConfig: (config) => ipcRenderer.invoke('update:update-config', config),
    
    // Escuchar estado de actualizaciones
    onStatus: (callback) => {
      ipcRenderer.on('update-status', (event, status) => callback(status));
    },
    
    // Remover listeners
    removeStatusListener: () => {
      ipcRenderer.removeAllListeners('update-status');
    },
  }
});