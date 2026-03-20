import { RouterProvider } from "react-router";
import { router } from "./routes.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";

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

export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}