// src/App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import QR from "qrcode-generator"; // precisa de `npm i qrcode-generator`

/* ============================================================
   CONFIG & CONSTANTES
==============================================================*/
const ACCESS_KEY = "umami";   // ?access=umami
const ADMIN_KEY  = "admin";   // + ?admin=admin

const STORE = {
  name: "Umami Fit - Gourmet",
  address: "Santa Mônica",
  city: "Uberlândia",
  opensAt: "08:00",
  closesAt: "18:00",
  banner: "/banner_1584x396.jpg",
  logo: "/umami-logo.png",
  pixChave: "+5534998970471",
  whatsPhone: "5534998970471",
};

const LS = {
  cats:   (k) => `cats_v7_${k}`,
  menu:   (k) => `menu_v7_${k}`,
  orders: (k) => `orders_v1_${k}`,
};

const DEFAULT_CATEGORIES = [
  { id: "marmitas", label: "Marmitas" },
  { id: "bolos", label: "Bolos de pote" },
  { id: "trufas", label: "Trufas" },
  { id: "panquecas", label: "Panquecas" },
  { id: "lasanhas", label: "Lasanhas" },
  { id: "combos", label: "Combos promocionais" },
];

const DEFAULT_MENU = [
  {
    id: "m1",
    category: "marmitas",
    name: "Marmita Fit (350g)",
    desc: "Arroz integral, frango grelhado, legumes no vapor.",
    price: 22.9,
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop",
    available: true,
  },
  {
    id: "m2",
    category: "marmitas",
    name: "Marmita Tradicional (500g)",
    desc: "Arroz, feijão, bife acebolado e salada.",
    price: 24.9,
    img: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop",
    available: true,
  },
];

/* ============================================================
   HELPERS
==============================================================*/
const currency = (n) =>
  Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const getParam = (k) => {
  try { return new URL(window.location.href).searchParams.get(k); }
  catch { return null; }
};

function slugify(t) {
  return String(t)
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function load(key, fallback) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function parseHM(hm) {
  const [h,m] = String(hm).split(":").map(Number);
  const d = new Date();
  d.setHours(h||0, m||0, 0, 0);
  return d;
}
function businessStatus(opensAt, closesAt) {
  const now = new Date();
  const open = parseHM(opensAt);
  const close = parseHM(closesAt);
  if (now < open) return `Abre às ${opensAt}`;
  if (now >= open && now <= close) return `Fecha às ${closesAt}`;
  return `Abre amanhã às ${opensAt}`;
}

/* ---------- PIX helpers (payload + SVG QR) ---------- */
function crc16Ccitt(str) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}
function tlv(id, value) {
  const size = String(value.length).padStart(2, "0");
  return `${id}${size}${value}`;
}
function generatePixPayload({ chave, valor, nome, cidade, id }) {
  const gui = tlv("00", "BR.GOV.BCB.PIX");
  const chaveTLV = tlv("01", chave);
  const mai = tlv("26", gui + chaveTLV);
  const mcc = tlv("52", "0000");
  const curr = tlv("53", "986");
  const amount = tlv("54", Number(valor).toFixed(2));
  const country = tlv("58", "BR");
  const mName = tlv("59", (nome || "").slice(0, 25));
  const mCity = tlv("60", (cidade || "").slice(0, 15));
  const addData = tlv("62", tlv("05", id));
  let payload = "000201" + mai + mcc + curr + amount + country + mName + mCity + addData + "6304";
  payload += crc16Ccitt(payload);
  return payload;
}
function generateQRCodeSVG(text, size = 300) {
  const qr = QR(0, "M");
  qr.addData(text);
  qr.make();
  const cellSize = Math.max(2, Math.floor(size / qr.getModuleCount()));
  return qr.createSvgTag({ cellSize, margin: 2 });
}

