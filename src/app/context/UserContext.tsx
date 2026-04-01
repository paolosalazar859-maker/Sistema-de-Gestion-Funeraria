import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

export type UserRole = "admin" | "oficina";

export interface AdminProfile {
  name: string;
  email: string;
  phone: string;
  position: string;
}

interface UserContextValue {
  role: UserRole | null;
  login: (role: UserRole) => void;
  logout: () => void;
  adminProfile: AdminProfile;
  profileLoading: boolean;
  updateAdminProfile: (data: Partial<AdminProfile>) => Promise<void>;
  changeAdminPassword: (current: string, next: string) => Promise<{ ok: boolean; error?: string }>;
  verifyAdminPassword: (password: string) => Promise<boolean>;
  verifyOfficePassword: (password: string) => Promise<boolean>;
  changeOfficePassword: (next: string) => Promise<{ ok: boolean; error?: string }>;
}

const SESSION_KEY = "funeral_user_role";
// Clave para caché offline de contraseña (hash simple)
const PWD_CACHE_KEY = "funeral_admin_pwd_hash";
const PWD_OFFICE_CACHE_KEY = "funeral_office_pwd_hash";
// Clave para caché offline del perfil
const PROFILE_CACHE_KEY = "funeral_admin_profile_cache";

const DEFAULT_PROFILE: AdminProfile = {
  name: "",
  email: "",
  phone: "",
  position: "Administrador",
};

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d9afe8ad`;

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
      ...(options.headers || {}),
    },
  });
  return res.json();
}

// ── Hash simple para caché local (no criptográfico, solo ofuscación) ──────────
async function hashPassword(password: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(`aura_salt_2026_${password}`);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    // Fallback si crypto.subtle no está disponible
    return btoa(`aura_${password}`);
  }
}

// ── Cargar perfil cacheado ────────────────────────────────────────────────────
function loadCachedProfile(): AdminProfile {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function saveCachedProfile(profile: AdminProfile): void {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
  } catch {
    // ignorar errores de storage
  }
}

const UserContext = createContext<UserContextValue>({
  role: null,
  login: () => {},
  logout: () => {},
  adminProfile: DEFAULT_PROFILE,
  profileLoading: false,
  updateAdminProfile: async () => {},
  changeAdminPassword: async () => ({ ok: false }),
  verifyAdminPassword: async () => false,
  verifyOfficePassword: async () => false,
  changeOfficePassword: async () => ({ ok: false }),
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(() => {
    // Usar sessionStorage para mayor seguridad (se borra al cerrar pestaña/navegador)
    const saved = sessionStorage.getItem(SESSION_KEY);
    return (saved as UserRole) || null;
  });

  // Limpiar cualquier residuo de localStorage antiguo por seguridad al iniciar
  useEffect(() => {
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const [adminProfile, setAdminProfile] = useState<AdminProfile>(loadCachedProfile);
  const [profileLoading, setProfileLoading] = useState(false);

  // ── Fetch profile from Supabase when role is admin ──────────────────────────
  useEffect(() => {
    if (role !== "admin") return;
    if (!navigator.onLine) return; // Usar caché si está offline
    setProfileLoading(true);
    apiFetch("/admin/profile")
      .then((data) => {
        if (data && !data.error) {
          const profile = { ...DEFAULT_PROFILE, ...data };
          setAdminProfile(profile);
          saveCachedProfile(profile); // Guardar en caché para uso offline
        }
      })
      .catch((err) => console.log(`Error cargando perfil admin: ${err}`))
      .finally(() => setProfileLoading(false));
  }, [role]);

  const login = (r: UserRole) => {
    sessionStorage.setItem(SESSION_KEY, r);
    setRole(r);
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setRole(null);
    setAdminProfile(DEFAULT_PROFILE);
  };

  const updateAdminProfile = async (data: Partial<AdminProfile>) => {
    const updated = { ...adminProfile, ...data };
    // Optimistic update
    setAdminProfile(updated);
    saveCachedProfile(updated);
    try {
      const res = await apiFetch("/admin/profile", {
        method: "POST",
        body: JSON.stringify(updated),
      });
      if (res?.error) {
        console.log(`Error guardando perfil: ${res.error}`);
      }
    } catch (err) {
      console.log(`Error al guardar perfil admin: ${err}`);
    }
  };

  const verifyAdminPassword = async (password: string): Promise<boolean> => {
    // ── ONLINE: verificar con el servidor ─────────────────────────────────
    if (navigator.onLine) {
      try {
        const res = await apiFetch("/admin/verify-password", {
          method: "POST",
          body: JSON.stringify({ password }),
        });
        if (res?.valid === true) {
          // Cachear hash de contraseña exitosa para uso offline
          const hash = await hashPassword(password);
          localStorage.setItem(PWD_CACHE_KEY, hash);
          return true;
        }
        return false;
      } catch (err) {
        console.log(`Error verificando contraseña online: ${err}`);
        // Si falla la red, intentar con caché
        return verifyOffline(password);
      }
    }

    // ── OFFLINE: verificar con caché local ────────────────────────────────
    return verifyOffline(password);
  };

  const verifyOffline = async (password: string): Promise<boolean> => {
    const cachedHash = localStorage.getItem(PWD_CACHE_KEY);
    if (!cachedHash) {
      console.log("Sin caché de contraseña para verificación offline.");
      return false;
    }
    const hash = await hashPassword(password);
    return hash === cachedHash;
  };

  const changeAdminPassword = async (
    current: string,
    next: string
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!navigator.onLine) {
      return { ok: false, error: "Sin conexión. Cambia la contraseña cuando tengas internet." };
    }
    try {
      const res = await apiFetch("/admin/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      if (res?.ok) {
        // Actualizar caché con la nueva contraseña
        const hash = await hashPassword(next);
        localStorage.setItem(PWD_CACHE_KEY, hash);
        return { ok: true };
      }
      return { ok: false, error: res?.error || "Error desconocido" };
    } catch (err) {
      console.log(`Error cambiando contraseña: ${err}`);
      return { ok: false, error: `Error de conexión: ${err}` };
    }
  };

  const verifyOfficePassword = async (password: string): Promise<boolean> => {
    const cachedHash = localStorage.getItem(PWD_OFFICE_CACHE_KEY);
    // Default password '1234' hash if none exists
    if (!cachedHash) {
      const defaultHash = await hashPassword("1234");
      const currentHash = await hashPassword(password);
      return currentHash === defaultHash;
    }
    const hash = await hashPassword(password);
    return hash === cachedHash;
  };

  const changeOfficePassword = async (next: string): Promise<{ ok: boolean; error?: string }> => {
    if (role !== "admin") {
      return { ok: false, error: "Solo el administrador puede cambiar esta contraseña." };
    }
    try {
      const hash = await hashPassword(next);
      localStorage.setItem(PWD_OFFICE_CACHE_KEY, hash);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: `Error al guardar: ${err}` };
    }
  };

  return (
    <UserContext.Provider
      value={{
        role,
        login,
        logout,
        adminProfile,
        profileLoading,
        updateAdminProfile,
        changeAdminPassword,
        verifyAdminPassword,
        verifyOfficePassword,
        changeOfficePassword,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
