import React, { useEffect, useState } from "react";

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
  const [showCheckout, setShowCheckout] = useState(false);

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

  /* --- PEDIDO SEM PIX (dinheiro/cartão/retirada) --- */
  function placeOrderWithoutPix(method) {
    if (cart.length === 0) {
      alert("Seu carrinho está vazio.");
      return;
    }
    const orderId = "P" + Date.now();
    const hoje = new Date();
    const dataBR = hoje.toLocaleString("pt-BR");

    const novoPedido = {
      id: orderId,
      data: dataBR,
      items: cart,
      total: subtotal,
      pagamento: method, // ex.: "dinheiro", "cartão", "retirada"
      status:
        method === "dinheiro" || method === "cartão"
          ? "pagamento na entrega"
          : "aguardando retirada",
      pix: null,
    };

    setOrders((prev) => [...prev, novoPedido]);
    clearCart();
    alert("Pedido registrado! Você pode acompanhar em 'Pedidos' (admin).");
  }

  /* ============================================================
     ROTAS
  ===============================================================*/
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

  /* ============================================================
     PÁGINA PRINCIPAL (MENU)
  ===============================================================*/
  return (
    <>
      {/* barra de ações fixa no topo e WhatsApp FAB */}
      <TopBarActions
        isAdmin={isAdmin}
        onGoAdmin={() => setPage("pedidos")}
      />
      <WhatsFab phone={STORE.whatsPhone || "+5534998970471"} msg="Olá! Gostaria de fazer um pedido." />

      {/* reserva lateral p/ o carrinho fixo no desktop */}
      <div className="min-h-screen bg-neutral-50 pr-0 md:pr-[380px]">
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

        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6">
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
        </div>
      </div>

      {/* carrinho fixo à direita */}
      <Cart
        cart={cart}
        updateQty={updateQty}
        subtotal={subtotal}
        isAdmin={isAdmin}
        onCheckout={() => setShowCheckout(true)}
        onGoAdmin={() => setPage("pedidos")}
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

      {/* Modal de escolha de pagamento */}
      <CheckoutModal
        open={showCheckout}
        subtotal={subtotal}
        onClose={() => setShowCheckout(false)}
        onChoose={(method) => {
          setShowCheckout(false);
          if (method === "pix") {
            setPage("pix");
          } else {
            placeOrderWithoutPix(method);
          }
        }}
      />
    </>
  );
}

/* ============================================================
   COMPONENTES INTERNOS — TopBarActions, WhatsFab e CheckoutModal
==============================================================*/

