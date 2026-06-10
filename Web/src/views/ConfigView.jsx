import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, X, Save, ChevronDown, ChevronRight, Inbox, RefreshCw, AlertCircle, Edit2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { PriorityBadge } from "../components/tickets/PriorityBadge";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorBanner } from "../components/ui/ErrorBanner";

const PRIORIDADES = [
  { value: "urgent", label: "Urgente" },
  { value: "high",   label: "Alta"    },
  { value: "medium", label: "Media"   },
  { value: "low",    label: "Baja"    },
];

// ── Data hook ─────────────────────────────────────────────────
function useIncidentes() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("Incidentes")
      .select("id, Categoria, Incidente, Tiempo, Prioridad, Agentes")
      .order("Categoria")
      .order("Incidente");
    if (err) setError(err.message);
    else setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addIncidente = async (payload) => {
    const { data, error: err } = await supabase
      .from("Incidentes")
      .insert([payload])
      .select()
      .single();
    if (err) throw err;
    setItems(prev =>
      [...prev, data].sort((a, b) =>
        a.Categoria.localeCompare(b.Categoria) || a.Incidente.localeCompare(b.Incidente)
      )
    );
  };

  const updateIncidente = async (id, payload) => {
    const { data, error: err } = await supabase
      .from("Incidentes")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (err) throw err;
    setItems(prev =>
      prev.map(item => (item.id === id ? data : item)).sort((a, b) =>
        a.Categoria.localeCompare(b.Categoria) || a.Incidente.localeCompare(b.Incidente)
      )
    );
  };

  return { items, loading, error, refresh: load, addIncidente, updateIncidente };
}

