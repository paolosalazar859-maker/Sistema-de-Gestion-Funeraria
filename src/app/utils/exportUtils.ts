import { FuneralService } from "../data/mockData";

const formatCLP = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);

// ── Export services to CSV (opens as Excel on Windows/Mac) ─────────────────
export function exportServicesToCSV(services: FuneralService[]) {
  if (services.length === 0) return;

  const headers = [
    "Código",
    "Categoría",
    "Tipo Servicio",
    "Fecha Servicio",
    "Cementerio",
    "Fallecido",
    "RUT Fallecido",
    "Traslado desde",
    "Contratante",
    "RUT Contratante",
    "Teléfono",
    "Correo",
    "Dirección",
    "Valor Servicio",
    "Costo Traslado",
    "Aporte Municipal",
    "Cuota Mortuoria",
    "Descuento",
    "Abono Inicial",
    "Total Servicio",
    "Total Abonado",
    "Saldo Pendiente",
    "Estado",
    "Último Pago",
    "N° Abonos",
  ];

  const escape = (val: string | number | undefined) => {
    const str = String(val ?? "");
    // Wrap in quotes and escape existing quotes
    return `"${str.replace(/"/g, '""')}"`;
  };

  const rows = services.map((s) => [
    escape(s.id),
    escape(s.serviceCategory),
    escape(s.serviceType),
    escape(s.date),
    escape(s.cemetery),
    escape(s.deceasedName),
    escape(s.deceasedRut),
    escape(s.transferFrom),
    escape(s.contractorName),
    escape(s.contractorRut),
    escape(s.contractorPhone),
    escape(s.contractorEmail),
    escape(s.contractorAddress),
    escape(s.serviceValue),
    escape(s.transferCost),
    escape(s.municipalContribution),
    escape(s.mortuaryFee),
    escape(s.discount),
    escape(s.initialPayment),
    escape(s.totalService),
    escape(s.totalPaid),
    escape(s.pendingBalance),
    escape(s.status),
    escape(s.lastPaymentDate),
    escape(s.payments.length),
  ]);

  const csvContent =
    "\uFEFF" + // BOM for Excel UTF-8
    [headers.map((h) => `"${h}"`).join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `AURA_Cobros_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Export payment history of a single service ──────────────────────────────
export function exportPaymentsCSV(service: FuneralService) {
  if (service.payments.length === 0) return;

  const headers = [
    "N°",
    "Fecha",
    "Monto Abonado",
    "Método de Pago",
    "Saldo Restante",
    "Observaciones",
  ];

  const escape = (val: string | number | undefined) =>
    `"${String(val ?? "").replace(/"/g, '""')}"`;

  const rows = service.payments.map((p, i) => [
    escape(i + 1),
    escape(p.date),
    escape(p.amount),
    escape(p.method),
    escape(p.balance),
    escape(p.notes ?? ""),
  ]);

  const csvContent =
    "\uFEFF" +
    [
      `"Historial de Pagos — Servicio ${service.id}"`,
      `"Contratante:";${escape(service.contractorName)}`,
      `"Fallecido:";${escape(service.deceasedName)}`,
      `"Total Servicio:";${escape(service.totalService)}`,
      `"Total Abonado:";${escape(service.totalPaid)}`,
      `"Saldo Pendiente:";${escape(service.pendingBalance)}`,
      "",
      headers.map((h) => `"${h}"`).join(";"),
      ...rows.map((r) => r.join(";")),
    ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Pagos_${service.id}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
