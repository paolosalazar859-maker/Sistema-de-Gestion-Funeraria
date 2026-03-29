import { loadServices, persistService, setLocalCache, deriveStatus, deleteService } from "../data/serviceStore";
import { useState, useEffect } from "react";
import {
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  Filter,
  Trash2,
  Pencil,
  AlertTriangle,
  X,
} from "lucide-react";
import { FuneralService } from "../data/mockData";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCLP = (v: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(v);

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

const formatDate = (s: string) => {
  if (!s || s === "-") return "—";
  const parts = s.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return s;
};

// Aggregate all services that share the same contractorRut into a "client"
interface Client {
  rut: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  services: FuneralService[];
  totalPaid: number;
  totalPending: number;
  totalServices: number;
  upToDate: boolean;
  lastServiceDate: string;
}

function buildClients(services: FuneralService[]): Client[] {
  const map: Record<string, Client> = {};
  const activeServices = services.filter(s => !s.isDeleted);
  for (const s of activeServices) {
    const key = s.contractorRut || s.contractorName;
    if (!map[key]) {
      map[key] = {
        rut: s.contractorRut,
        name: s.contractorName,
        phone: s.contractorPhone,
        email: s.contractorEmail,
        address: s.contractorAddress,
        services: [],
        totalPaid: 0,
        totalPending: 0,
        totalServices: 0,
        upToDate: true,
        lastServiceDate: s.date,
      };
    }
    const c = map[key];
    c.services.push(s);
    c.totalPaid += s.totalPaid;
    c.totalPending += s.pendingBalance;
    c.totalServices += 1;
    if (s.pendingBalance > 0) c.upToDate = false;
    if (s.date > c.lastServiceDate) c.lastServiceDate = s.date;
  }
  return Object.values(map).sort((a, b) =>
    b.lastServiceDate.localeCompare(a.lastServiceDate)
  );
}

// ─── Status Badges ────────────────────────────────────────────────────────────

const PaymentStatusBadge = ({ upToDate }: { upToDate: boolean }) => (
  <span
    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
    style={{
      background: upToDate ? "#dcfce7" : "#fee2e2",
      color: upToDate ? "#166534" : "#991b1b",
      fontWeight: 500,
    }}
  >
    {upToDate ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
    {upToDate ? "Al día" : "Con deuda"}
  </span>
);

const ServiceStatusBadge = ({ status }: { status: string }) => {
  const cfg: Record<string, { bg: string; color: string; icon: any }> = {
    Pagado: { bg: "#dcfce7", color: "#166534", icon: CheckCircle2 },
    Abonando: { bg: "#fef9c3", color: "#854d0e", icon: Clock },
    "Deuda Total": { bg: "#fee2e2", color: "#991b1b", icon: XCircle },
  };
  const c = cfg[status] || { bg: "#f3f4f6", color: "#374151", icon: AlertCircle };
  const Icon = c.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs"
      style={{ background: c.bg, color: c.color, fontWeight: 500 }}
    >
      <Icon size={10} />
      {status}
    </span>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteConfirmModal({
  title,
  description,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "#ffffff" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start gap-4">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "#fee2e2" }}
          >
            <AlertTriangle size={20} style={{ color: "#dc2626" }} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm" style={{ color: "#0d1b3e", fontWeight: 600 }}>
              {title}
            </h3>
            <p className="text-xs mt-1.5" style={{ color: "#6b7280", lineHeight: 1.6 }}>
              {description}
            </p>
          </div>
          <button onClick={onClose} style={{ color: "#9ca3af" }} className="mt-0.5">
            <X size={16} />
          </button>
        </div>

        {/* Warning banner */}
        <div
          className="mx-6 mb-5 px-3 py-2.5 rounded-xl flex items-center gap-2"
          style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
        >
          <AlertTriangle size={13} style={{ color: "#dc2626" }} />
          <p className="text-xs" style={{ color: "#991b1b" }}>
            Esta acción es permanente y no se puede deshacer.
          </p>
        </div>

        {/* Buttons */}
        <div className="px-6 pb-6 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm transition-all"
            style={{ background: "#f0f2f5", color: "#374151", border: "1.5px solid #e5e7eb" }}
          >
            Cancelar
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 py-2.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "#ffffff" }}
          >
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Client Modal ────────────────────────────────────────────────────────

function EditClientModal({
  client,
  onClose,
  onSaved,
}: {
  client: Client;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone);
  const [email, setEmail] = useState(client.email);
  const [address, setAddress] = useState(client.address);
  const [done, setDone] = useState(false);

  const handleSave = () => {
    const all = loadServices();
    const updated = all.map((s) => {
      const key = s.contractorRut || s.contractorName;
      const clientKey = client.rut || client.name;
      if (key !== clientKey) return s;
      return {
        ...s,
        contractorName: name,
        contractorPhone: phone,
        contractorEmail: email,
        contractorAddress: address,
      };
    });
    // Actualizar caché local y sincronizar con Supabase cada servicio modificado
    setLocalCache(updated);
    updated.forEach((s) => {
      const key = s.contractorRut || s.contractorName;
      const clientKey = client.rut || client.name;
      if (key === clientKey) persistService(s);
    });
    setDone(true);
    setTimeout(() => { onSaved(); onClose(); }, 900);
  };

  const fields: {
    label: string;
    value: string;
    setter: (v: string) => void;
    type?: string;
    placeholder: string;
  }[] = [
    { label: "Nombre completo", value: name, setter: setName, placeholder: "Nombre del contratante" },
    { label: "Teléfono", value: phone, setter: setPhone, placeholder: "+56 9 1234 5678" },
    { label: "Correo electrónico", value: email, setter: setEmail, type: "email", placeholder: "correo@ejemplo.com" },
    { label: "Dirección", value: address, setter: setAddress, placeholder: "Calle, número, comuna" },
  ];

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
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #0d1b3e, #1a2f5a)" }}
        >
          <div className="flex items-center gap-2">
            <Pencil size={15} style={{ color: "#c9a84c" }} />
            <h3 style={{ color: "#ffffff" }}>Editar Datos del Cliente</h3>
          </div>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.6)" }}>
            <X size={16} />
          </button>
        </div>

        {/* Info banner */}
        <div
          className="mx-6 mt-5 mb-1 px-3 py-2.5 rounded-xl flex items-center gap-2"
          style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
        >
          <AlertCircle size={13} style={{ color: "#1d4ed8" }} />
          <p className="text-xs" style={{ color: "#1e40af" }}>
            Los cambios se aplicarán a todos los servicios de este cliente.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {fields.map(({ label, value, setter, type, placeholder }) => (
            <div key={label}>
              <label className="block text-xs mb-1.5" style={{ color: "#374151", fontWeight: 500 }}>
                {label}
              </label>
              <input
                type={type || "text"}
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{ border: "1.5px solid #e5e7eb", color: "#0d1b3e" }}
                onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>
          ))}

          {done && (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: "#dcfce7", border: "1px solid #bbf7d0" }}
            >
              <CheckCircle2 size={14} style={{ color: "#16a34a" }} />
              <span className="text-xs" style={{ color: "#166534" }}>
                Datos actualizados correctamente
              </span>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm"
            style={{ background: "#f0f2f5", color: "#374151", border: "1.5px solid #e5e7eb" }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #0d1b3e, #1a2f5a)", color: "#c9a84c" }}
          >
            <Pencil size={13} /> Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Payment Modal ────────────────────────────────────────────────────────

function AddPaymentModal({
  service,
  onClose,
  onSaved,
}: {
  service: FuneralService;
  onClose: () => void;
  onSaved: (updated: FuneralService) => void;
}) {
  const [amount, setAmount] = useState("");
  const [displayAmount, setDisplayAmount] = useState("");
  const [method, setMethod] = useState("Efectivo");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);

  const handleSave = () => {
    const num = parseInt(amount.replace(/\D/g, ""), 10);
    if (!num || num <= 0) return;

    const newPending = Math.max(0, service.pendingBalance - num);
    const newPaid = service.totalPaid + num;
    const updated: FuneralService = {
      ...service,
      totalPaid: newPaid,
      pendingBalance: newPending,
      status: deriveStatus(newPaid, newPending),
      lastPaymentDate: date,
      payments: [
        ...service.payments,
        {
          id: `${service.id}-P${service.payments.length + 1}`,
          date,
          amount: num,
          method: method as "Efectivo" | "Transferencia" | "Cheque" | "Tarjeta",
          balance: newPending,
          notes: notes || undefined,
        },
      ],
    };
    persistService(updated);
    onSaved(updated);
    setDone(true);
    setTimeout(onClose, 1200);
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
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.6)" }}>
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div
            className="rounded-xl p-3"
            style={{ background: "#f8f9fa", border: "1px solid #e5e7eb" }}
          >
            <p className="text-xs" style={{ color: "#9ca3af" }}>
              Servicio — {service.id}
            </p>
            <p className="text-sm" style={{ color: "#0d1b3e", fontWeight: 500 }}>
              {service.deceasedName || service.serviceType}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
              Saldo pendiente:{" "}
              <span style={{ color: "#dc2626", fontWeight: 600 }}>
                {formatCLP(service.pendingBalance)}
              </span>
            </p>
          </div>

          {[
            {
              label: "Fecha",
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
              label: "Monto ($)",
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
              label: "Método",
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
                    <option key={m}>{m}</option>
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
                  placeholder="Notas..."
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
              <label
                className="block text-xs mb-1.5"
                style={{ color: "#374151", fontWeight: 500 }}
              >
                {label}
              </label>
              {el}
            </div>
          ))}

          {done && (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: "#dcfce7", border: "1px solid #bbf7d0" }}
            >
              <CheckCircle2 size={14} style={{ color: "#16a34a" }} />
              <span className="text-xs" style={{ color: "#166534" }}>
                Abono registrado correctamente
              </span>
            </div>
          )}
        </div>

        <div className="px-6 pb-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm"
            style={{
              background: "#f0f2f5",
              color: "#374151",
              border: "1.5px solid #e5e7eb",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-sm shadow-md"
            style={{
              background: "linear-gradient(135deg, #0d1b3e, #1a2f5a)",
              color: "#c9a84c",
            }}
          >
            Registrar Abono
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Client Detail View ─────────────────────────────��─────────────────────────

function ClientDetail({
  client,
  onBack,
  onUpdate,
}: {
  client: Client;
  onBack: () => void;
  onUpdate: () => void;
}) {
  const [payingService, setPayingService] = useState<FuneralService | null>(null);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "client" | "service";
    serviceId?: string;
  } | null>(null);
  const [editingClient, setEditingClient] = useState(false);

  const [localServices, setLocalServices] = useState<FuneralService[]>(client.services);

  const handlePaymentSaved = (updated: FuneralService) => {
    setLocalServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    onUpdate();
  };

  const handleDeleteService = (id: string) => {
    deleteService(id);
    const remaining = localServices.filter((s) => s.id !== id);
    setLocalServices(remaining);
    onUpdate();
    if (remaining.length === 0) onBack();
  };

  const handleDeleteClient = () => {
    localServices.forEach((s) => deleteService(s.id));
    onUpdate();
    onBack();
  };

  const totalPaid = localServices.reduce((a, s) => a + s.totalPaid, 0);
  const totalPending = localServices.reduce((a, s) => a + s.pendingBalance, 0);
  const upToDate = totalPending === 0;
  const pct =
    totalPaid + totalPending > 0
      ? Math.min(100, (totalPaid / (totalPaid + totalPending)) * 100)
      : 100;

  const methodColors: Record<string, string> = {
    Efectivo: "#16a34a",
    Transferencia: "#2563eb",
    Cheque: "#7c3aed",
    Tarjeta: "#c9a84c",
  };

  return (
    <div className="space-y-5">
      {/* ── Modals ── */}
      {payingService && (
        <AddPaymentModal
          service={payingService}
          onClose={() => setPayingService(null)}
          onSaved={(upd) => { handlePaymentSaved(upd); setPayingService(null); }}
        />
      )}

      {deleteTarget?.type === "client" && (
        <DeleteConfirmModal
          title={`Eliminar cliente: ${client.name}`}
          description={`Se eliminarán permanentemente ${localServices.length} servicio${localServices.length !== 1 ? "s" : ""} registrado${localServices.length !== 1 ? "s" : ""} a nombre de este cliente.`}
          onConfirm={handleDeleteClient}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {deleteTarget?.type === "service" && deleteTarget.serviceId && (
        <DeleteConfirmModal
          title={`Eliminar servicio ${deleteTarget.serviceId}`}
          description="Se eliminará este registro de servicio. El resto del historial del cliente se mantendrá intacto."
          onConfirm={() => handleDeleteService(deleteTarget.serviceId!)}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {editingClient && (
        <EditClientModal
          client={client}
          onClose={() => setEditingClient(false)}
          onSaved={() => { onUpdate(); setEditingClient(false); }}
        />
      )}

      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm transition-colors"
        style={{ color: "#1a2f5a" }}
      >
        <ArrowLeft size={16} /> Volver a clientes
      </button>

      {/* Client Header Card */}
      <div
        className="rounded-2xl p-6 shadow-sm"
        style={{ background: "linear-gradient(135deg, #0d1b3e 0%, #1a2f5a 100%)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {/* Left: avatar + name */}
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
              style={{ background: "linear-gradient(135deg, #c9a84c, #e8c97a)" }}
            >
              <span className="text-lg" style={{ color: "#0d1b3e", fontWeight: 700 }}>
                {client.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
              </span>
            </div>
            <div>
              <h2 style={{ color: "#ffffff" }}>{client.name}</h2>
              <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                RUT: {client.rut}
              </p>
              <div className="mt-2">
                <PaymentStatusBadge upToDate={upToDate} />
              </div>
            </div>
          </div>

          {/* Right: contact + action buttons */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              {client.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={12} style={{ color: "rgba(201,168,76,0.7)" }} />
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{client.phone}</span>
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-2">
                  <Mail size={12} style={{ color: "rgba(201,168,76,0.7)" }} />
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{client.email}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-center gap-2">
                  <MapPin size={12} style={{ color: "rgba(201,168,76,0.7)" }} />
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{client.address}</span>
                </div>
              )}
            </div>

            {/* Edit / Delete buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setEditingClient(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all"
                style={{
                  background: "rgba(201,168,76,0.15)",
                  color: "#c9a84c",
                  border: "1px solid rgba(201,168,76,0.3)",
                }}
              >
                <Pencil size={12} /> Editar datos
              </button>
              <button
                onClick={() => setDeleteTarget({ type: "client" })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all"
                style={{
                  background: "rgba(239,68,68,0.15)",
                  color: "#ef4444",
                  border: "1px solid rgba(239,68,68,0.3)",
                }}
              >
                <Trash2 size={12} /> Eliminar cliente
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex justify-between mb-2">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              Progreso global de pago
            </span>
            <span className="text-xs" style={{ color: "#c9a84c", fontWeight: 600 }}>
              {pct.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background:
                  pct === 100 ? "#22c55e" : pct > 50 ? "linear-gradient(90deg, #c9a84c, #e8c97a)" : "#ef4444",
              }}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Servicios Contratados", value: localServices.length.toString(), icon: FileText, color: "#1a2f5a", bg: "#eff6ff" },
          { label: "Total Pagado", value: formatCLP(totalPaid), icon: TrendingUp, color: "#16a34a", bg: "#dcfce7" },
          { label: "Saldo Pendiente", value: formatCLP(totalPending), icon: TrendingDown, color: totalPending > 0 ? "#dc2626" : "#16a34a", bg: totalPending > 0 ? "#fee2e2" : "#dcfce7" },
          { label: "Estado General", value: upToDate ? "Al día" : "Con deuda", icon: upToDate ? CheckCircle2 : AlertCircle, color: upToDate ? "#16a34a" : "#dc2626", bg: upToDate ? "#dcfce7" : "#fee2e2" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl p-4 shadow-sm" style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: card.bg }}>
              <card.icon size={15} style={{ color: card.color }} />
            </div>
            <p className="text-xs" style={{ color: "#6b7280" }}>{card.label}</p>
            <p className="text-sm mt-0.5" style={{ color: card.color, fontWeight: 700 }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Service History */}
      <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}>
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid #f0f2f5" }}>
          <Calendar size={16} style={{ color: "#1a2f5a" }} />
          <h3 style={{ color: "#0d1b3e" }}>Historial de Servicios</h3>
          <span className="ml-auto text-xs px-2.5 py-1 rounded-full" style={{ background: "#f0f2f5", color: "#6b7280" }}>
            {localServices.length} servicio{localServices.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="divide-y" style={{ borderColor: "#f0f2f5" }}>
          {localServices.map((svc) => {
            const isOpen = expandedService === svc.id;
            const svcPct = svc.totalService > 0 ? Math.min(100, (svc.totalPaid / svc.totalService) * 100) : 0;

            return (
              <div key={svc.id}>
                {/* Service Row */}
                <div
                  className="px-5 py-4 cursor-pointer transition-colors"
                  style={{ background: isOpen ? "#fafbfc" : "transparent" }}
                  onClick={() => setExpandedService(isOpen ? null : svc.id)}
                  onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = "#fafbfc"; }}
                  onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = "transparent"; }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#f0f2f5" }}>
                        <FileText size={15} style={{ color: "#1a2f5a" }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: "#f0f2f5", color: "#374151", fontWeight: 500 }}>
                            {svc.id}
                          </span>
                          <ServiceStatusBadge status={svc.status} />
                        </div>
                        <p className="text-sm mt-1" style={{ color: "#0d1b3e", fontWeight: 500 }}>
                          {svc.deceasedName || svc.serviceType}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                          {svc.serviceType} · {formatDate(svc.date)} · {svc.cemetery}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                      <div className="text-right">
                        <p className="text-xs" style={{ color: "#9ca3af" }}>Total servicio</p>
                        <p className="text-sm" style={{ color: "#0d1b3e", fontWeight: 700 }}>{formatCLP(svc.totalService)}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {svc.pendingBalance > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setPayingService(svc); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all shrink-0"
                            style={{ background: "#0d1b3e", color: "#c9a84c" }}
                          >
                            <Plus size={11} /> Abonar
                          </button>
                        )}
                        {/* Delete service */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "service", serviceId: svc.id }); }}
                          className="w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0"
                          style={{ background: "#fee2e2", color: "#dc2626" }}
                          title="Eliminar servicio"
                        >
                          <Trash2 size={12} />
                        </button>
                        <div style={{ color: "#9ca3af" }}>
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mini progress bar */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: "#f0f2f5" }}>
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${svcPct}%`,
                          background: svcPct === 100 ? "#22c55e" : svcPct > 30 ? "#eab308" : "#ef4444",
                        }}
                      />
                    </div>
                    <span
                      className="text-xs shrink-0"
                      style={{ color: svc.pendingBalance > 0 ? "#dc2626" : "#16a34a", fontWeight: 600 }}
                    >
                      {svc.pendingBalance > 0 ? `Debe ${formatCLP(svc.pendingBalance)}` : "Pagado"}
                    </span>
                  </div>
                </div>

                {/* Expanded: payment detail */}
                {isOpen && (
                  <div className="px-5 pb-5" style={{ background: "#fafbfc", borderTop: "1px solid #f0f2f5" }}>
                    <p className="text-xs pt-4 pb-2" style={{ color: "#9ca3af", letterSpacing: "0.08em" }}>
                      DETALLE DE PAGOS
                    </p>

                    {/* Financial mini cards */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { label: "Total Servicio", val: formatCLP(svc.totalService), c: "#1a2f5a" },
                        { label: "Total Abonado", val: formatCLP(svc.totalPaid), c: "#16a34a" },
                        { label: "Saldo Pendiente", val: formatCLP(svc.pendingBalance), c: svc.pendingBalance > 0 ? "#dc2626" : "#16a34a" },
                      ].map(({ label, val, c }) => (
                        <div key={label} className="rounded-xl p-3" style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}>
                          <p className="text-xs" style={{ color: "#9ca3af" }}>{label}</p>
                          <p className="text-sm mt-0.5" style={{ color: c, fontWeight: 700 }}>{val}</p>
                        </div>
                      ))}
                    </div>

                    {/* Payments table */}
                    {svc.payments.length === 0 ? (
                      <div className="rounded-xl py-6 text-center" style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}>
                        <AlertCircle size={18} className="mx-auto mb-1" style={{ color: "#9ca3af" }} />
                        <p className="text-xs" style={{ color: "#9ca3af" }}>Sin pagos registrados para este servicio</p>
                        {svc.pendingBalance > 0 && (
                          <button
                            onClick={() => setPayingService(svc)}
                            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs mx-auto"
                            style={{ background: "#0d1b3e", color: "#c9a84c" }}
                          >
                            <Plus size={11} /> Registrar primer abono
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}>
                        <table className="w-full">
                          <thead>
                            <tr style={{ background: "#f8f9fa" }}>
                              {["#", "Fecha", "Monto", "Método", "Saldo tras pago", "Notas"].map((h) => (
                                <th key={h} className="px-4 py-2.5 text-left text-xs" style={{ color: "#6b7280", fontWeight: 600 }}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {svc.payments.map((pay, idx) => (
                              <tr key={pay.id} style={{ borderTop: "1px solid #f0f2f5" }}>
                                <td className="px-4 py-2.5 text-xs" style={{ color: "#9ca3af" }}>{idx + 1}</td>
                                <td className="px-4 py-2.5 text-xs" style={{ color: "#374151" }}>{formatDate(pay.date)}</td>
                                <td className="px-4 py-2.5">
                                  <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: "#dcfce7", color: "#166534", fontWeight: 600 }}>
                                    + {formatCLP(pay.amount)}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: `${methodColors[pay.method] || "#374151"}18`, color: methodColors[pay.method] || "#374151", fontWeight: 500 }}>
                                    {pay.method}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-xs" style={{ color: pay.balance > 0 ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
                                  {formatCLP(pay.balance)}
                                </td>
                                <td className="px-4 py-2.5 text-xs" style={{ color: "#9ca3af" }}>{pay.notes || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Clients Page ────────────────────────────────────────────────────────

export function Clients() {
  const [allServices, setAllServices] = useState<FuneralService[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Todos" | "Al día" | "Con deuda">("Todos");
  const [sortField, setSortField] = useState("lastServiceDate");
  const [sortAsc, setSortAsc] = useState(false);
  const [deleteClientTarget, setDeleteClientTarget] = useState<Client | null>(null);
  const [editClientTarget, setEditClientTarget] = useState<Client | null>(null);

  const reload = (clearSelection = false) => {
    const svcs = loadServices();
    setAllServices(svcs);
    if (clearSelection) {
      setSelectedClient(null);
    } else if (selectedClient) {
      const updated = buildClients(svcs).find((c) => c.rut === selectedClient.rut);
      if (updated) setSelectedClient(updated);
    }
  };

  useEffect(() => { reload(); }, []);

  const handleDeleteClient = (client: Client) => {
    client.services.forEach((s) => deleteService(s.id));
    reload();
    setDeleteClientTarget(null);
  };

  const clients = buildClients(allServices);

  const filtered = clients
    .filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        c.name.toLowerCase().includes(q) ||
        c.rut.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);
      const matchFilter =
        filter === "Todos" ||
        (filter === "Al día" && c.upToDate) ||
        (filter === "Con deuda" && !c.upToDate);
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      let va: any, vb: any;
      if (sortField === "name") { va = a.name; vb = b.name; }
      else if (sortField === "pending") { va = a.totalPending; vb = b.totalPending; }
      else if (sortField === "services") { va = a.totalServices; vb = b.totalServices; }
      else { va = a.lastServiceDate; vb = b.lastServiceDate; }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });

  const toggleSort = (f: string) => {
    if (sortField === f) setSortAsc(!sortAsc);
    else { setSortField(f); setSortAsc(true); }
  };

  const SortIcon = ({ field }: { field: string }) =>
    sortField === field ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null;

  const totalClients = clients.length;
  const alDia = clients.filter((c) => c.upToDate).length;
  const conDeuda = clients.filter((c) => !c.upToDate).length;
  const totalPendingGlobal = clients.reduce((a, c) => a + c.totalPending, 0);

  if (selectedClient) {
    return (
      <ClientDetail
        client={selectedClient}
        onBack={() => reload(true)}
        onUpdate={() => reload(false)}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Delete confirm modal */}
      {deleteClientTarget && (
        <DeleteConfirmModal
          title={`Eliminar cliente: ${deleteClientTarget.name}`}
          description={`Se eliminarán permanentemente ${deleteClientTarget.services.length} servicio${deleteClientTarget.services.length !== 1 ? "s" : ""} de este cliente. Los registros de cobro también serán eliminados.`}
          onConfirm={() => handleDeleteClient(deleteClientTarget)}
          onClose={() => setDeleteClientTarget(null)}
        />
      )}

      {/* Edit modal */}
      {editClientTarget && (
        <EditClientModal
          client={editClientTarget}
          onClose={() => setEditClientTarget(null)}
          onSaved={() => { reload(); setEditClientTarget(null); }}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Clientes", value: totalClients.toString(), icon: Users, color: "#1a2f5a", bg: "#eff6ff" },
          { label: "Al Día", value: alDia.toString(), icon: CheckCircle2, color: "#16a34a", bg: "#dcfce7" },
          { label: "Con Deuda", value: conDeuda.toString(), icon: AlertCircle, color: "#dc2626", bg: "#fee2e2" },
          { label: "Deuda Total Pendiente", value: formatCLP(totalPendingGlobal), icon: CreditCard, color: totalPendingGlobal > 0 ? "#dc2626" : "#16a34a", bg: totalPendingGlobal > 0 ? "#fee2e2" : "#dcfce7" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl p-4 shadow-sm" style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: card.bg }}>
              <card.icon size={17} style={{ color: card.color }} />
            </div>
            <p className="text-xs" style={{ color: "#6b7280" }}>{card.label}</p>
            <p className="text-lg mt-0.5" style={{ color: card.color, fontWeight: 700 }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-4 shadow-sm" style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
            <input
              type="text"
              placeholder="Buscar por nombre, RUT o teléfono..."
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
            {(["Todos", "Al día", "Con deuda"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-2 rounded-xl text-xs transition-all"
                style={{
                  background: filter === f ? (f === "Al día" ? "#dcfce7" : f === "Con deuda" ? "#fee2e2" : "#0d1b3e") : "#f0f2f5",
                  color: filter === f ? (f === "Al día" ? "#166534" : f === "Con deuda" ? "#991b1b" : "#c9a84c") : "#6b7280",
                  fontWeight: filter === f ? 600 : 400,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Client Table */}
      <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f0f2f5" }}>
          <div className="flex items-center gap-2">
            <Users size={16} style={{ color: "#1a2f5a" }} />
            <h3 style={{ color: "#0d1b3e" }}>Directorio de Clientes</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#f0f2f5", color: "#6b7280" }}>
            {filtered.length} clientes
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#f0f2f5" }}>
              <Users size={24} style={{ color: "#9ca3af" }} />
            </div>
            <p className="text-sm" style={{ color: "#6b7280" }}>
              {allServices.length === 0 ? "No hay clientes registrados aún" : "No se encontraron resultados"}
            </p>
            <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>
              {allServices.length === 0
                ? "Los clientes aparecen automáticamente al registrar un servicio"
                : "Intenta con otro criterio de búsqueda"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#f8f9fa" }}>
                    {[
                      { label: "Cliente", field: "name" },
                      { label: "Contacto", field: "" },
                      { label: "Servicios", field: "services" },
                      { label: "Total Pagado", field: "" },
                      { label: "Saldo Pendiente", field: "pending" },
                      { label: "Estado de Pago", field: "" },
                      { label: "Último Servicio", field: "lastServiceDate" },
                      { label: "Acciones", field: "" },   // Ver · Editar · Eliminar
                    ].map(({ label, field }) => (
                      <th
                        key={label}
                        className="px-4 py-3 text-left text-xs"
                        style={{ color: "#6b7280", fontWeight: 600, cursor: field ? "pointer" : "default", userSelect: "none" }}
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
                  {filtered.map((client) => (
                    <tr
                      key={client.rut || client.name}
                      className="cursor-pointer transition-colors"
                      style={{ borderTop: "1px solid #f0f2f5" }}
                      onClick={() => setSelectedClient(client)}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfc")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Avatar + Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                            style={{ background: client.upToDate ? "linear-gradient(135deg, #dcfce7, #bbf7d0)" : "linear-gradient(135deg, #fee2e2, #fecaca)" }}
                          >
                            <span className="text-xs" style={{ color: client.upToDate ? "#166534" : "#991b1b", fontWeight: 700 }}>
                              {client.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: "#0d1b3e", fontWeight: 500 }}>{client.name}</p>
                            <p className="text-xs" style={{ color: "#9ca3af" }}>{client.rut}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3">
                        {client.phone && (
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Phone size={10} style={{ color: "#9ca3af" }} />
                            <span className="text-xs" style={{ color: "#6b7280" }}>{client.phone}</span>
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail size={10} style={{ color: "#9ca3af" }} />
                            <span className="text-xs" style={{ color: "#6b7280" }}>{client.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Services count */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "#eff6ff" }}>
                            <FileText size={11} style={{ color: "#1a2f5a" }} />
                          </div>
                          <span className="text-xs" style={{ color: "#374151", fontWeight: 600 }}>{client.totalServices}</span>
                        </div>
                      </td>

                      {/* Total paid */}
                      <td className="px-4 py-3 text-xs" style={{ color: "#16a34a", fontWeight: 500 }}>
                        {formatCLP(client.totalPaid)}
                      </td>

                      {/* Pending */}
                      <td className="px-4 py-3 text-xs" style={{ color: client.totalPending > 0 ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
                        {formatCLP(client.totalPending)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <PaymentStatusBadge upToDate={client.upToDate} />
                      </td>

                      {/* Last service date */}
                      <td className="px-4 py-3 text-xs" style={{ color: "#6b7280" }}>
                        {formatDate(client.lastServiceDate)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          {/* Ver */}
                          <button
                            className="text-xs px-2.5 py-1.5 rounded-lg transition-all"
                            style={{ background: "#f0f2f5", color: "#1a2f5a" }}
                            onClick={() => setSelectedClient(client)}
                            title="Ver ficha del cliente"
                          >
                            Ficha
                          </button>

                          {/* Editar */}
                          <button
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                            style={{ background: "#eff6ff", color: "#1a2f5a" }}
                            onClick={() => setEditClientTarget(client)}
                            title="Editar datos del cliente"
                          >
                            <Pencil size={12} />
                          </button>

                          {/* Eliminar */}
                          <button
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                            style={{ background: "#fee2e2", color: "#dc2626" }}
                            onClick={() => setDeleteClientTarget(client)}
                            title="Eliminar cliente"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="px-5 py-3 flex items-center gap-4 flex-wrap" style={{ borderTop: "1px solid #f0f2f5", background: "#fafbfc" }}>
              <p className="text-xs" style={{ color: "#9ca3af" }}>Estado de pago:</p>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />
                <span className="text-xs" style={{ color: "#6b7280" }}>Al día</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: "#ef4444" }} />
                <span className="text-xs" style={{ color: "#6b7280" }}>Con deuda</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}