/**
 * Type definitions for Electron APIs exposed via preload
 */

export interface ElectronDatabaseAPI {
  getAllServices: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
  getServiceById: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  upsertService: (service: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  deleteService: (id: string) => Promise<{ success: boolean; error?: string }>;
  migrateFromLocalStorage: (services: any[]) => Promise<{ success: boolean; count?: number; error?: string }>;
  createBackup: (path: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  restoreBackup: (path: string) => Promise<{ success: boolean; error?: string }>;
  getDatabaseInfo: () => Promise<{ 
    success: boolean; 
    data?: {
      path: string;
      size: number;
      sizeFormatted: string;
      servicesCount: number;
      paymentsCount: number;
      lastModified: Date;
    };
    error?: string 
  }>;
  isAvailable: () => Promise<boolean>;
}

export interface ElectronAPI {
  // App info
  getVersion: () => Promise<string>;
  
  // Window controls
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  
  // Platform
  isElectron: boolean;
  platform: string;
  
  // Database
  db: ElectronDatabaseAPI;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