/* Botões do topo: Ver pedidos (admin) sempre visível */
function TopBarActions({ isAdmin, onGoAdmin }) {
  return (
    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="text-sm text-neutral-600">
          Bem-vindo ao {STORE?.name || "Cardápio"}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${(STORE.whatsPhone || "+5534998970471").replace(/[^\d]/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-neutral-50"
            title="Falar no WhatsApp"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.52 3.48A11.83 11.83 0 0012.06 0 11.94 11.94 0 000 11.95a11.8 11.8 0 001.57 5.9L0 24l6.33-1.64a11.9 11.9 0 005.73 1.47h.01c6.59 0 11.93-5.35 11.93-11.94a11.88 11.88 0 00-3.48-8.41zM12.07 21.4a9.41 9.41 0 01-4.79-1.31l-.34-.2-3.76.98 1-3.67-.22-.38a9.42 9.42 0 1117.22-4.89 9.42 9.42 0 01-9.11 9.47zm5.16-7.07c-.28-.14-1.66-.82-1.92-.91-.26-.1-.45-.14-.64.14-.2.29-.74.91-.9 1.1-.17.19-.33.21-.61.07-.28-.14-1.2-.44-2.28-1.41-.84-.75-1.4-1.67-1.56-1.95-.16-.29-.02-.45.12-.6.12-.12.28-.31.42-.46.14-.16.19-.27.28-.46.09-.2.05-.35-.02-.49-.08-.14-.64-1.54-.88-2.1-.23-.56-.47-.48-.65-.49h-.56c-.19 0-.49.07-.74.35-.26.28-.98.95-.98 2.31 0 1.36 1 2.67 1.14 2.86.14.19 1.96 2.98 4.76 4.17.67.29 1.19.46 1.6.59.67.21 1.27.18 1.75.11.53-.08 1.66-.68 1.9-1.34.24-.66.24-1.23.17-1.35-.07-.12-.26-.2-.54-.34z" />
            </svg>
            WhatsApp
          </a>

          {isAdmin && (
            <button
              onClick={onGoAdmin}
              className="px-3 py-2 rounded-xl bg-black text-white text-sm font-semibold hover:opacity-90"
              title="Ver pedidos (admin)"
            >
              Ver pedidos
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* Botão flutuante do WhatsApp (mobile/desktop) */
function WhatsFab({ phone, msg }) {
  const to = `https://wa.me/${String(phone || "").replace(/[^\d]/g, "")}${
    msg ? `?text=${encodeURIComponent(msg)}` : ""
  }`;
  return (
    <a
      href={to}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-4 right-4 z-40 inline-flex items-center justify-center w-14 h-14 rounded-full shadow-lg bg-green-500 text-white hover:bg-green-600 focus:outline-none"
      title="Falar no WhatsApp"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.52 3.48A11.83 11.83 0 0012.06 0 11.94 11.94 0 000 11.95a11.8 11.8 0 001.57 5.9L0 24l6.33-1.64a11.9 11.9 0 005.73 1.47h.01c6.59 0 11.93-5.35 11.93-11.94a11.88 11.88 0 00-3.48-8.41zM12.07 21.4a9.41 9.41 0 01-4.79-1.31l-.34-.2-3.76.98 1-3.67-.22-.38a9.42 9.42 0 1117.22-4.89 9.42 9.42 0 01-9.11 9.47zm5.16-7.07c-.28-.14-1.66-.82-1.92-.91-.26-.1-.45-.14-.64.14-.2.29-.74.91-.9 1.1-.17.19-.33.21-.61.07-.28-.14-1.2-.44-2.28-1.41-.84-.75-1.4-1.67-1.56-1.95-.16-.29-.02-.45.12-.6.12-.12.28-.31.42-.46.14-.16.19-.27.28-.46.09-.2.05-.35-.02-.49-.08-.14-.64-1.54-.88-2.1-.23-.56-.47-.48-.65-.49h-.56c-.19 0-.49.07-.74.35-.26.28-.98.95-.98 2.31 0 1.36 1 2.67 1.14 2.86.14.19 1.96 2.98 4.76 4.17.67.29 1.19.46 1.6.59.67.21 1.27.18 1.75.11.53-.08 1.66-.68 1.9-1.34.24-.66.24-1.23.17-1.35-.07-.12-.26-.2-.54-.34z" />
      </svg>
    </a>
  );
}

/* Modal de escolha de pagamento */
function CheckoutModal({ open, subtotal, onClose, onChoose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-extrabold">Como deseja pagar?</h3>
        <p className="text-neutral-600 mt-1">Total: <b>R$ {subtotal.toFixed(2).replace(".", ",")}</b></p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            className="px-4 py-3 rounded-xl border font-semibold hover:bg-neutral-50"
            onClick={() => onChoose("dinheiro")}
          >
            Dinheiro
          </button>
          <button
            className="px-4 py-3 rounded-xl border font-semibold hover:bg-neutral-50"
            onClick={() => onChoose("cartão")}
          >
            Cartão
          </button>
          <button
            className="px-4 py-3 rounded-xl border font-semibold hover:bg-neutral-50"
            onClick={() => onChoose("retirada")}
          >
            Retirar na loja
          </button>
          <button
            className="px-4 py-3 rounded-xl bg-black text-white font-semibold hover:opacity-90"
            onClick={() => onChoose("pix")}
          >
            PIX (gerar QR Code)
          </button>
        </div>

        <button
          className="mt-4 w-full py-2 rounded-xl border"
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
