import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { slugify } from "../helpers/utils";

function Portal({ children }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

export default function NewCategoryModal({ categories, setCategories, setTab, onClose }) {
  const [label, setLabel] = useState("");
  const [id, setId] = useState("");

  useEffect(() => { setId(slugify(label)); }, [label]);

  function create() {
    if (!label.trim() || !id.trim()) return alert("Preencha nome e ID.");
    if (categories.some(c => c.id === id)) return alert("Já existe uma categoria com esse ID.");
    const novo = { id, label };
    setCategories([...categories, novo]);
    setTab(id);
    onClose();
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[10000]">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-3 shadow-2xl pointer-events-auto">
            <h3 className="text-lg font-semibold">Criar nova categoria</h3>

            <label className="text-sm">
              Nome da categoria
              <input className="w-full border rounded-xl px-3 py-2 mt-1" value={label} onChange={e => setLabel(e.target.value)} />
            </label>

            <label className="text-sm">
              ID (slug)
              <input className="w-full border rounded-xl px-3 py-2 mt-1" value={id} onChange={e => setId(slugify(e.target.value))} />
            </label>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 border rounded-xl">Cancelar</button>
              <button onClick={create} className="px-4 py-2 bg-black text-white rounded-xl">Criar</button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