// ── Add modal ─────────────────────────────────────────────────
function AddModal({ onClose, onSave, existingCategories, prefillCategory }) {
  const [form, setForm] = useState({
    categoria: prefillCategory ?? "",
    incidente: "",
    tiempo:    "",
    prioridad: "medium",
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.categoria.trim()) { setErr("La categoría es requerida."); return; }
    if (!form.incidente.trim()) { setErr("El nombre del incidente es requerido."); return; }
    setSaving(true); setErr("");
    try {
      await onSave({
        Categoria: form.categoria.trim(),
        Incidente: form.incidente.trim(),
        Tiempo:    form.tiempo.trim()   || null,
        Prioridad: form.prioridad,
      });
      onClose();
    } catch (e) {
      setErr(e.message ?? "Error al guardar");
      setSaving(false);
    }
  };

  const isNewCategory = form.categoria.trim() && !existingCategories.includes(form.categoria.trim());

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#c8b89a] dark:bg-[#1d1d1d] rounded-2xl w-[440px] border border-[#a09070] dark:border-[#2a2a2a] shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#b0a07a] dark:border-[#2a2a2a] flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#1a1a1a] dark:text-white">Agregar incidente</p>
            <p className="text-xs text-[#5a4a30] dark:text-[#888] mt-0.5">
              {prefillCategory
                ? `Categoría: ${prefillCategory}`
                : "Escribe una categoría existente o crea una nueva"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-[#a09070] dark:border-[#3a3a3a] flex items-center justify-center text-[#5a4a30] dark:text-[#666] hover:bg-[#b0a07a] dark:hover:bg-[#2a2a2a] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-4">
          {/* Categoría */}
          <div>
            <label className="text-[10px] font-bold text-[#5a4a30] dark:text-[#666] uppercase tracking-widest block mb-1.5">
              Categoría
            </label>
            <input
              list="cat-list"
              value={form.categoria}
              onChange={e => set("categoria", e.target.value)}
              placeholder="Selecciona o escribe una nueva…"
              className="w-full border border-[#a09070] dark:border-[#3a3a3a] rounded-lg px-3 py-2 text-sm text-[#1a1a1a] dark:text-[#e0d8cc] bg-[#d4c4a0] dark:bg-[#2a2a2a] outline-none focus:ring-2 focus:ring-[#16a34a]/30 focus:border-[#16a34a]"
            />
            <datalist id="cat-list">
              {existingCategories.map(c => <option key={c} value={c} />)}
            </datalist>
            {isNewCategory && (
              <p className="text-[11px] text-[#16a34a] mt-1 flex items-center gap-1">
                <Plus size={10} /> Se creará la categoría "{form.categoria.trim()}"
              </p>
            )}
          </div>

          {/* Incidente */}
          <div>
            <label className="text-[10px] font-bold text-[#5a4a30] dark:text-[#666] uppercase tracking-widest block mb-1.5">
              Nombre del incidente
            </label>
            <input
              type="text"
              value={form.incidente}
              onChange={e => set("incidente", e.target.value)}
              placeholder="Ej: Falla de disco duro"
              className="w-full border border-[#a09070] dark:border-[#3a3a3a] rounded-lg px-3 py-2 text-sm text-[#1a1a1a] dark:text-[#e0d8cc] bg-[#d4c4a0] dark:bg-[#2a2a2a] outline-none focus:ring-2 focus:ring-[#16a34a]/30 focus:border-[#16a34a]"
            />
          </div>

          {/* Tiempo + Prioridad */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#5a4a30] dark:text-[#666] uppercase tracking-widest block mb-1.5">
                Tiempo estimado
              </label>
              <input
                type="text"
                value={form.tiempo}
                onChange={e => set("tiempo", e.target.value)}
                placeholder="Ej: 30 min – 2 horas"
                className="w-full border border-[#a09070] dark:border-[#3a3a3a] rounded-lg px-3 py-2 text-sm text-[#1a1a1a] dark:text-[#e0d8cc] bg-[#d4c4a0] dark:bg-[#2a2a2a] outline-none focus:ring-2 focus:ring-[#16a34a]/30 focus:border-[#16a34a]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#5a4a30] dark:text-[#666] uppercase tracking-widest block mb-1.5">
                Prioridad
              </label>
              <select
                value={form.prioridad}
                onChange={e => set("prioridad", e.target.value)}
                className="w-full border border-[#a09070] dark:border-[#3a3a3a] rounded-lg px-3 py-2 text-sm text-[#1a1a1a] dark:text-[#e0d8cc] bg-[#d4c4a0] dark:bg-[#2a2a2a] outline-none focus:ring-2 focus:ring-[#16a34a]/30 focus:border-[#16a34a]"
              >
                {PRIORIDADES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          {err && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle size={13} className="flex-shrink-0" /> {err}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button" onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-[#a09070] dark:border-[#3a3a3a] text-sm text-[#3a2a1a] dark:text-[#888] hover:bg-[#b8a880] dark:hover:bg-[#2a2a2a] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-[#16a34a] text-white text-sm font-semibold hover:bg-[#15803d] transition-colors flex items-center gap-1.5 disabled:opacity-60"
            >
              <Save size={13} /> {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit modal ────────────────────────────────────────────────
function EditIncidentModal({ incident, existingCategories, allIncidents, onClose, onSave }) {
  const [form, setForm] = useState({
    categoria: incident.Categoria,
    incidente: incident.Incidente,
    tiempo:    incident.Tiempo || "",
    prioridad: incident.Prioridad || "medium",
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.categoria.trim()) { setErr("La categoría es requerida."); return; }
    if (!form.incidente.trim()) { setErr("El nombre del incidente es requerido."); return; }
    setSaving(true); setErr("");
    try {
      let newAgentId = incident.Agentes;
      if (form.categoria !== incident.Categoria) {
        const other = allIncidents.find(i => i.Categoria === form.categoria.trim() && i.Agentes != null);
        if (other) {
          newAgentId = other.Agentes;
        }
      }

      await onSave(incident.id, {
        Categoria: form.categoria.trim(),
        Incidente: form.incidente.trim(),
        Tiempo:    form.tiempo.trim()   || null,
        Prioridad: form.prioridad,
        Agentes:   newAgentId,
      });
      onClose();
    } catch (e) {
      setErr(e.message ?? "Error al actualizar");
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#c8b89a] dark:bg-[#1d1d1d] rounded-2xl w-[440px] border border-[#a09070] dark:border-[#2a2a2a] shadow-2xl">
        <div className="px-5 py-4 border-b border-[#b0a07a] dark:border-[#2a2a2a] flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#1a1a1a] dark:text-white">Editar incidente</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-[#a09070] dark:border-[#3a3a3a] flex items-center justify-center text-[#5a4a30] dark:text-[#666] hover:bg-[#b0a07a] dark:hover:bg-[#2a2a2a] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-bold text-[#5a4a30] dark:text-[#666] uppercase tracking-widest block mb-1.5">
              Categoría
            </label>
            <select
              value={form.categoria}
              onChange={e => set("categoria", e.target.value)}
              className="w-full border border-[#a09070] dark:border-[#3a3a3a] rounded-lg px-3 py-2 text-sm text-[#1a1a1a] dark:text-[#e0d8cc] bg-[#d4c4a0] dark:bg-[#2a2a2a] outline-none focus:ring-2 focus:ring-[#16a34a]/30 focus:border-[#16a34a]"
            >
              {existingCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#5a4a30] dark:text-[#666] uppercase tracking-widest block mb-1.5">
              Nombre del incidente
            </label>
            <input
              type="text"
              value={form.incidente}
              onChange={e => set("incidente", e.target.value)}
              className="w-full border border-[#a09070] dark:border-[#3a3a3a] rounded-lg px-3 py-2 text-sm text-[#1a1a1a] dark:text-[#e0d8cc] bg-[#d4c4a0] dark:bg-[#2a2a2a] outline-none focus:ring-2 focus:ring-[#16a34a]/30 focus:border-[#16a34a]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#5a4a30] dark:text-[#666] uppercase tracking-widest block mb-1.5">
                Tiempo estimado
              </label>
              <input
                type="text"
                value={form.tiempo}
                onChange={e => set("tiempo", e.target.value)}
                className="w-full border border-[#a09070] dark:border-[#3a3a3a] rounded-lg px-3 py-2 text-sm text-[#1a1a1a] dark:text-[#e0d8cc] bg-[#d4c4a0] dark:bg-[#2a2a2a] outline-none focus:ring-2 focus:ring-[#16a34a]/30 focus:border-[#16a34a]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#5a4a30] dark:text-[#666] uppercase tracking-widest block mb-1.5">
                Prioridad
              </label>
              <select
                value={form.prioridad}
                onChange={e => set("prioridad", e.target.value)}
                className="w-full border border-[#a09070] dark:border-[#3a3a3a] rounded-lg px-3 py-2 text-sm text-[#1a1a1a] dark:text-[#e0d8cc] bg-[#d4c4a0] dark:bg-[#2a2a2a] outline-none focus:ring-2 focus:ring-[#16a34a]/30 focus:border-[#16a34a]"
              >
                {PRIORIDADES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          {err && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle size={13} className="flex-shrink-0" /> {err}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button" onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-[#a09070] dark:border-[#3a3a3a] text-sm text-[#3a2a1a] dark:text-[#888] hover:bg-[#b8a880] dark:hover:bg-[#2a2a2a] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-[#16a34a] text-white text-sm font-semibold hover:bg-[#15803d] transition-colors flex items-center gap-1.5 disabled:opacity-60"
            >
              <Save size={13} /> {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Category accordion section ────────────────────────────────
function CategorySection({ category, incidents, onAddHere, onEditIncident }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-[#c8b89a] dark:bg-[#1d1d1d] rounded-xl border border-[#b0a07a] dark:border-[#2a2a2a] overflow-hidden">
      {/* Category header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 flex items-center gap-2 hover:bg-[#bfae88] dark:hover:bg-[#252525] transition-colors"
      >
        {open
          ? <ChevronDown  size={14} className="text-[#5a4a30] dark:text-[#666] flex-shrink-0" />
          : <ChevronRight size={14} className="text-[#5a4a30] dark:text-[#666] flex-shrink-0" />
        }
        <span className="text-sm font-semibold text-[#1a1a1a] dark:text-white flex-1 text-left">
          {category}
        </span>
        <span className="text-[11px] text-[#5a4a30] dark:text-[#666] mr-1">
          {incidents.length} incidente{incidents.length !== 1 ? "s" : ""}
        </span>
      </button>

      {open && (
        <>
          {/* Incident rows */}
          <div className="border-t border-[#b0a07a] dark:border-[#2a2a2a]">
            {incidents.map((inc, i) => (
              <div
                key={inc.id}
                className={`px-5 py-2.5 flex items-center gap-3 ${
                  i < incidents.length - 1 ? "border-b border-[#b8a880]/60 dark:border-[#2a2a2a]" : ""
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] flex-shrink-0" />
                <span className="text-sm text-[#1a1a1a] dark:text-[#e0d8cc] flex-1">{inc.Incidente}</span>
                {inc.Tiempo && (
                  <span className="text-[11px] text-[#5a4a30] dark:text-[#666] whitespace-nowrap">
                    ⏱ {inc.Tiempo}
                  </span>
                )}
                {inc.Prioridad && <PriorityBadge priority={inc.Prioridad} />}
                <button
                  onClick={() => onEditIncident(inc)}
                  className="w-6 h-6 rounded border border-[#a09070] dark:border-[#3a3a3a] flex items-center justify-center text-[#5a4a30] dark:text-[#666] hover:bg-[#b0a07a] dark:hover:bg-[#2a2a2a] transition-colors ml-2"
                  title="Editar incidente"
                >
                  <Edit2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Add within category */}
          <div className="px-5 py-2 border-t border-[#b0a07a] dark:border-[#2a2a2a]">
            <button
              onClick={() => onAddHere(category)}
              className="flex items-center gap-1 text-xs text-[#16a34a] hover:text-[#15803d] font-medium transition-colors"
            >
              <Plus size={11} /> Agregar incidente en esta categoría
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────
export function ConfigView() {
  const { items, loading, error, refresh, addIncidente, updateIncidente } = useIncidentes();
  const [showModal,   setShowModal]   = useState(false);
  const [prefillCat,  setPrefillCat]  = useState("");
  const [editingInc,  setEditingInc]  = useState(null);

  const grouped = useMemo(() => {
    const map = {};
    items.forEach(inc => {
      if (!map[inc.Categoria]) map[inc.Categoria] = [];
      map[inc.Categoria].push(inc);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  const categories = grouped.map(([cat]) => cat);

  const openModal = (cat = "") => { setPrefillCat(cat); setShowModal(true); };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-semibold text-[#1a1a1a] dark:text-white">
            Categorías e incidentes
          </p>
          <p className="text-xs text-[#7a6a50] dark:text-[#888] mt-0.5">
            {grouped.length} categoría{grouped.length !== 1 ? "s" : ""} · {items.length} incidente{items.length !== 1 ? "s" : ""} registrados
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="w-8 h-8 rounded-lg border border-[#a09070] dark:border-[#3a3a3a] flex items-center justify-center text-[#5a4a30] dark:text-[#666] hover:bg-[#b0a07a] dark:hover:bg-[#2a2a2a] transition-colors"
            title="Recargar"
          >
            <RefreshCw size={13} />
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16a34a] text-white text-sm font-semibold rounded-lg hover:bg-[#15803d] transition-colors"
          >
            <Plus size={14} /> Nueva categoría / incidente
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={refresh} />}

      {loading ? <LoadingSpinner /> : (
        grouped.length === 0 ? (
          <div className="bg-[#c8b89a] dark:bg-[#1d1d1d] rounded-xl border border-[#b0a07a] dark:border-[#2a2a2a] p-14 text-center">
            <Inbox size={36} className="mx-auto mb-3 text-[#a09070] dark:text-[#3a3a3a]" />
            <p className="text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">Sin categorías registradas</p>
            <button onClick={() => openModal()} className="text-xs text-[#16a34a] hover:underline">
              Agregar la primera categoría →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {grouped.map(([cat, incs]) => (
              <CategorySection
                key={cat}
                category={cat}
                incidents={incs}
                onAddHere={openModal}
                onEditIncident={setEditingInc}
              />
            ))}
          </div>
        )
      )}

      {showModal && (
        <AddModal
          onClose={() => setShowModal(false)}
          onSave={addIncidente}
          existingCategories={categories}
          prefillCategory={prefillCat}
        />
      )}
      
      {editingInc && (
        <EditIncidentModal
          incident={editingInc}
          existingCategories={categories}
          allIncidents={items}
          onClose={() => setEditingInc(null)}
          onSave={updateIncidente}
        />
      )}
    </div>
  );
}
