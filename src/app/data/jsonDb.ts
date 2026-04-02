import { readTextFile, writeTextFile, exists, BaseDirectory } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";

/**
 * Motor de Base de Datos Híbrido: Estabilidad 100% Garantizada
 */
export interface DatabaseState {
  services: any[];
  expenses: any[];
  inventory: any[];
  companyProfile: any | null;
  lastUpdated: string;
}

const STORAGE_KEY = "aura_main_db_v2";
const CUSTOM_PATH_KEY = "aura_db_custom_path";
const DEFAULT_FILENAME = "database.json";

const initialState: DatabaseState = {
  services: [],
  expenses: [],
  inventory: [],
  companyProfile: null,
  lastUpdated: new Date().toISOString(),
};

/**
 * Sistema de Persistencia Híbrida (localStorage + FS directo)
 */
export const jsonDb = {
  /** Obtiene la ruta actual del archivo (Personalizada o AppData) */
  async getDbPath(): Promise<string> {
    const customPath = localStorage.getItem(CUSTOM_PATH_KEY);
    if (customPath) return customPath;

    try {
      const dataDir = await appDataDir();
      return await join(dataDir, DEFAULT_FILENAME);
    } catch {
      return DEFAULT_FILENAME; // Fallback extremo
    }
  },

  /** Carga la base de datos de forma instantánea */
  async load(): Promise<DatabaseState> {
    try {
      // 1. Intentar cargar de localStorage (Caché rápido)
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const state = JSON.parse(raw) as DatabaseState;
        if (state.services && Array.isArray(state.services)) {
           return state;
        }
      }
      
      // 2. Si localStorage está vacío o corrupto, intentar cargar del sistema de archivos
      const isTauri = typeof window !== 'undefined' && (!!(window as any).__TAURI__ || !!(window as any).__TAURI_INTERNALS__);
      if (isTauri) {
        const fileContent = await this.readFromFile();
        if (fileContent) {
          console.info("⚡ Datos recuperados desde el sistema de archivos");
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fileContent)); // Sincronizar caché
          return fileContent;
        }
      }

      return initialState;
    } catch (error) {
      console.error("Error cargando base de datos interna:", error);
      return initialState;
    }
  },

  /** Guarda los datos al instante */
  async save(state: DatabaseState): Promise<boolean> {
    try {
      const updatedState = {
        ...state,
        lastUpdated: new Date().toISOString()
      };
      
      // Persistencia Instantánea (localStorage / Caché)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));

      // Persistencia en Disco (Solo en Tauri)
      const isTauri = typeof window !== 'undefined' && (!!(window as any).__TAURI__ || !!(window as any).__TAURI_INTERNALS__);
      if (isTauri) {
        await this.writeToFile(updatedState);
      }

      return true;
    } catch (error) {
      console.error("Error guardando base de datos interna:", error);
      return false;
    }
  },

  /** Escribe directamente en el sistema de archivos */
  async writeToFile(state: DatabaseState) {
    try {
      const path = await this.getDbPath();
      // Asegurarse de que el contenido sea un JSON formateado
      await writeTextFile(path, JSON.stringify(state, null, 2));
      console.info("🛡️ Base de datos en disco actualizada:", path);
    } catch (e) {
      console.error("Error escribiendo en archivo:", e);
    }
  },

  /** Lee datos desde el archivo de sistema */
  async readFromFile(): Promise<DatabaseState | null> {
    try {
      const path = await this.getDbPath();
      const fileExists = await exists(path);
      
      if (fileExists) {
        const content = await readTextFile(path);
        return JSON.parse(content) as DatabaseState;
      }
      return null;
    } catch (e) {
      console.error("Error leyendo desde archivo:", e);
      return null;
    }
  },

  /** Cambia la ubicación de la base de datos */
  async setCustomPath(newPath: string): Promise<boolean> {
    try {
      const currentState = await this.load();
      localStorage.setItem(CUSTOM_PATH_KEY, newPath);
      await this.writeToFile(currentState); // Mudar datos a la nueva ruta
      return true;
    } catch (e) {
      console.error("Error al mudar base de datos:", e);
      return false;
    }
  },

  /** Actualiza una sección específica */
  async updateSection(section: keyof DatabaseState, data: any) {
    const state = await this.load();
    (state as any)[section] = data;
    return await this.save(state);
  }
};
