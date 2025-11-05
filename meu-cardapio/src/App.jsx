import React, { useState, useEffect } from "react";

/* COMPONENTES PRINCIPAIS */
import Banner from "./components/Banner";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import Tabs from "./components/Tabs";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";

/* PÁGINAS INTERNAS */
import PixPage from "./components/PixPage";
import AdminOrders from "./components/AdminOrders";

/* MODAIS */
import ItemViewModal from "./components/ItemViewModal";
import EditModal from "./components/EditModal";
import NewItemModal from "./components/NewItemModal";
import NewCategoryModal from "./components/NewCategoryModal";

/* HELPERS */
import { load, save } from "./helpers/storage";
import { getParam } from "./helpers/utils";

/* CONFIG */
import { STORE, DEFAULT_CATEGORIES, DEFAULT_MENU, LS } from "./helpers/config";

/* ============================================================
   APLICATIVO PRINCIPAL — MENU + ADMIN + PIX
==============================================================*/

export default function App() {
  /* --- ACESSO --- */
  const hasAccess = getParam("access") === "umami";
  const isAdmin = hasAccess && getParam("admin") === "admin";

  /* --- ROTAS INTERNAS --- */
  const [page, setPage] = useState("menu"); // "menu" | "pix" | "pedidos"

  /* --- ESTADOS DE DADOS --- */
  const [categories, setCategories] = useState(() =>
    load(LS.cats("umami"), DEFAULT_CATEGORIES)
  );
  const [menu, setMenu] = useState(() =>
    load(LS.menu("umami"), DEFAULT_MENU)
  );
  const [orders, setOrders] = useState(() =>
    load(LS.orders("umami"), [])
  );

  /* --- UI STATE --- */
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("principal");

  /* --- MODAIS --- */
  const [viewItem, setViewItem] = useState(null);
  const [showNewCat, setShowNewCat] = useState(false);
  const [showNewItem, setShowNewItem] = useState(false);
  const [newItemCat, setNewItemCat] = useState("");

  /* --- PERSISTÊNCIA --- */
  useEffect(() => save(LS.cats("umami"), categories), [categories]);
  useEffect(() => save(LS.menu("umami"), menu), [menu]);
  useEffect(() => save(LS.orders("umami"), orders), [orders]);

  /* --- CARRINHO --- */
  const subtotal = cart.reduce((t, i) => t + i.price * i.qty, 0);

  function addToCart(item) {
    setCart((prev) => {
      const f = prev.find((p) => p.id === item.id);
      if (f) return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
      return [...prev, { ...item, qty: 1 }];
    });
  }

  function updateQty(id, delta) {
    setCart((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: Math.max(0, p.qty + delta) } : p))
        .filter((p) => p.qty > 0)
    );
  }

  function clearCart() {
    setCart([]);
  }

  /* --- ROTAS --- */
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <h1 className="text-2xl font-bold mb-2">Acesso restrito</h1>
          <p className="text-neutral-600">
            Use <b>?access=umami</b> no link.
          </p>
        </div>
      </div>
    );
  }

  if (page === "pix") {
    return (
      <PixPage
        cart={cart}
        subtotal={subtotal}
        clearCart={clearCart}
        orders={orders}
        setOrders={setOrders}
        setPage={setPage}
      />
    );
  }

  if (page === "pedidos" && isAdmin) {
    return <AdminOrders orders={orders} setOrders={setOrders} setPage={setPage} />;
  }

  /* --- PÁGINA PRINCIPAL (MENU) --- */
  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      <Banner />
      <Header />

      <SearchBar query={query} setQuery={setQuery} />

      <Tabs
        tab={tab}
        setTab={setTab}
        categories={categories}
        query={query}
        isAdmin={isAdmin}
        setShowNewCat={setShowNewCat}
      />

      <ProductList
        menu={menu}
        categories={categories}
        tab={tab}
        query={query}
        addToCart={addToCart}
        isAdmin={isAdmin}
        setMenu={setMenu}
        setViewItem={setViewItem}
        setShowNewItem={setShowNewItem}
        setNewItemCat={setNewItemCat}
      />

      <Cart
        cart={cart}
        updateQty={updateQty}
        subtotal={subtotal}
        setPage={setPage}
        isAdmin={isAdmin}
      />

      {/* MODAIS */}
      {viewItem && (
        <ItemViewModal
          item={viewItem}
          onClose={() => setViewItem(null)}
          onAdd={addToCart}
          setViewItem={setViewItem}
          setMenu={setMenu}
          isAdmin={isAdmin}
        />
      )}

      {showNewCat && (
        <NewCategoryModal
          categories={categories}
          setCategories={setCategories}
          setTab={setTab}
          onClose={() => setShowNewCat(false)}
        />
      )}

      {showNewItem && (
        <NewItemModal
          categories={categories}
          currentCategory={newItemCat || tab}
          onSave={(d) => setMenu((prev) => [...prev, d])}
          onClose={() => setShowNewItem(false)}
        />
      )}
    </div>
  );
}
