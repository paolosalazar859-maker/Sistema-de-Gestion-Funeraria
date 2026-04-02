import { invoke } from "@tauri-apps/api/core";
import { supabase } from "../../lib/supabase";

export interface LicenseToken {
  serialKey: string;
  activatedAt: string;
  deviceId: string;
}

const LICENSE_KEY = "aura_activation_data";

/**
 * Obtiene el ID único de hardware desde el proceso de Rust (Tauri)
 */
export async function getHardwareId(): Promise<string> {
  try {
    const hwid = await invoke<string>("get_machine_id");
    return hwid;
  } catch (err) {
    console.error("Error al obtener HWID:", err);
    return "unknown-hwid";
  }
}

/**
 * Verifica si esta PC ya está registrada en Supabase
 */
export async function checkServerActivation(hwid: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("activations")
      .select("*")
      .eq("machine_id", hwid)
      .eq("is_used", true)
      .single();

    if (error || !data) return false;
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Intenta activar la aplicación con un serial
 */
export async function activateWithSerial(serial: string): Promise<{ success: boolean; message: string }> {
  try {
    const hwid = await getHardwareId();

    // 1. Verificar si el serial existe y no está usado
    const { data: license, error: fetchError } = await supabase
      .from("activations")
      .select("*")
      .eq("serial", serial)
      .eq("is_used", false)
      .single();

    if (fetchError || !license) {
      return { success: false, message: "Serial inválido o ya utilizado en otra PC." };
    }

    // 2. Vincular el serial a esta PC (HWID)
    const { error: updateError } = await supabase
      .from("activations")
      .update({
        is_used: true,
        machine_id: hwid,
        activated_at: new Date().toISOString()
      })
      .eq("serial", serial);

    if (updateError) {
      return { success: false, message: "Error al registrar la activación. Reintente." };
    }

    // 3. Guardar localmente para acceso rápido
    const token: LicenseToken = {
      serialKey: serial,
      deviceId: hwid,
      activatedAt: new Date().toISOString()
    };
    localStorage.setItem(LICENSE_KEY, JSON.stringify(token));

    return { success: true, message: "¡Activación exitosa!" };
  } catch (err) {
    return { success: false, message: "Error de conexión con el servidor de licencias." };
  }
}

/**
 * Validación rápida al arrancar
 */
export async function isAppActivated(): Promise<boolean> {
  // Primero check local para velocidad
  const local = localStorage.getItem(LICENSE_KEY);
  if (!local) {
    // Si no hay local, intentamos ver si el server reconoce esta PC (por si reinstaló la app)
    const hwid = await getHardwareId();
    return await checkServerActivation(hwid);
  }

  // Opcional: Re-validar contra server cada vez (más seguro pero requiere internet siempre)
  const hwid = await getHardwareId();
  return await checkServerActivation(hwid);
}
