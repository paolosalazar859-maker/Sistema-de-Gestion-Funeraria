import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Users,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  LogOut,
  Settings,
  UserCircle,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { recalculateAllStatuses, loadServices } from "../data/serviceStore";
import { loadCompanyProfile, CompanyProfile } from "../data/companyStore";

const ALL_NAV = [
  { path: "/",         label: "Dashboard",           icon: LayoutDashboard, roles: ["admin"] },
  { path: "/registro", label: "Registro de Servicio", icon: FileText,        roles: ["admin", "oficina"] },
  { path: "/cobros",   label: "Estado de Cobros",     icon: CreditCard,      roles: ["admin", "oficina"] },
  { path: "/clientes", label: "Clientes",             icon: Users,           roles: ["admin"] },
  { path: "/gastos",   label: "Gastos",               icon: Wallet,          roles: ["admin"] },
  { path: "/perfil",   label: "Mi Perfil",            icon: Settings,        roles: ["admin"] },
];

const ROLE_LABEL: Record<string, string> = {
  admin:   "Administrador",
  oficina: "Oficina",
};
const ROLE_INITIALS: Record<string, string> = {
  admin:   "AD",
  oficina: "OF",
};
const ROLE_ICON: Record<string, any> = {
  admin:   ShieldCheck,
  oficina: Briefcase,
};
const ROLE_COLOR: Record<string, { bg: string; text: string }> = {
  admin:   { bg: "linear-gradient(135deg, #c9a84c, #e8c97a)", text: "#0d1b3e" },
  oficina: { bg: "rgba(255,255,255,0.15)",                    text: "#ffffff" },
};

