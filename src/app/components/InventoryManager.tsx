import { useState, useEffect } from "react";
import { Package, Trash2, Sparkles } from "lucide-react";
import { loadInventory, addInventoryItem, deleteInventoryItem, InventoryItem, addInventoryItems } from "../data/inventoryStore";
import { useUser } from "../context/UserContext";
import { funeralServiceTypes } from "../data/mockData";

export function InventoryManager() {
  const { role } = useUser();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [invForm, setInvForm] = useState({ name: "", price: "", category: "" });
  const [invFilter, setInvFilter] = useState("all");
  const [invSort, setInvSort] = useState("asc");

  useEffect(() => {
    setInventory(loadInventory());
  }, []);

  const handleAddInventory = () => {
    if (!invForm.name || !invForm.price) return;
    addInventoryItem({
      name: invForm.name,
      price: Number(invForm.price),
      category: invForm.category || "General"
    });
    setInventory(loadInventory());
    setInvForm({ name: "", price: "", category: "" });
  };

  const handleSeedDefaults = () => {
    if (!window.confirm("¿Deseas cargar las urnas y servicios por defecto en el inventario?")) return;
    
    const defaults = funeralServiceTypes.map(name => ({
      name,
      price: 0,
      category: "Servicio Funerario"
    }));
    
    addInventoryItems(defaults);
    setInventory(loadInventory());
  };

  const handleDeleteInventory = (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este artículo?")) {
      deleteInventoryItem(id);
      setInventory(loadInventory());
    }
  };

  const uniqueCategories = Array.from(new Set(inventory.map(i => i.category))).filter(Boolean);
  
  const filteredInventory = inventory
    .filter(i => invFilter === "all" || i.category === invFilter)
    .sort((a, b) => invSort === "asc" ? a.price - b.price : b.price - a.price);

  const inputStyle = (hasError = false) => ({
    background: "#f8f9fb",
    border: `1.5px solid ${hasError ? "#ef4444" : "#e5e7eb"}`,
    color: "#1a2f5a",
    borderRadius: "10px",
    outline: "none",
    transition: "border-color 0.2s",
    width: "100%",
    padding: "10px 14px 10px 14px",
    fontSize: "0.875rem",
  });

  const labelStyle = { color: "#374151", fontSize: "0.8rem", fontWeight: 600, marginBottom: "6px", display: "block" };

  return (
    <div className="max-w-4xl mx-auto">
      <div
        className="rounded-2xl p-6 shadow-sm"
        style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
             <Package size={20} />
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: "#0d1b3e" }}>Gestión de Inventario (Lista de Valores)</p>
            <p className="text-sm text-gray-400 mt-1">
              Agrega y administra los artículos, servicios o planes para tener un listado de precios centralizado.
            </p>
          </div>
        </div>

        {inventory.length === 0 && role === "admin" && (
          <div className="mb-6 p-4 rounded-xl flex items-center justify-between border border-blue-100 bg-blue-50/50">
            <div className="flex items-center gap-3 text-blue-800">
              <Sparkles size={18} className="text-blue-500" />
              <p className="text-sm">¿Tu inventario está vacío? Puedes cargar las urnas y servicios básicos automáticamente.</p>
            </div>
            <button
              onClick={handleSeedDefaults}
              className="text-xs font-bold px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Cargar por defecto
            </button>
          </div>
        )}

        {/* Formulario */}
        {role === "admin" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
              <div>
                <label style={labelStyle}>Nombre del artículo</label>
                <input
                  type="text"
                  placeholder="Ej. Urna Premium"
                  value={invForm.name}
                  onChange={e => setInvForm(p => ({ ...p, name: e.target.value }))}
                  style={inputStyle()}
                />
              </div>
              <div>
                <label style={labelStyle}>Precio referencial ($)</label>
                <input
                  type="text"
                  placeholder="Ej. 1.500.000"
                  value={invForm.price ? new Intl.NumberFormat("es-CL").format(Number(invForm.price)) : ""}
                  onChange={e => {
                    const rawVal = e.target.value.replace(/\D/g, "");
                    setInvForm(p => ({ ...p, price: rawVal }));
                  }}
                  style={inputStyle()}
                />
              </div>
              <div>
                <label style={labelStyle}>Categoría</label>
                <div className="relative">
                  <input
                    type="text"
                    list="categories-list"
                    placeholder="Ej. Servicio Funerario, Venta de Artículo..."
                    value={invForm.category}
                    onChange={e => setInvForm(p => ({ ...p, category: e.target.value }))}
                    style={inputStyle()}
                  />
                  <datalist id="categories-list">
                    <option value="Servicio Funerario" />
                    <option value="Venta de Artículo" />
                    {uniqueCategories.filter(c => c !== "Servicio Funerario" && c !== "Venta de Artículo").map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div className="sm:col-span-3 flex justify-end mt-2">
                <button
                  onClick={handleAddInventory}
                  disabled={!invForm.name || !invForm.price}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                  style={{ background: "#0d1b3e", color: "#c9a84c" }}
                >
                  + Añadir artículo
                </button>
              </div>
            </div>
            <div className="h-px w-full my-6" style={{ background: "#f0f2f5" }} />
          </>
        )}

        {/* Listado */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
          <h3 className="text-base font-bold text-[#0d1b3e]">Artículos Registrados ({filteredInventory.length})</h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select 
              value={invFilter} 
              onChange={e => setInvFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none"
            >
              <option value="all">Todas las categorías</option>
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select 
              value={invSort} 
              onChange={e => setInvSort(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none"
            >
              <option value="asc">Menor precio</option>
              <option value="desc">Mayor precio</option>
            </select>
          </div>
        </div>

        {filteredInventory.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-xl bg-gray-50/30">
             <Package size={32} className="text-gray-300 mb-3" />
             <p className="text-base text-gray-500">No hay artículos que coincidan con la búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-4 font-semibold text-xs">Artículo</th>
                  <th className="px-5 py-4 font-semibold text-xs">Categoría</th>
                  <th className="px-5 py-4 font-semibold text-xs">Precio</th>
                  {role === "admin" && <th className="px-5 py-4 font-semibold text-xs text-right">Acción</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredInventory.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-[#0d1b3e]">{item.name}</td>
                    <td className="px-5 py-4">
                       <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold">{item.category}</span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-green-600">
                      {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(item.price)}
                    </td>
                    {role === "admin" && (
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => handleDeleteInventory(item.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors">
                           <Trash2 size={16} />
                        </button>
                      </td>
                    )}
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
