import CardItem from "./CardItem";

export default function ProductList({
  menu,
  categories,
  tab,
  query,
  addToCart,
  isAdmin,
  setMenu,
  setViewItem,
  setShowNewItem,
  setNewItemCat,
}) {
  const itemsAvail = menu.filter((i) => i.available);

  const filtered = (() => {
    const q = query.trim().toLowerCase();
    let base =
      tab === "principal" ? itemsAvail : itemsAvail.filter((i) => i.category === tab);
    if (!q) return base;
    return base.filter(
      (i) =>
        (i.name || "").toLowerCase().includes(q) ||
        (i.desc || "").toLowerCase().includes(q) ||
        (categories.find((c) => c.id === i.category)?.label || "")
          .toLowerCase()
          .includes(q)
    );
  })();

  const showAddItemButton = (catId) => (
    isAdmin && (
      <button
        title="Adicionar item"
        onClick={() => {
          setNewItemCat(catId);
          setShowNewItem(true);
        }}
        className="ml-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white shadow hover:bg-orange-600"
      >
        +
      </button>
    )
  );

  // GRADE padronizada de cartas menores
  const Grid = ({ children }) => (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">{children}</div>
  );

  if (tab === "principal" && !query.trim()) {
    return (
      <div className="space-y-8">
        {categories.map((cat) => {
          const list = itemsAvail.filter((i) => i.category === cat.id);
          const showSection = isAdmin ? true : list.length > 0;
          if (!showSection) return null;

          return (
            <section key={cat.id}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl sm:text-2xl font-extrabold">{cat.label}</h3>
                {showAddItemButton(cat.id)}
              </div>

              {list.length === 0 ? (
                isAdmin ? (
                  <div className="text-sm text-neutral-400 italic">
                    Nenhum item nesta sessão.
                  </div>
                ) : null
              ) : (
                <Grid>
                  {list.map((item) => (
                    <CardItem
                      key={item.id}
                      item={item}
                      onAdd={addToCart}
                      isAdmin={isAdmin}
                      onEdit={(u) =>
                        setMenu((prev) => prev.map((p) => (p.id === u.id ? u : p)))
                      }
                      onDelete={(id) =>
                        setMenu((prev) => prev.filter((p) => p.id !== id))
                      }
                      onView={setViewItem}
                    />
                  ))}
                </Grid>
              )}
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-extrabold">
          {tab === "principal"
            ? "Resultado da busca"
            : categories.find((c) => c.id === tab)?.label}
        </h2>
        {tab !== "principal" && showAddItemButton(tab)}
      </div>

      {filtered.length === 0 ? (
        <div className="text-neutral-500 py-8">Nenhum item encontrado.</div>
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <CardItem
              key={item.id}
              item={item}
              onAdd={addToCart}
              isAdmin={isAdmin}
              onEdit={(u) => setMenu((prev) => prev.map((p) => (p.id === u.id ? u : p)))}
              onDelete={(id) => setMenu((prev) => prev.filter((p) => p.id !== id))}
              onView={setViewItem}
            />
          ))}
        </div>
      )}
    </>
  );
}
