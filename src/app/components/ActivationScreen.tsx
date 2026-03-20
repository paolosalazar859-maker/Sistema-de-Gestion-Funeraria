import React, { useState } from "react";
import { KeyRound, Loader2, AlertCircle } from "lucide-react";
import { licenseService } from "../services/licenseService";
import { saveLicenseToken, LicenseToken } from "../data/licenseStore";

interface ActivationScreenProps {
  onActivated: (token: LicenseToken) => void;
}

export default function ActivationScreen({ onActivated }: ActivationScreenProps) {
  const [serial, setSerial] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serial.trim()) {
      setError("Por favor, ingresa una clave de producto.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await licenseService.activateLicense(serial.trim());
      saveLicenseToken(token);
      onActivated(token);
    } catch (err: any) {
      setError(err.message || "Error desconocido al activar la licencia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[#0c1322] overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{ background: "#c9a84c", filter: "blur(100px)", transform: "translate(30%, -30%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{ background: "#c9a84c", filter: "blur(100px)", transform: "translate(-30%, 30%)" }}
        />
      </div>

      <div className="w-full max-w-md relative z-10 px-6">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center mb-6">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
              style={{ background: "linear-gradient(135deg, #132240, #0d1b3e)", border: "1px solid rgba(201,168,76,0.2)" }}
            >
              <KeyRound size={36} style={{ color: "#c9a84c" }} />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: "rgba(255,255,255,0.9)", letterSpacing: "0.02em" }}>
            Activación del Software
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            Por favor, ingresa la Clave de Producto (Serial Key) que se te ha proporcionado para desbloquear el sistema.
          </p>
        </div>

        <div className="rounded-3xl p-8 backdrop-blur-xl shadow-2xl" style={{ background: "rgba(19,34,64,0.4)", border: "1px solid rgba(201,168,76,0.15)" }}>
          <form onSubmit={handleActivate} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.6)" }}>
                Clave de Producto
              </label>
              <input
                type="text"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="w-full h-12 bg-black/20 border text-center text-lg font-mono tracking-widest rounded-xl outline-none focus:ring-2 transition-all text-white placeholder:text-white/20"
                style={{ borderColor: "rgba(201,168,76,0.3)" }}
                onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                onBlur={(e) => e.target.style.borderColor = "rgba(201,168,76,0.3)"}
              />
            </div>

            {error && (
              <div className="flex items-start gap-3 p-3 rounded-lg text-sm bg-red-500/10 border border-red-500/20 text-red-400">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !serial.trim()}
              className="mt-2 w-full h-12 rounded-xl flex items-center justify-center gap-2 font-medium text-white shadow-lg transition-all"
              style={{
                background: "linear-gradient(135deg, #c9a84c, #e8c97a)",
                textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                opacity: (loading || !serial.trim()) ? 0.6 : 1,
              }}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : "Activar Licencia"}
            </button>
          </form>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            Esta aplicación requiere internet en el momento de la activación. Luego podrá funcionar offline.
          </p>
        </div>
      </div>
    </div>
  );
}
