import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { FuneralService } from "./mockData";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-d9afe8ad`;
const HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${publicAnonKey}`,
};

// ── Cargar todos los servicios desde Supabase ─────────────────────────────────
export async function apiLoadServices(): Promise<FuneralService[]> {
  try {
    const res = await fetch(`${BASE}/services`, { headers: HEADERS });
    if (!res.ok) {
      const err = await res.text();
      console.error(`apiLoadServices error ${res.status}: ${err}`);
      return [];
    }
    const data = await res.json();
    // data is already an array of parsed objects (JSONB from Supabase)
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(`apiLoadServices excepción: ${err}`);
    return [];
  }
}

// ── Guardar / actualizar un servicio en Supabase ──────────────────────────────
export async function apiPersistService(service: FuneralService): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/services`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(service),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error(`apiPersistService error ${res.status}: ${err}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`apiPersistService excepción: ${err}`);
    return false;
  }
}

// ── Eliminar un servicio de Supabase ──────────────────────────────────────────
export async function apiDeleteService(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/services/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: HEADERS,
    });
    if (!res.ok) {
      const err = await res.text();
      console.error(`apiDeleteService error ${res.status}: ${err}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`apiDeleteService excepción: ${err}`);
    return false;
  }
}

// ── Migrar datos locales a Supabase de una sola vez ───────────────────────────
export async function apiMigrateServices(services: FuneralService[]): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/services/migrate`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(services),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error(`apiMigrateServices error ${res.status}: ${err}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`apiMigrateServices excepción: ${err}`);
    return false;
  }
}