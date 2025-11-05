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
import OrderPlacedPage from "./components/OrderPlacedPage";

/* MODAIS */
import ItemViewModal from "./components/ItemViewModal";
import EditModal from "./components/EditModal";
import NewItemModal from "./components/NewItemModal";
import NewCategoryModal from "./components/NewCategoryModal";
import CheckoutModal from "./components/CheckoutModal";

/* FIXOS */
import TopBarActions from "./components/TopBarActions";
import WhatsFab from "./components/WhatsFab";

/* HELPERS */
import { load, save } from "./helpers/storage";
import { getParam } from "./helpers/utils";
import { STORE, DEFAULT_CATEGORIES, DEFAULT_MENU, LS } from "./helpers/config";

export default function App() {
  const hasAccess = getParam("access") === "umami";
  const isAdmin = hasAccess && getParam("admin") === "admin";

  const [page, setPage] = useState("menu"); // "menu" | "pix" | "pedidos" | "orderPlaced"
  const [orderJustSaved, setOrderJustSaved] = useState(null);

  const [categories, setCategories] = useState(() => load(LS.cats("umami"), DEFAULT_CATEGORIES));
  const [menu, setMenu] = useState(() => load(LS.menu("umami"), DEFAULT_MENU));
  const [orders, setOrders] = useState(() => load(LS.orders("umami"), []));

  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("principal");

  const [viewItem, setViewItem] = useState(null);
  const [showNewCat, setShowNewCat] = useState(false);
  const [showNewItem, setShowNewItem] = useState(false);
  const [newItemCat, setNewItemCat] = useState("");

  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => save(LS.cats("umami"), categories), [categories]);
  useEffect(() => save(LS.menu("umami"), menu), [menu]);
  useEffect(() => save(LS.orders("umami"), orders), [orders]);

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

  // salva pedido quando NÃO é PIX
  function placeOrderWithoutPix(payment) {
    const orderId = "P" + Date.now();
    const dataBR = new Date().toLocaleString("pt-BR");
    const novo = {
      id: orderId,
      data: dataBR,
      items: cart,
      total: subtotal,
      payment,
      status: "aguardando pagamento",
    };
    const next = [...orders, novo];
    setOrders(next);
    save(LS.orders("umami"), next);
    clearCart();
    setOrderJustSaved(novo);
    setPage("orderPlaced");
  }

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
      <>
        <TopBarActions isAdmin={isAdmin} onGoAdmin={() => setPage("pedidos")} />
        <WhatsFab />
        <PixPage
          cart={cart}
          subtotal={subtotal}
          clearCart={clearCart}
          orders={orders}
          setOrders={setOrders}
          setPage={setPage}
        />
      </>
    );
  }

  if (page === "pedidos" && isAdmin) {
    return (
      <>
        <TopBarActions isAdmin={isAdmin} onGoAdmin={() => setPage("pedidos")} />
        <WhatsFab />
        <AdminOrders orders={orders} setOrders={setOrders} setPage={setPage} />
      </>
    );
  }

  if (page === "orderPlaced") {
    return (
      <>
        <TopBarActions isAdmin={isAdmin} onGoAdmin={() => setPage("pedidos")} />
        <WhatsFab />
        <OrderPlacedPage order={orderJustSaved} onBack={() => setPage("menu")} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pr-0 md:pr-[380px]">
      <TopBarActions isAdmin={isAdmin} onGoAdmin={() => setPage("pedidos")} />
      <WhatsFab presetMsg="Olá! Gostaria de falar sobre um pedido." />

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

      <CheckoutModal
        open={showCheckout}
        subtotal={subtotal}
        onClose={() => setShowCheckout(false)}
        onChoose={(method) => {
          setShowCheckout(false);
          if (method === "pix") {
            setPage("pix"); // fluxo PIX (salva no PixPage)
          } else {
            // não executar PIX; apenas salvar pedido e mostrar confirmação
            placeOrderWithoutPix(method);
          }
        }}
      />
    </div>
  );
}
