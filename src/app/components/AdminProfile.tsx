import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Save,
  ShieldCheck,
  KeyRound,
  UserCircle,
  Loader2,
  Database,
  Download,
  Building2,
  MapPin,
  Image as ImageIcon,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { DatabaseManager } from "./DatabaseManager";
import UpdateManagerComponent from "./UpdateManager";
import { loadCompanyProfile, saveCompanyProfile, CompanyProfile } from "../data/companyStore";

type Tab = "perfil" | "empresa" | "seguridad" | "database" | "updates";

export function AdminProfile() {
  const { adminProfile, updateAdminProfile, changeAdminPassword, profileLoading } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("perfil");

  // ── Profile form state ──────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({ ...adminProfile });
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Sync form when profile loads from server
  useEffect(() => {
    setProfileForm({ ...adminProfile });
  }, [adminProfile]);

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      await updateAdminProfile(profileForm);
      setProfileMsg({ type: "ok", text: "Datos actualizados correctamente." });
    } catch {
      setProfileMsg({ type: "err", text: "Error al guardar. Inténtalo de nuevo." });
    } finally {
      setSavingProfile(false);
      setTimeout(() => setProfileMsg(null), 3000);
    }
  };

  // ── Company form state ──────────────────────────────────────────
  const [empresaForm, setEmpresaForm] = useState<CompanyProfile>(loadCompanyProfile());
  const [empresaMsg, setEmpresaMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [savingEmpresa, setSavingEmpresa] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 500;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setEmpresaForm((p) => ({ ...p, logoBase64: dataUrl }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleEmpresaSave = () => {
    setSavingEmpresa(true);
    try {
      saveCompanyProfile(empresaForm);
      setEmpresaMsg({ type: "ok", text: "Datos de empresa actualizados." });
    } catch {
      setEmpresaMsg({ type: "err", text: "Error al guardar empresa." });
    } finally {
      setSavingEmpresa(false);
      setTimeout(() => setEmpresaMsg(null), 3000);
    }
  };

  // ── Password form state ─────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [savingPw, setSavingPw] = useState(false);

  const pwErrors: string[] = [];
  if (pwForm.next.length > 0 && pwForm.next.length < 6)
    pwErrors.push("La contraseña debe tener al menos 6 caracteres.");
  if (pwForm.next && pwForm.confirm && pwForm.next !== pwForm.confirm)
    pwErrors.push("Las contraseñas nuevas no coinciden.");

  const canSavePw =
    pwForm.current.length > 0 &&
    pwForm.next.length >= 6 &&
    pwForm.next === pwForm.confirm &&
    pwErrors.length === 0;

  const handlePwSave = async () => {
    setSavingPw(true);
    try {
      const result = await changeAdminPassword(pwForm.current, pwForm.next);
      if (result.ok) {
        setPwMsg({ type: "ok", text: "Contraseña actualizada correctamente." });
        setPwForm({ current: "", next: "", confirm: "" });
      } else {
        setPwMsg({ type: "err", text: result.error || "La contraseña actual es incorrecta." });
      }
    } catch {
      setPwMsg({ type: "err", text: "Error de conexión. Inténtalo de nuevo." });
    } finally {
      setSavingPw(false);
      setTimeout(() => setPwMsg(null), 3500);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────
  const inputStyle = (hasError = false) => ({
    background: "#f8f9fb",
    border: `1.5px solid ${hasError ? "#ef4444" : "#e5e7eb"}`,
    color: "#1a2f5a",
    borderRadius: "10px",
    outline: "none",
    transition: "border-color 0.2s",
    width: "100%",
    padding: "10px 14px 10px 40px",
    fontSize: "0.875rem",
  });

  const labelStyle = { color: "#374151", fontSize: "0.8rem", fontWeight: 600, marginBottom: "6px", display: "block" };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "perfil", label: "Datos personales", icon: UserCircle },
    { id: "empresa", label: "Empresa", icon: Building2 },
    { id: "seguridad", label: "Seguridad", icon: KeyRound },
    { id: "database", label: "Base de datos", icon: Database },
    { id: "updates", label: "Actualizaciones", icon: Download },
  ];

  // Initials avatar
  const initials = adminProfile.name
    ? adminProfile.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "AD";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl" style={{ color: "#0d1b3e", fontWeight: 700 }}>
          Perfil de Administrador
        </h2>
        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
          Gestiona tus datos personales y credenciales de acceso.
        </p>
      </div>

      {/* Avatar card */}
      <div
        className="rounded-2xl p-6 mb-5 flex items-center gap-5 shadow-sm"
        style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl shadow-md shrink-0"
          style={{ background: "linear-gradient(135deg, #c9a84c, #e8c97a)", color: "#0d1b3e", fontWeight: 700 }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base truncate" style={{ color: "#0d1b3e", fontWeight: 700 }}>
            {adminProfile.name || "Sin nombre"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
            {adminProfile.email || "Sin correo registrado"}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
              style={{ background: "rgba(201,168,76,0.12)", color: "#a07c28", fontWeight: 600 }}
            >
              <ShieldCheck size={11} />
              Administrador
            </span>
            <span
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
              style={{ background: "#f0f2f5", color: "#6b7280" }}
            >
              Acceso completo
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex rounded-xl p-1 mb-5"
        style={{ background: "#f0f2f5", border: "1px solid #e5e7eb" }}
      >
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all duration-200"
              style={{
                background: isActive ? "#ffffff" : "transparent",
                color: isActive ? "#0d1b3e" : "#9ca3af",
                fontWeight: isActive ? 600 : 400,
                boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── PERFIL TAB ────────────────────────────────────────────── */}
      {activeTab === "perfil" && (
        <div
          className="rounded-2xl p-6 shadow-sm"
          style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
        >
          <p className="text-sm mb-5" style={{ color: "#0d1b3e", fontWeight: 600 }}>
            Información personal
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="sm:col-span-2">
              <label style={labelStyle}>Nombre completo</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez García"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  style={inputStyle()}
                  onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Correo electrónico</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                  style={inputStyle()}
                  onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label style={labelStyle}>Teléfono</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input
                  type="tel"
                  placeholder="Ej. +52 55 1234 5678"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                  style={inputStyle()}
                  onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
            </div>

            {/* Cargo */}
            <div className="sm:col-span-2">
              <label style={labelStyle}>Cargo / Puesto</label>
              <div className="relative">
                <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input
                  type="text"
                  placeholder="Ej. Director General"
                  value={profileForm.position}
                  onChange={(e) => setProfileForm((p) => ({ ...p, position: e.target.value }))}
                  style={inputStyle()}
                  onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
            </div>
          </div>

          {/* Feedback */}
          {profileMsg && (
            <div
              className="flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl text-sm"
              style={{
                background: profileMsg.type === "ok" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${profileMsg.type === "ok" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                color: profileMsg.type === "ok" ? "#16a34a" : "#dc2626",
              }}
            >
              {profileMsg.type === "ok" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              {profileMsg.text}
            </div>
          )}

          {/* Save button */}
          <div className="flex justify-end mt-5">
            <button
              onClick={handleProfileSave}
              disabled={savingProfile}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all"
              style={{
                background: "linear-gradient(135deg, #c9a84c, #e8c97a)",
                color: "#0d1b3e",
                fontWeight: 600,
                opacity: savingProfile ? 0.7 : 1,
                cursor: savingProfile ? "not-allowed" : "pointer",
              }}
            >
              {savingProfile ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {savingProfile ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      )}

      {/* ── EMPRESA TAB ────────────────────────────────────────────── */}
      {activeTab === "empresa" && (
        <div
          className="rounded-2xl p-6 shadow-sm"
          style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
        >
          <p className="text-sm mb-5" style={{ color: "#0d1b3e", fontWeight: 600 }}>
            Información de la Funeraria
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 mb-2">
              <label style={labelStyle}>Logo de la Funeraria</label>
              <div className="flex items-center gap-4 mt-2">
                <div 
                  className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border"
                  style={{ background: "#f8f9fa", borderColor: "#e5e7eb" }}
                >
                  {empresaForm.logoBase64 ? (
                    <img src={empresaForm.logoBase64} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon size={24} style={{ color: "#9ca3af" }} />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-xl file:border-0
                      file:text-xs file:font-semibold
                      file:bg-[#f0f2f5] file:text-[#0d1b3e]
                      hover:file:bg-[#e5e7eb]
                      transition-all cursor-pointer"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Sube una imagen (PNG o JPG). Se redimensionará automáticamente para optimizar carga.
                  </p>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label style={labelStyle}>Nombre de la Funeraria</label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input
                  type="text"
                  placeholder="Ej. AURA"
                  value={empresaForm.name}
                  onChange={(e) => setEmpresaForm((p) => ({ ...p, name: e.target.value }))}
                  style={inputStyle()}
                  onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label style={labelStyle}>Subtítulo / Lema</label>
              <div className="relative">
                <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input
                  type="text"
                  placeholder="Ej. Sistema de Gestión Funeraria"
                  value={empresaForm.subtitle}
                  onChange={(e) => setEmpresaForm((p) => ({ ...p, subtitle: e.target.value }))}
                  style={inputStyle()}
                  onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Correo de contacto</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input
                  type="email"
                  placeholder="contacto@funeraria.com"
                  value={empresaForm.email}
                  onChange={(e) => setEmpresaForm((p) => ({ ...p, email: e.target.value }))}
                  style={inputStyle()}
                  onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Teléfono principal</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input
                  type="tel"
                  placeholder="Ej. +56 9 1234 5678"
                  value={empresaForm.phone}
                  onChange={(e) => setEmpresaForm((p) => ({ ...p, phone: e.target.value }))}
                  style={inputStyle()}
                  onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label style={labelStyle}>Dirección comercial (Aparecerá en recibos)</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input
                  type="text"
                  placeholder="Ej. Av. Siempre Viva 123, Ciudad"
                  value={empresaForm.address}
                  onChange={(e) => setEmpresaForm((p) => ({ ...p, address: e.target.value }))}
                  style={inputStyle()}
                  onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
            </div>
          </div>

          {empresaMsg && (
            <div
              className="flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl text-sm"
              style={{
                background: empresaMsg.type === "ok" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${empresaMsg.type === "ok" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                color: empresaMsg.type === "ok" ? "#16a34a" : "#dc2626",
              }}
            >
              {empresaMsg.type === "ok" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              {empresaMsg.text}
            </div>
          )}

          <div className="flex justify-end mt-5">
            <button
              onClick={handleEmpresaSave}
              disabled={savingEmpresa}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all"
              style={{
                background: "linear-gradient(135deg, #c9a84c, #e8c97a)",
                color: "#0d1b3e",
                fontWeight: 600,
                opacity: savingEmpresa ? 0.7 : 1,
                cursor: savingEmpresa ? "not-allowed" : "pointer",
              }}
            >
              {savingEmpresa ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {savingEmpresa ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      )}

      {/* ── SEGURIDAD TAB ─────────────────────────────────────────── */}
      {activeTab === "seguridad" && (
        <div
          className="rounded-2xl p-6 shadow-sm"
          style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
        >
          <p className="text-sm mb-1" style={{ color: "#0d1b3e", fontWeight: 600 }}>
            Cambiar contraseña
          </p>
          <p className="text-xs mb-5" style={{ color: "#9ca3af" }}>
            Para actualizar tu contraseña, ingresa la actual y luego la nueva dos veces.
          </p>

          {/* Info tip */}
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-xl mb-5"
            style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)" }}
          >
            <Lock size={14} style={{ color: "#c9a84c", marginTop: "2px", flexShrink: 0 }} />
            <p className="text-xs" style={{ color: "#a07c28" }}>
              La nueva contraseña se guardará de forma local en este navegador. Asegúrate de recordarla.
            </p>
          </div>

          <div className="space-y-4">
            {/* Contraseña actual */}
            <div>
              <label style={labelStyle}>Contraseña actual</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input
                  type={showPw.current ? "text" : "password"}
                  placeholder="••••••••"
                  value={pwForm.current}
                  onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
                  style={{ ...inputStyle(), paddingRight: "42px" }}
                  onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => ({ ...p, current: !p.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#9ca3af" }}
                >
                  {showPw.current ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Nueva contraseña */}
            <div>
              <label style={labelStyle}>Nueva contraseña</label>
              <div className="relative">
                <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input
                  type={showPw.next ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={pwForm.next}
                  onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
                  style={{ ...inputStyle(pwForm.next.length > 0 && pwForm.next.length < 6), paddingRight: "42px" }}
                  onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                  onBlur={(e) => (e.target.style.borderColor = pwForm.next.length > 0 && pwForm.next.length < 6 ? "#ef4444" : "#e5e7eb")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => ({ ...p, next: !p.next }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#9ca3af" }}
                >
                  {showPw.next ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength bar */}
              {pwForm.next.length > 0 && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map((i) => {
                      const strength = Math.min(4, Math.floor(pwForm.next.length / 3));
                      const color =
                        strength <= 1 ? "#ef4444" : strength === 2 ? "#f59e0b" : strength === 3 ? "#3b82f6" : "#22c55e";
                      return (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all"
                          style={{ background: i <= strength ? color : "#e5e7eb" }}
                        />
                      );
                    })}
                  </div>
                  <span className="text-xs" style={{ color: "#9ca3af" }}>
                    {pwForm.next.length < 6 ? "Débil" : pwForm.next.length < 9 ? "Regular" : pwForm.next.length < 12 ? "Fuerte" : "Muy fuerte"}
                  </span>
                </div>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label style={labelStyle}>Confirmar nueva contraseña</label>
              <div className="relative">
                <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input
                  type={showPw.confirm ? "text" : "password"}
                  placeholder="Repite la nueva contraseña"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                  style={{
                    ...inputStyle(!!pwForm.confirm && pwForm.confirm !== pwForm.next),
                    paddingRight: "42px",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                  onBlur={(e) => (e.target.style.borderColor = pwForm.confirm && pwForm.confirm !== pwForm.next ? "#ef4444" : "#e5e7eb")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#9ca3af" }}
                >
                  {showPw.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          {/* Errors */}
          {pwErrors.length > 0 && (
            <div className="mt-3 space-y-1">
              {pwErrors.map((err, i) => (
                <div key={i} className="flex items-center gap-2 text-xs" style={{ color: "#ef4444" }}>
                  <AlertCircle size={12} />
                  {err}
                </div>
              ))}
            </div>
          )}

          {/* Feedback */}
          {pwMsg && (
            <div
              className="flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl text-sm"
              style={{
                background: pwMsg.type === "ok" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${pwMsg.type === "ok" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                color: pwMsg.type === "ok" ? "#16a34a" : "#dc2626",
              }}
            >
              {pwMsg.type === "ok" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              {pwMsg.text}
            </div>
          )}

          {/* Save button */}
          <div className="flex justify-end mt-5">
            <button
              onClick={handlePwSave}
              disabled={!canSavePw || savingPw}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all"
              style={{
                background: canSavePw && !savingPw
                  ? "linear-gradient(135deg, #1a2f5a, #2a4a8a)"
                  : "#e5e7eb",
                color: canSavePw && !savingPw ? "#ffffff" : "#9ca3af",
                fontWeight: 600,
                cursor: canSavePw && !savingPw ? "pointer" : "not-allowed",
              }}
            >
              {savingPw ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
              {savingPw ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </div>
        </div>
      )}

      {/* ── DATABASE TAB ─────────────────────────────────────────── */}
      {activeTab === "database" && (
        <div
          className="rounded-2xl p-6 shadow-sm"
          style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
        >
          <p className="text-sm mb-1" style={{ color: "#0d1b3e", fontWeight: 600 }}>
            Gestión de Base de Datos
          </p>
          <p className="text-xs mb-5" style={{ color: "#9ca3af" }}>
            Aquí puedes gestionar la base de datos de la aplicación.
          </p>

          {/* Info tip */}
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-xl mb-5"
            style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)" }}
          >
            <Database size={14} style={{ color: "#c9a84c", marginTop: "2px", flexShrink: 0 }} />
            <p className="text-xs" style={{ color: "#a07c28" }}>
              Asegúrate de tener una copia de seguridad antes de realizar cambios en la base de datos.
            </p>
          </div>

          <DatabaseManager />
        </div>
      )}

      {/* ── UPDATES TAB ─────────────────────────────────────────── */}
      {activeTab === "updates" && (
        <div
          className="rounded-2xl p-6 shadow-sm"
          style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
        >
          <p className="text-sm mb-1" style={{ color: "#0d1b3e", fontWeight: 600 }}>
            Actualizaciones de la Aplicación
          </p>
          <p className="text-xs mb-5" style={{ color: "#9ca3af" }}>
            Aquí puedes gestionar las actualizaciones de la aplicación.
          </p>

          {/* Info tip */}
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-xl mb-5"
            style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)" }}
          >
            <Download size={14} style={{ color: "#c9a84c", marginTop: "2px", flexShrink: 0 }} />
            <p className="text-xs" style={{ color: "#a07c28" }}>
              Asegúrate de tener una copia de seguridad antes de realizar actualizaciones.
            </p>
          </div>

          <UpdateManagerComponent />
        </div>
      )}
    </div>
  );
}