/* ============================================================
   PORTAL para modais
==============================================================*/
function ModalPortal({ children }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

/* ============================================================
   APP (arquivo único, com tudo)
==============================================================*/
export default function App() {
  const hasAccess = getParam("access") === ACCESS_KEY;
  const isAdmin = hasAccess && getParam("admin") === ADMIN_KEY;

  const [page, setPage] = useState("menu"); // "menu" | "pix" | "pedidos"

  const [categories, setCategories] = useState(() =>
    load(LS.cats(ACCESS_KEY), DEFAULT_CATEGORIES)
  );
  const [menu, setMenu] = useState(() =>
    load(LS.menu(ACCESS_KEY), DEFAULT_MENU)
  );
  const [orders, setOrders] = useState(() =>
    load(LS.orders(ACCESS_KEY), [])
  );

  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("principal");

  const [viewItem, setViewItem] = useState(null);
  const [showNewCat, setShowNewCat] = useState(false);
  const [showNewItem, setShowNewItem] = useState(false);
  const [newItemCat, setNewItemCat] = useState("");

  useEffect(() => save(LS.cats(ACCESS_KEY), categories), [categories]);
  useEffect(() => save(LS.menu(ACCESS_KEY), menu), [menu]);
  useEffect(() => save(LS.orders(ACCESS_KEY), orders), [orders]);

  const subtotal = cart.reduce((t, i) => t + i.price * i.qty, 0);

  function addToCart(item) {
    setCart((prev) => {
      const f = prev.find((p) => p.id === item.id);
      if (f) return prev.map((p) => p.id === item.id ? { ...p, qty: p.qty + 1 } : p);
      return [...prev, { ...item, qty: 1 }];
    });
  }
  function updateQty(id, delta) {
    setCart(prev =>
      prev
        .map(p => p.id === id ? { ...p, qty: Math.max(0, p.qty + delta) } : p)
        .filter(p => p.qty > 0)
    );
  }
  function clearCart() { setCart([]); }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-2">Acesso restrito</h1>
          <p className="text-neutral-600 mb-6">Use <b>?access=umami</b> no link.</p>
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

  return (
    <div className="min-h-screen bg-neutral-50 pr-0 md:pr-[380px]">
      <Header
        isAdmin={isAdmin}
        onOpenOrders={() => setPage("pedidos")}
      />

      <Banner />

      <TopBarActions
        isAdmin={isAdmin}
        onOpenOrders={() => setPage("pedidos")}
      />

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

      {/* Modais */}
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

/* ============================================================
   COMPONENTES VISUAIS (no mesmo arquivo)
==============================================================*/

function Header({ isAdmin, onOpenOrders }) {
  const statusText = businessStatus(STORE.opensAt, STORE.closesAt);
  return (
    <div className="bg-white relative z-10">
      <div className="max-w-7xl mx-auto w-full px-4">
        <div className="flex items-center gap-4 py-5">
          <img
            src={STORE.logo}
            alt="logo"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-8 ring-white object-cover bg-white shadow-md"
          />
          <div className="flex-1">
            <h1 className="text-neutral-900 text-2xl sm:text-3xl font-extrabold">
              {STORE.name}
            </h1>
            <p className="text-neutral-700 text-sm sm:text-base font-medium">
              {STORE.address} • {STORE.city}
            </p>
            <p className="text-neutral-600 text-sm sm:text-base font-semibold">
              {statusText}
            </p>
          </div>

          {/* Ver pedidos sempre visível quando admin */}
          {isAdmin && (
            <button
              onClick={onOpenOrders}
              className="hidden md:inline-flex px-3 py-2 rounded-lg border text-sm font-semibold hover:bg-neutral-50"
              title="Ver pedidos"
            >
              Ver pedidos
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Banner() {
  return (
    <div className="relative z-0 h-48 sm:h-56 md:h-64 overflow-hidden">
      <img
        src={STORE.banner}
        alt="banner"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/15"></div>
    </div>
  );
}

function TopBarActions({ isAdmin, onOpenOrders }) {
  return (
    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-end gap-2">
        {isAdmin && (
          <button
            onClick={onOpenOrders}
            className="px-3 py-2 rounded-lg border text-sm font-semibold hover:bg-neutral-50"
            title="Ver pedidos"
          >
            Ver pedidos
          </button>
        )}
      </div>
    </div>
  );
}

function SearchBar({ query, setQuery }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-3">
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60">
          {/* lupa em contorno (SVG) */}
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"
               viewBox="0 0 24 24" className="text-neutral-500">
            <circle cx="11" cy="11" r="7"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input
          placeholder="Buscar no cardápio"
          className="w-full rounded-full border pl-10 pr-4 py-3 text-base focus:outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
    </div>
  );
}

function Tabs({ tab, setTab, categories, query, isAdmin, setShowNewCat }) {
  return (
    <div className="max-w-7xl mx-auto px-4 pb-3 overflow-x-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTab("principal")}
          className={`px-4 py-2 rounded-full text-sm font-semibold border ${
            tab === "principal" ? "bg-black text-white" : ""
          }`}
        >
          Principal
        </button>

        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setTab(c.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${
              tab === c.id ? "bg-black text-white" : ""
            }`}
          >
            {c.label}
          </button>
        ))}

        {isAdmin && (
          <button
            onClick={() => setShowNewCat(true)}
            className="ml-auto w-10 h-10 rounded-full bg-orange-500 text-white shadow"
            title="Nova categoria"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}

function ProductList({
  menu, categories, tab, query,
  addToCart, isAdmin, setMenu, setViewItem,
  setShowNewItem, setNewItemCat
}) {
  const filtered = useMemo(() => {
    return menu
      .filter(i => i.available)
      .filter(i => tab === "principal" ? true : i.category === tab)
      .filter(i => query.trim()
        ? (i.name.toLowerCase().includes(query.toLowerCase())
          || i.desc.toLowerCase().includes(query.toLowerCase()))
        : true);
  }, [menu, tab, query]);

  const title = tab === "principal"
    ? "Todos os Produtos"
    : (categories.find(c => c.id === tab)?.label || "");

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-extrabold mb-4">{title}</h2>

        {/* cards menores (iguais em todas as seções) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(item => (
            <CardItem
              key={item.id}
              item={item}
              onAdd={addToCart}
              isAdmin={isAdmin}
              onEdit={(u) => setMenu(prev => prev.map(p => p.id === u.id ? u : p))}
              onDelete={(id) => setMenu(prev => prev.filter(p => p.id !== id))}
              onView={(i) => setViewItem(i)}
            />
          ))}
        </div>

        {isAdmin && (
          <div className="mt-4">
            <button
              onClick={() => { setNewItemCat(tab === "principal" ? "" : tab); setShowNewItem(true); }}
              className="w-10 h-10 rounded-full bg-orange-500 text-white shadow"
              title="Adicionar item"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CardItem({ item, onAdd, isAdmin, onEdit, onDelete, onView }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border flex flex-col">
      <button className="w-full" onClick={() => onView(item)}>
        <div className="relative w-full aspect-[4/3] bg-neutral-100 overflow-hidden">
          <img
            src={item.img}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/400x300?text=Sem+imagem"; }}
          />
        </div>
      </button>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-semibold leading-tight line-clamp-2">{item.name}</h4>
            <span className="text-sm font-semibold">{currency(item.price)}</span>
          </div>
          <p className="text-sm text-neutral-600 mt-1 line-clamp-3">{item.desc}</p>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button className="flex-1 py-2 rounded-xl border font-medium" onClick={() => onAdd(item)}>
            Adicionar
          </button>

          {isAdmin && (
            <>
              <button className="px-3 py-2 rounded-xl border" onClick={() => onEdit(item)}>Editar</button>
              <button className="px-3 py-2 rounded-xl border" onClick={() => onDelete(item.id)}>🗑️</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Cart({ cart, updateQty, subtotal, setPage, isAdmin }) {
  return (
    <aside className="bg-white rounded-none md:rounded-2xl shadow-none md:shadow-sm p-4 h-max md:sticky md:top-24 md:mx-6 md:w-[340px] fixed bottom-0 left-0 right-0 md:left-auto md:right-0 border-t md:border-none">
      <h3 className="font-semibold text-lg mb-3">Seu carrinho</h3>

      {cart.length === 0 ? (
        <div className="text-center text-neutral-500 py-8">Carrinho vazio</div>
      ) : (
        <div className="space-y-3">
          {cart.map(it => (
            <div key={it.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm line-clamp-1">{it.name}</div>
                <div className="text-xs text-neutral-500">{currency(it.price)} × {it.qty}</div>
              </div>
              <div className="flex items-center gap-1">
                <button className="px-2 py-1 border rounded-full" onClick={() => updateQty(it.id, -1)}>-</button>
                <button className="px-2 py-1 border rounded-full" onClick={() => updateQty(it.id, +1)}>+</button>
              </div>
            </div>
          ))}
          <div className="border-t pt-3 flex items-center justify-between font-semibold">
            <span>Subtotal</span><span>{currency(subtotal)}</span>
          </div>
          <button
            onClick={() => setPage("pix")}
            className="w-full py-3 rounded-xl bg-black text-white font-semibold"
          >
            Finalizar pedido
          </button>
        </div>
      )}

      {isAdmin && (
        <button
          onClick={() => setPage("pedidos")}
          className="mt-4 w-full py-3 rounded-xl bg-orange-500 text-white font-semibold"
        >
          Ver pedidos
        </button>
      )}
    </aside>
  );
}

/* ============================================================
   PÁGINAS (PIX & ADMIN)
==============================================================*/
function PixPage({ cart, subtotal, clearCart, orders, setOrders, setPage }) {
  const orderId = "P" + Date.now();
  const payload = generatePixPayload({
    chave: STORE.pixChave,
    valor: subtotal,
    nome: STORE.name,
    cidade: STORE.city,
    id: orderId,
  });
  const qrSVG = generateQRCodeSVG(payload, 300);

  function salvarPedido() {
    const hoje = new Date();
    const dataBR = hoje.toLocaleString("pt-BR");
    const novo = {
      id: orderId,
      data: dataBR,
      items: cart,
      total: subtotal,
      status: "aguardando pagamento",
      pix: { copiaCola: payload },
    };
    setOrders([...orders, novo]);
    clearCart();
  }
  useEffect(() => { salvarPedido(); /* mount only */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function copiarCodigo() {
    navigator.clipboard.writeText(payload);
    alert("Código PIX copiado!");
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-6 max-w-lg w-full">
        <h1 className="text-2xl font-extrabold text-center">Pagamento via PIX</h1>
        <p className="text-neutral-600 text-center mt-1">Escaneie o QR Code ou copie o código.</p>

        <div className="mt-5 mx-auto w-full flex items-center justify-center">
          <div className="p-4 bg-white rounded-2xl border shadow">
            <div className="bg-white rounded-xl p-3 border" dangerouslySetInnerHTML={{ __html: qrSVG }} />
          </div>
        </div>

        <div className="mt-4 text-center text-xl font-bold">Total: {currency(subtotal)}</div>

        <div className="mt-4">
          <label className="text-sm font-semibold">Código PIX (copia e cola)</label>
          <textarea readOnly className="w-full border rounded-xl p-3 text-sm mt-1" rows={4} value={payload} />
        </div>

        <div className="mt-3 grid gap-2">
          <button onClick={copiarCodigo} className="w-full py-3 rounded-xl bg-black text-white font-semibold">
            Copiar código PIX
          </button>
          <button onClick={() => setPage("menu")} className="w-full py-3 rounded-xl border font-semibold">
            Voltar ao cardápio
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminOrders({ orders, setOrders, setPage }) {
  function confirmarPagamento(id) {
    const atualizado = orders.map(p => p.id === id ? { ...p, status: "pagamento confirmado" } : p);
    setOrders(atualizado);
    alert("Pagamento confirmado!");
  }
  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-xl p-6 rounded-2xl">
        <h1 className="text-2xl font-extrabold mb-6">Pedidos realizados</h1>

        {orders.length === 0 ? (
          <p className="text-neutral-600">Nenhum pedido foi feito ainda.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((p) => (
              <div key={p.id} className="border rounded-2xl p-5 shadow-sm bg-neutral-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-bold text-lg">Pedido {p.id}</h2>
                    <p className="text-neutral-600 text-sm">{p.data}</p>
                    <p className={`mt-1 text-sm font-semibold ${p.status === "pagamento confirmado" ? "text-green-600" : "text-red-600"}`}>
                      Status: {p.status}
                    </p>
                  </div>

                  {p.status !== "pagamento confirmado" && (
                    <button
                      onClick={() => confirmarPagamento(p.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl shadow"
                    >
                      Confirmar pagamento
                    </button>
                  )}
                </div>

                <div className="mt-4 border-t pt-4 space-y-2">
                  {p.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.qty}× {item.name}</span>
                      <span>{currency(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 border-t pt-3 text-right font-bold text-lg">
                  Total: {currency(p.total)}
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => setPage("menu")} className="mt-6 w-full py-3 rounded-xl bg-black text-white font-semibold">
          Voltar ao cardápio
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   MODAIS
==============================================================*/
function ItemViewModal({ item, onClose, onAdd, isAdmin, setViewItem, setMenu }) {
  const [edit, setEdit] = useState(false);
  const imgRef = useRef(null);
  const [painted, setPainted] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, []);

  useEffect(() => {
    setPainted(false);
    const el = imgRef.current;
    if (el && el.complete) requestAnimationFrame(() => setPainted(true));
  }, [item]);

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/50"></div>

        <div
          className={`relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-opacity duration-150 ${
            painted ? "opacity-100" : "opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative bg-white flex items-center justify-center">
            <img
              ref={imgRef}
              src={item.img}
              alt={item.name}
              className="max-h-[55vh] w-auto object-contain mx-auto"
              onLoad={() => requestAnimationFrame(() => setPainted(true))}
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/600x400?text=Imagem+indisponivel";
                requestAnimationFrame(() => setPainted(true));
              }}
            />
            <button className="absolute top-3 right-3 px-3 py-1 bg-white/90 border rounded-full text-sm shadow" onClick={onClose}>
              Fechar
            </button>
          </div>

          <div className="p-5 overflow-auto">
            <h2 className="text-2xl font-extrabold">{item.name}</h2>
            <p className="mt-2 text-neutral-700">{item.desc}</p>
            <p className="text-xl font-bold mt-4">{currency(item.price)}</p>

            <div className="flex items-center gap-3 mt-5">
              <button className="px-5 py-2 rounded-xl bg-black text-white font-semibold" onClick={() => onAdd(item)}>
                Adicionar ao carrinho
              </button>
              {isAdmin && (
                <button className="px-5 py-2 rounded-xl border" onClick={() => setEdit(true)}>
                  Editar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {edit && (
        <EditModal
          item={item}
          onClose={() => setEdit(false)}
          onSave={(d) => {
            setMenu(prev => prev.map(p => p.id === d.id ? d : p));
            setViewItem(d);
            setEdit(false);
          }}
        />
      )}
    </ModalPortal>
  );
}

function EditModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item);
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[10000]">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-3 shadow-2xl pointer-events-auto">
            <h3 className="text-lg font-semibold">Editar item</h3>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm col-span-2">Nome
                <input className="w-full border rounded-xl px-3 py-2 mt-1"
                       value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </label>

              <label className="text-sm">Preço
                <input type="number" className="w-full border rounded-xl px-3 py-2 mt-1"
                       value={form.price}
                       onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
              </label>

              <label className="text-sm col-span-2">Descrição
                <textarea className="w-full border rounded-xl px-3 py-2 mt-1"
                          value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
              </label>

              <label className="text-sm col-span-2">URL da imagem
                <input className="w-full border rounded-xl px-3 py-2 mt-1"
                       value={form.img} onChange={e => setForm({ ...form, img: e.target.value })} />
              </label>

              <label className="text-sm">Categoria
                <input className="w-full border rounded-xl px-3 py-2 mt-1"
                       value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              </label>

              <label className="text-sm flex items-center gap-2">
                <input type="checkbox" checked={form.available}
                       onChange={e => setForm({ ...form, available: e.target.checked })} />
                Disponível
              </label>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button className="px-4 py-2 rounded-xl border" onClick={onClose}>Cancelar</button>
              <button className="px-4 py-2 rounded-xl bg-black text-white" onClick={() => { onSave({ ...form }); onClose(); }}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function NewCategoryModal({ categories, setCategories, onClose, setTab }) {
  const [label, setLabel] = useState("");
  const [id, setId] = useState("");
  useEffect(() => setId(slugify(label)), [label]);

  function create() {
    if (!label.trim() || !id.trim()) return alert("Preencha nome e ID.");
    if (categories.some((c) => c.id === id)) return alert("Já existe uma categoria com esse ID.");
    const novo = { id, label };
    setCategories([...categories, novo]);
    setTab(id);
    onClose();
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[9999]">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-3 shadow-2xl pointer-events-auto">
            <h3 className="text-lg font-semibold">Criar nova categoria</h3>
            <label className="text-sm">Nome da categoria
              <input className="w-full border rounded-xl px-3 py-2 mt-1" value={label} onChange={(e) => setLabel(e.target.value)} />
            </label>
            <label className="text-sm">ID (slug)
              <input className="w-full border rounded-xl px-3 py-2 mt-1" value={id} onChange={(e) => setId(slugify(e.target.value))} />
            </label>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 border rounded-xl">Cancelar</button>
              <button onClick={create} className="px-4 py-2 bg-black text-white rounded-xl">Criar</button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function NewItemModal({ currentCategory, categories, onClose, onSave }) {
  const [form, setForm] = useState({
    id: "it_" + Math.random().toString(36).slice(2, 8),
    category: currentCategory || (categories[0]?.id || ""),
    name: "",
    desc: "",
    price: 0,
    img: "",
    available: true,
  });

  function create() {
    if (!form.name.trim()) return alert("Digite um nome.");
    if (!form.category) return alert("Escolha uma categoria.");
    onSave(form);
    onClose();
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[9999]">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-3 shadow-2xl pointer-events-auto">
            <h3 className="text-lg font-semibold">Novo item ({categories.find((c) => c.id === form.category)?.label})</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm col-span-2">Nome
                <input className="w-full border rounded-xl px-3 py-2 mt-1"
                       value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </label>
              <label className="text-sm">Preço
                <input type="number" className="w-full border rounded-xl px-3 py-2 mt-1"
                       value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
              </label>
              <label className="text-sm col-span-2">Descrição
                <textarea className="w-full border rounded-xl px-3 py-2 mt-1"
                          value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
              </label>
              <label className="text-sm col-span-2">URL da imagem
                <input className="w-full border rounded-xl px-3 py-2 mt-1"
                       value={form.img} onChange={e => setForm({ ...form, img: e.target.value })} />
              </label>
              <label className="text-sm">Categoria
                <select className="w-full border rounded-xl px-3 py-2 mt-1"
                        value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </label>
              <label className="text-sm flex items-center gap-2">
                <input type="checkbox" checked={form.available}
                       onChange={e => setForm({ ...form, available: e.target.checked })} />
                Disponível
              </label>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 border rounded-xl">Cancelar</button>
              <button onClick={create} className="px-4 py-2 bg-black text-white rounded-xl">Adicionar</button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

/* ============================================================
   FAB WhatsApp
==============================================================*/
function WhatsFab({ phone }) {
  const href = `https://wa.me/${String(phone).replace(/\D/g, "")}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed md:right-6 right-4 md:bottom-6 bottom-4 inline-flex items-center justify-center w-14 h-14 rounded-full shadow-lg bg-[#25D366]"
      aria-label="WhatsApp"
    >
      <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
        <path fill="#fff" d="M19.11 17.39c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37 0-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.47s1.07 2.86 1.22 3.06c.15.2 2.1 3.22 5.1 4.52.71.31 1.26.49 1.69.62.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35zM26.7 5.3C23.9 2.5 20.2 1 16.2 1 8.5 1 2.3 7.2 2.3 14.9c0 2.4.6 4.8 1.8 6.9L2 31l9.4-2.5c2 .9 4.1 1.3 6.3 1.3 7.7 0 13.9-6.2 13.9-13.9 0-3.7-1.5-7.4-4.3-10.2zM16.7 27.7c-2 .0-3.9-.5-5.6-1.4l-.4-.2-5.5 1.5 1.5-5.3-.3-.4c-1.1-1.8-1.7-3.9-1.7-6 0-6.5 5.3-11.8 11.8-11.8 3.1 0 6.1 1.2 8.3 3.5 2.2 2.2 3.5 5.2 3.5 8.3 0 6.5-5.3 11.8-11.8 11.8z"/>
      </svg>
    </a>
  );
}
