/**
 * UpdateManager Component
 * Interfaz para gestionar actualizaciones automáticas
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const UpdateManagerComponent = () => {
  const [version, setVersion] = useState({ version: '0.0.0', isPackaged: false });
  const [updateStatus, setUpdateStatus] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);

  // Verificar si está en Electron
  const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

  useEffect(() => {
    if (!isElectron) return;

    // Obtener versión actual
    loadVersion();

    // Escuchar estado de actualizaciones
    window.electronAPI.update.onStatus((status) => {
      console.log('Update status:', status);
      setUpdateStatus(status);

      switch (status.type) {
        case 'checking-for-update':
          setChecking(true);
          break;

        case 'update-available':
          setChecking(false);
          toast.info(`Nueva versión disponible: ${status.info?.version}`);
          break;

        case 'update-not-available':
          setChecking(false);
          toast.success('La aplicación está actualizada');
          break;

        case 'download-started':
          setDownloading(true);
          break;

        case 'download-progress':
          setDownloading(true);
          setDownloadProgress(Math.round(status.progress?.percent || 0));
          break;

        case 'update-downloaded':
          setDownloading(false);
          setUpdateReady(true);
          toast.success('Actualización lista para instalar');
          break;

        case 'error':
          setChecking(false);
          setDownloading(false);
          toast.error(`Error: ${status.message}`);
          break;
      }
    });

    return () => {
      if (window.electronAPI?.update?.removeStatusListener) {
        window.electronAPI.update.removeStatusListener();
      }
    };
  }, [isElectron]);

  const loadVersion = async () => {
    try {
      const result = await window.electronAPI.update.getVersion();
      if (result) {
        setVersion(result);
      }
    } catch (error) {
      console.error('Error obteniendo versión:', error);
    }
  };

  const handleCheckForUpdates = async () => {
    setChecking(true);
    try {
      const result = await window.electronAPI.update.check();
      if (!result.success) {
        toast.error(result.error || 'Error al verificar actualizaciones');
        setChecking(false);
      }
    } catch (error) {
      console.error('Error verificando actualizaciones:', error);
      toast.error('Error al verificar actualizaciones');
      setChecking(false);
    }
  };

  const handleInstallUpdate = async () => {
    try {
      await window.electronAPI.update.install();
    } catch (error) {
      console.error('Error instalando actualización:', error);
      toast.error('Error al instalar actualización');
    }
  };

  if (!isElectron) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Actualizaciones Automáticas
          </CardTitle>
          <CardDescription>
            Las actualizaciones automáticas solo están disponibles en la versión de escritorio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Esta funcionalidad requiere la aplicación de escritorio de AURA
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Información de Versión */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Información de Versión
          </CardTitle>
          <CardDescription>
            Versión actual de la aplicación AURA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Versión Actual</p>
              <p className="text-2xl font-bold">{version.version}</p>
            </div>
            <Badge variant={version.isPackaged ? 'default' : 'secondary'}>
              {version.isPackaged ? 'Producción' : 'Desarrollo'}
            </Badge>
          </div>

          {!version.isPackaged && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Las actualizaciones automáticas solo funcionan en la versión empaquetada de la aplicación
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Verificar Actualizaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Verificar Actualizaciones
          </CardTitle>
          <CardDescription>
            Buscar e instalar actualizaciones disponibles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estado de actualización */}
          {updateStatus && (
            <Alert className={
              updateStatus.type === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-950' :
              updateStatus.type === 'update-available' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' :
              updateStatus.type === 'update-downloaded' ? 'border-green-500 bg-green-50 dark:bg-green-950' :
              ''
            }>
              {updateStatus.type === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
              {updateStatus.type === 'update-available' && <Info className="h-4 w-4 text-blue-600" />}
              {updateStatus.type === 'update-downloaded' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              {updateStatus.type === 'checking-for-update' && <Loader2 className="h-4 w-4 animate-spin" />}
              <AlertDescription>
                {updateStatus.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Progreso de descarga */}
          {downloading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Descargando actualización...</span>
                <span className="font-medium">{downloadProgress}%</span>
              </div>
              <Progress value={downloadProgress} className="h-2" />
            </div>
          )}

          {/* Botón de actualización lista */}
          {updateReady && (
            <Button 
              onClick={handleInstallUpdate}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Instalar y Reiniciar
            </Button>
          )}

          {/* Botón de verificar */}
          {!updateReady && (
            <Button 
              onClick={handleCheckForUpdates}
              disabled={checking || downloading || !version.isPackaged}
              className="w-full"
            >
              {checking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Buscar Actualizaciones
                </>
              )}
            </Button>
          )}

          <p className="text-xs text-muted-foreground text-center">
            La aplicación verifica actualizaciones automáticamente cada hora
          </p>
        </CardContent>
      </Card>

      {/* Configuración Avanzada */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Actualizaciones</CardTitle>
          <CardDescription>
            Personalizar el comportamiento de las actualizaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Descargas Automáticas</Label>
              <p className="text-sm text-muted-foreground">
                Descargar actualizaciones en segundo plano
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Instalar al Salir</Label>
              <p className="text-sm text-muted-foreground">
                Instalar actualizaciones al cerrar la aplicación
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Las actualizaciones se publican a través de GitHub Releases y se verifican de forma segura
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateManagerComponent;
