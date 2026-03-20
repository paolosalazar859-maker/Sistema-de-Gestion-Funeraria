import { loadServices, computeMonthlyData, recalculateAllStatuses } from "../data/serviceStore";
import { TrendingUp, AlertTriangle, FileText, Users, DollarSign, ArrowRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const formatCLP = (value: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(value);

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    Pagado: { bg: "#dcfce7", color: "#166534", dot: "#22c55e" },
    Abonando: { bg: "#fef9c3", color: "#854d0e", dot: "#eab308" },
    "Deuda Total": { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
  }[status] || { bg: "#f3f4f6", color: "#374151", dot: "#9ca3af" };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
      style={{ background: config.bg, color: config.color, fontWeight: 500 }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: config.dot }} />
      {status}
    </span>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl p-3 shadow-xl" style={{ background: "#0d1b3e", border: "1px solid rgba(201,168,76,0.3)" }}>
        <p className="text-xs mb-2" style={{ color: "#c9a84c" }}>{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-xs" style={{ color: "white" }}>
            {entry.name}: {formatCLP(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const [services, setServices] = useState(() => loadServices());

  // Refresh on every mount (e.g. after navigating back from registration)
  useEffect(() => {
    setServices(loadServices());
  }, []);

  const monthlyData = computeMonthlyData(services);

  // Agregar IDs únicos a los datos mensuales para evitar keys duplicadas en Recharts
  const monthlyDataWithIds = useMemo(() => 
    monthlyData.map((data, idx) => ({
      ...data,
      id: `month-${data.month}-${idx}-${data.recaudado}-${data.deuda}`,
      uniqueKey: `data-${idx}-${Date.now()}`,
    })),
    [monthlyData]
  );

  // IDs únicos para los gráficos (generados una sola vez)
  const chartIds = useMemo(() => {
    const timestamp = Date.now();
    return {
      area: `area-chart-${timestamp}`,
      pie: `pie-chart-${timestamp + 1}`,
      bar: `bar-chart-${timestamp + 2}`,
    };
  }, []);

  const totalRecaudado = services.reduce((s, c) => s + c.totalPaid, 0);
  const totalDeuda = services.reduce((s, c) => s + c.pendingBalance, 0);
  const pagados = services.filter((c) => c.status === "Pagado").length;
  const abonando = services.filter((c) => c.status === "Abonando").length;
  const deudaTotal = services.filter((c) => c.status === "Deuda Total").length;
  const totalServicios = services.length;

  const pieData = useMemo(() => [
    { name: "Pagado", value: pagados, color: "#22c55e", id: "pie-pagado" },
    { name: "Abonando", value: abonando, color: "#eab308", id: "pie-abonando" },
    { name: "Deuda Total", value: deudaTotal, color: "#ef4444", id: "pie-deuda" },
  ], [pagados, abonando, deudaTotal]);

  const statCards = [
    {
      label: "Total Recaudado",
      value: formatCLP(totalRecaudado),
      icon: TrendingUp,
      iconBg: "linear-gradient(135deg, #16a34a, #22c55e)",
      change: "+12.5% este mes",
      changePositive: true,
    },
    {
      label: "Deuda Pendiente",
      value: formatCLP(totalDeuda),
      icon: AlertTriangle,
      iconBg: "linear-gradient(135deg, #dc2626, #ef4444)",
      change: `${deudaTotal + abonando} cuentas activas`,
      changePositive: false,
    },
    {
      label: "Servicios Activos",
      value: totalServicios.toString(),
      icon: FileText,
      iconBg: "linear-gradient(135deg, #1a2f5a, #2563eb)",
      change: `${pagados} completados`,
      changePositive: true,
    },
    {
      label: "Clientes Totales",
      value: totalServicios.toString(),
      icon: Users,
      iconBg: "linear-gradient(135deg, #c9a84c, #e8c97a)",
      change: `${abonando} en proceso`,
      changePositive: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="rounded-2xl p-5 shadow-sm"
            style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md"
                style={{ background: card.iconBg }}
              >
                <card.icon size={20} color="white" />
              </div>
            </div>
            <p className="text-xs mb-1" style={{ color: "#6b7280" }}>{card.label}</p>
            <p className="text-xl mb-2" style={{ color: "#0d1b3e", fontWeight: 700 }}>{card.value}</p>
            <p className="text-xs" style={{ color: card.changePositive ? "#16a34a" : "#dc2626" }}>
              {card.change}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div
          className="xl:col-span-2 rounded-2xl p-5 shadow-sm"
          style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 style={{ color: "#0d1b3e" }}>Flujo Financiero Mensual</h3>
              <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>Últimos 6 meses</p>
            </div>
          </div>
          {monthlyData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[220px]">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: "#f0f2f5" }}>
                <TrendingUp size={20} style={{ color: "#9ca3af" }} />
              </div>
              <p className="text-sm" style={{ color: "#9ca3af" }}>Sin datos de movimientos aún</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyDataWithIds} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="recaudado" name="Recaudado" stroke="#1a2f5a" strokeWidth={2.5} fill="#1a2f5a" fillOpacity={0.1} />
                <Area type="monotone" dataKey="deuda" name="Deuda" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.08} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div
          className="rounded-2xl p-5 shadow-sm"
          style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
        >
          <h3 className="mb-1" style={{ color: "#0d1b3e" }}>Estado de Servicios</h3>
          <p className="text-xs mb-4" style={{ color: "#9ca3af" }}>Distribución actual</p>
          {totalServicios === 0 ? (
            <div className="flex flex-col items-center justify-center h-[180px]">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: "#f0f2f5" }}>
                <FileText size={20} style={{ color: "#9ca3af" }} />
              </div>
              <p className="text-sm" style={{ color: "#9ca3af" }}>Sin servicios registrados</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" data={pieData}>
                    {pieData.map((entry) => (
                      <Cell key={`cell-${entry.id}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} servicios`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {pieData.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                      <span className="text-xs" style={{ color: "#6b7280" }}>{item.name}</span>
                    </div>
                    <span className="text-xs" style={{ color: "#0d1b3e", fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bar Chart */}
      <div
        className="rounded-2xl p-5 shadow-sm"
        style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 style={{ color: "#0d1b3e" }}>Comparativo Mensual</h3>
            <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>Recaudación vs Deuda</p>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ background: "#f0f2f5" }}
          >
            <DollarSign size={13} style={{ color: "#c9a84c" }} />
            <span className="text-xs" style={{ color: "#1a2f5a" }}>Total: {formatCLP(totalRecaudado + totalDeuda)}</span>
          </div>
        </div>
        {monthlyData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px]">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: "#f0f2f5" }}>
              <DollarSign size={20} style={{ color: "#9ca3af" }} />
            </div>
            <p className="text-sm" style={{ color: "#9ca3af" }}>Sin datos para mostrar</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyDataWithIds} margin={{ top: 5, right: 5, left: 5, bottom: 0 }} barSize={28} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="recaudado" name="Recaudado" fill="#1a2f5a" radius={[6, 6, 0, 0]} />
              <Bar dataKey="deuda" name="Deuda" fill="#fbbf24" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent Services Table */}
      <div
        className="rounded-2xl shadow-sm overflow-hidden"
        style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
      >
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f0f2f5" }}>
          <div>
            <h3 style={{ color: "#0d1b3e" }}>Servicios Recientes</h3>
            <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>Últimos registros del sistema</p>
          </div>
          <Link
            to="/cobros"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all"
            style={{ background: "#0d1b3e", color: "#c9a84c" }}
          >
            Ver todos <ArrowRight size={12} />
          </Link>
        </div>
        {services.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: "#f0f2f5" }}>
              <FileText size={24} style={{ color: "#9ca3af" }} />
            </div>
            <p className="text-sm" style={{ color: "#6b7280" }}>No hay servicios registrados</p>
            <p className="text-xs mt-1 mb-4" style={{ color: "#9ca3af" }}>Los servicios aparecerán aquí una vez que sean ingresados</p>
            <Link
              to="/registro"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs"
              style={{ background: "#0d1b3e", color: "#c9a84c" }}
            >
              + Registrar primer servicio
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  {["Fallecido", "Contratante", "Total Servicio", "Abonado", "Saldo", "Estado"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs" style={{ color: "#6b7280", fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.slice(0, 4).map((service) => (
                  <tr
                    key={service.id}
                    className="transition-colors"
                    style={{ borderTop: "1px solid #f0f2f5" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-4 py-3">
                      <p className="text-xs" style={{ color: "#0d1b3e", fontWeight: 500 }}>{service.deceasedName.split(" ").slice(0, 2).join(" ")}</p>
                      <p className="text-xs" style={{ color: "#9ca3af" }}>{service.date}</p>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#374151" }}>{service.contractorName.split(" ").slice(0, 2).join(" ")}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#0d1b3e", fontWeight: 500 }}>{formatCLP(service.totalService)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#16a34a", fontWeight: 500 }}>{formatCLP(service.totalPaid)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: service.pendingBalance > 0 ? "#dc2626" : "#16a34a", fontWeight: 500 }}>
                      {formatCLP(service.pendingBalance)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={service.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}