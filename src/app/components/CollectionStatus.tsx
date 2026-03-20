import { useState, useEffect } from "react";
import {
  CheckCircle2, Clock, XCircle, AlertCircle, Plus, ArrowLeft,
  CreditCard, TrendingUp, TrendingDown, Search, Filter, Users,
  ChevronUp, ChevronDown, Printer, Download, FileText, FileDown,
} from "lucide-react";
import { FuneralService } from "../data/mockData";
import { loadServices, persistService, deriveStatus } from "../data/serviceStore";
import { useUser } from "../context/UserContext";
import { printServiceVoucher, printPaymentReceipt } from "../utils/printUtils";
import { exportServicesToCSV, exportPaymentsCSV } from "../utils/exportUtils";

const formatCLP = (value: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(value);

// ── Formateo de dinero con separador de miles ──
const formatMoney = (value: string): string => {
  // Limpiar todo excepto dígitos
  const clean = value.replace(/\D/g, "");
  if (!clean) return "";
  
  // Formatear con puntos cada 3 dígitos
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseMoney = (value: string): number => {
  const clean = value.replace(/\D/g, "");
  const num = parseInt(clean, 10);
  return isNaN(num) ? 0 : num;
};

const formatDate = (dateStr: string) => {
  if (dateStr === "-") return "—";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
};

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { bg: string; color: string; dot: string; icon: any }> = {
    Pagado: { bg: "#dcfce7", color: "#166534", dot: "#22c55e", icon: CheckCircle2 },
    Abonando: { bg: "#fef9c3", color: "#854d0e", dot: "#eab308", icon: Clock },
    "Deuda Total": { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444", icon: XCircle },
  };
  const c = config[status] || { bg: "#f3f4f6", color: "#374151", dot: "#9ca3af", icon: AlertCircle };
  const Icon = c.icon;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
      style={{ background: c.bg, color: c.color, fontWeight: 500 }}
    >
      <Icon size={12} />
      {status}
    </span>
  );
};

const ProgressBar = ({ paid, total }: { paid: number; total: number }) => {
  const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
  const color = pct === 100 ? "#22c55e" : pct > 30 ? "#eab308" : "#ef4444";
  return (
    <div className="w-full h-1.5 rounded-full" style={{ background: "#f0f2f5" }}>
      <div
        className="h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
};

function AddPaymentModal({
  service,
  onClose,
  onSaved,
}: {
  service: FuneralService;
  onClose: () => void;
  onSaved: (updated: FuneralService) => void;
}) {
  // Calcular si hay cuotas y cuánto falta por pagar de la próxima cuota
  const hasInstallments = service.installments?.enabled && service.installments.totalInstallments > 0;
  const baseAmount = service.installments?.baseAmount ?? 0;
  const surchargeAmount = service.installments?.surchargeAmount ?? 0;
  const paidInstallments = service.installments?.paidInstallments ?? 0;
  const totalInstallments = service.installments?.totalInstallments ?? 0;
  
  // Calcular el monto de la cuota actual según si ya pasó las 5 de gracia
  const currentInstallmentAmount = (paidInstallments < 5) ? baseAmount : (baseAmount + surchargeAmount);
  
  const remainingInstallments = hasInstallments 
    ? (totalInstallments - paidInstallments)
    : 0;

  const [amount, setAmount] = useState(hasInstallments && currentInstallmentAmount > 0 ? currentInstallmentAmount.toString() : "");
  const [method, setMethod] = useState("Efectivo");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [payFullInstallment, setPayFullInstallment] = useState(true);

  // Formatear el monto inicial si viene de cuotas
  const initialFormatted = hasInstallments && currentInstallmentAmount > 0 ? formatMoney(currentInstallmentAmount.toString()) : "";
  const [displayAmount, setDisplayAmount] = useState(initialFormatted);

  const handleSave = () => {
    const amountNum = parseInt(amount.replace(/\D/g, ""), 10);
    if (!amountNum || amountNum <= 0) return;

    const newPayment = {
      id: `${service.id}-P${service.payments.length + 1}`,
      date,
      amount: amountNum,
      method: method as "Efectivo" | "Transferencia" | "Cheque" | "Tarjeta",
      balance: Math.max(0, service.pendingBalance - amountNum),
      notes: notes || undefined,
    };

    const newTotalPaid = service.totalPaid + amountNum;
    const newPending = Math.max(0, service.pendingBalance - amountNum);

    // Actualizar cuotas pagadas si aplica
    let updatedInstallments = service.installments;
    if (hasInstallments && payFullInstallment && amountNum >= currentInstallmentAmount) {
      const installmentsPaid = Math.floor(amountNum / currentInstallmentAmount);
      updatedInstallments = {
        ...service.installments!,
        paidInstallments: Math.min(
          paidInstallments + installmentsPaid,
          totalInstallments
        ),
      };
    }

    const updated: FuneralService = {
      ...service,
      totalPaid: newTotalPaid,
      pendingBalance: newPending,
      status: deriveStatus(newTotalPaid, newPending),
      lastPaymentDate: date,
      payments: [...service.payments, newPayment],
      installments: updatedInstallments,
    };

    persistService(updated);
    onSaved(updated);
    setSaved(true);
    setTimeout(() => onClose(), 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "#ffffff" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #0d1b3e, #1a2f5a)" }}
        >
          <div className="flex items-center gap-2">
            <Plus size={16} style={{ color: "#c9a84c" }} />
            <h3 style={{ color: "#ffffff" }}>Registrar Abono</h3>
          </div>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.6)" }}>✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div
            className="rounded-xl p-3"
            style={{ background: "#f8f9fa", border: "1px solid #e5e7eb" }}
          >
            <p className="text-xs" style={{ color: "#9ca3af" }}>Cliente</p>
            <p className="text-sm" style={{ color: "#0d1b3e", fontWeight: 500 }}>{service.contractorName}</p>
            <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
              Saldo pendiente: <span style={{ color: "#dc2626", fontWeight: 600 }}>{formatCLP(service.pendingBalance)}</span>
            </p>
          </div>

          {/* Información de cuotas si están habilitadas */}
          {hasInstallments && remainingInstallments > 0 && (
            <div
              className="rounded-xl p-3"
              style={{ background: "rgba(201,168,76,0.08)", border: "1.5px solid rgba(201,168,76,0.3)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <CreditCard size={14} style={{ color: "#c9a84c" }} />
                <p className="text-xs" style={{ color: "#92400e", fontWeight: 600 }}>
                  PLAN DE CUOTAS ACTIVO
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs" style={{ color: "#6b7280" }}>Pagadas</p>
                  <p className="text-sm" style={{ color: "#16a34a", fontWeight: 700 }}>
                    {paidInstallments} / {totalInstallments}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "#6b7280" }}>Por cuota</p>
                  <p className="text-sm" style={{ color: "#0d1b3e", fontWeight: 700 }}>
                    {formatCLP(currentInstallmentAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "#6b7280" }}>Restantes</p>
                  <p className="text-sm" style={{ color: "#dc2626", fontWeight: 700 }}>
                    {remainingInstallments}
                  </p>
                </div>
              </div>
              {currentInstallmentAmount > 0 && (
                <div className="mt-3">
                  <button
                    onClick={() => {
                      setAmount(currentInstallmentAmount.toString());
                      setDisplayAmount(formatMoney(currentInstallmentAmount.toString()));
                    }}
                    className="w-full py-2 px-3 rounded-lg text-xs transition-all"
                    style={{ 
                      background: "rgba(201,168,76,0.15)", 
                      color: "#92400e",
                      border: "1px solid rgba(201,168,76,0.4)",
                      fontWeight: 600
                    }}
                  >
                    💳 Pagar 1 Cuota ({formatCLP(currentInstallmentAmount)})
                  </button>
                </div>
              )}
            </div>
          )}

          {[
            {
              label: "Fecha de Pago",
              el: (
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: "1.5px solid #e5e7eb", color: "#0d1b3e" }}
                  onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              ),
            },
            {
              label: "Monto Abonado ($)",
              el: (
                <input
                  type="text"
                  value={displayAmount}
                  onChange={(e) => {
                    const formatted = formatMoney(e.target.value);
                    setDisplayAmount(formatted);
                    setAmount(e.target.value.replace(/\D/g, ""));
                  }}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: "1.5px solid #e5e7eb", color: "#0d1b3e" }}
                  onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              ),
            },
            {
              label: "Método de Pago",
              el: (
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: "1.5px solid #e5e7eb", color: "#0d1b3e" }}
                  onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                >
                  {["Efectivo", "Transferencia", "Cheque", "Tarjeta"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              ),
            },
            {
              label: "Observaciones",
              el: (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas adicionales..."
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={{ border: "1.5px solid #e5e7eb", color: "#0d1b3e" }}
                  onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              ),
            },
          ].map(({ label, el }) => (
            <div key={label}>
              <label className="block text-xs mb-1.5" style={{ color: "#374151", fontWeight: 500 }}>{label}</label>
              {el}
            </div>
          ))}

          {saved && (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: "#dcfce7", border: "1px solid #bbf7d0" }}
            >
              <CheckCircle2 size={14} style={{ color: "#16a34a" }} />
              <span className="text-xs" style={{ color: "#166534" }}>Abono registrado exitosamente</span>
            </div>
          )}
        </div>

        <div className="px-6 pb-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm"
            style={{ background: "#f0f2f5", color: "#374151", border: "1.5px solid #e5e7eb" }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-sm shadow-md"
            style={{ background: "linear-gradient(135deg, #0d1b3e, #1a2f5a)", color: "#c9a84c" }}
          >
            Registrar Abono
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientDetail({
  service,
  onBack,
  onPaymentSaved,
}: {
  service: FuneralService;
  onBack: () => void;
  onPaymentSaved: (updated: FuneralService) => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const { role } = useUser();
  const isAdmin = role === "admin";
  const pct = service.totalService > 0 ? Math.min(100, (service.totalPaid / service.totalService) * 100) : 0;

  // Constantes saneadas para el plan de cuotas
  const baseAmount = service.installments?.baseAmount ?? 0;
  const surchargeAmount = service.installments?.surchargeAmount ?? 0;
  const paidInstallments = service.installments?.paidInstallments ?? 0;
  const totalInstallments = service.installments?.totalInstallments ?? 0;

  const methodColors: Record<string, string> = {
    Efectivo: "#16a34a",
    Transferencia: "#2563eb",
    Cheque: "#7c3aed",
    Tarjeta: "#c9a84c",
  };

  return (
    <div className="space-y-5">
      {showModal && <AddPaymentModal service={service} onClose={() => setShowModal(false)} onSaved={onPaymentSaved} />}

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: "#1a2f5a" }}
        >
          <ArrowLeft size={16} /> Volver al listado
        </button>
        {/* Action buttons top-right */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => printServiceVoucher(service)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all"
            style={{ background: "#f0f2f5", color: "#374151", border: "1px solid #e5e7eb" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#e5e7eb"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#f0f2f5"; }}
            title="Imprimir comprobante completo del servicio"
          >
            <Printer size={13} /> Comprobante
          </button>
          <button
            onClick={() => exportPaymentsCSV(service)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all"
            style={{ background: "#f0f2f5", color: "#374151", border: "1px solid #e5e7eb" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#e5e7eb"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#f0f2f5"; }}
            title="Exportar historial de pagos a Excel"
          >
            <FileDown size={13} /> Exportar Pagos
          </button>
        </div>
      </div>

      {/* Client Header */}
      <div
        className="rounded-2xl p-6 shadow-sm"
        style={{ background: "linear-gradient(135deg, #0d1b3e 0%, #1a2f5a 100%)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(201,168,76,0.2)", color: "#c9a84c" }}>
                {service.id}
              </span>
              <StatusBadge status={service.status} />
            </div>
            <h2 style={{ color: "#ffffff" }}>{service.deceasedName}</h2>
            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
              Contratante: {service.contractorName}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
              Servicio: {service.date} — {service.serviceType}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm self-start"
            style={{ background: "rgba(201,168,76,0.2)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.3)" }}
          >
            <Plus size={14} /> Registrar Abono
          </button>
        </div>

        {/* Progress */}
        <div className="mt-5">
          <div className="flex justify-between mb-2">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Progreso de pago</span>
            <span className="text-xs" style={{ color: "#c9a84c", fontWeight: 600 }}>{pct.toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${pct}%`,
                background: pct === 100 ? "#22c55e" : pct > 30 ? "linear-gradient(90deg, #c9a84c, #e8c97a)" : "#ef4444",
              }}
            />
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className={`grid grid-cols-1 ${
        (service.municipalContribution > 0 || service.mortuaryFee > 0) 
          ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" 
          : "sm:grid-cols-3"
      } gap-4`}>
        {[
          { label: "Total Servicio", value: formatCLP(service.totalService), icon: CreditCard, color: "#1a2f5a", bg: "#eff6ff" },
          ...(service.municipalContribution > 0 ? [{ label: "Aporte Municipal", value: formatCLP(service.municipalContribution), icon: CreditCard, color: "#16a34a", bg: "#dcfce7" }] : []),
          ...(service.mortuaryFee > 0 ? [{ label: "Cuota Mortuoria", value: formatCLP(service.mortuaryFee), icon: CreditCard, color: "#16a34a", bg: "#dcfce7" }] : []),
          ...(service.discount > 0 ? [{ label: "Descuento", value: formatCLP(service.discount), icon: TrendingDown, color: "#dc2626", bg: "#fee2e2" }] : []),
          { label: "Total Abonado", value: formatCLP(service.totalPaid), icon: TrendingUp, color: "#16a34a", bg: "#dcfce7" },
          { label: "Saldo Pendiente", value: formatCLP(service.pendingBalance), icon: TrendingDown, color: service.pendingBalance > 0 ? "#dc2626" : "#16a34a", bg: service.pendingBalance > 0 ? "#fee2e2" : "#dcfce7" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl p-4 shadow-sm"
            style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: item.bg }}>
                <item.icon size={15} style={{ color: item.color }} />
              </div>
              <span className="text-xs" style={{ color: "#6b7280" }}>{item.label}</span>
            </div>
            <p className="text-lg" style={{ color: item.color, fontWeight: 700 }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Installments Section */}
      {service.installments?.enabled && (
        <div
          className="rounded-2xl shadow-sm overflow-hidden"
          style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
        >
          <div 
            className="px-5 py-4" 
            style={{ 
              background: "linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.12))",
              borderBottom: "1px solid rgba(201,168,76,0.2)" 
            }}
          >
            <div className="flex items-center gap-2">
              <CreditCard size={16} style={{ color: "#c9a84c" }} />
              <h3 style={{ color: "#0d1b3e" }}>Plan de Cuotas</h3>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
              Pago financiado en {service.installments.totalInstallments} cuotas
            </p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 rounded-xl" style={{ background: "#f8f9fa" }}>
                <p className="text-xs mb-1" style={{ color: "#6b7280" }}>Total Cuotas</p>
                <p className="text-xl" style={{ color: "#0d1b3e", fontWeight: 700 }}>
                  {totalInstallments}
                </p>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ background: "#dcfce7" }}>
                <p className="text-xs mb-1" style={{ color: "#6b7280" }}>Pagadas</p>
                <p className="text-xl" style={{ color: "#16a34a", fontWeight: 700 }}>
                  {paidInstallments}
                </p>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ background: "#fee2e2" }}>
                <p className="text-xs mb-1" style={{ color: "#6b7280" }}>Pendientes</p>
                <p className="text-xl" style={{ color: "#dc2626", fontWeight: 700 }}>
                  {totalInstallments - paidInstallments}
                </p>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ background: "rgba(201,168,76,0.1)" }}>
                <p className="text-xs mb-1" style={{ color: "#6b7280" }}>Próxima Cuota</p>
                <p className="text-lg" style={{ color: "#c9a84c", fontWeight: 700 }}>
                  {formatCLP(paidInstallments < 5 ? baseAmount : (baseAmount + surchargeAmount))}
                </p>
              </div>
            </div>
            
            {/* Progress bar de cuotas */}
            <div className="mb-2">
              <div className="flex justify-between mb-2">
                <span className="text-xs" style={{ color: "#6b7280" }}>Progreso del Plan</span>
                <span className="text-xs" style={{ color: "#c9a84c", fontWeight: 600 }}>
                  {paidInstallments} / {totalInstallments}
                </span>
              </div>
              <div className="h-2 rounded-full" style={{ background: "#f0f2f5" }}>
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0}%`,
                    background: "linear-gradient(90deg, #c9a84c, #e8c97a)",
                  }}
                />
              </div>
            </div>

            {paidInstallments < totalInstallments && (
              <div
                className="mt-4 p-3 rounded-xl flex items-center justify-between"
                style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}
              >
                <div>
                  <p className="text-xs" style={{ color: "#6b7280" }}>Próxima cuota</p>
                  <p className="text-sm" style={{ color: "#0d1b3e", fontWeight: 600 }}>
                    {formatCLP(paidInstallments < 5 ? baseAmount : (baseAmount + surchargeAmount))}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                  style={{ background: "#c9a84c", color: "#ffffff", fontWeight: 600 }}
                >
                  <Plus size={12} /> Pagar Cuota
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div
        className="rounded-2xl shadow-sm overflow-hidden"
        style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
      >
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f0f2f5" }}>
          <div>
            <div className="flex items-center gap-2">
              <Clock size={16} style={{ color: "#1a2f5a" }} />
              <h3 style={{ color: "#0d1b3e" }}>Historial de Pagos</h3>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
              {service.payments.length} transacciones registradas
            </p>
          </div>
        </div>

        {service.payments.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#fee2e2" }}>
              <AlertCircle size={20} style={{ color: "#ef4444" }} />
            </div>
            <p className="text-sm" style={{ color: "#6b7280" }}>Sin pagos registrados</p>
            <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>El contratante no ha realizado ningún abono</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-xs mx-auto"
              style={{ background: "#0d1b3e", color: "#c9a84c" }}
            >
              <Plus size={12} /> Registrar primer abono
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  {["#", "Fecha", "Monto Abonado", "Método de Pago", "Saldo Restante", "Notas", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs" style={{ color: "#6b7280", fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {service.payments.map((payment, idx) => (
                  <tr
                    key={payment.id}
                    style={{ borderTop: "1px solid #f0f2f5" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-4 py-3 text-xs" style={{ color: "#9ca3af" }}>{idx + 1}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#374151" }}>{formatDate(payment.date)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "#dcfce7", color: "#166534", fontWeight: 600 }}>
                        + {formatCLP(payment.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs px-2 py-1 rounded-lg"
                        style={{
                          background: `${methodColors[payment.method] || "#374151"}18`,
                          color: methodColors[payment.method] || "#374151",
                          fontWeight: 500,
                        }}
                      >
                        {payment.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: payment.balance > 0 ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
                      {formatCLP(payment.balance)}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#9ca3af" }}>
                      {payment.notes || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => printPaymentReceipt(service, payment, idx + 1)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all"
                        style={{ background: "#f0f2f5", color: "#374151", border: "1px solid #e5e7eb", whiteSpace: "nowrap" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#0d1b3e"; e.currentTarget.style.color = "#c9a84c"; e.currentTarget.style.borderColor = "#0d1b3e"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#f0f2f5"; e.currentTarget.style.color = "#374151"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
                        title="Imprimir recibo de este abono"
                      >
                        <Printer size={11} /> Recibo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Datos del Fallecido e Información del Servicio */}
      <div
        className="rounded-2xl p-5 shadow-sm"
        style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#f0f2f5" }}>
            <Users size={15} style={{ color: "#1a2f5a" }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: "#0d1b3e" }}>Datos del Fallecido e Información del Servicio</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            ["Nombre Completo", service.deceasedName],
            ["RUT", service.deceasedRut],
            ["Fecha de Servicio", formatDate(service.date)],
            ["Cementerio", service.cemetery],
            ["Tipo de Servicio", service.serviceType],
            ["Traslado desde", service.transferFrom],
            ["N° Factura 1", service.invoice1],
            ["N° Factura 2", service.invoice2],
            ["N° Factura 3", service.invoice3],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl p-3" style={{ background: "#f8f9fa" }}>
              <p className="text-xs" style={{ color: "#9ca3af" }}>{label}</p>
              <p className="text-sm mt-0.5" style={{ color: "#0d1b3e", fontWeight: 500 }}>{value || "—"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Datos del Contratante */}
      <div
        className="rounded-2xl p-5 shadow-sm"
        style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#eff6ff" }}>
            <Users size={15} style={{ color: "#2563eb" }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: "#0d1b3e" }}>Datos del Contratante</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            ["Nombre del Contratante", service.contractorName],
            ["RUT del Contratante", service.contractorRut],
            ["Teléfono de Contacto", service.contractorPhone],
            ["Correo Electrónico", service.contractorEmail],
            ["Dirección Particular", service.contractorAddress],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl p-3" style={{ background: "#f8f9fa" }}>
              <p className="text-xs" style={{ color: "#9ca3af" }}>{label}</p>
              <p className="text-sm mt-0.5" style={{ color: "#0d1b3e", fontWeight: 500 }}>{value || "—"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Otros Créditos y Descuentos (Solo si existen) */}
      {(service.municipalContribution > 0 || service.mortuaryFee > 0 || service.discount > 0) && (
        <div
          className="rounded-2xl p-5 shadow-sm"
          style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
        >
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "#0d1b3e" }}>Créditos y Aportes Aplicados</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {service.municipalContribution > 0 && (
              <div className="rounded-xl p-3" style={{ background: "#f8f9fa" }}>
                <p className="text-xs" style={{ color: "#9ca3af" }}>Aporte Municipal</p>
                <p className="text-sm mt-0.5 font-bold" style={{ color: "#16a34a" }}>{formatCLP(service.municipalContribution)}</p>
              </div>
            )}
            {service.mortuaryFee > 0 && (
              <div className="rounded-xl p-3" style={{ background: "#f8f9fa" }}>
                <p className="text-xs" style={{ color: "#9ca3af" }}>Cuota Mortuoria</p>
                <p className="text-sm mt-0.5 font-bold" style={{ color: "#16a34a" }}>{formatCLP(service.mortuaryFee)}</p>
              </div>
            )}
            {service.discount > 0 && (
              <div className="rounded-xl p-3" style={{ background: "#f8f9fa" }}>
                <p className="text-xs" style={{ color: "#9ca3af" }}>Descuento Aplicado</p>
                <p className="text-sm mt-0.5 font-bold" style={{ color: "#dc2626" }}>{formatCLP(service.discount)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function CollectionStatus() {
  const [services, setServices] = useState<FuneralService[]>([]);
  const [selectedService, setSelectedService] = useState<FuneralService | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");
  const [sortField, setSortField] = useState<string>("date");
  const [sortAsc, setSortAsc] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setServices(loadServices());
  }, []);

  const handleServiceUpdated = (updated: FuneralService) => {
    const refreshed = loadServices();
    setServices(refreshed);
    setSelectedService(updated);
  };

  const totalRecaudado = services.reduce((s, c) => s + c.totalPaid, 0);
  const totalDeuda = services.reduce((s, c) => s + c.pendingBalance, 0);

  const filtered = services
    .filter((s) => {
      const q = search.toLowerCase();
      const matchSearch =
        s.deceasedName.toLowerCase().includes(q) ||
        s.contractorName.toLowerCase().includes(q) ||
        s.contractorRut.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q);
      const matchStatus = 
        statusFilter === "Todos" || 
        (statusFilter === "Deudores" && s.pendingBalance > 0) ||
        s.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let va: any, vb: any;
      if (sortField === "date") { va = a.date; vb = b.date; }
      else if (sortField === "total") { va = a.totalService; vb = b.totalService; }
      else if (sortField === "balance") { va = a.pendingBalance; vb = b.pendingBalance; }
      else { va = a.status; vb = b.status; }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });

  const toggleSort = (field: string) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const SortIcon = ({ field }: { field: string }) =>
    sortField === field ? (
      sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />
    ) : null;

  if (selectedService) {
    return (
      <ClientDetail
        service={selectedService}
        onBack={() => setSelectedService(null)}
        onPaymentSaved={handleServiceUpdated}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Recaudado", value: formatCLP(totalRecaudado), color: "#16a34a", bg: "#dcfce7", icon: TrendingUp, filter: "Todos" },
          { label: "Deuda Pendiente", value: formatCLP(totalDeuda), color: "#dc2626", bg: "#fee2e2", icon: TrendingDown, filter: "Deudores" },
          {
            label: "Cuentas Pagadas",
            value: services.filter((s) => s.status === "Pagado").length.toString(),
            color: "#16a34a", bg: "#dcfce7", icon: CheckCircle2,
            filter: "Pagado"
          },
          {
            label: "Con Deuda",
            value: services.filter((s) => s.status !== "Pagado").length.toString(),
            color: "#dc2626", bg: "#fee2e2", icon: AlertCircle,
            filter: "Deudores"
          },
        ].map((card) => (
          <div
            key={card.label}
            onClick={() => card.filter && setStatusFilter(card.filter)}
            className={`rounded-2xl p-4 shadow-sm transition-all ${card.filter ? "cursor-pointer hover:scale-[1.02] active:scale-95" : ""}`}
            style={{ 
              background: "#ffffff", 
              border: `1px solid ${statusFilter === card.filter ? card.color : "#e5e7eb"}`,
              boxShadow: statusFilter === card.filter ? `0 0 0 1px ${card.color}10` : ""
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: card.bg }}>
                <card.icon size={15} style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-xs" style={{ color: "#6b7280" }}>{card.label}</p>
            <p className="text-base mt-0.5" style={{ color: card.color, fontWeight: 700 }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        className="rounded-2xl p-4 shadow-sm"
        style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
            <input
              type="text"
              placeholder="Buscar por nombre, RUT o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ border: "1.5px solid #e5e7eb", color: "#374151" }}
              onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} style={{ color: "#9ca3af" }} />
            {["Todos", "Deudores", "Pagado", "Abonando", "Deuda Total"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className="px-3 py-2 rounded-xl text-xs transition-all"
                style={{
                  background:
                    statusFilter === status
                      ? status === "Pagado"
                        ? "#dcfce7"
                        : status === "Abonando"
                        ? "#fef9c3"
                        : status === "Deuda Total" || status === "Deudores"
                        ? "#fee2e2"
                        : "#0d1b3e"
                      : "#f0f2f5",
                  color:
                    statusFilter === status
                      ? status === "Pagado"
                        ? "#166534"
                        : status === "Abonando"
                        ? "#854d0e"
                        : status === "Deuda Total" || status === "Deudores"
                        ? "#991b1b"
                        : "#c9a84c"
                      : "#6b7280",
                  border: "1.5px solid transparent",
                  fontWeight: statusFilter === status ? 600 : 400,
                }}
              >
                {status === "Deudores" ? "📌 Deudores" : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl shadow-sm overflow-hidden"
        style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
      >
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f0f2f5" }}>
          <div className="flex items-center gap-2">
            <Users size={16} style={{ color: "#1a2f5a" }} />
            <h3 style={{ color: "#0d1b3e" }}>Clientes Activos</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#f0f2f5", color: "#6b7280" }}>
              {filtered.length} registros
            </span>
            <button
              onClick={() => exportServicesToCSV(filtered)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all"
              style={{ background: "#0d1b3e", color: "#c9a84c", border: "1px solid #0d1b3e" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#1a2f5a"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#0d1b3e"; }}
              title="Exportar tabla a Excel (CSV)"
            >
              <Download size={12} /> Exportar Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#f8f9fa" }}>
                {[
                  { label: "Código", field: "" },
                  { label: "Fallecido", field: "" },
                  { label: "Contratante", field: "" },
                  { label: "Total Serv.", field: "total" },
                  { label: "Total Abon.", field: "" },
                  { label: "Cuota Mort.", field: "" },
                  { label: "Saldo Pend.", field: "balance" },
                  { label: "Estado", field: "status" },
                  { label: "Último Pago", field: "date" },
                  { label: "", field: "" },
                ].map(({ label, field }) => (
                  <th
                    key={label}
                    className="px-4 py-3 text-left text-xs"
                    style={{ color: "#6b7280", fontWeight: 600, cursor: field ? "pointer" : "default" }}
                    onClick={() => field && toggleSort(field)}
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      {field && <SortIcon field={field} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((service) => (
                <tr
                  key={service.id}
                  className="cursor-pointer transition-colors"
                  style={{ borderTop: "1px solid #f0f2f5" }}
                  onClick={() => setSelectedService(service)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: "#f0f2f5", color: "#374151", fontWeight: 500 }}>
                      {service.id}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs" style={{ color: "#0d1b3e", fontWeight: 500 }}>
                      {service.deceasedName.split(" ").slice(0, 3).join(" ")}
                    </p>
                    <p className="text-xs" style={{ color: "#9ca3af" }}>{service.date}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs" style={{ color: "#374151" }}>{service.contractorName.split(" ").slice(0, 2).join(" ")}</p>
                    <p className="text-xs" style={{ color: "#9ca3af" }}>{service.contractorRut}</p>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#0d1b3e", fontWeight: 500 }}>
                    {formatCLP(service.totalService)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs mb-1" style={{ color: "#16a34a", fontWeight: 500 }}>{formatCLP(service.totalPaid)}</p>
                    <ProgressBar paid={service.totalPaid} total={service.totalService} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: service.mortuaryFee > 0 ? "#16a34a" : "#9ca3af", fontWeight: service.mortuaryFee > 0 ? 600 : 400 }}>
                      {service.mortuaryFee > 0 ? formatCLP(service.mortuaryFee) : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: service.pendingBalance > 0 ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
                    {formatCLP(service.pendingBalance)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={service.status} />
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#6b7280" }}>
                    {formatDate(service.lastPaymentDate)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="text-xs px-2.5 py-1 rounded-lg transition-all"
                      style={{ background: "#f0f2f5", color: "#1a2f5a" }}
                      onClick={(e) => { e.stopPropagation(); setSelectedService(service); }}
                    >
                      Ver →
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-xs" style={{ color: "#9ca3af" }}>
                    No se encontraron resultados para la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="px-5 py-3 flex items-center gap-4 flex-wrap" style={{ borderTop: "1px solid #f0f2f5", background: "#fafbfc" }}>
          <p className="text-xs" style={{ color: "#9ca3af" }}>Estado de cuentas:</p>
          {[
            { label: "Pagado", bg: "#dcfce7", color: "#166534", dot: "#22c55e" },
            { label: "Abonando", bg: "#fef9c3", color: "#854d0e", dot: "#eab308" },
            { label: "Deuda Total", bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: s.dot }} />
              <span className="text-xs" style={{ color: "#6b7280" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}