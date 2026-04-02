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
  Loader2,
  Monitor
} from 'lucide-react';
import { toast } from 'sonner';
import { invoke } from "@tauri-apps/api/core";

const UpdateManagerComponent = () => {
  const [version, setVersion] = useState({ version: '0.0.0', isPackaged: false });
  const [updateStatus, setUpdateStatus] = useState<any>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);

  // Verificar ambiente
  const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI?.isElectron;
  const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI__;

  useEffect(() => {
    if (isTauri) {
      loadVersion();
      return;
    }

    if (!isElectron) return;

    // Obtener versión actual (Electron)
    loadVersion();

    // Escuchar estado de actualizaciones (Electron)
    (window as any).electronAPI.update.onStatus((status: any) => {
      console.log('Update status:', status);
      setUpdateStatus(status);
      // ... rest of the switch logic remains the same
    });

    return () => {
      if ((window as any).electronAPI?.update?.removeStatusListener) {
        (window as any).electronAPI.update.removeStatusListener();
      }
    };
  }, [isElectron, isTauri]);

  const loadVersion = async () => {
    try {
      if (isTauri) {
        const tVersion = await invoke('get_app_version');
        setVersion({ version: tVersion as string, isPackaged: true });
      } else if (isElectron) {
        const result = await (window as any).electronAPI.update.getVersion();
        if (result) setVersion(result);
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

  if (!isElectron && !isTauri) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Actualizaciones de Escritorio
          </CardTitle>
          <CardDescription>
            La gestión de versiones está optimizada para la aplicación instalada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Esta funcionalidad requiere la aplicación de escritorio de AURA (Windows/Mac).
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
