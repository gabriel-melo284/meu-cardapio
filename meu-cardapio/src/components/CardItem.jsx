import React, { useState } from "react";
import { currency } from "../helpers/utils";

export default function CardItem({
  item,
  onAdd,
  isAdmin,
  onEdit,
  onDelete,
  onView,
  size = "md", // "sm" ou "md"
}) {
  const [editing, setEditing] = useState(false);

  const isSm = size === "sm";

  const cardCls =
    "bg-white rounded-2xl shadow-sm overflow-hidden border flex flex-col";
  const bodyCls = isSm ? "p-3 flex-1 flex flex-col" : "p-4 flex-1 flex flex-col";
  const titleCls = isSm ? "font-semibold text-base leading-tight" : "font-semibold leading-tight";
  const priceCls = isSm ? "text-sm font-semibold" : "text-sm font-semibold";
  const descCls = isSm ? "text-[13px] text-neutral-600 mt-1 line-clamp-2" : "text-sm text-neutral-600 mt-1 line-clamp-3";
  const addBtnCls = isSm
    ? "flex-1 py-2 rounded-xl border text-sm font-medium"
    : "flex-1 py-2 rounded-xl border font-medium";
  const adminBtnCls = isSm ? "px-3 py-2 rounded-xl border text-sm" : "px-3 py-2 rounded-xl border";

  return (
    <div className={cardCls}>
      <button className="w-full" onClick={() => onView(item)} aria-label={item.name}>
        <CardThumb src={item.img} alt={item.name} size={size} />
      </button>

      <div className={bodyCls}>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <h4 className={titleCls}>{item.name}</h4>
            <span className={priceCls}>{currency(item.price)}</span>
          </div>
          <p className={descCls}>{item.desc}</p>
          {!item.available && (
            <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-neutral-100">
              Indisponível
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            className={addBtnCls}
            disabled={!item.available}
            onClick={() => onAdd(item)}
          >
            Adicionar
          </button>

          {isAdmin && (
            <>
              <button
                className={adminBtnCls}
                onClick={() => onEdit ? onEdit(item) : setEditing(true)}
                title="Editar"
              >
                ✎
              </button>
              <button
                className={adminBtnCls}
                onClick={() => onDelete(item.id)}
                title="Remover"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CardThumb({ src, alt = "", size = "md" }) {
  // miniatura mais “baixa” no modo compacto
  const wrapCls =
    size === "sm"
      ? "relative w-full aspect-[4/3] max-h-40 bg-neutral-100 overflow-hidden"
      : "relative w-full aspect-[4/3] bg-neutral-100 overflow-hidden";

  return (
    <div className={wrapCls}>
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.src =
            "https://via.placeholder.com/400x300?text=Sem+imagem";
        }}
        loading="lazy"
      />
    </div>
  );
}
