// src/components/CardItem.jsx
import React, { useState } from "react";
import { currency } from "../helpers/utils";

export default function CardItem({ item, onAdd, isAdmin, onEdit, onDelete, onView }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border flex flex-col h-full">
      <button className="w-full" onClick={() => onView(item)}>
        <div className="relative w-full aspect-[4/3] bg-neutral-100 overflow-hidden">
          <img
            src={item.img}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/400x300?text=Sem+imagem";
            }}
          />
        </div>
      </button>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-semibold leading-tight">{item.name}</h4>
            <span className="text-sm font-semibold">{currency(item.price)}</span>
          </div>
          <p className="text-sm text-neutral-600 mt-1 line-clamp-3">
            {item.desc}
          </p>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            className="flex-1 py-2 rounded-xl border font-medium disabled:opacity-50"
            disabled={!item.available}
            onClick={() => onAdd(item)}
          >
            {item.available ? "Adicionar" : "Indisponível"}
          </button>

          {isAdmin && (
            <>
              <button className="px-3 py-2 rounded-xl border" onClick={() => setEditing(true)}>
                Editar
              </button>
              <button
                className="px-3 py-2 rounded-xl border"
                onClick={() => onDelete(item.id)}
                title="Remover"
                aria-label="Remover"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>

      {editing && (
        // Reaproveita seu EditModal existente
        // (deixe como já está no seu projeto)
        null
      )}
    </div>
  );
}
