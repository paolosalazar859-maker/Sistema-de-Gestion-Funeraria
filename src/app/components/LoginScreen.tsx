import { useState } from "react";
import { ShieldCheck, Briefcase, Eye, EyeOff, AlertCircle, Lock, Loader2 } from "lucide-react";
import { useUser, UserRole } from "../context/UserContext";

export function LoginScreen() {
  const { login, verifyAdminPassword } = useUser();
  const [selecting, setSelecting] = useState<UserRole | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSelectAdmin = () => {
    setSelecting("admin");
    setPassword("");
    setError("");
  };

  const handleSelectOficina = () => {
    login("oficina");
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || verifying) return;
    setVerifying(true);
    setError("");
    try {
      const valid = await verifyAdminPassword(password);
      if (valid) {
        login("admin");
      } else {
        setError("Contraseña incorrecta. Inténtalo de nuevo.");
        setPassword("");
        triggerShake();
      }
    } catch (err) {
      setError("Error de conexión. Inténtalo de nuevo.");
      triggerShake();
    } finally {
      setVerifying(false);
    }
  };

  const handleBack = () => {
    setSelecting(null);
    setPassword("");
    setError("");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "linear-gradient(160deg, #07102b 0%, #0d1b3e 40%, #142240 70%, #1a2f5a 100%)" }}
    >
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5"
          style={{ background: "#c9a84c", filter: "blur(80px)", transform: "translate(30%, -30%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-5"
          style={{ background: "#c9a84c", filter: "blur(80px)", transform: "translate(-30%, 30%)" }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="mx-auto mb-5 flex items-center justify-center">
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: "drop-shadow(0 4px 24px rgba(201,168,76,0.4))" }}
            >
              <circle cx="60" cy="60" r="58" stroke="url(#goldGrad)" strokeWidth="2" fill="rgba(13,27,62,0.6)" />
              <circle cx="60" cy="60" r="50" stroke="rgba(201,168,76,0.2)" strokeWidth="1" fill="none" />
              <text
                x="60"
                y="70"
                textAnchor="middle"
                fontSize="36"
                fontWeight="700"
                fontFamily="Georgia, serif"
                letterSpacing="4"
                fill="url(#goldGrad)"
              >
                A
              </text>
              <path d="M30 85 Q60 90 90 85" stroke="url(#goldGrad)" strokeWidth="1" fill="none" opacity="0.5" />
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c9a84c" />
                  <stop offset="50%" stopColor="#e8c97a" />
                  <stop offset="100%" stopColor="#c9a84c" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-2xl" style={{ color: "rgba(201,168,76,0.8)", letterSpacing: "0.1em", fontWeight: 700 }}>
            Funeraria AURA
          </h1>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(20px)",
          }}
        >
          {!selecting ? (
            /* ── Profile selection ── */
            <>
              <div className="text-center mb-7">
                <p className="text-base" style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                  Selecciona tu perfil de acceso
                </p>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Elige el usuario con el que deseas ingresar al sistema
                </p>
              </div>

              <div className="space-y-3">
                {/* Admin card */}
                <button
                  onClick={handleSelectAdmin}
                  className="w-full rounded-xl p-5 text-left transition-all duration-200 group"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1.5px solid rgba(201,168,76,0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(201,168,76,0.1)";
                    e.currentTarget.style.borderColor = "rgba(201,168,76,0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)";
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "linear-gradient(135deg, #c9a84c, #e8c97a)" }}
                    >
                      <ShieldCheck size={22} style={{ color: "#0d1b3e" }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm" style={{ color: "#ffffff", fontWeight: 600 }}>
                          Administrador
                        </p>
                      </div>
                    </div>
                    <Lock size={15} style={{ color: "rgba(201,168,76,0.5)" }} />
                  </div>
                </button>

                {/* Oficina card */}
                <button
                  onClick={handleSelectOficina}
                  className="w-full rounded-xl p-5 text-left transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1.5px solid rgba(255,255,255,0.12)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(255,255,255,0.12)" }}
                    >
                      <Briefcase size={22} style={{ color: "rgba(255,255,255,0.7)" }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm" style={{ color: "#ffffff", fontWeight: 600 }}>
                          Oficina
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </>
          ) : (
            /* ── Admin password form ── */
            <form onSubmit={handleAdminSubmit}>
              <div className="flex items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
                >
                  ← Volver
                </button>
                <div>
                  <p className="text-sm" style={{ color: "#ffffff", fontWeight: 600 }}>
                    Acceso Administrador
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Ingresa tu contraseña para continuar
                  </p>
                </div>
              </div>

              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: "linear-gradient(135deg, #c9a84c, #e8c97a)" }}
                >
                  <ShieldCheck size={28} style={{ color: "#0d1b3e" }} />
                </div>
              </div>

              {/* Password input */}
              <div
                className="relative mb-4"
                style={{ animation: shake ? "shake 0.4s ease-in-out" : "none" }}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  autoFocus
                  disabled={verifying}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: error ? "1.5px solid #ef4444" : "1.5px solid rgba(255,255,255,0.15)",
                    color: "#ffffff",
                    letterSpacing: showPassword ? "normal" : "0.15em",
                    opacity: verifying ? 0.7 : 1,
                  }}
                  onFocus={(e) => {
                    if (!error) e.target.style.borderColor = "rgba(201,168,76,0.6)";
                  }}
                  onBlur={(e) => {
                    if (!error) e.target.style.borderColor = "rgba(255,255,255,0.15)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Error message */}
              {error && (
                <div
                  className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg text-xs"
                  style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}
                >
                  <AlertCircle size={13} />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={password.length === 0 || verifying}
                className="w-full py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: password.length > 0 && !verifying
                    ? "linear-gradient(135deg, #c9a84c, #e8c97a)"
                    : "rgba(201,168,76,0.3)",
                  color: password.length > 0 && !verifying ? "#0d1b3e" : "rgba(201,168,76,0.5)",
                  fontWeight: 600,
                  cursor: password.length > 0 && !verifying ? "pointer" : "not-allowed",
                }}
              >
                {verifying ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Ingresar al sistema"
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.2)" }}>
          © 2026 — Sistema de Gestión Funeraria v2.1.0
        </p>
      </div>

      {/* Shake keyframe */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}