import { useState, useEffect } from 'react';
import { Database, HardDrive, Download, Upload, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { migrateToSQLite, isSQLiteMigrated } from '../data/serviceStore';

export function DatabaseManager() {
  const [isElectron, setIsElectron] = useState(false);
  const [isSQLiteAvailable, setIsSQLiteAvailable] = useState(false);
  const [isMigrated, setIsMigrated] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkElectronAndSQLite();
    setIsMigrated(isSQLiteMigrated());
  }, []);

  async function checkElectronAndSQLite() {
    const electron = typeof window !== 'undefined' && window.electronAPI?.isElectron;
    setIsElectron(electron);

    if (electron) {
      try {
        const available = await window.electronAPI.db.isAvailable();
        setIsSQLiteAvailable(available);

        if (available) {
          loadDatabaseInfo();
        }
      } catch (err) {
        console.error('Error verificando SQLite:', err);
      }
    }
  }

  async function loadDatabaseInfo() {
    try {
      const response = await window.electronAPI.db.getDatabaseInfo();
      if (response.success) {
        setDbInfo(response.data);
      }
    } catch (err) {
      console.error('Error cargando info de BD:', err);
    }
  }

  async function handleMigration() {
    setIsMigrating(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await migrateToSQLite();
      
      if (result) {
        setSuccess('✅ Migración completada exitosamente');
        setIsMigrated(true);
        loadDatabaseInfo();
      } else {
        setError('No se pudo completar la migración');
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsMigrating(false);
    }
  }

  async function handleCreateBackup() {
    try {
      setError(null);
      setSuccess(null);
      
      // El diálogo se maneja desde el menú de Electron
      setSuccess('💾 Usa el menú AURA → Crear Backup para guardar una copia de seguridad');
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    }
  }

  async function handleRestoreBackup() {
    try {
      setError(null);
      setSuccess(null);
      
      // El diálogo se maneja desde el menú de Electron
      setSuccess('📂 Usa el menú AURA → Restaurar Backup para cargar una copia de seguridad');
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    }
  }

  // Si no estamos en Electron, no mostrar nada
  if (!isElectron) {
    return null;
  }

  // Si SQLite no está disponible, mostrar advertencia
  if (!isSQLiteAvailable) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertCircle className="h-5 w-5" />
            Base de Datos SQLite No Disponible
          </CardTitle>
          <CardDescription className="text-amber-700">
            Para habilitar SQLite en la aplicación de escritorio, instala la dependencia necesaria.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-amber-300 bg-amber-100">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900">
              <p className="font-medium mb-2">Instrucciones de instalación:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Abre una terminal en la carpeta del proyecto</li>
                <li>Ejecuta: <code className="bg-amber-200 px-2 py-1 rounded">npm install better-sqlite3</code></li>
                <li>Reinicia la aplicación</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estado de Migración */}
      {!isMigrated && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Database className="h-5 w-5" />
              Migración a SQLite Disponible
            </CardTitle>
            <CardDescription className="text-blue-700">
              Migra tus datos de localStorage a SQLite para mejor rendimiento y confiabilidad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-blue-800">
              SQLite proporciona una base de datos robusta y eficiente para la aplicación de escritorio.
              Tus datos actuales se migrarán de forma segura.
            </p>
            
            <Button 
              onClick={handleMigration}
              disabled={isMigrating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isMigrating ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Migrando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Migrar a SQLite
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Información de la Base de Datos */}
      {isMigrated && dbInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              Base de Datos SQLite Activa
            </CardTitle>
            <CardDescription>
              Información y herramientas de gestión de la base de datos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <HardDrive className="h-4 w-4" />
                  Servicios
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {dbInfo.servicesCount}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <Info className="h-4 w-4" />
                  Tamaño
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {dbInfo.sizeFormatted}
                </div>
              </div>
            </div>

            {/* Detalles */}
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Ubicación:</strong> {dbInfo.path}</p>
              <p><strong>Pagos registrados:</strong> {dbInfo.paymentsCount}</p>
              <p><strong>Última modificación:</strong> {new Date(dbInfo.lastModified).toLocaleString('es-CL')}</p>
            </div>

            {/* Acciones */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleCreateBackup}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Crear Backup
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleRestoreBackup}
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                Restaurar Backup
              </Button>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900 text-sm">
                También puedes crear y restaurar backups desde el menú <strong>AURA</strong> en la barra superior.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Mensajes de Error y Éxito */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900">{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
