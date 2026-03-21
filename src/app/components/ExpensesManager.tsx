import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  DollarSign, 
  Calendar, 
  Tag, 
  Filter, 
  Search, 
  ArrowLeft,
  Fuel,
  Lightbulb,
  Droplets,
  Wrench,
  ShoppingBag,
  MoreHorizontal
} from "lucide-react";
import { Expense } from "../data/mockData";
import { loadExpenses, persistExpense, deleteExpense, generateExpenseId, loadCustomCategories, persistCustomCategory } from "../data/expenseStore";

const formatCLP = (value: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(value);

const formatMoney = (value: string): string => {
  const clean = value.replace(/\D/g, "");
  if (!clean) return "";
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const CATEGORIES = [
  { label: "Bencina / Traslado", icon: Fuel, color: "#ef4444", bg: "#fef2f2" },
  { label: "Servicios Básicos (Luz/Agua)", icon: Lightbulb, color: "#eab308", bg: "#fefce8" },
  { label: "Mantenimiento", icon: Wrench, color: "#3b82f6", bg: "#eff6ff" },
  { label: "Artículos Funerarios", icon: ShoppingBag, color: "#8b5cf6", bg: "#f5f3ff" },
  { label: "Otros", icon: MoreHorizontal, color: "#6b7280", bg: "#f9fafb" },
];

export function ExpensesManager({ onBack }: { onBack?: () => void }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");

  // Form Fields
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [displayAmount, setDisplayAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[4].label);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isOtherSelected, setIsOtherSelected] = useState(false);

  useEffect(() => {
    setExpenses(loadExpenses());
    setCustomCategories(loadCustomCategories());
  }, []);

  const handleSave = () => {
    const amountNum = parseInt(amount, 10);
    if (!description || !amountNum) return;

    let finalCategory = category;
    if (isOtherSelected && newCategoryName.trim()) {
      finalCategory = newCategoryName.trim();
      persistCustomCategory(finalCategory);
    }

    const newExpense: Expense = {
      id: generateExpenseId(),
      description,
      amount: amountNum,
      category: finalCategory,
      date,
      createdAt: new Date().toISOString(),
    };

    persistExpense(newExpense);
    setExpenses(loadExpenses());
    setCustomCategories(loadCustomCategories());
    resetForm();
    setShowAddModal(false);
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setDisplayAmount("");
    setCategory(CATEGORIES[4].label);
    setIsOtherSelected(false);
    setNewCategoryName("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este gasto?")) {
      deleteExpense(id);
      setExpenses(loadExpenses());
    }
  };

  const filtered = expenses.filter((e) => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "Todas" || e.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const totalFiltered = filtered.reduce((acc, e) => acc + e.amount, 0);

  // Totales por categoría (incluyendo personalizadas)
  const allAvailableCategories = [
    ...CATEGORIES,
    ...customCategories.map(catName => ({ 
      label: catName, 
      icon: Tag, 
      color: "#8b5cf6", 
      bg: "#f5f3ff" 
    }))
  ];

  const categoryTotals = allAvailableCategories.map(cat => ({
    ...cat,
    total: filtered.filter(e => e.category === cat.label).reduce((sum, e) => sum + e.amount, 0)
  })).filter(c => c.total > 0 || categoryFilter === c.label || (categoryFilter === "Todas" && c.label !== "Otros"));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm mb-2 transition-colors"
              style={{ color: "#1a2f5a" }}
            >
              <ArrowLeft size={16} /> Volver
            </button>
          )}
          <h1 className="text-2xl font-bold" style={{ color: "#0d1b3e" }}>Gestión de Gastos</h1>
          <p className="text-sm" style={{ color: "#9ca3af" }}>Administra los egresos mensuales de la empresa</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all"
          style={{ background: "linear-gradient(135deg, #0d1b3e, #1a2f5a)", color: "#c9a84c" }}
        >
          <Plus size={18} /> Registrar Gasto
        </button>
      </div>

      {/* Stats Summary & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl p-5 shadow-sm" style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-100 text-red-600">
                <DollarSign size={18} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Gastos (Filtrado)</span>
            </div>
            <p className="text-3xl font-bold text-red-600">{formatCLP(totalFiltered)}</p>
          </div>
          
          <div className="rounded-2xl p-5 shadow-sm" style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600">
                <Tag size={18} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Items Registrados</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "#0d1b3e" }}>{filtered.length}</p>
          </div>
        </div>

        <div className="lg:col-span-3 rounded-2xl p-6 shadow-sm" style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}>
          <h3 className="text-sm font-bold mb-4 uppercase tracking-widest flex items-center gap-2" style={{ color: "#0d1b3e" }}>
            Resumen Detallado por Categoría
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {categoryTotals.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No hay gastos para mostrar en el resumen</p>
            ) : (
              categoryTotals.map((cat) => {
                const Icon = cat.icon;
                const percentage = totalFiltered > 0 ? (cat.total / totalFiltered) * 100 : 0;
                return (
                  <div key={cat.label} className="p-4 rounded-xl border border-gray-100 transition-all hover:border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: cat.bg, color: cat.color }}>
                            <Icon size={14} />
                          </div>
                          <span className="text-xs font-bold truncate" style={{ color: "#374151" }}>{cat.label}</span>
                       </div>
                       <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-50 text-gray-400">{percentage.toFixed(1)}%</span>
                    </div>
                    <p className="text-lg font-bold" style={{ color: cat.color }}>{formatCLP(cat.total)}</p>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                       <div 
                         className="h-full rounded-full transition-all duration-500" 
                         style={{ background: cat.color, width: `${percentage}%` }}
                       />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="rounded-2xl p-4 shadow-sm space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-4" style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}>
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ border: "1.5px solid #e5e7eb" }}
            onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          />
        </div>
        <div className="w-full lg:w-64 flex items-center gap-3">
          <Filter size={16} className="text-gray-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ border: "1.5px solid #e5e7eb", background: "#fff" }}
            onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          >
            <option value="Todas">Todas las categorías</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.label} value={cat.label}>{cat.label}</option>
            ))}
            {customCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense List */}
      <div className="rounded-2xl shadow-xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#1a2f5a" }}>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "#c9a84c" }}>Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "#c9a84c" }}>Descripción</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "#c9a84c" }}>Categoría</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider" style={{ color: "#c9a84c" }}>Monto</th>
                <th className="px-6 py-4 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                    {search || categoryFilter !== "Todas" ? "No se encontraron gastos con estos filtros" : "No tienes gastos registrados aún"}
                  </td>
                </tr>
              ) : (
                filtered.map((expense) => {
                  const catInfo = CATEGORIES.find(c => c.label === expense.category) || CATEGORIES[4];
                  const Icon = catInfo.icon;
                  return (
                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600">{new Date(expense.date + "T12:00:00").toLocaleDateString("es-CL")}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                          style={{ background: catInfo.bg, color: catInfo.color }}
                        >
                          <Icon size={12} />
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-bold text-red-600">{formatCLP(expense.amount)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Eliminar gasto"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Gasto Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" style={{ background: "#ffffff" }}>
            <div className="px-8 py-6 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #0d1b3e, #1a2f5a)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(201,168,76,0.15)" }}>
                  <Plus size={20} style={{ color: "#c9a84c" }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: "#ffffff" }}>Registrar Nuevo Gasto</h3>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Completa la información del egreso</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                <Trash2 size={20} className="rotate-45" />
              </button>
            </div>

            <div className="p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#9ca3af" }}>Descripción del Gasto</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ej: Bencina para carro funebre"
                    className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all"
                    style={{ border: "2px solid #f0f2f5" }}
                    onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                    onBlur={(e) => e.target.style.borderColor = "#f0f2f5"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#9ca3af" }}>Monto ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="text"
                      value={displayAmount}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setAmount(val);
                        setDisplayAmount(formatMoney(val));
                      }}
                      placeholder="0"
                      className="w-full pl-8 pr-4 py-3 rounded-2xl text-sm font-bold outline-none transition-all"
                      style={{ border: "2px solid #f0f2f5", color: "#ef4444" }}
                      onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                      onBlur={(e) => e.target.style.borderColor = "#f0f2f5"}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#9ca3af" }}>Fecha</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all"
                    style={{ border: "2px solid #f0f2f5" }}
                    onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                    onBlur={(e) => e.target.style.borderColor = "#f0f2f5"}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#9ca3af" }}>Categoría</label>
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const active = category === cat.label;
                      return (
                        <button
                          key={cat.label}
                          type="button"
                          onClick={() => {
                            setCategory(cat.label);
                            setIsOtherSelected(cat.label === "Otros");
                          }}
                          className="flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left"
                          style={{ 
                            borderColor: (category === cat.label && !isOtherSelected) || (cat.label === "Otros" && isOtherSelected) ? cat.color : "#f0f2f5",
                            background: (category === cat.label && !isOtherSelected) || (cat.label === "Otros" && isOtherSelected) ? cat.bg : "#fff" 
                          }}
                        >
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" 
                            style={{ background: (category === cat.label && !isOtherSelected) || (cat.label === "Otros" && isOtherSelected) ? cat.color : "#f9fafb", color: (category === cat.label && !isOtherSelected) || (cat.label === "Otros" && isOtherSelected) ? "#fff" : "#9ca3af" }}
                          >
                            <Icon size={16} />
                          </div>
                          <span className="text-xs font-semibold truncate" style={{ color: (category === cat.label && !isOtherSelected) || (cat.label === "Otros" && isOtherSelected) ? cat.color : "#6b7280" }}>{cat.label}</span>
                        </button>
                      );
                    })}
                    
                    {/* Botones para categorías personalizadas guardadas */}
                    {customCategories.map((catName) => (
                      <button
                        key={catName}
                        type="button"
                        onClick={() => {
                          setCategory(catName);
                          setIsOtherSelected(false);
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left"
                        style={{ 
                          borderColor: category === catName ? "#8b5cf6" : "#f0f2f5",
                          background: category === catName ? "#f5f3ff" : "#fff" 
                        }}
                      >
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" 
                          style={{ background: category === catName ? "#8b5cf6" : "#f9fafb", color: category === catName ? "#fff" : "#9ca3af" }}
                        >
                          <Tag size={16} />
                        </div>
                        <span className="text-xs font-semibold truncate" style={{ color: category === catName ? "#8b5cf6" : "#6b7280" }}>{catName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {isOtherSelected && (
                  <div className="sm:col-span-2 animate-in slide-in-from-top-2 duration-200">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#9ca3af" }}>Nueva Categoría</label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Escribe el nombre de la categoría..."
                      autoFocus
                      className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all"
                      style={{ border: "2px solid #0d1b3e", background: "#f8fafc" }}
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all"
                  style={{ background: "#f8f9fa", color: "#6b7280" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!description || !amount}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-blue-900/10 transition-all"
                  style={{ 
                    background: "linear-gradient(135deg, #0d1b3e, #1a2f5a)", 
                    color: "#c9a84c",
                    opacity: (!description || !amount) ? 0.6 : 1
                  }}
                >
                  Guardar Gasto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
