// NOVO CÓDIGO COMPLETO — Cardápio com criação de categorias e itens via ícones " + "
// Observação: Este código substitui totalmente o anterior, conforme solicitado.

import React, { useEffect, useMemo, useState } from "react";

// =================== CONFIG ===================
const ACCESS_KEY = "umami";
const ADMIN_KEY = "admin-123"; // admin acessa via ?admin=...

const STORE = {
  name: "UMAMI - FIT E GOURMET",
  address: "Santa Mônica",
  city: "Uberlândia",
  banner:
    "https://images.unsplash.com/photo-1604908554007-43f5b2f318a6?q=80&w=2070&auto=format&fit=crop",
  logo:
    "https://images.unsplash.com/photo-1603048297172-c92544798d5a?q=80&w=300&auto=format&fit=crop",
  opensAt: "08:00",
  closesAt: "18:00",
};

function currency(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function getParam(n) {
  try {
    return new URL(window.location.href).searchParams.get(n);
  } catch {
    return null;
  }
}
function slugify(t) {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// =================== APP ===================
export default function App() {
  const hasAccess = getParam("access") === ACCESS_KEY;
  const isAdmin = hasAccess && getParam("admin") === ADMIN_KEY;

  // CATEGORIAS DINÂMICAS
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("cats");
    return (
      saved ||
      JSON.stringify([
        { id: "marmitas", label: "Marmitas" },
        { id: "bolos", label: "Bolos de pote" },
      ])
    );
  });
  const cats = JSON.parse(categories);

  // MENU
  const [menu, setMenu] = useState(() => {
    const saved = localStorage.getItem("menu");
    return saved ? JSON.parse(saved) : [];
  });
  const [tab, setTab] = useState(cats[0]?.id || "");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);

  useEffect(() => localStorage.setItem("menu", JSON.stringify(menu)), [menu]);
  useEffect(() => localStorage.setItem("cats", JSON.stringify(cats)), [categories]);

  if (!hasAccess)
    return <div className="p-10 text-center">Acesso negado</div>;

  const filtered = menu.filter(
    (i) =>
      i.category === tab &&
      (i.name.toLowerCase().includes(query.toLowerCase()) ||
        i.desc.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* BANNER */}
      <div className="relative h-72">
        <img src={STORE.banner} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-4 left-4 flex items-center gap-4">
          <img src={STORE.logo} className="w-20 h-20 rounded-full ring-4 ring-white" />
          <div>
            <h1 className="text-white text-2xl font-bold">{STORE.name}</h1>
            <p className="text-white/80 text-sm">{STORE.address}</p>
          </div>
        </div>
      </div>

      {/* ABA + ÍCONE NOVA SESSÃO */}
      <div className="px-4 py-3 flex items-center gap-3 overflow-x-auto border-b bg-white sticky top-0 z-30">
        {cats.map((c) => (
          <button
            key={c.id}
            onClick={() => setTab(c.id)}
            className={`px-4 py-2 rounded-full border whitespace-nowrap ${
              tab === c.id ? "bg-black text-white" : "bg-white"
            }`}
          >
            {c.label}
          </button>
        ))}

        {/* BOTÃO + PARA CRIAR SESSÃO */}
        {isAdmin && (
          <button
            className="ml-2 px-4 py-2 rounded-full border text-xl"
            onClick={() => {
              const name = prompt("Nome da nova sessão:");
              if (!name) return;
              const id = slugify(name);
              const newCats = [...cats, { id, label: name }];
              setCategories(JSON.stringify(newCats));
              if (!tab) setTab(id);
            }}
          >
            +
          </button>
        )}
      </div>

      {/* LISTA DE ITENS */}
      <div className="px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* BOTÃO + PARA CRIAR ITEM */}
        {isAdmin && (
          <button
            className="w-full py-6 border rounded-2xl text-4xl text-neutral-500"
            onClick={() => {
              const name = prompt("Nome do item:");
              if (!name) return;
              const desc = prompt("Descrição:") || "";
              const price = parseFloat(prompt("Preço:") || 0);
              const img = prompt("URL da imagem:") || "";
              const newItem = {
                id: `id_${Math.random().toString(36).slice(2, 8)}`,
                category: tab,
                name,
                desc,
                price,
                img,
                available: true,
              };
              setMenu([...menu, newItem]);
            }}
          >
            +
          </button>
        )}

        {filtered.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            isAdmin={isAdmin}
            update={(d) =>
              setMenu(menu.map((x) => (x.id === d.id ? d : x)))
            }
            remove={(id) => setMenu(menu.filter((x) => x.id !== id))}
          />
        ))}
      </div>
    </div>
  );
}

// =================== ITEM CARD ===================
function ItemCard({ item, isAdmin, update, remove }) {
  const [edit, setEdit] = useState(false);

  return (
    <div className="border rounded-2xl bg-white overflow-hidden shadow-sm flex flex-col">
      <img src={item.img} className="h-36 w-full object-cover" />
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold">{item.name}</h3>
        <p className="text-sm text-neutral-500 line-clamp-2">{item.desc}</p>
        <span className="mt-2 font-semibold">{currency(item.price)}</span>

        {isAdmin && (
          <div className="flex gap-2 mt-4">
            <button className="px-3 py-1 border rounded" onClick={() => setEdit(true)}>
              Editar
            </button>
            <button
              className="px-3 py-1 border rounded"
              onClick={() => remove(item.id)}
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {edit && (
        <EditModal
          item={item}
          onClose={() => setEdit(false)}
          onSave={(d) => {
            update(d);
            setEdit(false);
          }}
        />
      )}
    </div>
  );
}

// =================== MODAL DE EDIÇÃO ===================
function EditModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-3">
        <h2 className="text-lg font-bold">Editar item</h2>
        <label>
          Nome
          <input className="w-full border rounded p-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>
          Preço
          <input type="number" className="w-full border rounded p-2" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })} />
        </label>
        <label>
          Descrição
          <textarea className="w-full border rounded p-2" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
        </label>
        <label>
