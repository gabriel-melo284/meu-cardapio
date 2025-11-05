import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { currency } from "../helpers/utils";
import EditModal from "./EditModal";

function Portal({ children }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

export default function ItemViewModal({ item, onClose, onAdd, isAdmin, setViewItem, setMenu }) {
  const [edit, setEdit] = useState(false);
  const [painted, setPainted] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    setPainted(false);
    if (imgRef.current && imgRef.current.complete) {
      requestAnimationFrame(() => setPainted(true));
    }
  }, [item]);

  if (!item) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/50" />
        <div
          className={`relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden transition-opacity duration-150 ${painted ? "opacity-100" : "opacity-0"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white flex items-center justify-center">
            <img
              ref={imgRef}
              src={item.img}
              alt={item.name}
              className="max-h-[55vh] w-auto object-contain mx-auto"
              onLoad={() => requestAnimationFrame(() => setPainted(true))}
              onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/600x400?text=Imagem"; requestAnimationFrame(() => setPainted(true)); }}
            />
            <button className="absolute top-3 right-3 px-3 py-1 bg-white/90 border rounded-full text-sm shadow" onClick={onClose}>
              Fechar
            </button>
          </div>

          <div className="p-5">
            <h2 className="text-2xl font-extrabold">{item.name}</h2>
            <p className="mt-2 text-neutral-700">{item.desc}</p>
            <p className="text-xl font-bold mt-4">{currency(item.price)}</p>

            <div className="flex items-center gap-3 mt-5">
              <button className="px-5 py-2 rounded-xl bg-black text-white font-semibold" onClick={() => onAdd(item)}>
                Adicionar ao carrinho
              </button>
              {isAdmin && (
                <button className="px-5 py-2 rounded-xl border" onClick={() => setEdit(true)}>Editar</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {edit && (
        <EditModal
          item={item}
          onClose={() => setEdit(false)}
          onSave={(u) => {
            setMenu(prev => prev.map(p => p.id === u.id ? u : p));
            setViewItem(u);
            setEdit(false);
          }}
        />
      )}
    </Portal>
  );
}
