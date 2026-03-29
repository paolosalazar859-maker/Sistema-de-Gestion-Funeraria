import { FuneralService, Payment } from "../data/mockData";
import { loadCompanyProfile } from "../data/companyStore";

const formatCLP = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr === "-") return "—";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" });
};

const today = () =>
  new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" });

const now = () =>
  new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });

// ── Shared styles ─────────────────────────────────────────────────────────────
const BASE_STYLE = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; font-size: 12px; color: #1a1a2e; background: #fff; }
    .page { max-width: 780px; margin: 0 auto; padding: 32px 36px; }
    /* Header */
    .header { display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 18px; border-bottom: 2px solid #0d1b3e; margin-bottom: 20px; }
    .brand-logo { display: flex; flex-direction: column; }
    .brand-name { font-size: 28px; font-weight: 800; color: #0d1b3e; letter-spacing: 0.15em; }
    .brand-sub  { font-size: 10px; color: #6b7280; letter-spacing: 0.12em; text-transform: uppercase; margin-top: 2px; }
    .doc-info   { text-align: right; }
    .doc-title  { font-size: 14px; font-weight: 700; color: #0d1b3e; text-transform: uppercase; letter-spacing: 0.06em; }
    .doc-num    { font-size: 18px; font-weight: 800; color: #c9a84c; margin-top: 2px; }
    .doc-date   { font-size: 10px; color: #6b7280; margin-top: 3px; }
    /* Section */
    .section    { margin-bottom: 16px; }
    .sec-title  { font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
    .sec-title::after { content: ''; flex: 1; height: 1px; background: #e5e7eb; }
    .card       { background: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px; }
    /* Grid */
    .grid-2     { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
    .grid-3     { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px 16px; }
    .field      { display: flex; flex-direction: column; gap: 1px; }
    .field-label{ font-size: 9.5px; color: #9ca3af; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .field-value{ font-size: 12px; color: #0d1b3e; font-weight: 500; }
    /* Financials */
    .fin-table  { width: 100%; border-collapse: collapse; }
    .fin-table td { padding: 7px 10px; border-bottom: 1px solid #f0f2f5; }
    .fin-table td:last-child { text-align: right; font-weight: 500; }
    .fin-label  { color: #6b7280; }
    .fin-total  { background: #0d1b3e; color: #fff !important; font-weight: 700 !important; border-radius: 6px; }
    .fin-total td { color: #fff !important; border: none !important; }
    .saldo-ok   { background: #dcfce7; color: #166534 !important; font-weight: 700 !important; }
    .saldo-ok td { color: #166534 !important; border: none !important; border-radius: 6px; }
    .saldo-debt { background: #fee2e2; }
    .saldo-debt td { color: #991b1b !important; border: none !important; border-radius: 6px; }
    .gold-val   { color: #c9a84c; font-weight: 700; }
    /* Payments table */
    .pay-table  { width: 100%; border-collapse: collapse; }
    .pay-table th { padding: 8px 10px; background: #0d1b3e; color: #c9a84c; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; text-align: left; }
    .pay-table th:first-child { border-radius: 8px 0 0 8px; }
    .pay-table th:last-child  { border-radius: 0 8px 8px 0; text-align: right; }
    .pay-table td { padding: 8px 10px; border-bottom: 1px solid #f0f2f5; font-size: 11.5px; color: #374151; }
    .pay-table td:last-child { text-align: right; }
    .pay-table tr:last-child td { border-bottom: none; }
    /* Badge */
    .badge      { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 10px; font-weight: 600; }
    .badge-ok   { background: #dcfce7; color: #166534; }
    .badge-debt { background: #fee2e2; color: #991b1b; }
    .badge-partial { background: #fef9c3; color: #854d0e; }
    /* Signatures */
    .sig-row    { display: flex; gap: 40px; margin-top: 30px; }
    .sig-box    { flex: 1; text-align: center; }
    .sig-line   { border-top: 1.5px solid #0d1b3e; margin-bottom: 6px; margin-top: 40px; }
    .sig-name   { font-size: 10.5px; font-weight: 600; color: #0d1b3e; }
    .sig-role   { font-size: 9.5px; color: #9ca3af; margin-top: 1px; }
    /* Footer */
    .footer     { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
    .footer-note{ font-size: 9.5px; color: #9ca3af; }
    .footer-stamp{ font-size: 9.5px; color: #9ca3af; }
    @media print { @page { margin: 10mm; } }
  </style>
`;

export function openPrint(html: string, title: string) {
  console.log(`🖨️ Iniciando proceso de impresión: "${title}"`);

  // 1. Intentar usar la API nativa de Electron si está disponible
  if ((window as any).electronAPI?.printHTML) {
    console.log("🖥️ Utilizando API nativa de Electron para impresión");
    // Envolver el HTML con el estilo base antes de enviar al proceso principal
    const completeHtml = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>${title}</title>${BASE_STYLE}</head><body>${html}</body></html>`;
    
    (window as any).electronAPI.printHTML(completeHtml).then((result: any) => {
      if (result && !result.success && result.error) {
        console.error("❌ Error en impresión nativa:", result.error);
        alert(`Error al imprimir: ${result.error}. Intentando método alternativo...`);
        // Si falla la nativa, intentamos el fallback
        performBrowserPrint(completeHtml, title);
      } else {
        console.log("✅ Impresión nativa enviada con éxito");
      }
    }).catch((err: any) => {
      console.error("❌ Excepción en impresión nativa:", err);
      performBrowserPrint(html, title);
    });
    return;
  }

  // 2. Fallback: Abrir ventana nueva (comportamiento original / modo web)
  console.warn("🌐 API de Electron no detectada. Usando impresión de navegador.");
  const completeHtml = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>${title}</title>${BASE_STYLE}</head><body>${html}</body></html>`;
  performBrowserPrint(completeHtml, title);
}

/**
 * Método de impresión estándar del navegador como fallback
 */
function performBrowserPrint(html: string, title: string) {
  const win = window.open("", "_blank", "width=900,height=800");
  if (!win) {
    alert("No se pudo abrir la ventana de impresión. Por favor, asegúrate de que los pop-ups estén permitidos.");
    return;
  }
  
  // Asegurarnos de que el HTML sea un documento completo
  const fullHtml = html.toLowerCase().includes('<!doctype') 
    ? html 
    : `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>${title}</title>${BASE_STYLE}</head><body>${html}</body></html>`;

  win.document.write(fullHtml);
  win.document.close();
  
  win.onload = () => {
    setTimeout(() => {
      win.focus();
      win.print();
      // En modo navegador, no cerramos automáticamente para que el usuario pueda ver si algo falló
    }, 500);
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. COMPROBANTE DE SERVICIO COMPLETO
// ─────────────────────────────────────────────────────────────────────────────
export function printServiceVoucher(service: FuneralService) {
  const company = loadCompanyProfile();
  const saldoFinal = Math.max(0, service.pendingBalance);
  const statusClass = service.status === "Pagado" ? "badge-ok" : service.status === "Abonando" ? "badge-partial" : "badge-debt";

  const paymentRows = service.payments.length === 0
    ? `<tr><td colspan="5" style="text-align:center;color:#9ca3af;padding:16px;">Sin abonos registrados</td></tr>`
    : service.payments.map((p, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${formatDate(p.date)}</td>
          <td style="font-weight:600;color:#16a34a;">${formatCLP(p.amount)}</td>
          <td>${p.method}</td>
          <td style="color:${p.balance > 0 ? "#dc2626" : "#16a34a"};font-weight:600;">${formatCLP(p.balance)}</td>
        </tr>`).join("");

  // Generar HTML para información de cuotas
  const installmentsSection = service.installments?.enabled ? `
    <!-- PLAN DE CUOTAS -->
    <div class="section">
      <div class="sec-title">Plan de Cuotas</div>
      <div class="card" style="background:#fef9c3;border-color:#e8c97a;">
        <div class="grid-2" style="margin-bottom:12px;">
          <div class="field"><span class="field-label">Total de Cuotas</span><span class="field-value">${service.installments.totalInstallments}</span></div>
          <div class="field"><span class="field-label">Cuota (1-5)</span><span class="field-value gold-val">${formatCLP(service.installments.baseAmount)}</span></div>
          ${service.installments.surchargeAmount > 0 ? `
            <div class="field"><span class="field-label">Cuota (6+)</span><span class="field-value" style="color:#dc2626;font-weight:700;">${formatCLP(service.installments.baseAmount + service.installments.surchargeAmount)}</span></div>
          ` : ""}
          <div class="field"><span class="field-label">Cuotas Pagadas</span><span class="field-value" style="color:#16a34a;">${service.installments.paidInstallments}</span></div>
          <div class="field"><span class="field-label">Cuotas Pendientes</span><span class="field-value" style="color:#dc2626;">${service.installments.totalInstallments - service.installments.paidInstallments}</span></div>
        </div>
        <div style="padding:10px;background:#fff;border-radius:6px;text-align:center;">
          <span style="font-size:10px;color:#92400e;font-weight:600;">PROGRESO: ${service.installments.paidInstallments} / ${service.installments.totalInstallments} cuotas completadas</span>
        </div>
      </div>
    </div>
  ` : "";

  const html = `
  <div class="page">
    <!-- HEADER -->
    <div class="header">
      <div class="brand-logo">
        ${company.logoBase64 ? `<img src="${company.logoBase64}" style="max-height: 48px; max-width: 160px; object-fit: contain; margin-bottom: 4px;" />` : `<span class="brand-name">${company.name}</span>`}
        <span class="brand-sub">${company.subtitle}</span>
      </div>
      <div class="doc-info">
        <div class="doc-title">Comprobante de Servicio</div>
        <div class="doc-num">${service.id}</div>
        <div class="doc-date">Emitido el ${today()} a las ${now()}</div>
        <div style="margin-top:6px;"><span class="badge ${statusClass}">${service.status}</span></div>
      </div>
    </div>

    <!-- SERVICIO -->
    <div class="section">
      <div class="sec-title">Datos del Servicio</div>
      <div class="card">
        <div class="grid-3">
          <div class="field"><span class="field-label">Categoría</span><span class="field-value">${service.serviceCategory || "—"}</span></div>
          <div class="field"><span class="field-label">Tipo de Servicio</span><span class="field-value">${service.serviceType || "—"}</span></div>
          <div class="field"><span class="field-label">Fecha del Servicio</span><span class="field-value">${formatDate(service.date)}</span></div>
          <div class="field"><span class="field-label">Cementerio</span><span class="field-value">${service.cemetery || "—"}</span></div>
          <div class="field"><span class="field-label">Traslado desde</span><span class="field-value">${service.transferFrom || "—"}</span></div>
          ${service.engravingText ? `<div class="field"><span class="field-label">Texto de Tallado</span><span class="field-value">${service.engravingText}</span></div>` : ""}
        </div>
      </div>
    </div>

    <!-- FALLECIDO + CONTRATANTE -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
      <div class="section" style="margin-bottom:0;">
        <div class="sec-title">Datos del Fallecido</div>
        <div class="card" style="height:calc(100% - 26px);">
          <div style="display:grid;gap:8px;">
            <div class="field"><span class="field-label">Nombre</span><span class="field-value">${service.deceasedName || "—"}</span></div>
            <div class="field"><span class="field-label">RUT</span><span class="field-value">${service.deceasedRut || "—"}</span></div>
          </div>
        </div>
      </div>
      <div class="section" style="margin-bottom:0;">
        <div class="sec-title">Datos del Contratante</div>
        <div class="card" style="height:calc(100% - 26px);">
          <div style="display:grid;gap:6px;">
            <div class="field"><span class="field-label">Nombre</span><span class="field-value">${service.contractorName || "—"}</span></div>
            <div class="field"><span class="field-label">RUT</span><span class="field-value">${service.contractorRut || "—"}</span></div>
            <div class="field"><span class="field-label">Teléfono</span><span class="field-value">${service.contractorPhone || "—"}</span></div>
            <div class="field"><span class="field-label">Correo</span><span class="field-value">${service.contractorEmail || "—"}</span></div>
            <div class="field"><span class="field-label">Dirección</span><span class="field-value">${service.contractorAddress || "—"}</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- FINANCIERO -->
    <div class="section">
      <div class="sec-title">Resumen Financiero</div>
      <div class="card" style="padding:0;overflow:hidden;">
        <table class="fin-table">
          <tbody>
            <tr><td class="fin-label">Valor del Servicio</td><td>${formatCLP(service.serviceValue)}</td></tr>
            ${service.transferCost > 0 ? `<tr><td class="fin-label">Costo de Traslado</td><td>${formatCLP(service.transferCost)}</td></tr>` : ""}
            <tr class="fin-total"><td><strong>Total del Servicio</strong></td><td><strong>${formatCLP(service.totalService)}</strong></td></tr>
            ${service.municipalContribution > 0 ? `<tr><td class="fin-label" style="padding-left:20px;">− Aporte Municipal</td><td style="color:#16a34a;">${formatCLP(service.municipalContribution)}</td></tr>` : ""}
            ${service.mortuaryFee > 0 ? `<tr><td class="fin-label" style="padding-left:20px;">− Cuota Mortuoria</td><td style="color:#16a34a;">${formatCLP(service.mortuaryFee)}</td></tr>` : ""}
            ${service.discount > 0 ? `<tr><td class="fin-label" style="padding-left:20px;">− Descuento</td><td style="color:#16a34a;">${formatCLP(service.discount)}</td></tr>` : ""}
            ${service.initialPayment > 0 ? `<tr><td class="fin-label" style="padding-left:20px;">− Abono Inicial</td><td style="color:#16a34a;">${formatCLP(service.initialPayment)}</td></tr>` : ""}
            <tr class="${saldoFinal > 0 ? "saldo-debt" : "saldo-ok"}">
              <td><strong>Saldo Pendiente</strong></td>
              <td><strong>${formatCLP(saldoFinal)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    ${installmentsSection}

    <!-- HISTORIAL DE PAGOS -->
    <div class="section">
      <div class="sec-title">Historial de Abonos (${service.payments.length})</div>
      <table class="pay-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Monto</th>
            <th>Método</th>
            <th>Saldo Restante</th>
          </tr>
        </thead>
        <tbody>${paymentRows}</tbody>
      </table>
    </div>

    <!-- FIRMAS -->
    <div class="sig-row">
      <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-name">${service.contractorName || "Contratante"}</div>
        <div class="sig-role">Firma del Contratante · RUT: ${service.contractorRut || "—"}</div>
      </div>
      <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-name">${company.name}</div>
        <div class="sig-role">Firma y Timbre Empresa</div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <div class="footer-note">Este documento es el comprobante oficial del servicio funerario contratado con ${company.name}.</div>
      <div class="footer-stamp">Generado: ${today()} ${now()}</div>
    </div>
  </div>`;

  openPrint(html, `Comprobante ${service.id}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. RECIBO DE ABONO INDIVIDUAL
// ─────────────────────────────────────────────────────────────────────────────
export function printPaymentReceipt(service: FuneralService, payment: Payment, paymentNum: number) {
  const company = loadCompanyProfile();
  const receiptId = `REC-${service.id}-${String(paymentNum).padStart(2, "0")}`;
  const isPaid = payment.balance <= 0;

  const html = `
  <div class="page">
    <!-- HEADER -->
    <div class="header">
      <div class="brand-logo">
        ${company.logoBase64 ? `<img src="${company.logoBase64}" style="max-height: 48px; max-width: 160px; object-fit: contain; margin-bottom: 4px;" />` : `<span class="brand-name">${company.name}</span>`}
        <span class="brand-sub">${company.subtitle}</span>
      </div>
      <div class="doc-info">
        <div class="doc-title">Recibo de Abono</div>
        <div class="doc-num">${receiptId}</div>
        <div class="doc-date">Emitido el ${today()} a las ${now()}</div>
      </div>
    </div>

    <!-- REFERENCIA DEL SERVICIO -->
    <div class="section">
      <div class="sec-title">Referencia de Servicio</div>
      <div class="card">
        <div class="grid-3">
          <div class="field"><span class="field-label">N° Servicio</span><span class="field-value gold-val">${service.id}</span></div>
          <div class="field"><span class="field-label">Fallecido</span><span class="field-value">${service.deceasedName || "—"}</span></div>
          <div class="field"><span class="field-label">Tipo de Servicio</span><span class="field-value">${service.serviceType || "—"}</span></div>
        </div>
      </div>
    </div>

    <!-- DATOS DEL PAGADOR -->
    <div class="section">
      <div class="sec-title">Datos del Pagador</div>
      <div class="card">
        <div class="grid-2">
          <div class="field"><span class="field-label">Nombre</span><span class="field-value">${service.contractorName || "—"}</span></div>
          <div class="field"><span class="field-label">RUT</span><span class="field-value">${service.contractorRut || "—"}</span></div>
          <div class="field"><span class="field-label">Teléfono</span><span class="field-value">${service.contractorPhone || "—"}</span></div>
          <div class="field"><span class="field-label">Correo</span><span class="field-value">${service.contractorEmail || "—"}</span></div>
        </div>
      </div>
    </div>

    <!-- DETALLE DEL ABONO -->
    <div class="section">
      <div class="sec-title">Detalle del Abono</div>
      <div class="card" style="padding:0;overflow:hidden;">
        <table class="fin-table">
          <tbody>
            <tr><td class="fin-label">Fecha de Pago</td><td>${formatDate(payment.date)}</td></tr>
            <tr><td class="fin-label">Método de Pago</td><td>${payment.method}</td></tr>
            ${payment.notes ? `<tr><td class="fin-label">Observaciones</td><td>${payment.notes}</td></tr>` : ""}
            ${service.installments?.enabled ? `
              <tr style="background:#fef9c3;">
                <td class="fin-label" style="color:#92400e;font-weight:600;">💳 Plan de Cuotas</td>
                <td style="color:#92400e;font-weight:600;">${service.installments.paidInstallments} / ${service.installments.totalInstallments} pagadas</td>
              </tr>
              <tr style="background:#fef9c3;">
                <td class="fin-label" style="padding-left:20px;">Valor por cuota</td>
                <td style="color:#c9a84c;font-weight:600;">${formatCLP(paymentNum <= 5 ? service.installments.baseAmount : (service.installments.baseAmount + service.installments.surchargeAmount))}</td>
              </tr>
            ` : ""}
            <tr style="background:#f8f9fa;"><td class="fin-label">Total Servicio</td><td>${formatCLP(service.totalService)}</td></tr>
            <tr style="background:#f8f9fa;"><td class="fin-label">Total Abonado (acumulado)</td><td style="color:#16a34a;font-weight:600;">${formatCLP(service.totalPaid)}</td></tr>
            <tr class="fin-total"><td><strong>Monto de Este Abono</strong></td><td><strong style="font-size:15px;color:#c9a84c;">${formatCLP(payment.amount)}</strong></td></tr>
            <tr class="${isPaid ? "saldo-ok" : "saldo-debt"}">
              <td><strong>${isPaid ? "✓ Servicio Cancelado" : "Saldo Pendiente"}</strong></td>
              <td><strong>${formatCLP(payment.balance)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- FIRMAS -->
    <div class="sig-row">
      <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-name">${service.contractorName || "Contratante"}</div>
        <div class="sig-role">Firma del Pagador · RUT: ${service.contractorRut || "—"}</div>
      </div>
      <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-name">${company.name}</div>
        <div class="sig-role">Firma y Timbre Empresa</div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <div class="footer-note">Este recibo acredita el pago N° ${paymentNum} asociado al servicio ${service.id}. Consérvelo como respaldo.</div>
      <div class="footer-stamp">Generado: ${today()} ${now()}</div>
    </div>
  </div>`;

  openPrint(html, `Recibo ${receiptId}`);
}
