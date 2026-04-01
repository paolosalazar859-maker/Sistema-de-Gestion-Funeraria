import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Calendar,
  MapPin,
  User,
  DollarSign,
  FileText,
  Save,
  Edit3,
  Printer,
  CheckCircle,
  ArrowLeft,
  Building2,
  CreditCard,
  Download,
  X,
  Check,
  ShoppingBag,
  Type,
  Heart,
} from "lucide-react";
import { openPrint } from "../utils/printUtils";
import { funeralServiceTypes, productServiceTypes } from "../data/mockData";
import { loadServices, persistService, generateServiceId, deriveStatus } from "../data/serviceStore";
import { loadCompanyProfile } from "../data/companyStore";
import { useUser } from "../context/UserContext";
import { loadInventory } from "../data/inventoryStore";

const formatCLP = (value: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(value);

const numericInput = (val: string) => {
  const num = parseInt(val.replace(/\D/g, ""), 10);
  return isNaN(num) ? 0 : num;
};

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

// ── RUT formatter ─────────────────────────────────────────────────────────────
function formatRut(raw: string): string {
  const clean = raw.replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean;
  const verifier = clean.slice(-1);
  const body = clean.slice(0, -1);
  let formatted = "";
  for (let i = 0; i < body.length; i++) {
    const pos = body.length - 1 - i;
    if (i > 0 && i % 3 === 0) formatted = "." + formatted;
    formatted = body[pos] + formatted;
  }
  return `${formatted}-${verifier}`;
}

// ── MoneyInput: Input con formato de miles ──────────────────────────────────
const MoneyInput = ({
  label,
  value,
  onChange,
  placeholder = "0",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) => {
  const [displayValue, setDisplayValue] = useState(() => formatMoney(value));

  // Sincronizar cuando el valor externo cambia
  useEffect(() => {
    setDisplayValue(formatMoney(value));
  }, [value]);

  const handleChange = (rawValue: string) => {
    const formatted = formatMoney(rawValue);
    setDisplayValue(formatted);
    // Enviar el valor sin formato al padre
    const cleanValue = rawValue.replace(/\D/g, "");
    onChange?.(cleanValue);
  };

  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: "#374151", fontWeight: 500 }}>
        {label}
      </label>
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
          style={{ color: "#9ca3af" }}
        >
          $
        </span>
        <input
          type="text"
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{
            paddingLeft: "28px",
            border: "1.5px solid #e5e7eb",
            color: "#0d1b3e",
            background: disabled ? "#f8f9fa" : "#ffffff",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
      </div>
    </div>
  );
};

interface FormData {
  serviceCategory: string;
  date: string;
  cemetery: string;
  serviceType: string;
  serviceValue: string;
  engravingText: string;
  deceasedName: string;
  deceasedRut: string;
  transferFrom: string;
  transferCost: string;
  contractorName: string;
  contractorRut: string;
  contractorAddress: string;
  contractorPhone: string;
  contractorEmail: string;
  municipalContribution: string;
  mortuaryFee: string;
  discount: string;
  initialPayment: string;
  installmentsEnabled: boolean;
  numberOfInstallments: string;
  invoice1: string;
  invoice2: string;
  invoice3: string;
  observations: string;
  paymentNotes: string;
  initialPaymentMethod: "Efectivo" | "Transferencia" | "Cheque" | "Tarjeta" | "Crédito" | "Débito";
}

const emptyForm: FormData = {
  serviceCategory: "",
  date: new Date().toISOString().split("T")[0],
  cemetery: "",
  serviceType: "",
  serviceValue: "",
  engravingText: "",
  deceasedName: "",
  deceasedRut: "",
  transferFrom: "",
  transferCost: "",
  contractorName: "",
  contractorRut: "",
  contractorAddress: "",
  contractorPhone: "",
  contractorEmail: "",
  municipalContribution: "",
  mortuaryFee: "",
  discount: "",
  initialPayment: "",
  installmentsEnabled: false,
  numberOfInstallments: "3",
  invoice1: "",
  invoice2: "",
  invoice3: "",
  observations: "",
  paymentNotes: "",
  initialPaymentMethod: "Efectivo",
};

const SectionHeader = ({
  icon: Icon,
  title,
  subtitle,
  color = "#1a2f5a",
}: {
  icon: any;
  title: string;
  subtitle: string;
  color?: string;
}) => (
  <div className="flex items-center gap-3 mb-5">
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
      style={{ background: `${color}18`, border: `1.5px solid ${color}30` }}
    >
      <Icon size={17} style={{ color }} />
    </div>
    <div>
      <h3 style={{ color: "#0d1b3e" }}>{title}</h3>
      <p className="text-xs" style={{ color: "#9ca3af" }}>{subtitle}</p>
    </div>
  </div>
);

