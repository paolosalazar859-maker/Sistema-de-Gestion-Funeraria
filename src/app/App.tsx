import { RouterProvider } from "react-router";
import { router } from "./routes.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useEffect } from "react";
import { loadServicesAsync } from "./data/serviceStore";
import { loadExpensesAsync } from "./data/expenseStore";
import { loadInventoryAsync } from "./data/inventoryStore";
import { loadCompanyProfileAsync } from "./data/companyStore";

export default function App() {
  useEffect(() => {
    async function initApp() {
      try {
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
      } catch (err: any) {
        console.error("Error crítico en inicialización de App:", err);
      }
    }
    
    initApp();
  }, []);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}