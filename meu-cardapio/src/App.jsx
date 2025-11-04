import React, { useEffect, useMemo, useState } from "react";

/** =================== CONFIG =================== **/
const ACCESS_KEY = "umami";   // público: ?access=umami
const ADMIN_KEY  = "admin";   // admin:   ?access=umami&admin=admin

// localStorage isolado por chave
const LS = {
  cats: (ak) => `cats_v3_${ak}`,
  menu: (ak) => `menu_v3_${ak}`,
};

const STORE = {
  name: "Umami Fit • Gourmet",
  address: "Av. Exemplo, 1234",
  city: "Sua Cidade",
  opensAt: "10:00",
  closesAt: "22:00",
  banner: "/banner.jpg",         // /public/banner.jpg
  logo: "/umami-logo.png",       // /public/umami-logo.png
};

/** =================== BASE =================== **/
const DEFAULT_CATEGORIES = [
  { id: "marmitas",  label: "Marmitas" },
  { id: "bolos",     label: "Bolos de pote" },
  { id: "trufas",    label: "Trufas" },
  { id: "panquecas", label: "Panquecas" },
  { id: "lasanhas",  label: "Lasanhas" },
  { id: "combos",    label: "Combos promocionais" },
];

const DEFAULT_MENU = [
  { id:"m1", category:"marmitas", name:"Marmita Fit (350g)", desc:"Arroz integral, frango grelhado, legumes no vapor.", price:22.9, img:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1974&auto=format&fit=crop", available:true },
  { id:"m2", category:"marmitas", name:"Marmita Tradicional (500g)", desc:"Arroz, feijão, bife acebolado e salada.", price:24.9, img:"https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1974&auto=format&fit=crop", available:true },
  { id:"b1", category:"bolos", name:"Bolo de pote Ninho com morango", desc:"Creme de ninho com camadas de morango.", price:11.9, img:"https://images.unsplash.com/photo-1607920591413-6b7224c162b2?q=80&w=1974&auto=format&fit=crop", available:true },
  { id:"t1", category:"trufas", name:"Trufa tradicional", desc:"Chocolate ao leite recheado.", price:4.5, img:"https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1936&auto=format&fit=crop", available:true },
  { id:"p1", category:"panquecas", name:"Panqueca de carne", desc:"Molho de tomate artesanal e queijo gratinado.", price:19.9, img:"https://images.unsplash.com/photo-1528731708534-816fe59f90cb?q=80&w=1974&auto=format&fit=crop", available:true },
  { id:"l1", category:"lasanhas", name:"Lasanha à bolonhesa", desc:"Massa fresca, molho bolonhesa e queijo mussarela.", price:34.9, img:"https://images.unsplash.com/photo-1625944527181-4b2f35a1819d?q=80&w=1974&auto=format&fit=crop", available:true },
  { id:"c1", category:"combos", name:"Combo da Semana", desc:"2 marmitas + 2 bolos de pote.", price:69.9, img:"https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1974&auto=format&fit=crop", available:true },
];

/** =================== HELPERS =================== **/
const currency = (n) => n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const getParam  = (k) => { try { return new URL(window.location.href).searchParams.get(k);} catch { return null; } };
const slugify   = (t) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");

function safeLoad(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    if(!raw) return fallback;
    const val = JSON.parse(raw);
    if(Array.isArray(fallback) && !Array.isArray(val)) return fallback;
    return val ?? fallback;
  }catch{ return fallback; }
}
function safeSave(key, value){
  try{ localStorage.setItem(key, JSON.stringify(value)); }catch{}
}

