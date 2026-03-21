export type PaymentStatus = "Pagado" | "Abonando" | "Deuda Total";

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: "Efectivo" | "Transferencia" | "Cheque" | "Tarjeta";
  balance: number;
  notes?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  createdAt: string;
}

export interface FuneralService {
  id: string;
  // Categoría y tipo
  serviceCategory: string;   // "Servicio Funerario" | "Venta de Artículo"
  engravingText?: string;    // Texto a tallar (solo cuando aplica tallado)
  // Datos del Servicio
  date: string;
  cemetery: string;
  serviceType: string;
  serviceValue: number;
  // Datos del Fallecido
  deceasedName: string;
  deceasedRut: string;
  transferFrom: string;
  transferCost: number;
  // Datos del Contratante
  contractorName: string;
  contractorRut: string;
  contractorAddress: string;
  contractorPhone: string;
  contractorEmail: string;
  // Facturas
  invoice1?: string;
  invoice2?: string;
  invoice3?: string;
  // Pagos
  municipalContribution: number;
  mortuaryFee: number;
  discount: number;
  initialPayment: number;
  // Cuotas
  installments?: {
    enabled: boolean;
    totalInstallments: number;
    baseAmount: number;      // Cuota base (precio contado / total)
    surchargeAmount: number; // Recargo mensual aplicado después de la cuota 5
    paidInstallments: number;
  };
  // Calculados
  totalService: number;
  totalPaid: number;
  pendingBalance: number;
  status: PaymentStatus;
  lastPaymentDate: string;
  payments: Payment[];
  createdAt: string;
}

export const mockServices: FuneralService[] = [];

export const monthlyData: { month: string; recaudado: number; deuda: number }[] = [];

// Tipos por categoría
export const funeralServiceTypes = [
  "Urna Básica",
  "Urna Francesa Pino",
  "Urna Francesa Roble",
  "Urna Gonda Terciado",
  "Urna IPS",
  "Urna Mackler (sin especificación)",
  "Urna Mackler Básica",
  "Urna Mackler Pino",
  "Urna Mackler Pino Cuerpo Entero",
  "Urna Mackler Pino Española",
  "Urna Mackler Raulí",
  "Urna Mackler Secoya",
  "Urna Mackler Terciado Consul",
];

export const productServiceTypes = [
  "Lápida",
  "Jardinera",
  "Tallado",
  "Lápida + Tallado",
  "Lápida + Jardinera",
  "Tallado + Jardinera",
  "Lápida + Tallado + Jardinera",
  "Imagen Cromada Pequeña",
  "Imagen Cromada Mediana",
];

// Mantenemos serviceTypes para compatibilidad
export const serviceTypes = [...funeralServiceTypes, ...productServiceTypes];

export const cemeteries = [
  "Cementerio General",
  "Cementerio Parque del Recuerdo",
  "Cementerio Metropolitano",
  "Cementerio Parque Santiago",
  "Cementerio Católico",
  "Cementerio Israelita",
  "Cementerio Municipal de Maipú",
];