const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  disabled = false,
  prefix = "",
  options,
}: {
  label: string;
  type?: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  prefix?: string;
  options?: string[];
}) => (
  <div>
    <label className="block text-xs mb-1.5" style={{ color: "#374151", fontWeight: 500 }}>
      {label}
    </label>
    {options ? (
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{
          border: "1.5px solid #e5e7eb",
          color: value ? "#0d1b3e" : "#9ca3af",
          background: disabled ? "#f8f9fa" : "#ffffff",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
      >
        <option value="">Seleccionar...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    ) : (
      <div className="relative">
        {prefix && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: "#9ca3af" }}
          >
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{
            paddingLeft: prefix ? "28px" : "12px",
            border: "1.5px solid #e5e7eb",
            color: "#0d1b3e",
            background: disabled ? "#f8f9fa" : "#ffffff",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
      </div>
    )}
  </div>
);

// ── RutInput ────────────────────────���─────────────────────────────────────────
function RutInput({
  label,
  value,
  onChange,
  placeholder = "12.345.678-9",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const handleChange = (raw: string) => {
    onChange?.(formatRut(raw));
  };

  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: "#374151", fontWeight: 500 }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={12}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{
          border: "1.5px solid #e5e7eb",
          color: "#0d1b3e",
          background: disabled ? "#f8f9fa" : "#ffffff",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.04em",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
      />
    </div>
  );
}

// ── ClientAutocomplete ────────────────────────────────────────────────────────
interface ClientRecord {
  name: string;
  rut: string;
  address: string;
  phone: string;
  email: string;
}

function ClientAutocomplete({
  value,
  onChange,
  onSelectClient,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelectClient: (client: ClientRecord) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Build unique client list from saved services
  const allClients = useMemo<ClientRecord[]>(() => {
    const services = loadServices();
    const seen = new Set<string>();
    const list: ClientRecord[] = [];
    for (const s of services) {
      if (!s.contractorName?.trim()) continue;
      const key = (s.contractorRut || s.contractorName).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      list.push({
        name: s.contractorName,
        rut: s.contractorRut || "",
        address: s.contractorAddress || "",
        phone: s.contractorPhone || "",
        email: s.contractorEmail || "",
      });
    }
    return list;
  }, [open]);

  const filtered = value.trim()
    ? allClients.filter(
        (c) =>
          c.name.toLowerCase().includes(value.toLowerCase()) ||
          c.rut.replace(/\./g, "").toLowerCase().includes(value.replace(/\./g, "").toLowerCase())
      )
    : allClients;

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (client: ClientRecord) => {
    onSelectClient(client);
    setOpen(false);
  };

  // Initials avatar
  const initials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-xs mb-1.5" style={{ color: "#374151", fontWeight: 500 }}>
        Nombre del Contratante
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => { if (!disabled) setOpen(true); }}
          placeholder="Nombre completo o RUT para buscar cliente"
          disabled={disabled}
          autoComplete="off"
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all pr-9"
          style={{
            border: `1.5px solid ${open && !disabled ? "#c9a84c" : "#e5e7eb"}`,
            color: "#0d1b3e",
            background: disabled ? "#f8f9fa" : "#ffffff",
          }}
        />
        <User
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#9ca3af" }}
        />
      </div>

      {open && !disabled && filtered.length > 0 && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl shadow-xl overflow-hidden"
          style={{
            background: "#ffffff",
            border: "1.5px solid #e5e7eb",
            maxHeight: "240px",
            overflowY: "auto",
          }}
        >
          <p className="px-3 pt-2.5 pb-1 text-xs" style={{ color: "#9ca3af" }}>
            Clientes registrados — selecciona para autocompletar
          </p>
          {filtered.map((client, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors"
              style={{ borderTop: "1px solid #f0f2f5" }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(client)}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfc")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                style={{ background: "linear-gradient(135deg, #0d1b3e, #1a2f5a)", color: "#c9a84c" }}
              >
                {initials(client.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "#0d1b3e" }}>
                  {client.name}
                </p>
                <p className="text-xs truncate" style={{ color: "#9ca3af" }}>
                  {client.rut && <span className="mr-2">{client.rut}</span>}
                  {client.phone && <span>{client.phone}</span>}
                </p>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-lg shrink-0"
                style={{ background: "rgba(201,168,76,0.12)", color: "#c9a84c", fontWeight: 600 }}
              >
                Completar
              </span>
            </div>
          ))}
        </div>
      )}

      {open && !disabled && allClients.length === 0 && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl shadow-xl px-3 py-3"
          style={{ background: "#ffffff", border: "1.5px solid #e5e7eb" }}
        >
          <p className="text-xs" style={{ color: "#9ca3af" }}>
            Aún no hay clientes guardados. Se registrarán al guardar el primer servicio.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Cemetery Storage Management ──────────────────────────────────────────────
const CEMETERY_STORAGE_KEY = "funeral_cemeteries";

function loadSavedCemeteries(): string[] {
  try {
    const raw = localStorage.getItem(CEMETERY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCemeteryToStorage(name: string) {
  if (!name.trim()) return;
  const current = loadSavedCemeteries();
  const normalized = name.trim();
  if (!current.includes(normalized)) {
    localStorage.setItem(CEMETERY_STORAGE_KEY, JSON.stringify([...current, normalized]));
  }
}

// ── CemeteryAutocomplete ──────────────────────────────────────────────────────
function CemeteryAutocomplete({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [savedList, setSavedList] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reload from localStorage every time dropdown opens
  useEffect(() => {
    if (open) setSavedList(loadSavedCemeteries());
  }, [open]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = value.trim()
    ? savedList.filter((c) => c.toLowerCase().includes(value.toLowerCase()) && c.toLowerCase() !== value.toLowerCase())
    : savedList;

  const isNew = value.trim() !== "" && !savedList.some((c) => c.toLowerCase() === value.toLowerCase().trim());

  const handleSelect = (cemetery: string) => {
    onChange(cemetery);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleRemove = (cemetery: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedList.filter((c) => c !== cemetery);
    localStorage.setItem(CEMETERY_STORAGE_KEY, JSON.stringify(updated));
    setSavedList(updated);
  };

  const showDropdown = open && !disabled && (filtered.length > 0 || isNew);

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-xs mb-1.5" style={{ color: "#374151", fontWeight: 500 }}>
        Cementerio
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => { if (!disabled) setOpen(true); }}
          placeholder="Escribir nombre del cementerio..."
          disabled={disabled}
          autoComplete="off"
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all pr-8"
          style={{
            border: `1.5px solid ${open && !disabled ? "#c9a84c" : "#e5e7eb"}`,
            color: "#0d1b3e",
            background: disabled ? "#f8f9fa" : "#ffffff",
          }}
        />
        <MapPin
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#9ca3af" }}
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl shadow-xl overflow-hidden"
          style={{ background: "#ffffff", border: "1.5px solid #e5e7eb", maxHeight: "220px", overflowY: "auto" }}
        >
          {/* "Nuevo" indicator */}
          {isNew && (
            <div
              className="flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors"
              style={{ borderBottom: filtered.length > 0 ? "1px solid #f0f2f5" : "none" }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(value.trim())}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-xs px-1.5 py-0.5 rounded-md"
                  style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c", fontWeight: 600 }}
                >
                  NUEVO
                </span>
                <span className="text-sm" style={{ color: "#0d1b3e" }}>{value.trim()}</span>
              </div>
              <Check size={13} style={{ color: "#c9a84c" }} />
            </div>
          )}

          {/* Saved suggestions */}
          {filtered.length > 0 && (
            <div>
              {!isNew && (
                <p className="px-3 pt-2 pb-1 text-xs" style={{ color: "#9ca3af" }}>
                  Cementerios guardados
                </p>
              )}
              {filtered.map((cemetery) => (
                <div
                  key={cemetery}
                  className="flex items-center justify-between px-3 py-2.5 cursor-pointer group transition-colors"
                  style={{ borderTop: "1px solid #f0f2f5" }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(cemetery)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={12} style={{ color: "#9ca3af" }} />
                    <span className="text-sm" style={{ color: "#374151" }}>{cemetery}</span>
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
                    style={{ color: "#9ca3af" }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => handleRemove(cemetery, e)}
                    title="Eliminar de la lista"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Empty saved state while typing something that doesn't match */}
          {!isNew && filtered.length === 0 && savedList.length > 0 && (
            <p className="px-3 py-2.5 text-xs" style={{ color: "#9ca3af" }}>
              Sin coincidencias
            </p>
          )}
        </div>
      )}

      {/* Empty state hint when no cemeteries saved yet */}
      {open && !disabled && savedList.length === 0 && !value.trim() && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl shadow-xl px-3 py-3"
          style={{ background: "#ffffff", border: "1.5px solid #e5e7eb" }}
        >
          <p className="text-xs" style={{ color: "#9ca3af" }}>
            Escribe el nombre del cementerio. Se guardará automáticamente al guardar el servicio.
          </p>
        </div>
      )}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export function ServiceRegistration() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({ ...emptyForm });
  const [saved, setSaved] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [sortServicesBy, setSortServicesBy] = useState<"recent" | "oldest" | "name">("recent");
  const [editMode, setEditMode] = useState(true);
  const [showVoucher, setShowVoucher] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState<string>("");
  const [services, setServices] = useState(() => loadServices().filter(s => !s.isDeleted));
  const inventoryItems = useMemo(() => loadInventory(), []);
  const { role } = useUser();
  const isAdmin = role === "admin";
  // isNewService = no hay un servicio seleccionado o viene de URL pero sin editar
  const isNewService = !selectedId && !serviceId;

  // Efecto para cargar servicio si viene por URL
  useEffect(() => {
    if (serviceId) {
      const srv = loadServices().find((s) => s.id === serviceId);
      if (srv) {
        setSelectedId(srv.id);
      }
    } else {
      setForm({ ...emptyForm });
      setCurrentServiceId("");
      setSelectedId("");
      setEditMode(true);
      setSaved(false);
    }
  }, [serviceId]);

  const set = (field: keyof FormData) => (val: string) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const isProduct = form.serviceCategory === "Venta de Artículo";
  const currentTypeOptions = useMemo(() => {
    const baseOptions = isProduct ? productServiceTypes : funeralServiceTypes;
    const invNames = inventoryItems.map(i => i.name).filter(Boolean);
    return Array.from(new Set([...baseOptions, ...invNames]));
  }, [isProduct, inventoryItems]);
  const hasTallado = isProduct && form.serviceType.includes("Tallado");

  const serviceValue = numericInput(form.serviceValue);
  const transferCost = numericInput(form.transferCost);
  const municipal = numericInput(form.municipalContribution);
  const mortuary = numericInput(form.mortuaryFee);
  const discount = numericInput(form.discount);
  const initial = numericInput(form.initialPayment);

  const totalService = serviceValue + transferCost;
  const totalAbonado = municipal + mortuary + initial;
  const saldo = totalService - totalAbonado - discount;

  useEffect(() => {
    if (selectedId) {
      const srv = loadServices().find((s) => s.id === selectedId);
      if (srv) {
        setForm({
          serviceCategory: srv.serviceCategory || "Servicio Funerario",
          date: srv.date,
          cemetery: srv.cemetery,
          serviceType: srv.serviceType,
          serviceValue: srv.serviceValue.toString(),
          engravingText: srv.engravingText || "",
          deceasedName: srv.deceasedName,
          deceasedRut: srv.deceasedRut,
          transferFrom: srv.transferFrom,
          transferCost: srv.transferCost.toString(),
          contractorName: srv.contractorName,
          contractorRut: srv.contractorRut,
          contractorAddress: srv.contractorAddress,
          contractorPhone: srv.contractorPhone,
          contractorEmail: srv.contractorEmail,
          municipalContribution: srv.municipalContribution.toString(),
          mortuaryFee: srv.mortuaryFee.toString(),
          discount: srv.discount.toString(),
          initialPayment: srv.initialPayment.toString(),
          invoice1: srv.invoice1 || "",
          invoice2: srv.invoice2 || "",
          invoice3: srv.invoice3 || "",
          observations: srv.observations || "",
          paymentNotes: srv.payments[0]?.notes || "",
          initialPaymentMethod: (srv.payments[0]?.method as any) || "Efectivo",
          installmentsEnabled: srv.installments?.enabled || false,
          numberOfInstallments: srv.installments?.totalInstallments.toString() || "3",
        });
        setCurrentServiceId(srv.id);
        // Si viene por ID de URL, habilitamos edición de inmediato
        setEditMode(!!serviceId);
        setSaved(true);
      }
    }
  }, [selectedId]);

  const handleSave = async () => {
    // Save cemetery to autocomplete history
    saveCemeteryToStorage(form.cemetery);

    // Build the full FuneralService object
    const svcValue = numericInput(form.serviceValue);
    const tfrCost  = numericInput(form.transferCost);
    const muni     = numericInput(form.municipalContribution);
    const mort     = numericInput(form.mortuaryFee);
    const disc     = numericInput(form.discount);
    const init     = numericInput(form.initialPayment);
    const numInstallments = parseInt(form.numberOfInstallments, 10) || 3;

    const total    = svcValue + tfrCost;
    const abonado  = muni + mort + init;
    const pending  = Math.max(0, total - abonado - disc);

    const id = currentServiceId || generateServiceId();
    const today = new Date().toISOString().split("T")[0];

    // Calcular cuotas si están habilitadas
    let installmentsData = undefined;
    if (form.installmentsEnabled && pending > 0) {
      let baseAmount = 0;
      if (numInstallments <= 6) {
        // Regla: Hasta 6 cuotas es Precio Contado (0 interés)
        baseAmount = Math.ceil(pending / numInstallments);
      } else {
        // Regla: 7 cuotas o más = 3% de interés mensual (Amortización Francesa)
        const monthlyRate = 0.03;
        const factor = (monthlyRate * Math.pow(1 + monthlyRate, numInstallments)) /
                       (Math.pow(1 + monthlyRate, numInstallments) - 1);
        baseAmount = Math.ceil(pending * factor);
      }

      installmentsData = {
        enabled: true,
        totalInstallments: numInstallments,
        baseAmount: baseAmount,
        surchargeAmount: 0, // El interés ya está integrado en la cuota base
        paidInstallments: 0,
      };
    }

    const isEdit = !!currentServiceId;
    const existingService = isEdit ? services.find(s => s.id === currentServiceId) : null;

    if (installmentsData && existingService?.installments) {
      installmentsData.paidInstallments = existingService.installments.paidInstallments;
    }

    const service = {
      id,
      serviceCategory: form.serviceCategory,
      date: form.date,
      cemetery: form.cemetery,
      serviceType: form.serviceType,
      serviceValue: svcValue,
      engravingText: form.engravingText,
      deceasedName: form.deceasedName,
      deceasedRut: form.deceasedRut,
      transferFrom: form.transferFrom,
      transferCost: tfrCost,
      contractorName: form.contractorName,
      contractorRut: form.contractorRut,
      contractorAddress: form.contractorAddress,
      contractorPhone: form.contractorPhone,
      contractorEmail: form.contractorEmail,
      municipalContribution: muni,
      mortuaryFee: mort,
      discount: disc,
      initialPayment: init,
      invoice1: form.invoice1,
      invoice2: form.invoice2,
      invoice3: form.invoice3,
      observations: form.observations,
      installments: installmentsData,
      totalService: total,
      totalPaid: abonado,
      pendingBalance: pending,
      status: deriveStatus(abonado, pending),
      lastPaymentDate: init > 0 ? today : "-",
      payments: isEdit && existingService
        ? existingService.payments
        : (init > 0
            ? [{ id: `${id}-P1`, date: today, amount: init, method: form.initialPaymentMethod, balance: pending, notes: form.paymentNotes || "Abono inicial", registeredBy: role ?? "admin" }]
            : []),
      createdAt: isEdit && existingService ? existingService.createdAt : today,
    };

    await persistService(service as any);
    setCurrentServiceId(id);
    const updatedServices = await loadServices();
    setServices(updatedServices); // refresh dropdown list
    setSaved(true);
    setEditMode(false);

    // Auto-reset after a short delay so the user can see the "Saved" message or just reset immediately
    // The user requested: "que se elimine para poder registrar uno nuevo automáticamente"
    setTimeout(() => {
      handleNew();
    }, 1500);
  };

  const handleEdit = () => {
    setEditMode(true);
    setSaved(false);
    setShowVoucher(false);
  };

  const handleNew = () => {
    setForm({ ...emptyForm });
    setEditMode(true);
    setSaved(false);
    setShowVoucher(false);
    setSelectedId("");
    setCurrentServiceId("");
  };

  // ── Auto-fill contractor from existing client ─────────────────────────────
  const handleSelectClient = (client: ClientRecord) => {
    setForm((prev) => ({
      ...prev,
      contractorName: client.name,
      contractorRut: client.rut,
      contractorAddress: client.address,
      contractorPhone: client.phone,
      contractorEmail: client.email,
    }));
  };
  // ────────────────────────────────────────────────────────────────────────────

  // ── Print Ficha ─────────────────────────────────────────────────────────────
  const handlePrintFicha = () => {
    const dateFormatted = form.date
      ? new Date(form.date + "T12:00:00").toLocaleDateString("es-CL", {
          day: "2-digit", month: "long", year: "numeric",
        })
      : "—";

    const emissionDate = new Date().toLocaleDateString("es-CL", {
      day: "2-digit", month: "long", year: "numeric",
    });

    const company = loadCompanyProfile();

    const purchasedRows: [string, string][] = [];
    if (form.serviceCategory) purchasedRows.push(["Categoría", form.serviceCategory]);
    if (form.serviceType)     purchasedRows.push(["Tipo de Servicio", form.serviceType]);
    if (form.cemetery)        purchasedRows.push(["Cementerio", form.cemetery]);
    if (form.transferFrom)    purchasedRows.push(["Traslado desde", form.transferFrom]);
    if (form.engravingText)   purchasedRows.push(["Texto de Tallado", form.engravingText]);

    const valueRows: [string, string][] = [];
    if (serviceValue > 0) valueRows.push(["Valor del Servicio", formatCLP(serviceValue)]);
    if (transferCost > 0) valueRows.push(["Costo de Traslado", formatCLP(transferCost)]);
    if (municipal > 0)    valueRows.push(["Aporte Municipal", `– ${formatCLP(municipal)}`]);
    if (mortuary > 0)     valueRows.push(["Cuota Mortuoria", `– ${formatCLP(mortuary)}`]);
    if (discount > 0)     valueRows.push(["Descuento", `– ${formatCLP(discount)}`]);

    const totalAbono = initial + municipal + mortuary;
    const abonoRows: [string, string, boolean][] = [];
    if (initial > 0)   abonoRows.push(["Abono Inicial", formatCLP(initial), false]);
    if (municipal > 0) abonoRows.push(["Aporte Municipal", formatCLP(municipal), false]);
    if (mortuary > 0)  abonoRows.push(["Cuota Mortuoria", formatCLP(mortuary), false]);
    if (totalAbono > 0) abonoRows.push(["Total Abonado", formatCLP(totalAbono), true]);

    const saldoFinal = Math.max(0, saldo);
    const saldoColor = saldoFinal > 0 ? "#dc2626" : "#16a34a";
    const saldoBg    = saldoFinal > 0 ? "#fee2e2" : "#dcfce7";
    const saldoLabelTxtColor = saldoFinal > 0 ? "#991b1b" : "#166534";

    const htmlContent = `
    <div style="font-family: 'Inter', sans-serif; padding: 20px; color: #1a2f5a;">
      <div style="border-bottom: 2px solid #0d1b3e; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <div style="font-size: 24px; font-weight: 800; color: #0d1b3e;">${company.name}</div>
          <div style="font-size: 10px; color: #6b7280;">SISTEMA DE GESTIÓN FUNERARIA</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 14px; font-weight: 700; color: #c9a84c; text-transform: uppercase;">Ficha de Servicio</div>
          <div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">Emisión: ${emissionDate}</div>
        </div>
      </div>

      <div style="margin-bottom: 25px;">
        <div style="font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #f0f2f5; padding-bottom: 5px;">Información del Fallecido</div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f2f5; font-size: 12px; color: #6b7280; width: 151px;">Nombre Completo</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f2f5; font-size: 12px; color: #0d1b3e; font-weight: 500; text-align: right;">${form.deceasedName || "—"}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f2f5; font-size: 12px; color: #6b7280; width: 151px;">RUT</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f2f5; font-size: 12px; color: #0d1b3e; font-weight: 500; text-align: right;">${form.deceasedRut || "—"}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f2f5; font-size: 12px; color: #6b7280; width: 151px;">Fecha del Servicio</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f2f5; font-size: 12px; color: #0d1b3e; font-weight: 500; text-align: right;">${dateFormatted}</td></tr>
        </table>
      </div>

      <div style="margin-bottom: 25px;">
        <div style="font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #f0f2f5; padding-bottom: 5px;">Datos del Contratante</div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f2f5; font-size: 12px; color: #6b7280; width: 151px;">Nombre</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f2f5; font-size: 12px; color: #0d1b3e; font-weight: 500; text-align: right;">${form.contractorName || "—"}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f2f5; font-size: 12px; color: #6b7280; width: 151px;">RUT</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f2f5; font-size: 12px; color: #0d1b3e; font-weight: 500; text-align: right;">${form.contractorRut || "—"}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f2f5; font-size: 12px; color: #6b7280; width: 151px;">Teléfono</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f2f5; font-size: 12px; color: #0d1b3e; font-weight: 500; text-align: right;">${form.contractorPhone || "—"}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f2f5; font-size: 12px; color: #6b7280; width: 151px;">Correo</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f2f5; font-size: 12px; color: #0d1b3e; font-weight: 500; text-align: right;">${form.contractorEmail || "—"}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f2f5; font-size: 12px; color: #6b7280; width: 151px;">Dirección</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f2f5; font-size: 12px; color: #0d1b3e; font-weight: 500; text-align: right;">${form.contractorAddress || "—"}</td></tr>
        </table>
      </div>

      <div style="margin-bottom: 25px;">
        <div style="font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #f0f2f5; padding-bottom: 5px;">Detalle del Servicio</div>
        <table style="width: 100%; border-collapse: collapse;">
          ${purchasedRows.map(([l, v]) => `<tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f2f5; font-size: 12px; color: #6b7280; width: 151px;">${l}</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f2f5; font-size: 12px; color: #0d1b3e; font-weight: 500; text-align: right;">${v}</td></tr>`).join("")}
        </table>
      </div>

      <div style="margin-bottom: 25px;">
        <div style="font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #f0f2f5; padding-bottom: 5px;">Resumen Financiero</div>
        <table style="width: 100%; border-collapse: collapse;">
          ${valueRows.map(([l, v]) => `<tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f2f5; font-size: 12px; color: #6b7280; width: 151px;">${l}</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f2f5; font-size: 12px; color: #0d1b3e; font-weight: 500; text-align: right;">${v}</td></tr>`).join("")}
        </table>
      </div>

      <div style="margin-bottom: 25px;">
        <div style="font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #f0f2f5; padding-bottom: 5px;">Abonos y Saldo Pendiente</div>
        <table style="width: 100%; border-collapse: collapse;">
          ${abonoRows.map(([l, v, b]) => `<tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f2f5; font-size: 12px; color: ${b ? "#0d1b3e" : "#6b7280"}; font-weight: ${b ? "600" : "400"}; width: 151px;">${l}</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f2f5; font-size: 12px; color: ${b ? "#0d1b3e" : "#374151"}; font-weight: ${b ? "700" : "400"}; text-align: right;">${v}</td></tr>`).join("")}
        </table>
        <div style="margin-top: 20px; padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; background: ${saldoBg};">
          <span style="font-weight: 600; font-size: 13px; color: ${saldoLabelTxtColor};">Saldo Pendiente</span>
          <span style="font-weight: 800; font-size: 17px; color: ${saldoColor};">${formatCLP(saldoFinal)}</span>
        </div>
      </div>

      <div style="margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
        <div>
          <div style="border-top: 1.5px solid #0d1b3e; margin-top: 51px; padding-top: 10px; text-align: center; font-size: 11px; font-weight: 600;">Firma del Contratante</div>
          <div style="text-align: center; font-size: 11px; color: #374151; margin-top: 5px; font-weight: 500;">${form.contractorName || ""}</div>
        </div>
        <div>
          <div style="border-top: 1.5px solid #0d1b3e; margin-top: 51px; padding-top: 10px; text-align: center; font-size: 11px; font-weight: 600;">Firma Responsable ${company.name}</div>
        </div>
      </div>
    </div>
    `;

    openPrint(htmlContent, `Ficha ${form.deceasedName || "Servicio"}`);
  };
  // ────────────────────────────────────────────────────────────────────────────

  if (showVoucher) {
    return (
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => setShowVoucher(false)}
          className="flex items-center gap-2 mb-5 text-sm transition-colors"
          style={{ color: "#1a2f5a" }}
        >
          <ArrowLeft size={16} /> Volver al formulario
        </button>

        <div
          id="printable-voucher"
          className="rounded-2xl shadow-lg overflow-hidden"
          style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
        >
          {/* Voucher Header */}
          <div
            className="px-8 py-7"
            style={{ background: "linear-gradient(135deg, #0d1b3e 0%, #1a2f5a 100%)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #c9a84c, #e8c97a)" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L4 7v10l8 5 8-5V7L12 2z" fill="white" fillOpacity="0.9" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "#c9a84c", letterSpacing: "0.1em" }}>
                    COMPROBANTE DE SERVICIO
                  </p>
                  <p className="text-base" style={{ color: "#ffffff" }}>Sistema de Gestión Funeraria</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Fecha de emisión</p>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>
                  {new Date().toLocaleDateString("es-CL")}
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">
            {/* Deceased Info */}
            <div>
              <p className="text-xs mb-3" style={{ color: "#c9a84c", letterSpacing: "0.1em", fontWeight: 600 }}>
                INFORMACIÓN DEL SERVICIO
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Fallecido", form.deceasedName],
                  ["RUT Fallecido", form.deceasedRut],
                  ["Fecha del Servicio", new Date(form.date).toLocaleDateString("es-CL")],
                  ["Cementerio", form.cemetery],
                  ["Tipo de Servicio", form.serviceType],
                  ["Traslado desde", form.transferFrom],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl p-3" style={{ background: "#f8f9fa" }}>
                    <p className="text-xs" style={{ color: "#9ca3af" }}>{label}</p>
                    <p className="text-sm mt-0.5" style={{ color: "#0d1b3e", fontWeight: 500 }}>{value || "—"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contractor Info */}
            <div>
              <p className="text-xs mb-3" style={{ color: "#c9a84c", letterSpacing: "0.1em", fontWeight: 600 }}>
                DATOS DEL CONTRATANTE
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Nombre", form.contractorName],
                  ["RUT", form.contractorRut],
                  ["Teléfono", form.contractorPhone],
                  ["Correo", form.contractorEmail],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl p-3" style={{ background: "#f8f9fa" }}>
                    <p className="text-xs" style={{ color: "#9ca3af" }}>{label}</p>
                    <p className="text-sm mt-0.5" style={{ color: "#0d1b3e", fontWeight: 500 }}>{value || "—"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div>
              <p className="text-xs mb-3" style={{ color: "#c9a84c", letterSpacing: "0.1em", fontWeight: 600 }}>
                RESUMEN DE PAGOS
              </p>
              <div
                className="rounded-xl p-4"
                style={{ background: "linear-gradient(135deg, #f8f9fa, #f0f2f5)", border: "1px solid #e5e7eb" }}
              >
                {[
                  ["Valor del Servicio", formatCLP(serviceValue), true],
                  ["Costo de Traslado", formatCLP(transferCost), transferCost > 0],
                  ["Aporte Municipal", `- ${formatCLP(municipal)}`, municipal > 0],
                  ["Cuota Mortuoria", `- ${formatCLP(mortuary)}`, mortuary > 0],
                  ["Descuento", `- ${formatCLP(discount)}`, discount > 0],
                ]
                  .filter(([,, show]) => show)
                  .map(([label, value]) => (
                    <div key={label as string} className="flex justify-between py-1.5" style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <span className="text-xs" style={{ color: "#6b7280" }}>{label as string}</span>
                      <span className="text-xs" style={{ color: "#374151", fontWeight: 500 }}>{value as string}</span>
                    </div>
                  ))}
                <div className="flex justify-between py-2 mt-1">
                  <span className="text-sm" style={{ color: "#0d1b3e", fontWeight: 600 }}>Total Servicio</span>
                  <span className="text-sm" style={{ color: "#0d1b3e", fontWeight: 700 }}>{formatCLP(totalService)}</span>
                </div>
                {initial > 0 && (
                  <div className="flex justify-between py-1.5">
                    <span className="text-xs" style={{ color: "#16a34a" }}>Abono Inicial</span>
                    <span className="text-xs" style={{ color: "#16a34a", fontWeight: 500 }}>{formatCLP(initial)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 mt-1 rounded-xl px-3" style={{ background: saldo > 0 ? "#fee2e2" : "#dcfce7" }}>
                  <span className="text-sm" style={{ color: saldo > 0 ? "#991b1b" : "#166534", fontWeight: 600 }}>
                    Saldo Pendiente
                  </span>
                  <span className="text-sm" style={{ color: saldo > 0 ? "#dc2626" : "#16a34a", fontWeight: 700 }}>
                    {formatCLP(Math.max(0, saldo))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-4 flex justify-between items-center" style={{ background: "#f8f9fa", borderTop: "1px solid #e5e7eb" }}>
            <p className="text-xs" style={{ color: "#9ca3af" }}>
              Este documento es un comprobante oficial del servicio prestado.
            </p>
            <button
              onClick={() => {
                const voucherElement = document.getElementById('printable-voucher');
                if (voucherElement) {
                   openPrint(voucherElement.innerHTML, "Comprobante de Pago");
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all"
              style={{ background: "#0d1b3e", color: "#c9a84c" }}
            >
              <Printer size={15} /> Imprimir
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-xs" style={{ color: "#9ca3af" }}>Buscar Servicio Registrado</p>
          <select
            value={sortServicesBy}
            onChange={(e) => setSortServicesBy(e.target.value as any)}
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg border-none bg-gray-100"
            style={{ color: "#6b7280" }}
          >
            <option value="recent">Recientes</option>
            <option value="oldest">Antiguos</option>
            <option value="name">A-Z</option>
          </select>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs outline-none"
            style={{ border: "1.5px solid #e5e7eb", color: "#374151", background: "#fff" }}
            onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          >
            <option value="">Cargar servicio existente...</option>
            {[...services]
              .sort((a, b) => {
                if (sortServicesBy === "recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                if (sortServicesBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                return (a.contractorName || "").toLowerCase().localeCompare((b.contractorName || "").toLowerCase());
              })
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} — {s.deceasedName?.split(" ").slice(0, 2).join(" ") || s.serviceType}
                </option>
              ))}
          </select>
          <button
            onClick={handleNew}
            className="px-3 py-2 rounded-xl text-xs transition-all"
            style={{ background: "#f0f2f5", color: "#374151", border: "1.5px solid #e5e7eb" }}
          >
            + Nuevo
          </button>
        </div>
      </div>

      {/* ── Selector de Categoría ── */}
      <div
        className="rounded-2xl p-5 shadow-sm"
        style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: "rgba(201,168,76,0.1)", border: "1.5px solid rgba(201,168,76,0.3)" }}
          >
            <FileText size={17} style={{ color: "#c9a84c" }} />
          </div>
          <div>
            <h3 style={{ color: "#0d1b3e" }}>Categoría del Registro</h3>
            <p className="text-xs" style={{ color: "#9ca3af" }}>
              Selecciona el tipo de registro a ingresar
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              value: "Servicio Funerario",
              label: "Servicio Funerario",
              desc: "Servicio fúnebre asociado a un fallecido (traslado, velatorio, inhumación, etc.)",
              Icon: Heart,
              accent: "#1a2f5a",
              accentBg: "#eff6ff",
            },
            {
              value: "Venta de Artículo",
              label: "Venta de Artículo",
              desc: "Compra de lápida, jardinera, tallado u otros artículos funerarios",
              Icon: ShoppingBag,
              accent: "#92400e",
              accentBg: "#fef3c7",
            },
          ].map((opt) => {
            const active = form.serviceCategory === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={!editMode}
                onClick={() =>
                  setForm((p) => ({ ...p, serviceCategory: opt.value, serviceType: "" }))
                }
                className="text-left rounded-2xl p-4 transition-all"
                style={{
                  border: `2px solid ${active ? opt.accent : "#e5e7eb"}`,
                  background: active ? opt.accentBg : "#fafbfc",
                  opacity: !editMode ? 0.75 : 1,
                  cursor: !editMode ? "default" : "pointer",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: active ? opt.accent : "#f0f2f5" }}
                  >
                    <opt.Icon size={18} style={{ color: active ? "#ffffff" : "#9ca3af" }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className="text-sm"
                        style={{ color: active ? opt.accent : "#374151", fontWeight: active ? 600 : 400 }}
                      >
                        {opt.label}
                      </p>
                      {active && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-md"
                          style={{ background: opt.accent, color: "#ffffff", fontWeight: 600 }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-1" style={{ color: "#6b7280" }}>{opt.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {!form.serviceCategory && (
          <p className="mt-3 text-xs" style={{ color: "#f59e0b" }}>
            ⚠ Selecciona una categoría para continuar
          </p>
        )}
      </div>


      {/* ── Resto del formulario (solo si hay categoría) ── */}
      {form.serviceCategory && (
        <>
          {/* Section 3: Datos del Contratante — solo Servicio Funerario */}
          {!isProduct && (
          <div
            className="rounded-2xl p-5 shadow-sm"
            style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
          >
            <SectionHeader
              icon={Building2}
              title="Datos del Contratante"
              subtitle="Responsable del contrato y pago del servicio"
              color="#c9a84c"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <ClientAutocomplete
                  value={form.contractorName}
                  onChange={set("contractorName")}
                  onSelectClient={handleSelectClient}
                  disabled={!editMode}
                />
              </div>
              <RutInput
                label="RUT Contratante"
                value={form.contractorRut}
                onChange={set("contractorRut")}
                disabled={!editMode}
              />
              <div className="lg:col-span-3">
                <InputField
                  label="Dirección"
                  value={form.contractorAddress}
                  onChange={set("contractorAddress")}
                  placeholder="Calle, número, comuna, ciudad"
                  disabled={!editMode}
                />
              </div>
              <InputField
                label="Teléfono de Contacto"
                value={form.contractorPhone}
                onChange={set("contractorPhone")}
                placeholder="+56 9 1234 5678"
                disabled={!editMode}
              />
              <div className="lg:col-span-2">
                <InputField
                  label="Correo Electrónico"
                  type="email"
                  value={form.contractorEmail}
                  onChange={set("contractorEmail")}
                  placeholder="correo@ejemplo.com"
                  disabled={!editMode}
                />
              </div>
            </div>
          </div>
          )}

          {/* Section 2: Fallecido / Beneficiario */}
          <div
            className="rounded-2xl p-5 shadow-sm"
            style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
          >
            {isProduct ? (
              <>
                <SectionHeader
                  icon={User}
                  title="Datos del Cliente / Beneficiario"
                  subtitle="Persona que adquiere el artículo (opcional)"
                  color="#92400e"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <InputField
                      label="Nombre del Cliente (opcional)"
                      value={form.deceasedName}
                      onChange={set("deceasedName")}
                      placeholder="Nombre completo"
                      disabled={!editMode}
                    />
                  </div>
                  <RutInput
                    label="RUT (opcional)"
                    value={form.deceasedRut}
                    onChange={set("deceasedRut")}
                    disabled={!editMode}
                  />
                  <InputField
                    label="Teléfono (opcional)"
                    value={form.contractorPhone}
                    onChange={set("contractorPhone")}
                    placeholder="+56 9 1234 5678"
                    disabled={!editMode}
                  />
                </div>

                {/* ── Campo de Tallado ── */}
                {hasTallado && (
                  <div
                    className="mt-4 rounded-2xl p-4"
                    style={{ background: "linear-gradient(135deg, #fef3c7, #fef9ec)", border: "1.5px solid #fbbf24" }}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "#92400e" }}
                      >
                        <Type size={13} style={{ color: "#ffffff" }} />
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: "#92400e", fontWeight: 600 }}>
                          Texto para Tallado
                        </p>
                        <p className="text-xs" style={{ color: "#a16207" }}>
                          Ingresa el texto exacto a grabar en la lápida
                        </p>
                      </div>
                    </div>

                    {/* Textarea + contador */}
                    <div className="relative">
                      <textarea
                        value={form.engravingText}
                        onChange={(e) => set("engravingText")(e.target.value)}
                        disabled={!editMode}
                        rows={4}
                        placeholder={"Ej: Juan Pérez García\n12 de Enero 1940 — 3 de Marzo 2024\n\"En nuestros corazones vivirás siempre\""}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                        style={{
                          border: "1.5px solid #fbbf24",
                          color: "#0d1b3e",
                          background: !editMode ? "#fef9ec" : "#ffffff",
                          fontFamily: "Georgia, serif",
                          lineHeight: "1.7",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#92400e")}
                        onBlur={(e) => (e.target.style.borderColor = "#fbbf24")}
                      />

                      {/* Contador de caracteres */}
                      <div
                        className="mt-2 flex items-center justify-between"
                      >
                        {/* desglose por líneas */}
                        <div className="flex flex-wrap gap-2">
                          {form.engravingText
                            ? form.engravingText.split("\n").map((line, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs"
                                  style={{ background: "#fef3c7", border: "1px solid #fbbf24", color: "#92400e" }}
                                >
                                  <span style={{ color: "#a16207" }}>L{i + 1}</span>
                                  <span style={{ fontWeight: 600 }}>{line.length}</span>
                                  <span style={{ color: "#a16207" }}>letras</span>
                                </span>
                              ))
                            : (
                              <span className="text-xs" style={{ color: "#a16207" }}>
                                Las líneas se contarán al escribir el texto
                              </span>
                            )}
                        </div>

                        {/* total */}
                        <span
                          className="text-xs px-2.5 py-1 rounded-lg shrink-0 ml-2"
                          style={{
                            background: form.engravingText.length > 0 ? "#92400e" : "#f0f2f5",
                            color: form.engravingText.length > 0 ? "#ffffff" : "#9ca3af",
                            fontWeight: 600,
                          }}
                        >
                          {form.engravingText.replace(/\n/g, "").length} letras en total
                        </span>
                      </div>
                    </div>

                    {/* Vista previa estilo lápida */}
                    {form.engravingText.trim() && (
                      <div
                        className="mt-4 rounded-xl p-4 text-center"
                        style={{
                          background: "linear-gradient(180deg, #374151 0%, #1f2937 100%)",
                          border: "2px solid #6b7280",
                          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3)",
                        }}
                      >
                        <p className="text-xs mb-2" style={{ color: "rgba(201,168,76,0.7)", letterSpacing: "0.12em" }}>
                          VISTA PREVIA
                        </p>
                        {form.engravingText.split("\n").map((line, i) => (
                          <p
                            key={i}
                            className="leading-relaxed"
                            style={{
                              color: "#e8c97a",
                              fontFamily: "Georgia, serif",
                              fontSize: i === 0 ? "15px" : "13px",
                              fontWeight: i === 0 ? 600 : 400,
                              letterSpacing: "0.04em",
                              textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                            }}
                          >
                            {line || "\u00A0"}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <SectionHeader
                  icon={User}
                  title="Datos del Fallecido"
                  subtitle="Información del difunto y traslado"
                  color="#6b7280"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-2">
                    <InputField
                      label="Nombre del Fallecido"
                      value={form.deceasedName}
                      onChange={set("deceasedName")}
                      placeholder="Nombre completo"
                      disabled={!editMode}
                    />
                  </div>
                  <RutInput
                    label="RUT Fallecido"
                    value={form.deceasedRut}
                    onChange={set("deceasedRut")}
                    disabled={!editMode}
                  />
                  <div />
                  <div className="lg:col-span-2">
                    <InputField
                      label="Traslado desde"
                      value={form.transferFrom}
                      onChange={set("transferFrom")}
                      placeholder="Hospital / Domicilio / Clínica"
                      disabled={!editMode}
                    />
                  </div>
                  <MoneyInput
                    label="Costo de Traslado ($)"
                    value={form.transferCost}
                    onChange={set("transferCost")}
                    placeholder="0"
                    disabled={!editMode}
                  />
                  <div />

                  {/* Facturas */}
                  <div className="lg:col-span-1">
                    <InputField
                      label="N° Factura 1"
                      value={form.invoice1}
                      onChange={set("invoice1")}
                      placeholder="0001"
                      disabled={!editMode}
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <InputField
                      label="N° Factura 2"
                      value={form.invoice2}
                      onChange={set("invoice2")}
                      placeholder="0002"
                      disabled={!editMode}
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <InputField
                      label="N° Factura 3"
                      value={form.invoice3}
                      onChange={set("invoice3")}
                      placeholder="0003"
                      disabled={!editMode}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Section 1: Datos del Servicio */}
          <div
            className="rounded-2xl p-5 shadow-sm"
            style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
          >
            <SectionHeader
              icon={Calendar}
              title="Datos del Servicio"
              subtitle={isProduct ? "Artículo, precio y ubicación" : "Información general del servicio funerario"}
              color="#1a2f5a"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InputField
                label="Fecha"
                type="date"
                value={form.date}
                onChange={set("date")}
                disabled={!editMode}
              />
              {!isProduct && (
                <div className="lg:col-span-1">
                  <CemeteryAutocomplete
                    value={form.cemetery}
                    onChange={set("cemetery")}
                    disabled={!editMode}
                  />
                </div>
              )}
              <div className={isProduct ? "lg:col-span-2" : "lg:col-span-1"}>
                <InputField
                  label={isProduct ? "Artículo" : "Tipo de Servicio"}
                  value={form.serviceType}
                  onChange={(val) => {
                    setForm(p => {
                      const match = inventoryItems.find(i => i.name === val);
                      return {
                        ...p,
                        serviceType: val,
                        ...(match ? { serviceValue: match.price.toString() } : {})
                      };
                    });
                  }}
                  disabled={!editMode}
                  options={currentTypeOptions}
                />
              </div>
              <MoneyInput
                label={isProduct ? "Precio ($)" : "Valor del Servicio ($)"}
                value={form.serviceValue}
                onChange={set("serviceValue")}
                placeholder="0"
                disabled={!editMode}
              />
              {isProduct && (
                <div className="lg:col-span-4">
                  <label className="block text-xs mb-1.5" style={{ color: "#374151", fontWeight: 500 }}>Notas</label>
                  <textarea
                    value={form.observations}
                    onChange={(e) => set("observations")(e.target.value)}
                    disabled={!editMode}
                    rows={3}
                    placeholder="Observaciones sobre el artículo o la venta..."
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
                    style={{ border: "1.5px solid #e5e7eb", color: "#374151", background: !editMode ? "#f8f9fa" : "#ffffff" }}
                    onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Pagos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div
              className="lg:col-span-2 rounded-2xl p-5 shadow-sm"
              style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
            >
              <SectionHeader
                icon={CreditCard}
                title="Información de Pagos"
                subtitle={isProduct ? "Descuento y abono inicial" : "Aportes, descuentos y abonos aplicados"}
                color="#16a34a"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!isProduct && (
                  <>
                    <MoneyInput
                      label="Aporte Municipal ($)"
                      value={form.municipalContribution}
                      onChange={set("municipalContribution")}
                      placeholder="0"
                      disabled={!editMode}
                    />
                    <MoneyInput
                      label="Cuota Mortuoria ($)"
                      value={form.mortuaryFee}
                      onChange={set("mortuaryFee")}
                      placeholder="0"
                      disabled={!editMode}
                    />
                  </>
                )}
                <MoneyInput
                  label="Descuento ($)"
                  value={form.discount}
                  onChange={set("discount")}
                  placeholder="0"
                  disabled={!editMode}
                />
                <MoneyInput
                  label="Pie / Abono Inicial ($)"
                  value={form.initialPayment}
                  onChange={set("initialPayment")}
                  placeholder="0"
                  disabled={!editMode}
                />
                <InputField
                  label="Método Abono Inicial"
                  value={form.initialPaymentMethod}
                  onChange={set("initialPaymentMethod")}
                  options={["Efectivo", "Transferencia", "Cheque", "Tarjeta", "Crédito", "Débito"]}
                  disabled={!editMode}
                />
                <div className="sm:col-span-2">
                  <InputField
                    label="Observaciones del Pago"
                    value={form.paymentNotes}
                    onChange={set("paymentNotes")}
                    placeholder="Ej: Pago con cheque N° 123, abono parcial, etc."
                    disabled={!editMode}
                  />
                </div>
              </div>

              {/* Opciones de Cuotas */}
              <div className="mt-6 pt-6" style={{ borderTop: "1.5px solid #e5e7eb" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                    style={{ background: "rgba(201,168,76,0.1)", border: "1.5px solid rgba(201,168,76,0.3)" }}
                  >
                    <CreditCard size={14} style={{ color: "#c9a84c" }} />
                  </div>
                  <div>
                    <h4 className="text-sm" style={{ color: "#0d1b3e", fontWeight: 600 }}>
                      Modalidad de Pago en Cuotas
                    </h4>
                    <p className="text-xs" style={{ color: "#9ca3af" }}>
                      Configura el plan de cuotas para el saldo pendiente
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Switch para habilitar cuotas */}
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all" 
                      style={{ 
                        background: form.installmentsEnabled ? "rgba(201,168,76,0.08)" : "#fafbfc",
                        border: `1.5px solid ${form.installmentsEnabled ? "rgba(201,168,76,0.3)" : "#e5e7eb"}`,
                        opacity: !editMode ? 0.6 : 1
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.installmentsEnabled}
                        onChange={(e) => setForm((prev) => ({ ...prev, installmentsEnabled: e.target.checked }))}
                        disabled={!editMode}
                        className="w-5 h-5 rounded-md"
                        style={{ accentColor: "#c9a84c" }}
                      />
                      <div className="flex-1">
                        <span className="text-sm block" style={{ color: "#0d1b3e", fontWeight: 500 }}>
                          Habilitar Pago en Cuotas
                        </span>
                        <span className="text-xs block" style={{ color: "#6b7280" }}>
                          El saldo se dividirá en cuotas iguales
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Número de cuotas */}
                  {form.installmentsEnabled && (
                    <InputField
                      label="Número de Cuotas"
                      type="number"
                      value={form.numberOfInstallments}
                      onChange={set("numberOfInstallments")}
                      placeholder="3"
                      disabled={!editMode}
                    />
                  )}
                </div>

                {/* Información de cuotas calculadas */}
                {form.installmentsEnabled && saldo > 0 && (
                  <div
                    className="mt-4 p-4 rounded-xl"
                    style={{ background: "rgba(201,168,76,0.08)", border: "1.5px solid rgba(201,168,76,0.2)" }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "#c9a84c" }}
                      >
                        <CreditCard size={16} style={{ color: "#ffffff" }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs mb-2" style={{ color: "#92400e", fontWeight: 600 }}>
                          PLAN DE CUOTAS CALCULADO
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs" style={{ color: "#6b7280" }}>Saldo a financiar</p>
                            <p className="text-sm" style={{ color: "#0d1b3e", fontWeight: 700 }}>
                              {formatCLP(saldo)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: "#6b7280" }}>Monto por cuota</p>
                            <p className="text-sm" style={{ color: "#16a34a", fontWeight: 700 }}>
                              {(() => {
                                const n = parseInt(form.numberOfInstallments, 10) || 1;
                                if (n <= 6) return formatCLP(Math.ceil(saldo / n));
                                
                                const monthlyRate = 0.03;
                                const factor = (monthlyRate * Math.pow(1 + monthlyRate, n)) / 
                                               (Math.pow(1 + monthlyRate, n) - 1);
                                return formatCLP(Math.ceil(saldo * factor));
                              })()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: "#6b7280" }}>Interés aplicado (Total)</p>
                            <p className="text-sm" style={{ color: parseInt(form.numberOfInstallments, 10) > 6 ? "#dc2626" : "#6b7280", fontWeight: 700 }}>
                              {(() => {
                                const n = parseInt(form.numberOfInstallments, 10) || 1;
                                if (n <= 6) return "Sin interés";
                                
                                const monthlyRate = 0.03;
                                const factor = (monthlyRate * Math.pow(1 + monthlyRate, n)) / 
                                               (Math.pow(1 + monthlyRate, n) - 1);
                                const cuota = Math.ceil(saldo * factor);
                                const total = cuota * n;
                                return formatCLP(total - saldo);
                              })()}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs mt-2" style={{ color: "#6b7280" }}>
                          {parseInt(form.numberOfInstallments, 10) > 6 ? (
                            <span style={{ color: "#dc2626", fontWeight: 600 }}>
                              ⚠️ Aplicado recargo del 3% mensual por el plan de cuotas (sobre 6 meses)
                            </span>
                          ) : (
                            <span>💡 Precio contado configurado para 6 cuotas o menos</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Resumen Calculado */}
            <div
              className="rounded-2xl p-5 shadow-sm flex flex-col"
              style={{
                background: "linear-gradient(135deg, #0d1b3e 0%, #1a2f5a 100%)",
                border: "1px solid #0d1b3e",
              }}
            >
              <div className="flex items-center gap-2 mb-5">
                <DollarSign size={16} style={{ color: "#c9a84c" }} />
                <h3 style={{ color: "#ffffff" }}>Resumen Financiero</h3>
              </div>

              <div className="space-y-3 flex-1">
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {isProduct ? "Precio Artículo" : "Valor Servicio"}
                  </span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                    {formatCLP(serviceValue)}
                  </span>
                </div>
                {!isProduct && (
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Traslado</span>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                      {formatCLP(transferCost)}
                    </span>
                  </div>
                )}
                <div className="h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Total</span>
                  <span className="text-sm" style={{ color: "#ffffff", fontWeight: 700 }}>{formatCLP(totalService)}</span>
                </div>
                <div className="h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
                {!isProduct && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>− Aporte Municipal</span>
                      <span className="text-xs" style={{ color: "#86efac", fontWeight: 500 }}>{formatCLP(municipal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>− Cuota Mortuoria</span>
                      <span className="text-xs" style={{ color: "#86efac", fontWeight: 500 }}>{formatCLP(mortuary)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>− Descuento</span>
                  <span className="text-xs" style={{ color: "#86efac", fontWeight: 500 }}>{formatCLP(discount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>− Abono Inicial</span>
                  <span className="text-xs" style={{ color: "#86efac", fontWeight: 500 }}>{formatCLP(initial)}</span>
                </div>
                <div className="h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Total Abonado</span>
                  <span className="text-sm" style={{ color: "#86efac", fontWeight: 600 }}>{formatCLP(totalAbonado)}</span>
                </div>
              </div>

              <div
                className="mt-4 p-3 rounded-xl"
                style={{ background: saldo > 0 ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)" }}
              >
                <p className="text-xs mb-1" style={{ color: saldo > 0 ? "#fca5a5" : "#86efac" }}>
                  Saldo Pendiente
                </p>
                <p className="text-xl" style={{ color: saldo > 0 ? "#ef4444" : "#22c55e", fontWeight: 800 }}>
                  {formatCLP(Math.max(0, saldo))}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Observaciones Internas */}
          <div
            className="rounded-2xl p-5 shadow-sm"
            style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
          >
            <SectionHeader
              icon={FileText}
              title="Observaciones Internas"
              subtitle="Notas adicionales que NO aparecerán en la ficha impresa"
              color="#6b7280"
            />
            <div className="relative">
              <textarea
                value={form.observations}
                onChange={(e) => set("observations")(e.target.value)}
                disabled={!editMode}
                rows={3}
                placeholder="Ingresa notas u observaciones internas aquí..."
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                style={{
                  border: "1.5px solid #e5e7eb",
                  color: "#0d1b3e",
                  background: !editMode ? "#f8f9fa" : "#ffffff",
                  lineHeight: "1.6",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className="rounded-2xl p-4 shadow-sm"
            style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
          >
            <div className="flex flex-wrap gap-3 justify-end">
              {editMode ? (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all shadow-md"
                  style={{ background: "linear-gradient(135deg, #0d1b3e, #1a2f5a)", color: "#c9a84c" }}
                >
                  <Save size={15} /> {currentServiceId ? "Actualizar Información" : "Guardar"}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all"
                    style={{ background: "#f0f2f5", color: "#374151", border: "1.5px solid #e5e7eb" }}
                  >
                    <Edit3 size={15} /> Editar
                  </button>
                  <button
                    onClick={() => setShowVoucher(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all"
                    style={{ background: "linear-gradient(135deg, #c9a84c, #e8c97a)", color: "#0d1b3e" }}
                  >
                    <Download size={15} /> Generar Comprobante
                  </button>
                  <button
                    onClick={handlePrintFicha}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm"
                    style={{ background: "linear-gradient(135deg, #0d1b3e, #1a2f5a)", color: "#c9a84c" }}
                  >
                    <Printer size={15} /> Imprimir Ficha
                  </button>
                </>
              )}
            </div>
            {saved && !editMode && (
              <div
                className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{ background: "#dcfce7", border: "1px solid #bbf7d0" }}
              >
                <CheckCircle size={15} style={{ color: "#16a34a" }} />
                <span className="text-xs" style={{ color: "#166534" }}>
                  Registro guardado exitosamente.
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}