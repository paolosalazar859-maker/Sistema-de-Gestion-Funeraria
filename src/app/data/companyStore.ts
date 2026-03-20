export interface CompanyProfile {
  name: string;
  subtitle: string;
  phone: string;
  email: string;
  address: string;
}

const DB_KEY = "funeral_company_profile";

const defaultProfile: CompanyProfile = {
  name: "AURA",
  subtitle: "Sistema de Gestión Funeraria",
  phone: "",
  email: "",
  address: ""
};

export function loadCompanyProfile(): CompanyProfile {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return { ...defaultProfile, ...JSON.parse(raw) };
  } catch (err) {
    console.error("Error al cargar el perfil de la empresa", err);
  }
  return defaultProfile;
}

export function saveCompanyProfile(profile: CompanyProfile) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(profile));
    // Disparamos un evento global para que componentes como Layout y LoginScreen se actualicen en tiempo real
    window.dispatchEvent(new Event("companyProfileChanged"));
  } catch (err) {
    console.error("Error al guardar el perfil de la empresa", err);
  }
}