export function Layout({ children }: { children: React.ReactNode }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { role, logout, adminProfile } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [company, setCompany] = useState<CompanyProfile>(loadCompanyProfile());

  useEffect(() => {
    const handleProfileChange = () => setCompany(loadCompanyProfile());
    window.addEventListener("companyProfileChanged", handleProfileChange);
    return () => window.removeEventListener("companyProfileChanged", handleProfileChange);
  }, []);

  const navItems = ALL_NAV.filter((n) => n.roles.includes(role ?? ""));
  const currentPage = ALL_NAV.find((item) => item.path === location.pathname);

  const RoleIcon = role ? ROLE_ICON[role] : ShieldCheck;
  const roleColors = role ? ROLE_COLOR[role] : ROLE_COLOR.admin;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleRecalculate = () => {
    setRecalculating(true);
    setTimeout(() => {
      recalculateAllStatuses();
      setRecalculating(false);
      // Recargar la página actual para ver los cambios
      window.location.reload();
    }, 500);
  };

  // ── Sidebar content (shared between desktop & mobile) ──────────────────────
  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md overflow-hidden"
            style={{ background: company.logoBase64 ? "transparent" : "linear-gradient(135deg, #c9a84c, #e8c97a)" }}
          >
            {company.logoBase64 ? (
              <img src={company.logoBase64} alt="Company Logo" className="w-full h-full object-contain" />
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 7v10l8 5 8-5V7L12 2z" fill="white" fillOpacity="0.9" />
                <path d="M12 6v12M8 8l4-2 4 2" stroke="rgba(12,27,62,0.6)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold truncate max-w-[150px]" style={{ color: "rgba(255,255,255,0.95)", letterSpacing: "0.03em" }}>
              {company.name}
            </p>
          </div>
        </div>
      </div>

      {/* Active user chip */}
      <div className="px-4 pt-5 pb-2">
        {role === "admin" ? (
          <Link
            to="/perfil"
            onClick={() => mobile && setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.12)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.3)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: roleColors.bg }}
            >
              <RoleIcon size={15} style={{ color: roleColors.text }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs truncate" style={{ color: "#ffffff", fontWeight: 600 }}>
                {adminProfile.name || ROLE_LABEL[role]}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                Acceso completo
              </p>
            </div>
            <Settings size={13} style={{ color: "rgba(201,168,76,0.6)", flexShrink: 0 }} />
          </Link>
        ) : (
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: roleColors.bg }}
            >
              <RoleIcon size={15} style={{ color: roleColors.text }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs truncate" style={{ color: "#ffffff", fontWeight: 600 }}>
                {ROLE_LABEL["oficina"]}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                Acceso completo
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        <p className="px-3 mb-3 text-xs" style={{ color: "rgba(201,168,76,0.7)", letterSpacing: "0.12em" }}>
          MENÚ
        </p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => mobile && setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200"
              style={{
                background: isActive
                  ? "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.1))"
                  : "transparent",
                borderLeft: isActive ? "3px solid #c9a84c" : "3px solid transparent",
              }}
            >
              <item.icon size={18} style={{ color: isActive ? "#c9a84c" : "rgba(255,255,255,0.55)" }} />
              <span
                className="text-sm"
                style={{
                  color: isActive ? "#ffffff" : "rgba(255,255,255,0.55)",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {item.label}
              </span>
              {isActive && <ChevronRight size={14} style={{ color: "#c9a84c", marginLeft: "auto" }} />}
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="px-4 pb-4">
        {!confirmLogout ? (
          <button
            onClick={() => setConfirmLogout(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.45)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.12)";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
              e.currentTarget.style.color = "#fca5a5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "rgba(255,255,255,0.45)";
            }}
          >
            <LogOut size={15} />
            <span className="text-xs">Cerrar sesión</span>
          </button>
        ) : (
          <div
            className="rounded-xl p-3"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <p className="text-xs mb-2.5 text-center" style={{ color: "#fca5a5" }}>
              ¿Seguro que quieres salir?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmLogout(false)}
                className="flex-1 py-1.5 rounded-lg text-xs transition-all"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-1.5 rounded-lg text-xs transition-all"
                style={{ background: "rgba(239,68,68,0.5)", color: "#ffffff", fontWeight: 600 }}
              >
                Salir
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.2)" }}>
          © 2026 — v2.1.0
        </p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "#f0f2f5" }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 min-h-screen shadow-xl"
        style={{ background: "linear-gradient(180deg, #0d1b3e 0%, #1a2f5a 50%, #0d1b3e 100%)" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="w-72 h-full flex flex-col shadow-2xl"
            style={{ background: "linear-gradient(180deg, #0d1b3e 0%, #1a2f5a 50%, #0d1b3e 100%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              <X size={18} />
            </button>
            <SidebarContent mobile />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header
          className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm"
          style={{ background: "#ffffff", borderBottom: "1px solid #e5e7eb" }}
        >
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 rounded-lg transition-colors"
              style={{ color: "#1a2f5a" }}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs truncate max-w-[150px] sm:max-w-none" style={{ color: "#9ca3af" }}>{company.subtitle}</span>
                <ChevronRight size={12} style={{ color: "#9ca3af" }} />
                <span className="text-xs" style={{ color: "#1a2f5a" }}>
                  {currentPage?.label || "Dashboard"}
                </span>
              </div>
              <h1 className="text-base" style={{ color: "#0d1b3e" }}>
                {currentPage?.label || "Dashboard"}
              </h1>
            </div>
          </div>

          {/* User badge */}
          <div className="flex items-center gap-3">
            {/* Botón recalcular (todos los roles autorizados) */}
            {(role === "admin" || role === "oficina") && (
              <button
                onClick={handleRecalculate}
                disabled={recalculating}
                className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200"
                style={{ 
                  background: recalculating ? "#e5e7eb" : "#f0f2f5",
                  cursor: recalculating ? "not-allowed" : "pointer",
                  opacity: recalculating ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!recalculating) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.15)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!recalculating) {
                    (e.currentTarget as HTMLElement).style.background = "#f0f2f5";
                  }
                }}
                title="Recalcular estados de pago"
              >
                <RefreshCw 
                  size={14} 
                  style={{ 
                    color: "#c9a84c",
                    animation: recalculating ? "spin 1s linear infinite" : "none",
                  }} 
                />
                <span className="text-xs hidden md:block" style={{ color: "#374151", fontWeight: 500 }}>
                  {recalculating ? "Recalculando..." : "Recalcular"}
                </span>
              </button>
            )}
            
            {role === "admin" ? (
              <Link
                to="/perfil"
                className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200"
                style={{ background: "#f0f2f5" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#f0f2f5";
                }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                  style={{ background: roleColors.bg, color: roleColors.text, fontWeight: 700 }}
                >
                  {adminProfile.name
                    ? adminProfile.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
                    : "AD"}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs leading-tight" style={{ color: "#374151", fontWeight: 500 }}>
                    {adminProfile.name || "Administrador"}
                  </p>
                  <p className="text-xs leading-tight" style={{ color: "#9ca3af" }}>Mi perfil</p>
                </div>
                <UserCircle size={13} style={{ color: "#c9a84c" }} />
              </Link>
            ) : (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "#f0f2f5" }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                  style={{ background: roleColors.bg, color: roleColors.text, fontWeight: 700 }}
                >
                  OF
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs leading-tight" style={{ color: "#374151", fontWeight: 500 }}>
                    Oficina
                  </p>
                  <p className="text-xs leading-tight" style={{ color: "#9ca3af" }}>Acceso completo</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}