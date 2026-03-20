import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, X, Monitor, Smartphone, Wifi, WifiOff } from "lucide-react";
import { Button } from "./ui/button";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineToast, setShowOfflineToast] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalada como PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Verificar si el usuario ya cerró el banner antes
    const dismissed = localStorage.getItem("aura-pwa-dismissed");
    if (dismissed) return;

    // Capturar el evento de instalación
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Mostrar banner después de 3 segundos
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Detectar si ya fue instalada
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowBanner(false);
      setInstallPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Monitor de conexión
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineToast(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineToast(true);
      setTimeout(() => setShowOfflineToast(false), 5000);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Detectar actualizaciones del service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowBanner(false);
      setInstallPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("aura-pwa-dismissed", "true");
  };

  const handleUpdate = () => {
    window.location.reload();
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Banner de instalación */}
      <AnimatePresence>
        {showBanner && installPrompt && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50"
          >
            <div className="bg-[#1a1f2e] border border-[#C9A84C]/30 rounded-xl shadow-2xl overflow-hidden">
              {/* Línea dorada decorativa */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Ícono AURA */}
                  <div className="flex-shrink-0 w-12 h-12 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-lg flex items-center justify-center">
                    <span className="text-[#C9A84C] font-bold text-xl tracking-wider">A</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-white font-semibold text-sm">
                          Instalar AURA
                        </h3>
                        <p className="text-gray-400 text-xs mt-0.5">
                          Accede sin navegador, trabaja sin conexión
                        </p>
                      </div>
                      <button
                        onClick={handleDismiss}
                        className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0 p-0.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Beneficios */}
                    <div className="flex gap-3 mt-3 mb-3">
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Monitor className="w-3 h-3 text-[#C9A84C]" />
                        <span>Escritorio</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Smartphone className="w-3 h-3 text-[#C9A84C]" />
                        <span>Móvil</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <WifiOff className="w-3 h-3 text-[#C9A84C]" />
                        <span>Sin conexión</span>
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleInstall}
                        className="flex-1 bg-[#C9A84C] hover:bg-[#b8963d] text-[#1a1f2e] text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Instalar ahora
                      </button>
                      <button
                        onClick={handleDismiss}
                        className="text-gray-400 hover:text-gray-200 text-xs py-2 px-3 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors"
                      >
                        Ahora no
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Línea dorada decorativa inferior */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent opacity-40" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast de sin conexión */}
      <AnimatePresence>
        {showOfflineToast && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-[#1a1f2e] border border-orange-500/40 rounded-lg px-4 py-2.5 shadow-xl flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-orange-400" />
              <span className="text-white text-sm font-medium">Sin conexión</span>
              <span className="text-gray-400 text-xs">— Mostrando datos en caché</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast de conexión restaurada */}
      <AnimatePresence>
        {isOnline && !showOfflineToast && (
          <></>
        )}
      </AnimatePresence>

      {/* Banner de actualización disponible */}
      <AnimatePresence>
        {updateAvailable && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-[#1a1f2e] border border-[#C9A84C]/50 rounded-lg px-4 py-2.5 shadow-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
              <span className="text-white text-sm font-medium">Nueva versión disponible</span>
              <button
                onClick={handleUpdate}
                className="text-[#C9A84C] text-xs font-semibold hover:underline ml-1"
              >
                Actualizar
              </button>
              <button
                onClick={() => setUpdateAvailable(false)}
                className="text-gray-500 hover:text-gray-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de estado de conexión (siempre visible cuando está offline) */}
      {!isOnline && !showOfflineToast && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-orange-500/10 border-b border-orange-500/20">
          <div className="flex items-center justify-center gap-2 py-1">
            <WifiOff className="w-3 h-3 text-orange-400" />
            <span className="text-orange-400 text-xs font-medium">
              Modo sin conexión — Los cambios se sincronizarán al reconectarse
            </span>
          </div>
        </div>
      )}
    </>
  );
}
