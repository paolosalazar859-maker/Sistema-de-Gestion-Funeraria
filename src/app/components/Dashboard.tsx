import { loadServices, computeMonthlyData, getAvailableYears, getMonthsWithData } from "../data/serviceStore";
import { loadExpenses } from "../data/expenseStore";
import { TrendingUp, FileText, DollarSign, ArrowRight, ArrowUpRight, Wallet, PieChart as PieIcon, Calendar, Lock } from "lucide-react";
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

import { useUser } from "../context/UserContext";

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
  const { role } = useUser();
  const isAdmin = role === "admin";
  const [services, setServices] = useState(() => loadServices().filter(s => !s.isDeleted));
  const [expenses, setExpenses] = useState(() => loadExpenses());
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | "all">(() => new Date().getMonth() + 1);

  const availableYears = useMemo(() => getAvailableYears(services), [services]);
  
  // Meses con datos para el año seleccionado
  const activeMonths = useMemo(() => getMonthsWithData(services, selectedYear), [services, selectedYear]);

  // Auto-selección inicial eliminada. Ahora siempre usa la fecha actual del computador.
  
  const months = [
    { value: "all", label: "Todos los meses" },
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
  ];

  // Refresh on every mount
  useEffect(() => {
    setServices(loadServices().filter(s => !s.isDeleted));
    setExpenses(loadExpenses());
  }, []);

  const { monthlyDataWithIds, filteredTotals } = useMemo(() => {
    const sData = computeMonthlyData(services, selectedYear);
    const expData = expenses.filter(e => e.date?.startsWith(`${selectedYear}-`));
    
    const combined = sData.map((monthData, idx) => {
      const monthExpenses = expData
        .filter(e => e.date.startsWith(monthData.key))
        .reduce((acc, e) => acc + e.amount, 0);

      return {
        ...monthData,
        gastos: monthExpenses,
        id: `month-${monthData.month}-${idx}`,
        uniqueKey: `data-${idx}-${selectedYear}`
      };
    });

    const yearRecaudado = combined.reduce((acc, m) => acc + m.recaudado, 0);
    const yearDeuda = combined.reduce((acc, m) => acc + m.deuda, 0);
    const yearGastos = combined.reduce((acc, m) => acc + m.gastos, 0);

    const monthRecaudado = selectedMonth === "all" 
      ? yearRecaudado 
      : (combined[Number(selectedMonth) - 1]?.recaudado || 0);
    const monthDeuda = selectedMonth === "all" 
      ? yearDeuda 
      : (combined[Number(selectedMonth) - 1]?.deuda || 0);
    const monthGastos = selectedMonth === "all" 
      ? yearGastos 
      : (combined[Number(selectedMonth) - 1]?.gastos || 0);

    return { 
      monthlyDataWithIds: combined,
      filteredTotals: {
        recaudado: monthRecaudado,
        deuda: monthDeuda,
        gastos: monthGastos,
        utilidad: monthRecaudado - monthGastos
      }
    };
  }, [services, expenses, selectedYear, selectedMonth]);

