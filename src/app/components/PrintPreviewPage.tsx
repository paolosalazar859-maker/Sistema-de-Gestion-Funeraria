import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

/**
 * Página para la ventana emergente de impresión (Pop-up).
 * Versión Minimalista y Optimizada.
 */
export function PrintPreviewPage() {
  const [html, setHtml] = useState<string>("");
  const [title, setTitle] = useState<string>("Comprobante AURA");

  useEffect(() => {
    // Recuperamos los datos de localStorage
    const savedPrintData = localStorage.getItem("aura-print-data");
    if (savedPrintData) {
      try {
        const parsed = JSON.parse(savedPrintData);
        setHtml(parsed.html || "");
        setTitle(parsed.title || "Comprobante");
        document.title = parsed.title || "Comprobante";
      } catch (e) {
        console.error("Error al cargar datos de impresión:", e);
      }
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = async () => {
    try {
      const win = getCurrentWindow();
      await win.close();
    } catch (e) {
      console.error("Error al cerrar ventana:", e);
      window.close(); // Fallback
    }
  };

  if (!html) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-slate-400 font-sans">
        Cargando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col font-sans text-slate-900 border-t border-slate-200">
      {/* Barra de Acciones Minimalista */}
      <div className="no-print sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex flex-col">
          <h1 className="font-semibold text-sm text-slate-800">{title}</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">AURA - Gestión Funeraria</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleClose}
            className="px-4 py-2 text-slate-400 hover:text-slate-800 text-sm font-medium transition-colors rounded-md hover:bg-slate-100"
          >
            Cerrar
          </button>
          <button 
            onClick={handlePrint}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-2.5 rounded-md text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
           🖨️ Imprimir
          </button>
        </div>
      </div>

      {/* Área del Documento */}
      <div className="flex-1 p-6 flex justify-center overflow-auto custom-scrollbar">
        <div className="bg-white shadow-sm border border-slate-200 w-full max-w-[800px] min-h-[1050px]">
          <div 
            dangerouslySetInnerHTML={{ __html: html }} 
            className="w-full h-full"
          />
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }

        @media print {
          .no-print {
            display: none !important;
          }
          
          html, body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }

          .min-h-screen {
            background: white !important;
            min-height: auto !important;
          }

          .flex-1 {
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
          }

          div[class*="max-w-[800px]"] {
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            min-height: auto !important;
          }

          @page {
            margin: 0;
            size: auto;
          }
        }
      `}</style>
    </div>
  );
}
