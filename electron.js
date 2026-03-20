/**
 * Electron Main Process
 * Punto de entrada para la aplicación de escritorio AURA
 */

import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import BackupManager from './backup-manager.js';
import UpdateManager from './update-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let database = null;
let backupManager = null;
let updateManager = null;

// Intentar cargar el módulo de base de datos
try {
  const dbModule = await import('./database.js');
  database = dbModule.default || dbModule;
  console.log('✅ Módulo de base de datos cargado');
} catch (error) {
  console.warn('⚠️  Base de datos SQLite no disponible. Instala better-sqlite3 con: npm install better-sqlite3');
  console.warn('    Error:', error.message);
}

function createWindow() {
  // Detectar modo desarrollo
  const isDev = !app.isPackaged;
  console.log(`🔧 Modo: ${isDev ? 'DESARROLLO' : 'PRODUCCIÓN'}`);
  console.log(`📦 app.isPackaged: ${app.isPackaged}`);
  
  // Crear la ventana principal
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    backgroundColor: '#0d1b3e',
    icon: path.join(__dirname, 'public', 'icons', 'icon-512x512.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false, // No mostrar hasta que esté lista
    titleBarStyle: 'default',
    frame: true,
  });

  // Mostrar ventana cuando esté lista para evitar flash blanco
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Abrir DevTools en desarrollo
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Cargar la aplicación
  if (isDev) {
    console.log('🌐 Cargando desde: http://localhost:5173');
    // En desarrollo, cargar desde el servidor de Vite
    mainWindow.loadURL('http://localhost:5173');
  } else {
    console.log('📁 Cargando desde: dist/index.html');
    // En producción, cargar el build
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // Menú personalizado
  createMenu(isDev);

  // Manejar el cierre de la ventana
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevenir navegación externa
  mainWindow.webContents.on('will-navigate', (event, url) => {
    // Permitir navegación local con hash (#)
    const urlObj = new URL(url);
    const isLocalFile = url.startsWith('file://');
    const isLocalhost = url.startsWith('http://localhost');
    const isSameOrigin = urlObj.origin === mainWindow.webContents.getURL().split('#')[0].split('?')[0];
    
    if (!isLocalFile && !isLocalhost && !isSameOrigin) {
      event.preventDefault();
    }
  });
}