/** =================== APP =================== **/
export default function App(){
  const hasAccess = getParam("access") === ACCESS_KEY;
  const isAdmin   = hasAccess && getParam("admin") === ADMIN_KEY;

  const [categories, setCategories] = useState(()=> safeLoad(LS.cats(ACCESS_KEY), DEFAULT_CATEGORIES));
  const [menu,        setMenu]      = useState(()=> safeLoad(LS.menu(ACCESS_KEY), DEFAULT_MENU));
  const [tab,         setTab]       = useState(()=> "principal"); // começa na Principal
  const [query,       setQuery]     = useState("");
  const [cart,        setCart]      = useState([]);

  // popups
  const [showNewCat,  setShowNewCat]  = useState(false);
  const [showNewItem, setShowNewItem] = useState(false);
  const [newItemCat,  setNewItemCat]  = useState(""); // para criar item a partir da Principal

  // prioridade quando o usuário clica manualmente
  const [manualTabPriority, setManualTabPriority] = useState(false);

  // abas incluindo a "Principal"
  const tabs = useMemo(() => [{ id:"principal", label:"Principal" }, ...categories], [categories]);

  useEffect(()=> safeSave(LS.cats(ACCESS_KEY), categories), [categories]);
  useEffect(()=> safeSave(LS.menu(ACCESS_KEY), menu), [menu]);

  if(!hasAccess){
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-2">Acesso restrito</h1>
          <p className="text-neutral-600 mb-6">Este cardápio é privado. Solicite o <b>link de acesso</b> ao estabelecimento.</p>
          <p className="text-sm text-neutral-500">Dica (dev): use <code>?access={ACCESS_KEY}</code> no URL. Admin usa link separado.</p>
        </div>
      </div>
    );
  }

  // auto-seleção de sessão na busca (se o usuário não clicou manualmente)
  useEffect(()=>{
    const q = query.trim().toLowerCase();
    if(!q){
      setManualTabPriority(false);
      return;
    }
    if(manualTabPriority) return;

    const firstMatch = menu.find(i=>{
      if(!i.available) return false;
      const catLabel = categories.find(c=>c.id===i.category)?.label?.toLowerCase() || "";
      return (i.name||"").toLowerCase().includes(q) || (i.desc||"").toLowerCase().includes(q) || catLabel.includes(q);
    });
    if(firstMatch && firstMatch.category !== tab){
      setTab(firstMatch.category);
    }
  },[query, manualTabPriority, menu, categories, tab]);

  // filtro da lista principal (quando há busca mostra resultados globais)
  const filtered = useMemo(()=>{
    const avail = menu.filter(i=>i.available);
    const q = query.trim().toLowerCase();

    if(q){
      return avail.filter(i=>{
        const catLabel = categories.find(c=>c.id===i.category)?.label?.toLowerCase() || "";
        return (i.name||"").toLowerCase().includes(q) || (i.desc||"").toLowerCase().includes(q) || catLabel.includes(q);
      });
    }

    if(tab === "principal") return avail;
    return avail.filter(i=>i.category===tab);
  },[menu, categories, tab, query]);

  const subtotal  = cart.reduce((s,it)=> s + it.price*it.qty, 0);
  const upsertItem= (item)=> setMenu(prev=> prev.some(p=>p.id===item.id)? prev.map(p=>p.id===item.id?item:p) : [...prev, item]);
  const removeItem= (id)=> setMenu(prev=> prev.filter(p=>p.id!==id));

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Banner estático com fallback */}
      <div className="relative h-72 overflow-hidden">
        <img
          src={STORE.banner}
          alt="banner"
          className="w-full h-full object-cover"
          onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src="data:image/svg+xml;utf8,\
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 400'><defs><linearGradient id='g' x1='0' x2='1'><stop offset='0' stop-color='%23ffe08a'/><stop offset='1' stop-color='%23ffb347'/></linearGradient></defs><rect width='1200' height='400' fill='url(%23g)'/></svg>"; }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-4 pb-6">
            <div className="flex items-center gap-4">
              {/* LOGO MAIOR E NÍTIDA */}
              <img
                src={STORE.logo}
                alt="logo"
                className="w-32 h-32 rounded-full ring-8 ring-white object-cover bg-white shadow-md"
              />
              <div>
                <h1 className="text-white text-3xl font-bold">{STORE.name}</h1>
                <p className="text-white/90 text-sm">{STORE.address} • {STORE.city}</p>
                <p className="text-white/80 text-xs">Hoje: {STORE.opensAt} – {STORE.closesAt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top bar: busca + tabs + (+) nova sessão se admin */}
      <div className="sticky top-0 z-30 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <input
            placeholder="Buscar no cardápio"
            className="flex-1 rounded-full border px-4 py-2 focus:outline-none"
            value={query}
            onChange={(e)=> setQuery(e.target.value)}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-3 overflow-x-auto">
          <div className="flex items-center gap-4">
            {tabs.map(c=>(
              <button
                key={c.id}
                onClick={()=>{
                  if(query.trim()) setQuery("");           // limpar busca ao selecionar manualmente
                  setManualTabPriority(true);              // dar prioridade à seleção manual
                  setTab(c.id);
                }}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border ${tab===c.id ? "bg-black text-white" : "bg-white"}`}
              >
                {c.label}
              </button>
            ))}
            {isAdmin && (
              <button
                className="ml-auto w-10 h-10 flex items-center justify-center rounded-full bg-orange-500 text-white shadow hover:bg-orange-600"
                title="Criar nova sessão"
                onClick={()=> setShowNewCat(true)}
              >+</button>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {query.trim()
            ? <SearchTitle query={query} count={filtered.length}/>
            : <SectionTitle id={tab} categories={tabs}/>
          }

          {/* Botão + para criar item (não aparece na Principal) */}
          {!query.trim() && isAdmin && tab!=="principal" && (
            <button
              className="mb-4 w-10 h-10 flex items-center justify-center rounded-full bg-orange-500 text-white shadow hover:bg-orange-600"
              title="Adicionar item nesta sessão"
              onClick={()=> { setNewItemCat(tab); setShowNewItem(true); }}
            >+</button>
          )}

          {/* Render principal como subseções */}
          {tab === "principal" && !query.trim() ? (
            <div className="space-y-8">
              {categories.map(cat=>{
                const items = menu.filter(i=>i.available && i.category===cat.id);
                if(items.length===0) return null;
                return (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold">{cat.label}</h3>
                      {isAdmin && (
                        <button
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-500 text-white shadow hover:bg-orange-600"
                          title={`Adicionar item em ${cat.label}`}
                          onClick={()=>{ setNewItemCat(cat.id); setShowNewItem(true); }}
                        >+</button>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {items.map(item=>(
                        <CardItem
                          key={item.id}
                          item={item}
                          onAdd={(it)=> setCart(prev=>{
                            const f = prev.find(p=>p.id===it.id);
                            return f ? prev.map(p=>p.id===it.id?{...p,qty:p.qty+1}:p) : [...prev, {...it, qty:1}];
                          })}
                          isAdmin={isAdmin}
                          onEdit={upsertItem}
                          onDelete={removeItem}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(item=>(
                <CardItem
                  key={item.id}
                  item={item}
                  onAdd={(it)=> setCart(prev=>{
                    const f = prev.find(p=>p.id===it.id);
                    return f ? prev.map(p=>p.id===it.id?{...p,qty:p.qty+1}:p) : [...prev, {...it, qty:1}];
                  })}
                  isAdmin={isAdmin}
                  onEdit={upsertItem}
                  onDelete={removeItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sacola + Modais */}
        <aside className="bg-white rounded-2xl shadow-sm p-4 h-max sticky top-28">
          <h3 className="font-semibold text-lg mb-3">Sua sacola</h3>

          {showNewCat && (
            <NewCategoryModal
              categories={categories}
              setCategories={setCategories}
              onClose={()=> setShowNewCat(false)}
              setTab={setTab}
            />
          )}
          {showNewItem && (
            <NewItemModal
              currentCategory={newItemCat || tab}
              categories={categories}
              onClose={()=> setShowNewItem(false)}
              onSave={(data)=>{ upsertItem(data); setShowNewItem(false); }}
            />
          )}

          {cart.length===0 ? (
            <div className="text-center text-neutral-500 py-10">Sacola vazia</div>
          ) : (
            <div className="space-y-3">
              {cart.map(it=>(
                <div key={it.id} className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-sm">{it.name}</div>
                    <div className="text-xs text-neutral-500">{currency(it.price)} x {it.qty}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-2 py-1 border rounded-full"
                      onClick={()=> setCart(prev=> prev.map(p=>p.id===it.id?{...p,qty:Math.max(0,p.qty-1)}:p).filter(p=>p.qty>0))}>−</button>
                    <button className="px-2 py-1 border rounded-full"
                      onClick={()=> setCart(prev=> prev.map(p=>p.id===it.id?{...p,qty:p.qty+1}:p))}>+</button>
                  </div>
                </div>
              ))}
              <div className="border-t pt-3 flex items-center justify-between font-semibold">
                <span>Subtotal</span><span>{currency(subtotal)}</span>
              </div>
              <button className="w-full py-3 rounded-xl bg-black text-white font-semibold">Finalizar pedido (simulado)</button>
            </div>
          )}
        </aside>
      </div>

      <footer className="border-t py-6 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} {STORE.name}. Todos os direitos reservados.
      </footer>
    </div>
  );
}

/** =================== Subcomponentes =================== **/
function SectionTitle({ id, categories }){
  const cat = categories.find(c=>c.id===id);
  return (
    <div className="mb-2">
      <h2 className="text-2xl font-bold">{cat?.label}</h2>
      <p className="text-sm text-neutral-500">
        {id==="principal" ? "Itens organizados por sessão" : "Escolha suas opções favoritas"}
      </p>
    </div>
  );
}
function SearchTitle({ query, count }){
  return (
    <div className="mb-2">
      <h2 className="text-2xl font-bold">Resultados para “{query}”</h2>
      <p className="text-sm text-neutral-500">{count} item(ns) encontrados</p>
    </div>
  );
}

function CardItem({ item, onAdd, isAdmin, onEdit, onDelete }){
  const [editing, setEditing] = useState(false);
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border flex flex-col">
      <div className="h-36 w-full overflow-hidden">
        <img src={item.img} alt={item.name} className="w-full h-full object-cover"/>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-semibold leading-tight">{item.name}</h4>
            <span className="text-sm font-semibold">{currency(item.price)}</span>
          </div>
          <p className="text-sm text-neutral-600 mt-1 line-clamp-3">{item.desc}</p>
          {!item.available && <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-neutral-100">Indisponível</span>}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button className="flex-1 py-2 rounded-xl border font-medium disabled:opacity-50" disabled={!item.available} onClick={()=>onAdd(item)}>Adicionar</button>
          {isAdmin && (
            <>
              <button className="px-3 py-2 rounded-xl border" onClick={()=>setEditing(true)}>Editar</button>
              <button className="px-3 py-2 rounded-xl border" onClick={()=>onDelete(item.id)} title="Remover">🗑️</button>
            </>
          )}
        </div>
      </div>
      {editing && (
        <EditModal
          item={item}
          onClose={()=>setEditing(false)}
          onSave={(data)=>{ onEdit(data); setEditing(false); }}
        />
      )}
    </div>
  );
}

function EditModal({ item, onClose, onSave }){
  const [form,setForm] = useState(item);
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-3">
        <h3 className="text-lg font-semibold">Editar item</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm"><span className="text-neutral-500">Nome</span>
            <input className="w-full border rounded-xl px-3 py-2" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
          </label>
          <label className="text-sm"><span className="text-neutral-500">Preço</span>
            <input type="number" step="0.01" className="w-full border rounded-xl px-3 py-2" value={form.price} onChange={e=>setForm({...form,price:parseFloat(e.target.value||0)})}/>
          </label>
          <label className="text-sm col-span-2"><span className="text-neutral-500">Descrição</span>
            <textarea className="w-full border rounded-xl px-3 py-2" value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})}/>
          </label>
          <label className="text-sm col-span-2"><span className="text-neutral-500">URL da imagem</span>
            <input className="w-full border rounded-xl px-3 py-2" value={form.img} onChange={e=>setForm({...form,img:e.target.value})}/>
          </label>
          <label className="text-sm"><span className="text-neutral-500">Categoria</span>
            <input className="w-full border rounded-xl px-3 py-2" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/>
          </label>
          <label className="text-sm flex items-end gap-2">
            <input type="checkbox" checked={form.available} onChange={e=>setForm({...form,available:e.target.checked})}/>
            Disponível
          </label>
        </div>
        <div className="pt-2 flex items-center justify-end gap-2">
          <button className="px-4 py-2 rounded-xl border" onClick={onClose}>Cancelar</button>
          <button className="px-4 py-2 rounded-xl bg-black text-white" onClick={()=>onSave(form)}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

/** =================== Modais de criação =================== **/
function NewCategoryModal({ categories, setCategories, onClose, setTab }){
  const [label, setLabel] = useState("");
  const [id, setId] = useState("");
  useEffect(()=> setId(slugify(label)), [label]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-3">
        <h3 className="text-lg font-semibold">Criar nova sessão</h3>
        <label className="text-sm"><span className="text-neutral-500">Nome da sessão</span>
          <input className="w-full border rounded-xl px-3 py-2" value={label} onChange={e=>setLabel(e.target.value)} placeholder="Ex.: Sobremesas"/>
        </label>
        <label className="text-sm"><span className="text-neutral-500">ID (slug)</span>
          <input className="w-full border rounded-xl px-3 py-2" value={id} onChange={e=>setId(slugify(e.target.value))} placeholder="ex.: sobremesas"/>
        </label>
        <div className="pt-2 flex items-center justify-end gap-2">
          <button className="px-4 py-2 rounded-xl border" onClick={onClose}>Cancelar</button>
          <button className="px-4 py-2 rounded-xl bg-black text-white" onClick={()=>{
            if(!label||!id) return alert("Preencha nome e id.");
            if(categories.some(c=>c.id===id)) return alert("Já existe uma sessão com esse ID.");
            const next = [...categories, { id, label }];
            setCategories(next);
            setTab(id);
            onClose();
          }}>Criar</button>
        </div>
      </div>
    </div>
  );
}

function NewItemModal({ currentCategory, categories, onClose, onSave }){
  const [form, setForm] = useState({
    id: `id_${Math.random().toString(36).slice(2,8)}`,
    category: currentCategory,
    name: "", desc: "", price: 0, img: "", available: true,
  });
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-3">
        <h3 className="text-lg font-semibold">Novo item ({categories.find(c=>c.id===currentCategory)?.label})</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm"><span className="text-neutral-500">Nome</span>
            <input className="w-full border rounded-xl px-3 py-2" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
          </label>
          <label className="text-sm"><span className="text-neutral-500">Preço</span>
            <input type="number" step="0.01" className="w-full border rounded-xl px-3 py-2" value={form.price} onChange={e=>setForm({...form,price:parseFloat(e.target.value||0)})}/>
          </label>
          <label className="text-sm col-span-2"><span className="text-neutral-500">Descrição</span>
            <textarea className="w-full border rounded-xl px-3 py-2" value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})}/>
          </label>
          <label className="text-sm col-span-2"><span className="text-neutral-500">URL da imagem</span>
            <input className="w-full border rounded-xl px-3 py-2" value={form.img} onChange={e=>setForm({...form,img:e.target.value})}/>
          </label>
          <label className="text-sm flex items-end gap-2">
            <input type="checkbox" checked={form.available} onChange={e=>setForm({...form,available:e.target.checked})}/>
            Disponível
          </label>
        </div>
        <div className="pt-2 flex items-center justify-end gap-2">
          <button className="px-4 py-2 rounded-xl border" onClick={onClose}>Cancelar</button>
          <button className="px-4 py-2 rounded-xl bg-black text-white" onClick={()=> onSave(form)}>Adicionar</button>
        </div>
      </div>
    </div>
  );
}
