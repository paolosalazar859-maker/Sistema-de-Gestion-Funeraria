import { supabase } from "../../lib/supabase";
import { getOrCreateDeviceId, LicenseToken } from "../data/licenseStore";

export class LicenseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LicenseError";
  }
}

export const licenseService = {
  /**
   * Intenta activar y vincular un serial key con este dispositivo.
   * Si es exitoso, retorna el objeto LicenseToken para guardarlo.
   */
  async activateLicense(serialKey: string): Promise<LicenseToken> {
    const deviceId = getOrCreateDeviceId();

    // 0. Bypass de Llave Maestra para Desarrollador
    if (serialKey.toUpperCase() === "AURA-DEVELOPER-2026-MASTER") {
      return {
        serialKey: "AURA-DEVELOPER-2026-MASTER",
        clientName: "Acceso Maestro (Desarrollador)",
        expiresAt: "2099-12-31T23:59:59Z",
        deviceId: deviceId
      };
    }
    
    // 1. Buscar la licencia
    const { data: licenseRow, error: fetchError } = await supabase
      .from("licenses")
      .select("*")
      .eq("serial_key", serialKey)
      .maybeSingle();

    if (fetchError) {
      console.error(fetchError);
      throw new LicenseError("Error de comunicación con el servidor de licencias.");
    }

    if (!licenseRow) {
      throw new LicenseError("La clave de producto ingresada no existe.");
    }

    if (!licenseRow.is_active) {
      throw new LicenseError("Esta licencia ha sido revocada o desactivada por el administrador.");
    }

    const now = new Date();
    const expiresDate = new Date(licenseRow.expires_at);
    if (now > expiresDate) {
      throw new LicenseError("Esta licencia ya ha expirado.");
    }

    // 2. Comprobar si ya está ligada a un dispositivo
    if (licenseRow.device_id && licenseRow.device_id !== deviceId) {
      throw new LicenseError("Esta licencia ya se encuentra en uso en otra computadora.");
    }

    // 3. Si no tiene device_id, la reclamamos para este dispositivo
    if (!licenseRow.device_id) {
      const { error: updateError } = await supabase
        .from("licenses")
        .update({ device_id: deviceId })
        .eq("id", licenseRow.id);
        
      if (updateError) {
        throw new LicenseError("Ocurrió un error al intentar vincular la licencia a tu computadora.");
      }
    }

    // Licencia validada exitosamente
    return {
      serialKey: licenseRow.serial_key,
      clientName: licenseRow.client_name,
      expiresAt: licenseRow.expires_at,
      deviceId: deviceId
    };
  },

  /**
   * Verifica silenciosamente si la licencia guardada sigue siendo válida.
   * Se puede llamar de vez en cuando (ej. al inicio de la app si hay internet).
   */
  async verifyOnline(serialKey: string, storedDeviceId: string): Promise<boolean> {
    // 0. Bypass de Llave Maestra
    if (serialKey.toUpperCase() === "AURA-DEVELOPER-2026-MASTER") return true;

    try {
      const { data, error } = await supabase
        .from("licenses")
        .select("is_active, expires_at, device_id")
        .eq("serial_key", serialKey)
        .maybeSingle();

      if (error || !data) return false;
      if (!data.is_active) return false;
      if (data.device_id !== storedDeviceId) return false;

      const now = new Date();
      const expiresDate = new Date(data.expires_at);
      if (now > expiresDate) return false;

      return true;
    } catch {
      // Si no hay internet, asumimos que es válida (la verificación local ya pasó)
      return true;
    }
  }
};
