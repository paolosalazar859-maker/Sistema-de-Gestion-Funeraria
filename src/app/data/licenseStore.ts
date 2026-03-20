export interface LicenseToken {
  serialKey: string;
  clientName: string;
  expiresAt: string;
  deviceId: string;
}

const LICENSE_KEY = "funeral_app_license";
const DEVICE_KEY = "funeral_app_device_id";

// Genera un ID "permanente" para la máquina usando localStorage 
// (En una app pura de Electron usaríamos node-machine-id, pero esto funciona transversalmente)
export function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_KEY);
  if (!deviceId) {
    deviceId = "DEV-" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem(DEVICE_KEY, deviceId);
  }
  return deviceId;
}

export function loadLicenseToken(): LicenseToken | null {
  try {
    const raw = localStorage.getItem(LICENSE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LicenseToken;
  } catch (err) {
    console.error("Error al cargar la licencia", err);
    return null;
  }
}

export function saveLicenseToken(token: LicenseToken) {
  try {
    localStorage.setItem(LICENSE_KEY, JSON.stringify(token));
  } catch (err) {
    console.error("Error al guardar la licencia", err);
  }
}

export function clearLicenseToken() {
  localStorage.removeItem(LICENSE_KEY);
}

export function isLicenseValidLocally(): boolean {
  const token = loadLicenseToken();
  if (!token) return false;

  const now = new Date();
  const expiresDate = new Date(token.expiresAt);
  
  // Si la fecha actual superó la de expiración
  if (now > expiresDate) {
    return false;
  }

  return true;
}
