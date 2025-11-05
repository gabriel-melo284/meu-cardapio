import React, { useMemo } from "react";
import CardItem from "./CardItem";

/**
 * Lista de produtos com:
 * - Filtro por aba (tab)
 * - Filtro por busca (query)
 * - Grid responsivo otimizado para mobile
 */
export default function ProductList({
  items = [],
  tab = "principal",
  query = "",
  categories = [],
  onAdd,
  onView,
  isAdmin = false,
  onEdit,
  onDelete,
}) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const base = items.filter((i) => i.available);

    const byTab =
      tab === "principal" ? base : base.filter((i) => i.category === tab);

    if (!q) return byTab;

    return byTab.filter((i) => {
      const catLabel =
        categories.find((c) => c.id === i.category)?.label?.toLowerCase() || "";
      return (
        (i.name || "").toLowerCase().includes(q) ||
        (i.desc || "").toLowerCase().includes(q) ||
        catLabel.includes(q)
      );
    });
  }, [items, tab, query, categories]);

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {filtered.map((item) => (
        <CardItem
          key={item.id}
          item={item}
          onAdd={onAdd}
          onView={onView}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      {filtered.length === 0 && (
        <div className="col-span-full text-center text-neutral-500 py-10">
          Nenhum item encontrado.
        </div>
      )}
    </div>
  );
}
