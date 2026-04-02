import { supabase } from "../../lib/supabase";
import { getHardwareId, LicenseToken, checkServerActivation } from "../data/licenseStore";

export class LicenseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LicenseError";
  }
}

const LOCAL_STORAGE_KEY = "aura_activation_data";

export const licenseService = {
  /**
   * Proceso de activación principal.
   * Valida el serial contra Supabase y lo quema vinculándolo al HWID de Rust.
   */
  async activateLicense(serial: string): Promise<LicenseToken> {
    const hwid = await getHardwareId();

    // 0. Bypass de Llave Maestra (opcional para ti)
    if (serial.toUpperCase() === "AURA-MASTER-DEV-2026") {
      return {
        serialKey: serial,
        activatedAt: new Date().toISOString(),
        deviceId: hwid
      };
    }
    
    // 1. Verificar si el serial existe y es válido
    const { data: license, error: fetchError } = await supabase
      .from("activations")
      .select("*")
      .eq("serial", serial)
      .maybeSingle();

    if (fetchError) {
      throw new LicenseError("Error de conexión con el servidor de licencias.");
    }

    if (!license) {
      throw new LicenseError("El serial ingresado no es válido.");
    }

    // 2. Comprobar si ya fue usado
    if (license.is_used) {
      // Si ya fue usado, permitir solo si es en ESTA misma PC (re-instalación)
      if (license.machine_id === hwid) {
        return {
          serialKey: license.serial,
          activatedAt: license.activated_at,
          deviceId: hwid
        };
      }
      throw new LicenseError("Este serial ya ha sido activado en otra computadora.");
    }

    // 3. Vincular y "quemar" el serial para esta PC
    const { error: updateError } = await supabase
      .from("activations")
      .update({
        is_used: true,
        machine_id: hwid,
        activated_at: new Date().toISOString()
      })
      .eq("serial", serial);
      
    if (updateError) {
      throw new LicenseError("No se pudo completar la activación. Reintente.");
    }

    // Retornar token exitoso
    return {
      serialKey: serial,
      activatedAt: new Date().toISOString(),
      deviceId: hwid
    };
  },

  /**
   * Verificación exhaustiva (Online)
   */
  async fullVerify(): Promise<boolean> {
    try {
      const hwid = await getHardwareId();
      return await checkServerActivation(hwid);
    } catch {
      // Si no hay internet por un momento, confiamos en el check local que se hace en Root
      return true;
    }
  }
};
