export interface CompanyProfile {
  name: string;
  subtitle: string;
  phone: string;
  email: string;
  address: string;
  logoBase64?: string;
}

const DB_KEY = "funeral_company_profile";

const defaultProfile: CompanyProfile = {
  name: "AURA",
  subtitle: "Sistema de Gestión Funeraria",
  phone: "",
  email: "",
  address: ""
};

import { jsonDb } from "./jsonDb";

export function loadCompanyProfile(): CompanyProfile {
  try {
    const isTauri = typeof window !== 'undefined' && (!!(window as any).__TAURI__ || !!(window as any).__TAURI_INTERNALS__);
    
    // Fallback síncrono
    if (isTauri) {
      const raw = localStorage.getItem(DB_KEY);
      return raw ? { ...defaultProfile, ...JSON.parse(raw) } : defaultProfile;
    }

    const raw = localStorage.getItem(DB_KEY);
    if (raw) return { ...defaultProfile, ...JSON.parse(raw) };
  } catch (err) {
    console.error("Error al cargar el perfil de la empresa", err);
  }
  return defaultProfile;
}

/** Carga asíncrona para Tauri */
export async function loadCompanyProfileAsync(): Promise<CompanyProfile> {
  const isTauri = !!(window as any).__TAURI__ || !!(window as any).__TAURI_INTERNALS__;
  if (isTauri) {
    const state = await jsonDb.load();
    if (state.companyProfile) {
      localStorage.setItem(DB_KEY, JSON.stringify(state.companyProfile));
      return state.companyProfile;
    }
  }
  return loadCompanyProfile();
}

export async function saveCompanyProfile(profile: CompanyProfile) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(profile));

    const isTauri = !!(window as any).__TAURI__ || !!(window as any).__TAURI_INTERNALS__;
    if (isTauri) {
      await jsonDb.updateSection('companyProfile', profile);
    }

    // Disparamos un evento global para que componentes como Layout y LoginScreen se actualicen en tiempo real
    window.dispatchEvent(new Event("companyProfileChanged"));
  } catch (err) {
    console.error("Error al guardar el perfil de la empresa", err);
  }
}
