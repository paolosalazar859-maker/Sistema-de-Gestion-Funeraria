import React, { useState, useEffect } from "react";
import { 
  Database, 
  Download, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  FolderOpen,
  ShieldCheck,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { jsonDb } from "../data/jsonDb";
import { save, open } from "@tauri-apps/plugin-dialog";
import { copyFile, readTextFile } from "@tauri-apps/plugin-fs";

const DatabaseManager: React.FC = () => {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [currentPath, setCurrentPath] = useState<string>("");

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const path = await jsonDb.getDbPath();
        setCurrentPath(path);
      } catch (e) {
        console.error("Error obteniendo ruta:", e);
      }
    };
    fetchPath();
  }, []);

  const handleCreateBackup = async () => {
    setStatus("loading");
    setMessage("Preparando copia de seguridad...");
    try {
      const selectedPath = await save({
        filters: [{
          name: 'Respaldo AURA (JSON)',
          extensions: ['json']
        }],
        defaultPath: `AURA_BACKUP_${new Date().toISOString().split('T')[0]}.json`
      });

      if (selectedPath) {
        const sourcePath = await jsonDb.getDbPath();
        await copyFile(sourcePath, selectedPath);
        setStatus("success");
        setMessage("¡Copia de seguridad creada con éxito!");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("idle");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Error al procesar el respaldo.");
    }
  };

  const handleSetCustomLocation = async () => {
    setStatus("loading");
    setMessage("Configurando nueva ubicación...");
    try {
      const selectedPath = await save({
        title: "Selecciona el destino de la Base de Datos Principal",
        defaultPath: "aura_database.json",
        filters: [{ name: 'JSON', extensions: ['json'] }]
      });

      if (selectedPath) {
        const success = await jsonDb.setCustomPath(selectedPath);
        if (success) {
          setCurrentPath(selectedPath);
          setStatus("success");
          setMessage("Ubicación del sistema actualizada.");
          setTimeout(() => setStatus("idle"), 3000);
        } else {
          throw new Error("No se pudo mudar la base de datos");
        }
      } else {
        setStatus("idle");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Error al migrar la ubicación.");
    }
  };

  const handleRestoreBackup = async () => {
    setStatus("loading");
    setMessage("Validando archivo de respaldo...");
    try {
      const selectedPath = await open({
        multiple: false,
        filters: [{ name: 'Respaldo AURA', extensions: ['json'] }]
      });

      if (selectedPath) {
        const content = await readTextFile(selectedPath as string);
        const parsed = JSON.parse(content);
        
        if (parsed.services || parsed.inventory) {
          await jsonDb.save(parsed);
          setStatus("success");
          setMessage("¡Datos restaurados! Reinicia para aplicar los cambios.");
        } else {
          throw new Error("El archivo no parece ser un respaldo válido de AURA.");
        }
      } else {
        setStatus("idle");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Error al restaurar los datos.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Sección */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#0d1b3e] flex items-center gap-2">
            <Database className="text-[#c9a84c]" size={20} />
            Mantenimiento de Datos
          </h3>
          <p className="text-xs text-slate-500">
            Control integral de integridad y redundancia de la información.
          </p>
        </div>
      </div>

      {/* Tarjeta de Ubicación Actual (Premium Glass) */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden relative group transition-all duration-300 hover:shadow-md">
        <div className="absolute top-0 right-0 p-4">
           <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-tighter">Motor Activo</span>
           </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400">
            <FolderOpen size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Ruta de Persistencia Local</span>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-50/80 rounded-2xl p-4 border border-slate-100 group-hover:bg-slate-50 transition-colors duration-300">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono text-[#0d1b3e]/80 truncate">
                {currentPath || "Obteniendo ruta de sistema..."}
              </p>
            </div>
            <button 
              onClick={handleSetCustomLocation}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#0d1b3e] hover:bg-[#0d1b3e] hover:text-white transition-all shadow-sm flex items-center gap-2"
            >
              Mudar Datos
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Acciones principales - Grid 2 Columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Backup Card */}
        <button
          onClick={handleCreateBackup}
          disabled={status === "loading"}
          className="relative group overflow-hidden bg-white hover:bg-slate-50 border border-slate-100 p-6 rounded-[2rem] text-left transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
        >
          {/* Background Gradient Detail */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full translate-x-12 -translate-y-12 group-hover:translate-x-6 group-hover:-translate-y-6 transition-transform duration-700" />
          
          <div className="space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110 duration-500">
              <Download size={26} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-[#0d1b3e]">Crear Respaldo</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Genera un archivo portátil de toda la gestión para guardar en disco externo.
              </p>
            </div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
               Ejecutar ahora <ChevronRight size={12} />
            </div>
          </div>
        </button>

        {/* Restore Card */}
        <button
          onClick={handleRestoreBackup}
          disabled={status === "loading"}
          className="relative group overflow-hidden bg-white hover:bg-slate-50 border border-slate-100 p-6 rounded-[2rem] text-left transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
        >
          {/* Background Gradient Detail */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full translate-x-12 -translate-y-12 group-hover:translate-x-6 group-hover:-translate-y-6 transition-transform duration-700" />

          <div className="space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 transition-transform group-hover:scale-110 duration-500">
              <Upload size={26} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-[#0d1b3e]">Restaurar Datos</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Importa una sesión previa. Sobrescribirá los datos actuales del sistema.
              </p>
            </div>
            <div className="flex items-center gap-2 text-purple-600 font-bold text-[10px] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
               Cargar archivo <ChevronRight size={12} />
            </div>
          </div>
        </button>
      </div>

      {/* Barra de Estado Dinámica */}
      {status !== "idle" && (
        <div className={`p-4 rounded-2xl flex items-center gap-4 border animate-in slide-in-from-top-2 duration-300
          ${status === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : ""}
          ${status === "error" ? "bg-rose-50 border-rose-100 text-rose-700" : ""}
          ${status === "loading" ? "bg-blue-50 border-blue-100 text-[#0d1b3e]" : ""}
        `}>
          <div className="flex-shrink-0">
            {status === "loading" && <RefreshCw size={18} className="animate-spin text-blue-500" />}
            {status === "success" && <CheckCircle2 size={18} className="text-emerald-500" />}
            {status === "error" && <AlertCircle size={18} className="text-rose-500" />}
          </div>
          <p className="text-xs font-bold">{message}</p>
        </div>
      )}

      {/* Footer Info Box */}
      <div className="bg-[#0d1b3e]/[0.02] border border-slate-100 rounded-3xl p-6">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#c9a84c]/10 flex items-center justify-center text-[#c9a84c] flex-shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div className="space-y-1">
             <h5 className="text-sm font-bold text-[#0d1b3e]">Protocolo de Seguridad AURA</h5>
             <p className="text-xs text-slate-500 leading-relaxed">
                Este sistema realiza persistencia inmediata. Para mayor seguridad, exporta una copia externa mensualmente a una ubicación física separada de este terminal.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseManager;
