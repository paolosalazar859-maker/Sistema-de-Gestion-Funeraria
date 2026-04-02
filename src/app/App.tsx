import { RouterProvider } from "react-router";
import { router } from "./routes.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useState, useEffect } from "react";
import ActivationScreen from "./components/ActivationScreen";
import { isLicenseValidLocally, getOrCreateDeviceId } from "./data/licenseStore";
import { invoke } from "@tauri-apps/api/core";

// Suprimir warning conocido de Recharts sobre keys duplicadas en SVG
// Este es un problema interno de la librería que no afecta la funcionalidad
if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = (...args: any[]) => {
    const message = args[0];
    if (
      typeof message === "string" &&
      (message.includes("Encountered two children with the same key") ||
        message.includes("Keys should be unique"))
    ) {
      // Suprimir solo este warning específico de Recharts
      return;
    }
    originalWarn.apply(console, args);
  };

  console.error = (...args: any[]) => {
    const message = args[0];
    if (
      typeof message === "string" &&
      (message.includes("Encountered two children with the same key") ||
        message.includes("Keys should be unique") ||
        message.includes("Warning: Encountered two children"))
    ) {
      // Suprimir warnings de React sobre keys en Recharts
      return;
    }
    originalError.apply(console, args);
  };
}

import { loadServicesAsync } from "./data/serviceStore";
import { loadExpensesAsync } from "./data/expenseStore";
import { loadInventoryAsync } from "./data/inventoryStore";
import { loadCompanyProfileAsync } from "./data/companyStore";

export default function App() {
  const [isActivated, setIsActivated] = useState<boolean | null>(null);

  useEffect(() => {
    async function initApp() {
      try {
        getOrCreateDeviceId();
        
        // Inicializar todos los módulos con el nuevo Sistema JSON
        const isTauri = typeof window !== 'undefined' && 
          (!!(window as any).__TAURI__ || 
           !!(window as any).__TAURI_INTERNALS__ || 
           !!(window as any).__TAURI_METADATA__);
        
        if (isTauri) {
          console.log("🚀 Entorno Tauri detectado. Iniciando Motor JSON...");
          await Promise.all([
            loadServicesAsync(),
            loadExpensesAsync(),
            loadInventoryAsync(),
            loadCompanyProfileAsync()
          ]);
          console.log("✅ Sistema de Datos Listo");
        }
        
        setIsActivated(true);
      } catch (err: any) {
        console.error("Error crítico en inicialización de App:", err);
        setIsActivated(true);
      }
    }
    
    initApp();
  }, []);

  if (isActivated === null) {
    return (
      <div className="min-h-screen bg-[#0d1b3e] flex items-center justify-center text-white font-medium">
        Cargando AURA...
      </div>
    );
  }

  if (!isActivated) {
    return <ActivationScreen onActivated={() => setIsActivated(true)} />;
  }

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}