function createMenu(isDev) {
  const template = [
    {
      label: 'AURA',
      submenu: [
        {
          label: 'Acerca de AURA',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Sistema AURA',
              message: 'Sistema de Gestión Funeraria AURA',
              detail: 'Versión 1.0.0\n\nSistema profesional de gestión para servicios funerarios.\n\n© 2026 AURA',
              buttons: ['Cerrar']
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Crear Backup',
          click: () => {
            if (!database) {
              dialog.showErrorBox('Error', 'Base de datos SQLite no disponible');
              return;
            }
            
            dialog.showSaveDialog(mainWindow, {
              title: 'Guardar Backup',
              defaultPath: `aura-backup-${new Date().toISOString().split('T')[0]}.db`,
              filters: [{ name: 'Base de datos', extensions: ['db'] }]
            }).then(result => {
              if (!result.canceled && result.filePath) {
                const response = database.createBackup(result.filePath);
                if (response.success) {
                  dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    title: 'Backup Exitoso',
                    message: 'Backup creado correctamente',
                    detail: `Ubicación: ${result.filePath}`,
                    buttons: ['OK']
                  });
                } else {
                  dialog.showErrorBox('Error', `Error creando backup: ${response.error}`);
                }
              }
            });
          }
        },
        {
          label: 'Restaurar Backup',
          click: () => {
            if (!database) {
              dialog.showErrorBox('Error', 'Base de datos SQLite no disponible');
              return;
            }

            dialog.showOpenDialog(mainWindow, {
              title: 'Seleccionar Backup',
              filters: [{ name: 'Base de datos', extensions: ['db'] }],
              properties: ['openFile']
            }).then(result => {
              if (!result.canceled && result.filePaths.length > 0) {
                dialog.showMessageBox(mainWindow, {
                  type: 'warning',
                  title: 'Confirmar Restauración',
                  message: '¿Estás seguro?',
                  detail: 'Esta acción reemplazará todos los datos actuales con el backup seleccionado.',
                  buttons: ['Cancelar', 'Restaurar'],
                  defaultId: 0,
                  cancelId: 0
                }).then(choice => {
                  if (choice.response === 1) {
                    const response = database.restoreBackup(result.filePaths[0]);
                    if (response.success) {
                      dialog.showMessageBox(mainWindow, {
                        type: 'info',
                        title: 'Restauración Exitosa',
                        message: 'Base de datos restaurada correctamente',
                        detail: 'La aplicación se recargará para aplicar los cambios.',
                        buttons: ['OK']
                      }).then(() => {
                        mainWindow.reload();
                      });
                    } else {
                      dialog.showErrorBox('Error', `Error restaurando backup: ${response.error}`);
                    }
                  }
                });
              }
            });
          }
        },
        { type: 'separator' },
        { role: 'quit', label: 'Salir' }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Deshacer' },
        { role: 'redo', label: 'Rehacer' },
        { type: 'separator' },
        { role: 'cut', label: 'Cortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Pegar' },
        { role: 'selectAll', label: 'Seleccionar todo' }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload', label: 'Recargar' },
        { role: 'forceReload', label: 'Forzar recarga' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom normal' },
        { role: 'zoomIn', label: 'Acercar' },
        { role: 'zoomOut', label: 'Alejar' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Pantalla completa' }
      ]
    },
    {
      label: 'Ventana',
      submenu: [
        { role: 'minimize', label: 'Minimizar' },
        { role: 'close', label: 'Cerrar' }
      ]
    }
  ];

  // Agregar menú de desarrollo solo en dev mode
  if (isDev) {
    template.push({
      label: 'Desarrollo',
      submenu: [
        { role: 'toggleDevTools', label: 'Herramientas de desarrollo' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ═══════════════════════════════════════════════════════════════════════════
// IPC HANDLERS - SQLite Database
// ═══════════════════════════════════════════════════════════════════════════

// Verificar si SQLite está disponible
ipcMain.handle('db:is-available', () => {
  return database !== null;
});

// Obtener todos los servicios
ipcMain.handle('db:get-all-services', async () => {
  if (!database) {
    return { success: false, error: 'Database not available' };
  }
  return database.getAllServices();
});

// Obtener servicio por ID
ipcMain.handle('db:get-service-by-id', async (event, id) => {
  if (!database) {
    return { success: false, error: 'Database not available' };
  }
  return database.getServiceById(id);
});

// Crear o actualizar servicio
ipcMain.handle('db:upsert-service', async (event, service) => {
  if (!database) {
    return { success: false, error: 'Database not available' };
  }
  return database.upsertService(service);
});

// Eliminar servicio
ipcMain.handle('db:delete-service', async (event, id) => {
  if (!database) {
    return { success: false, error: 'Database not available' };
  }
  return database.deleteService(id);
});

// Migrar desde localStorage
ipcMain.handle('db:migrate-from-localstorage', async (event, services) => {
  if (!database) {
    return { success: false, error: 'Database not available' };
  }
  return database.migrateFromLocalStorage(services);
});

// Crear backup
ipcMain.handle('db:create-backup', async (event, backupPath) => {
  if (!database) {
    return { success: false, error: 'Database not available' };
  }
  return database.createBackup(backupPath);
});

// Restaurar backup
ipcMain.handle('db:restore-backup', async (event, backupPath) => {
  if (!database) {
    return { success: false, error: 'Database not available' };
  }
  return database.restoreBackup(backupPath);
});

// Obtener información de la BD
ipcMain.handle('db:get-database-info', async () => {
  if (!database) {
    return { success: false, error: 'Database not available' };
  }
  return database.getDatabaseInfo();
});

// Inicializar la aplicación
app.whenReady().then(() => {
  // Inicializar base de datos
  if (database) {
    const initialized = database.initDatabase();
    if (initialized) {
      console.log('✅ Base de datos SQLite lista');
      
      // Inicializar sistema de backups automáticos
      backupManager = new BackupManager(database, mainWindow);
      backupManager.startScheduler();
      console.log('✅ Sistema de backups automáticos inicializado');
    } else {
      console.error('❌ Error inicializando base de datos');
    }
  }

  createWindow();
  
  // Inicializar sistema de actualizaciones automáticas
  updateManager = new UpdateManager(mainWindow);
  updateManager.startAutoCheck();
  console.log('✅ Sistema de actualizaciones automáticas inicializado');
});

// Salir cuando todas las ventanas estén cerradas (excepto en macOS)
app.on('window-all-closed', () => {
  // Cerrar base de datos
  if (database) {
    database.closeDatabase();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// En macOS, recrear la ventana cuando se hace click en el dock
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
});

// Opcional: Manejar comunicación IPC para features futuras
ipcMain.on('app-version', (event) => {
  event.reply('app-version', app.getVersion());
});

ipcMain.on('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) mainWindow.close();
});

// ═══════════════════════════════════════════════════════════════════════════
// IPC HANDLERS - Backup Manager
// ═══════════════════════════════════════════════════════════════════════════

// Obtener configuración de backups
ipcMain.handle('backup:get-config', async () => {
  if (!backupManager) {
    return { success: false, error: 'Backup manager not available' };
  }
  return backupManager.getConfig();
});

// Actualizar configuración de backups
ipcMain.handle('backup:update-config', async (event, config) => {
  if (!backupManager) {
    return { success: false, error: 'Backup manager not available' };
  }
  return backupManager.updateConfig(config);
});

// Crear backup manual
ipcMain.handle('backup:create-manual', async () => {
  if (!backupManager) {
    return { success: false, error: 'Backup manager not available' };
  }
  return backupManager.createManualBackup();
});

// Listar backups disponibles
ipcMain.handle('backup:list', async () => {
  if (!backupManager) {
    return { success: false, error: 'Backup manager not available', backups: [] };
  }
  return backupManager.listBackups();
});

// Abrir directorio de backups
ipcMain.handle('backup:open-directory', async () => {
  if (!backupManager) {
    return { success: false, error: 'Backup manager not available' };
  }
  return backupManager.openBackupDirectory();
});

// Cambiar ubicación de backups
ipcMain.handle('backup:change-location', async () => {
  if (!backupManager) {
    return { success: false, error: 'Backup manager not available' };
  }
  return await backupManager.changeBackupLocation();
});

// Restaurar desde backup
ipcMain.handle('backup:restore', async (event, backupPath) => {
  if (!backupManager) {
    return { success: false, error: 'Backup manager not available' };
  }
  return await backupManager.restoreFromBackup(backupPath);
});

// ═══════════════════════════════════════════════════════════════════════════
// IPC HANDLERS - Update Manager
// ═══════════════════════════════════════════════════════════════════════════

// Verificar actualizaciones manualmente
ipcMain.handle('update:check', async () => {
  if (!updateManager) {
    return { success: false, error: 'Update manager not available' };
  }
  return await updateManager.checkForUpdates();
});

// Descargar actualización
ipcMain.handle('update:download', async () => {
  if (!updateManager) {
    return { success: false, error: 'Update manager not available' };
  }
  return updateManager.downloadUpdate();
});

// Instalar actualización y reiniciar
ipcMain.handle('update:install', async () => {
  if (!updateManager) {
    return { success: false, error: 'Update manager not available' };
  }
  return updateManager.quitAndInstall();
});

// Obtener versión actual
ipcMain.handle('update:get-version', async () => {
  if (!updateManager) {
    return { success: false, error: 'Update manager not available' };
  }
  return updateManager.getCurrentVersion();
});

// Obtener configuración de actualizaciones
ipcMain.handle('update:get-config', async () => {
  if (!updateManager) {
    return { success: false, error: 'Update manager not available' };
  }
  return updateManager.getConfig();
});

// Actualizar configuración de actualizaciones
ipcMain.handle('update:update-config', async (event, config) => {
  if (!updateManager) {
    return { success: false, error: 'Update manager not available' };
  }
  return updateManager.updateConfig(config);
});