// IDs únicos para los gráficos (generados una sola vez)

  // IDs únicos para los gráficos (generados una sola vez)
  const chartIds = useMemo(() => {
    const timestamp = Date.now();
    return {
      area: `area-chart-${timestamp}`,
      pie: `pie-chart-${timestamp + 1}`,
      bar: `bar-chart-${timestamp + 2}`,
    };
  }, []);

  const periodPrefix = selectedMonth === "all" ? `${selectedYear}-` : `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-`;
  
  const totalServicios = services.filter(s => (s.date || s.createdAt || "").startsWith(periodPrefix)).length;
  const pagados = services.filter((s) => s.status === "Pagado" && (s.date || s.createdAt || "").startsWith(periodPrefix)).length;
  const abonando = services.filter((s) => s.status === "Abonando" && (s.date || s.createdAt || "").startsWith(periodPrefix)).length;
  const deudaTotalCount = services.filter((s) => s.status === "Deuda Total" && (s.date || s.createdAt || "").startsWith(periodPrefix)).length;

  const pieData = useMemo(() => [
    { name: "Pagado", value: pagados, color: "#22c55e", id: "pie-pagado" },
    { name: "Abonando", value: abonando, color: "#eab308", id: "pie-abonando" },
    { name: "Deuda Total", value: deudaTotalCount, color: "#ef4444", id: "pie-deuda" },
  ], [pagados, abonando, deudaTotalCount]);

  const revenueBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {
      "Cuota Mortuoria": services
        .filter(s => (s.date || s.createdAt || "").startsWith(periodPrefix))
        .reduce((acc, s) => acc + s.mortuaryFee, 0),
      "Efectivo": 0,
      "Transferencia": 0,
      "Crédito": 0,
      "Débito": 0,
    };

    services.forEach(s => {
      s.payments.forEach(p => {
        if (p.date?.startsWith(periodPrefix)) {
          const method = p.method as string;
          if (method === "Tarjeta") {
            breakdown["Crédito"] += p.amount; // Mapeo legado
          } else if (breakdown[method] !== undefined) {
            breakdown[method] += p.amount;
          }
        }
      });
    });

    return Object.entries(breakdown)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  }, [services, selectedYear, selectedMonth, periodPrefix]);

  const statCards = [
    {
      label: selectedMonth === "all" ? `Recaudado en ${selectedYear}` : `Recaudado en ${months.find(m => m.value === selectedMonth)?.label || ""}`,
      value: formatCLP(filteredTotals.recaudado),
      icon: TrendingUp,
      iconBg: "linear-gradient(135deg, #16a34a, #22c55e)",
      change: "Ingresos por abonos",
      changePositive: true,
      to: "/cobros",
    },
    {
      label: selectedMonth === "all" ? `Gastos en ${selectedYear}` : `Gastos en ${months.find(m => m.value === selectedMonth)?.label || ""}`,
      value: formatCLP(filteredTotals.gastos),
      icon: Wallet,
      iconBg: "linear-gradient(135deg, #dc2626, #ef4444)",
      change: "Egresos del periodo",
      changePositive: false,
      to: "/gastos",
    },
    {
      label: selectedMonth === "all" ? `Utilidad en ${selectedYear}` : `Utilidad en ${months.find(m => m.value === selectedMonth)?.label || ""}`,
      value: formatCLP(filteredTotals.utilidad),
      icon: DollarSign,
      iconBg: "linear-gradient(135deg, #0d1b3e, #1a2f5a)",
      change: "Recaudado - Gastos",
      changePositive: filteredTotals.utilidad >= 0,
      to: "/",
    },
    {
      label: selectedMonth === "all" ? `Servicios de ${selectedYear}` : `Servicios de ${months.find(m => m.value === selectedMonth)?.label || ""}`,
      value: totalServicios.toString(),
      icon: FileText,
      iconBg: "linear-gradient(135deg, #c9a84c, #e8c97a)",
      change: `${pagados} finalizados`,
      changePositive: true,
      to: "/registro",
    },
  ].filter((c, i) => {
    // Hide Recaudado, Gastos, Utilidad for non-admin
    if (!isAdmin && (i === 0 || i === 1 || i === 2)) return false;
    return true;
  });

  const incomeDetails = useMemo(() => {
    const period = selectedMonth === "all" ? `${selectedYear}-` : `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-`;
    const breakdown: Record<string, number> = {
      "Cuota Mortuoria": 0,
      "Efectivo": 0,
      "Transferencia": 0,
      "Tarjeta": 0,
      "Cheque": 0,
      "Otros": 0
    };

    services.forEach(s => {
      // Cuota mortuoria y aportes municipales se cuentan si el servicio es del periodo
      if ((s.date || s.createdAt || "").startsWith(period)) {
        breakdown["Cuota Mortuoria"] += (s.mortuaryFee || 0);
        if (s.municipalContribution > 0) breakdown["Otros"] += s.municipalContribution;
      }
      
      // Pagos realizados en el periodo
      s.payments.forEach(p => {
        if (p.date?.startsWith(period)) {
          const method = p.method as string;
          if (breakdown[method] !== undefined) {
            breakdown[method] += p.amount;
          } else {
            breakdown["Otros"] += p.amount;
          }
        }
      });
    });

    return Object.entries(breakdown)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [services, selectedYear, selectedMonth]);

  return (
    <div className="space-y-6">
      {/* Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-[#0d1b3e] flex items-center gap-2">
            <Calendar size={20} className="text-[#c9a84c]" />
            Resumen de Gestión
          </h2>
          <p className="text-xs text-gray-400">Visualización de rendimiento por periodo anual</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Año:</span>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-[#0d1b3e] outline-none focus:ring-2 focus:ring-[#c9a84c]/20 transition-all cursor-pointer shadow-sm"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mes:</span>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value === "all" ? "all" : parseInt(e.target.value, 10))}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-[#0d1b3e] outline-none focus:ring-2 focus:ring-[#c9a84c]/20 transition-all cursor-pointer shadow-sm"
            >
              {months.map(m => {
                const hasData = m.value !== "all" && activeMonths.has(m.value as number);
                return (
                  <option key={m.value} value={m.value}>
                    {m.label} {hasData ? "•" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Link
            key={i}
            to={card.to}
            className="rounded-2xl p-5 shadow-sm block transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{ background: "#ffffff", border: "1px solid #e5e7eb", textDecoration: "none" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md"
                style={{ background: card.iconBg }}
              >
                <card.icon size={20} color="white" />
              </div>
              <ArrowUpRight size={15} style={{ color: "#d1d5db" }} />
            </div>
            <p className="text-xs mb-1" style={{ color: "#6b7280" }}>{card.label}</p>
            <p className="text-xl mb-2" style={{ color: "#0d1b3e", fontWeight: 700 }}>{card.value}</p>
            <p className="text-xs" style={{ color: card.changePositive ? "#16a34a" : "#dc2626" }}>
              {card.change}
            </p>
          </Link>
        ))}
      </div>
      
      {/* Revenue Breakdown Detail */}
      <div className="rounded-2xl p-6 shadow-sm mb-6" style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}>
        <div className="flex items-center gap-2 mb-5">
           <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50 text-green-600">
             <PieIcon size={18} />
           </div>
           <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#0d1b3e]">
                Detalle de Servicios por Estado
              </h3>
              <p className="text-xs text-gray-400">Distribución de servicios registrados en el sistema</p>
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pieData.map((item) => (
            <div key={item.name} className="p-4 rounded-xl border border-gray-100 transition-all hover:border-gray-200 bg-gray-50/30">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{item.name}</p>
              <p className="text-lg font-bold" style={{ color: item.color }}>{item.value} Servicios</p>
            </div>
          ))}
        </div>
      </div>

      {/* Income Details Breakdown - Desktop Only / Admin Only */}
      {isAdmin && (
        <div className="rounded-2xl p-6 shadow-sm mb-6" style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
                <TrendingUp size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#0d1b3e]">Detalle de Ingresos del Periodo</h3>
                <p className="text-xs text-gray-400">Desglose de recaudación por método de pago</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Recaudado</p>
              <p className="text-sm font-bold text-[#16a34a]">{formatCLP(filteredTotals.recaudado)}</p>
            </div>
          </div>

          {incomeDetails.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs italic">
              No hay ingresos registrados en este periodo
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {incomeDetails.map((item) => (
                <div key={item.name} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.name === "Cuota Mortuoria" ? "#7c3aed" : item.name === "Efectivo" ? "#16a34a" : "#2563eb" }} />
                    <p className="text-[10px] font-bold text-gray-500 uppercase truncate">{item.name}</p>
                  </div>
                  <p className="text-sm font-bold text-[#0d1b3e]">{formatCLP(item.value)}</p>
                  <p className="text-[9px] text-gray-400 mt-1">
                    {filteredTotals.recaudado > 0 ? `${((item.value / filteredTotals.recaudado) * 100).toFixed(1)}% del total` : "0%"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
              <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                {selectedMonth === "all" ? `Resumen Anual ${selectedYear}` : `Mes de ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`}
              </p>
            </div>
          </div>
          {monthlyDataWithIds.length === 0 ? (
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
                 <Area type="monotone" dataKey="recaudado" name="Recaudado" stroke="#1a2f5a" strokeWidth={2.5} fill="#1a2f5a" fillOpacity={0.1} hide={!isAdmin} />
                <Area type="monotone" dataKey="gastos" name="Gastos" stroke="#dc2626" strokeWidth={2} fill="#dc2626" fillOpacity={0.05} hide={!isAdmin} />
                <Area type="monotone" dataKey="deuda" name="Deuda" stroke="#fbbf24" strokeWidth={2} fill="#fbbf24" fillOpacity={0.05} hide={!isAdmin} />
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
            <span className="text-xs" style={{ color: "#1a2f5a" }}>Total Servicios: {totalServicios}</span>
          </div>
        </div>
        {!isAdmin ? (
          <div className="flex flex-col items-center justify-center h-[200px] bg-gray-50/30 rounded-xl border border-dashed border-gray-200">
             <Lock size={20} className="text-gray-300 mb-2" />
             <p className="text-xs text-gray-400">Gráfico financiero restringido para este perfil</p>
          </div>
        ) : monthlyDataWithIds.length === 0 ? (
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
                    className="transition-colors cursor-pointer"
                    style={{ borderTop: "1px solid #f0f2f5" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f4ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    onClick={() => window.location.hash = "#/cobros"}
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