/**
 * Sistema de Actualizaciones Automáticas para AURA
 * Gestiona verificación, descarga e instalación de actualizaciones
 */

import pkg from 'electron-updater';
const { autoUpdater } = pkg;
import { app, dialog } from 'electron';
import log from 'electron-log';

// Configurar logging
log.transports.file.level = 'info';
autoUpdater.logger = log;

class UpdateManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.updateCheckInterval = null;
    this.config = {
      autoDownload: true,
      autoInstallOnAppQuit: true,
      checkInterval: 3600000, // 1 hora en milisegundos
      allowPrerelease: false,
      allowDowngrade: false
    };
    
    this.setupAutoUpdater();
    this.loadConfig();
  }

  /**
   * Configurar el autoUpdater
   */
  setupAutoUpdater() {
    // Configuración básica
    autoUpdater.autoDownload = this.config.autoDownload;
    autoUpdater.autoInstallOnAppQuit = this.config.autoInstallOnAppQuit;
    autoUpdater.allowPrerelease = this.config.allowPrerelease;
    autoUpdater.allowDowngrade = this.config.allowDowngrade;

    // Eventos del autoUpdater
    autoUpdater.on('checking-for-update', () => {
      log.info('🔍 Verificando actualizaciones...');
      this.sendStatusToWindow({
        type: 'checking-for-update',
        message: 'Verificando actualizaciones...'
      });
    });

    autoUpdater.on('update-available', (info) => {
      log.info('✅ Actualización disponible:', info.version);
      this.sendStatusToWindow({
        type: 'update-available',
        message: `Nueva versión disponible: ${info.version}`,
        info: info
      });
      
      // Mostrar notificación al usuario
      this.showUpdateAvailableDialog(info);
    });

    autoUpdater.on('update-not-available', (info) => {
      log.info('✅ La aplicación está actualizada');
      this.sendStatusToWindow({
        type: 'update-not-available',
        message: 'La aplicación está actualizada'
      });
    });

    autoUpdater.on('error', (err) => {
      log.error('❌ Error en actualización:', err);
      this.sendStatusToWindow({
        type: 'error',
        message: `Error al actualizar: ${err.message}`,
        error: err
      });
    });

    autoUpdater.on('download-progress', (progressObj) => {
      const message = `Descargando: ${Math.round(progressObj.percent)}%`;
      log.info(message);
      this.sendStatusToWindow({
        type: 'download-progress',
        message: message,
        progress: progressObj
      });
    });

    autoUpdater.on('update-downloaded', (info) => {
      log.info('✅ Actualización descargada');
      this.sendStatusToWindow({
        type: 'update-downloaded',
        message: 'Actualización lista para instalar',
        info: info
      });
      
      // Mostrar diálogo para instalar
      this.showUpdateReadyDialog(info);
    });
  }

  /**
   * Cargar configuración desde la base de datos
   */
  loadConfig() {
    try {
      // Aquí podrías cargar desde la base de datos si lo necesitas
      log.info('⚙️ Configuración de actualizaciones cargada');
    } catch (error) {
      log.error('Error cargando configuración:', error);
    }
  }

  /**
   * Enviar estado al proceso renderer
   */
  sendStatusToWindow(status) {
    if (!this.mainWindow) return;
    
    try {
      this.mainWindow.webContents.send('update-status', status);
    } catch (error) {
      log.error('Error enviando estado a ventana:', error);
    }
  }

  /**
   * Mostrar diálogo cuando hay actualización disponible
   */
  async showUpdateAvailableDialog(info) {
    if (!this.mainWindow) return;

    const result = await dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'Actualización Disponible',
      message: `Nueva versión ${info.version} disponible`,
      detail: `Versión actual: ${app.getVersion()}\nNueva versión: ${info.version}\n\n¿Desea descargar e instalar la actualización ahora?`,
      buttons: ['Descargar Ahora', 'Más Tarde'],
      defaultId: 0,
      cancelId: 1
    });

    if (result.response === 0) {
      // Usuario eligió descargar
      autoUpdater.downloadUpdate();
      
      // Mostrar notificación de descarga
      this.sendStatusToWindow({
        type: 'download-started',
        message: 'Descargando actualización...'
      });
    }
  }

  /**
   * Mostrar diálogo cuando la actualización está lista
   */
  async showUpdateReadyDialog(info) {
    if (!this.mainWindow) return;

    const result = await dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'Actualización Lista',
      message: 'La actualización se ha descargado correctamente',
      detail: `Versión ${info.version} está lista para instalar.\n\n¿Desea cerrar la aplicación e instalar ahora?`,
      buttons: ['Instalar y Reiniciar', 'Instalar al Salir'],
      defaultId: 0,
      cancelId: 1
    });

    if (result.response === 0) {
      // Instalar inmediatamente
      setImmediate(() => {
        app.removeAllListeners('window-all-closed');
        autoUpdater.quitAndInstall(false, true);
      });
    }
  }

  /**
   * Verificar actualizaciones manualmente
   */
  async checkForUpdates() {
    if (app.isPackaged) {
      try {
        log.info('🔍 Verificación manual de actualizaciones iniciada');
        await autoUpdater.checkForUpdates();
        return { success: true, message: 'Verificando actualizaciones...' };
      } catch (error) {
        log.error('❌ Error verificando actualizaciones:', error);
        return { success: false, error: error.message };
      }
    } else {
      log.info('⚠️ Las actualizaciones solo funcionan en modo producción');
      return { 
        success: false, 
        error: 'Las actualizaciones solo funcionan en la versión empaquetada' 
      };
    }
  }

  /**
   * Iniciar verificación automática periódica
   */
  startAutoCheck() {
    if (!app.isPackaged) {
      log.info('⚠️ Verificación automática deshabilitada en modo desarrollo');
      return;
    }

    // Verificar inmediatamente al iniciar
    setTimeout(() => {
      this.checkForUpdates();
    }, 5000); // 5 segundos después de iniciar

    // Verificar periódicamente
    this.updateCheckInterval = setInterval(() => {
      this.checkForUpdates();
    }, this.config.checkInterval);

    log.info('✅ Verificación automática de actualizaciones iniciada');
    log.info(`   Intervalo: ${this.config.checkInterval / 1000 / 60} minutos`);
  }

  /**
   * Detener verificación automática
   */
  stopAutoCheck() {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
      log.info('⏸️ Verificación automática de actualizaciones detenida');
    }
  }

  /**
   * Descargar actualización
   */
  downloadUpdate() {
    try {
      autoUpdater.downloadUpdate();
      return { success: true, message: 'Descarga iniciada' };
    } catch (error) {
      log.error('❌ Error descargando actualización:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Instalar actualización y reiniciar
   */
  quitAndInstall() {
    try {
      setImmediate(() => {
        app.removeAllListeners('window-all-closed');
        autoUpdater.quitAndInstall(false, true);
      });
      return { success: true, message: 'Instalando actualización...' };
    } catch (error) {
      log.error('❌ Error instalando actualización:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener versión actual
   */
  getCurrentVersion() {
    return {
      version: app.getVersion(),
      isPackaged: app.isPackaged
    };
  }

  /**
   * Actualizar configuración
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // Aplicar cambios al autoUpdater
    autoUpdater.autoDownload = this.config.autoDownload;
    autoUpdater.autoInstallOnAppQuit = this.config.autoInstallOnAppQuit;
    autoUpdater.allowPrerelease = this.config.allowPrerelease;
    autoUpdater.allowDowngrade = this.config.allowDowngrade;

    // Reiniciar verificación automática si cambió el intervalo
    if (newConfig.checkInterval) {
      this.stopAutoCheck();
      this.startAutoCheck();
    }

    log.info('⚙️ Configuración de actualizaciones actualizada');
    return { success: true, config: this.config };
  }

  /**
   * Obtener configuración actual
   */
  getConfig() {
    return { success: true, config: this.config };
  }
}

export default UpdateManager;