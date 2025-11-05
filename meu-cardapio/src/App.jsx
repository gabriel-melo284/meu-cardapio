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

  /* --- ROTAS --- */
  const [page, setPage] = useState("menu"); // menu | pix | pedidos

  /* --- PERSISTÊNCIA --- */
  const [categories, setCategories] = useState(() =>
    load(LS.cats("umami"), DEFAULT_CATEGORIES)
  );
  const [menu, setMenu] = useState(() =>
    load(LS.menu("umami"), DEFAULT_MENU)
  );
  const [orders, setOrders] = useState(() =>
    load(LS.orders("umami"), [])
  );

  /* --- ESTADOS VISUAIS --- */
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("principal");

  /* --- MODAIS --- */
  const [viewItem, setViewItem] = useState(null);
  const [showNewCat, setShowNewCat] = useState(false);
  const [showNewItem, setShowNewItem] = useState(false);
  const [newItemCat, setNewItemCat] = useState("");

  /* --- SALVAMENTO --- */
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

  /* ============== RESTRIÇÃO DE ACESSO ============== */
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

  /* ============== PÁGINA PIX ============== */
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

  /* ============== PÁGINA ADMIN ============== */
  if (page === "pedidos" && isAdmin) {
    return (
      <AdminOrders
        orders={orders}
        setOrders={setOrders}
        setPage={setPage}
      />
    );
  }

  /* ============== PÁGINA MENU ============== */
  return (
    <div className="min-h-screen bg-neutral-50 pr-0 md:pr-[380px]">

      <TopBarActions
        isAdmin={isAdmin}
        onOpenOrders={() => setPage("pedidos")}
      />

      <Header isAdmin={isAdmin} />
      <Banner />

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

      <WhatsFab phone={STORE.whatsPhone || "5534998970471"} />
    </div>
  );
}

/* =================== BARRA FIXA DO ADMIN =================== */
function TopBarActions({ isAdmin, onOpenOrders }) {
  return (
    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-end">
        {isAdmin && (
          <button
            onClick={onOpenOrders}
            className="px-3 py-2 rounded-lg border text-sm font-semibold hover:bg-neutral-100"
          >
            Ver pedidos
          </button>
        )}
      </div>
    </div>
  );
}

/* =================== BOTÃO FIXO WHATSAPP =================== */
function WhatsFab({ phone }) {
  const href = `https://wa.me/${phone.replace(/\D/g, "")}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="
        fixed bottom-4 right-4 md:bottom-6 md:right-6
        w-14 h-14 flex items-center justify-center rounded-full
        shadow-xl bg-[#25D366]
      "
    >
      <svg viewBox="0 0 32 32" width="26" height="26" fill="#fff">
        <path d="M19.11 17.39c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37 0-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.47s1.07 2.86 1.22 3.06c.15.2 2.1 3.22 5.1 4.52.71.31 1.26.49 1.69.62.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35zM26.7 5.3C23.9 2.5 20.2 1 16.2 1 8.5 1 2.3 7.2 2.3 14.9c0 2.4.6 4.8 1.8 6.9L2 31l9.4-2.5c2 .9 4.1 1.3 6.3 1.3 7.7 0 13.9-6.2 13.9-13.9 0-3.7-1.5-7.4-4.3-10.2z"/>
      </svg>
    </a>
  );
}
