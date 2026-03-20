/**
 * Sistema de Gestión de Backups Automáticos para AURA
 * Maneja backups programados, rotación y notificaciones
 */

import { app, dialog } from 'electron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BackupManager {
  constructor(database, mainWindow) {
    this.database = database;
    this.mainWindow = mainWindow;
    this.backupInterval = null;
    this.config = {
      enabled: false,
      frequency: 'daily', // 'daily', 'weekly', 'monthly'
      time: '02:00', // Hora del backup (formato 24h)
      maxBackups: 30, // Número máximo de backups a mantener
      backupPath: path.join(app.getPath('documents'), 'AURA-Backups')
    };
    
    this.loadConfig();
    this.ensureBackupDirectory();
  }

  /**
   * Cargar configuración desde la base de datos
   */
  loadConfig() {
    try {
      if (!this.database) return;
      
      const configResult = this.database.getConfig('backup_settings');
      if (configResult.success && configResult.data) {
        const savedConfig = JSON.parse(configResult.data.value);
        this.config = { ...this.config, ...savedConfig };
      }
    } catch (error) {
      console.error('Error cargando configuración de backups:', error);
    }
  }

  /**
   * Guardar configuración en la base de datos
   */
  saveConfig() {
    try {
      if (!this.database) return { success: false, error: 'Database not available' };
      
      const result = this.database.setConfig('backup_settings', JSON.stringify(this.config));
      return result;
    } catch (error) {
      console.error('Error guardando configuración de backups:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Asegurar que el directorio de backups existe
   */
  ensureBackupDirectory() {
    try {
      if (!fs.existsSync(this.config.backupPath)) {
        fs.mkdirSync(this.config.backupPath, { recursive: true });
        console.log('📁 Directorio de backups creado:', this.config.backupPath);
      }
    } catch (error) {
      console.error('Error creando directorio de backups:', error);
    }
  }

  /**
   * Actualizar configuración de backups
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    
    // Reiniciar el programador si está habilitado
    if (this.config.enabled) {
      this.stopScheduler();
      this.startScheduler();
    } else {
      this.stopScheduler();
    }
    
    return { success: true, config: this.config };
  }

  /**
   * Obtener configuración actual
   */
  getConfig() {
    return { success: true, config: this.config };
  }

  /**
   * Crear backup manual
   */
  createManualBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
    const date = timestamp[0];
    const time = timestamp[1].substring(0, 8);
    const filename = `aura-backup-manual-${date}-${time}.db`;
    const backupPath = path.join(this.config.backupPath, filename);
    
    console.log('🔄 Creando backup manual:', filename);
    
    const result = this.database.createBackup(backupPath);
    
    if (result.success) {
      console.log('✅ Backup manual creado:', backupPath);
      this.showNotification('Backup Exitoso', `Backup manual creado correctamente\n${filename}`, 'info');
    } else {
      console.error('❌ Error creando backup manual:', result.error);
      this.showNotification('Error de Backup', `No se pudo crear el backup: ${result.error}`, 'error');
    }
    
    return result;
  }

  /**
   * Crear backup automático
   */
  createAutoBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
    const date = timestamp[0];
    const time = timestamp[1].substring(0, 8);
    const filename = `aura-backup-auto-${date}-${time}.db`;
    const backupPath = path.join(this.config.backupPath, filename);
    
    console.log('⏰ Creando backup automático:', filename);
    
    const result = this.database.createBackup(backupPath);
    
    if (result.success) {
      console.log('✅ Backup automático creado:', backupPath);
      this.showNotification('Backup Automático', `Backup creado correctamente\n${filename}`, 'info');
      
      // Limpiar backups antiguos
      this.cleanOldBackups();
    } else {
      console.error('❌ Error creando backup automático:', result.error);
      this.showNotification('Error de Backup Automático', `No se pudo crear el backup: ${result.error}`, 'error');
    }
    
    return result;
  }

  /**
   * Limpiar backups antiguos según el límite configurado
   */
  cleanOldBackups() {
    try {
      const files = fs.readdirSync(this.config.backupPath)
        .filter(file => file.startsWith('aura-backup-') && file.endsWith('.db'))
        .map(file => ({
          name: file,
          path: path.join(this.config.backupPath, file),
          time: fs.statSync(path.join(this.config.backupPath, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time); // Más recientes primero
      
      // Si hay más backups que el límite, eliminar los más antiguos
      if (files.length > this.config.maxBackups) {
        const toDelete = files.slice(this.config.maxBackups);
        console.log(`🧹 Limpiando ${toDelete.length} backup(s) antiguo(s)...`);
        
        toDelete.forEach(file => {
          try {
            fs.unlinkSync(file.path);
            console.log('  🗑️  Eliminado:', file.name);
          } catch (error) {
            console.error('  ❌ Error eliminando:', file.name, error);
          }
        });
        
        console.log('✅ Limpieza de backups completada');
      }
    } catch (error) {
      console.error('Error limpiando backups antiguos:', error);
    }
  }

  /**
   * Listar todos los backups disponibles
   */
  listBackups() {
    try {
      const files = fs.readdirSync(this.config.backupPath)
        .filter(file => file.startsWith('aura-backup-') && file.endsWith('.db'))
        .map(file => {
          const filePath = path.join(this.config.backupPath, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            path: filePath,
            size: stats.size,
            created: stats.mtime.toISOString(),
            type: file.includes('manual') ? 'manual' : 'auto'
          };
        })
        .sort((a, b) => new Date(b.created) - new Date(a.created));
      
      return { success: true, backups: files };
    } catch (error) {
      console.error('Error listando backups:', error);
      return { success: false, error: error.message, backups: [] };
    }
  }

  /**
   * Calcular la próxima fecha de backup
   */
  calculateNextBackup() {
    const now = new Date();
    const [hours, minutes] = this.config.time.split(':').map(Number);
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);
    
    // Si la hora ya pasó hoy, programar para mañana
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    
    // Ajustar según la frecuencia
    switch (this.config.frequency) {
      case 'weekly':
        // Próximo lunes a las 2:00 AM
        const daysUntilMonday = (8 - next.getDay()) % 7 || 7;
        next.setDate(next.getDate() + daysUntilMonday);
        break;
      case 'monthly':
        // Primer día del próximo mes a las 2:00 AM
        next.setMonth(next.getMonth() + 1, 1);
        break;
      // 'daily' ya está configurado arriba
    }
    
    return next;
  }

  /**
   * Iniciar el programador de backups
   */
  startScheduler() {
    if (!this.config.enabled || !this.database) {
      console.log('⏸️  Programador de backups deshabilitado');
      return;
    }
    
    const checkBackup = () => {
      const nextBackup = this.calculateNextBackup();
      const now = new Date();
      const timeUntilBackup = nextBackup - now;
      
      console.log(`⏰ Próximo backup automático: ${nextBackup.toLocaleString()}`);
      
      // Si es tiempo de hacer backup (dentro de 1 minuto)
      if (timeUntilBackup <= 60000 && timeUntilBackup > 0) {
        this.createAutoBackup();
      }
    };
    
    // Verificar cada minuto
    this.backupInterval = setInterval(checkBackup, 60000);
    checkBackup(); // Verificar inmediatamente
    
    console.log('✅ Programador de backups iniciado');
    console.log(`   Frecuencia: ${this.config.frequency}`);
    console.log(`   Hora: ${this.config.time}`);
    console.log(`   Ubicación: ${this.config.backupPath}`);
  }

  /**
   * Detener el programador de backups
   */
  stopScheduler() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
      console.log('⏸️  Programador de backups detenido');
    }
  }

  /**
   * Mostrar notificación al usuario
   */
  showNotification(title, message, type = 'info') {
    if (!this.mainWindow) return;
    
    try {
      // Enviar notificación al renderer process
      this.mainWindow.webContents.send('backup-notification', {
        title,
        message,
        type,
        timestamp: new Date().toISOString()
      });
      
      // También mostrar como dialog si es error
      if (type === 'error') {
        dialog.showMessageBox(this.mainWindow, {
          type: 'error',
          title: title,
          message: message,
          buttons: ['OK']
        });
      }
    } catch (error) {
      console.error('Error mostrando notificación:', error);
    }
  }

  /**
   * Abrir directorio de backups
   */
  openBackupDirectory() {
    try {
      const { shell } = require('electron');
      shell.openPath(this.config.backupPath);
      return { success: true };
    } catch (error) {
      console.error('Error abriendo directorio de backups:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cambiar ubicación de backups
   */
  async changeBackupLocation() {
    try {
      const result = await dialog.showOpenDialog(this.mainWindow, {
        title: 'Seleccionar ubicación para backups',
        properties: ['openDirectory', 'createDirectory'],
        defaultPath: this.config.backupPath
      });
      
      if (!result.canceled && result.filePaths.length > 0) {
        const newPath = path.join(result.filePaths[0], 'AURA-Backups');
        
        // Crear directorio si no existe
        if (!fs.existsSync(newPath)) {
          fs.mkdirSync(newPath, { recursive: true });
        }
        
        // Actualizar configuración
        this.config.backupPath = newPath;
        this.saveConfig();
        
        return { success: true, path: newPath };
      }
      
      return { success: false, error: 'Cancelled' };
    } catch (error) {
      console.error('Error cambiando ubicación de backups:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Restaurar desde backup
   */
  async restoreFromBackup(backupPath) {
    try {
      const result = await dialog.showMessageBox(this.mainWindow, {
        type: 'warning',
        title: 'Confirmar Restauración',
        message: '¿Estás seguro de que deseas restaurar este backup?',
        detail: 'Esta acción reemplazará todos los datos actuales. Se recomienda crear un backup antes de continuar.',
        buttons: ['Cancelar', 'Crear Backup y Restaurar', 'Restaurar Sin Backup'],
        defaultId: 0,
        cancelId: 0
      });
      
      if (result.response === 1) {
        // Crear backup antes de restaurar
        this.createManualBackup();
      }
      
      if (result.response === 1 || result.response === 2) {
        // Proceder con la restauración
        const restoreResult = this.database.restoreBackup(backupPath);
        
        if (restoreResult.success) {
          this.showNotification('Restauración Exitosa', 'Base de datos restaurada correctamente', 'info');
          
          // Recargar la ventana
          if (this.mainWindow) {
            this.mainWindow.reload();
          }
        }
        
        return restoreResult;
      }
      
      return { success: false, error: 'Cancelled by user' };
    } catch (error) {
      console.error('Error restaurando backup:', error);
      return { success: false, error: error.message };
    }
  }
}

export default BackupManager;
