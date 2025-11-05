// src/helpers/config.js

export const STORE = {
  name: "Umami Fit - Gourmet",
  address: "Santa Mônica",
  city: "Uberlândia",

  opensAt: "08:00",
  closesAt: "18:00",

  banner: "/banner_1584x396.jpg",
  logo: "/umami-logo.png",

  pixChave: "+5534998970471",
  pixTitulo: "Umami Fit - Pagamento",
};

export const DEFAULT_CATEGORIES = [
  { id: "marmitas", label: "Marmitas" },
  { id: "bolos", label: "Bolos de pote" },
  { id: "trufas", label: "Trufas" },
  { id: "panquecas", label: "Panquecas" },
  { id: "lasanhas", label: "Lasanhas" },
  { id: "combos", label: "Combos promocionais" },
];

export const DEFAULT_MENU = [
  {
    id: "m1",
    category: "marmitas",
    name: "Marmita Fit (350g)",
    desc: "Arroz integral, frango grelhado, legumes no vapor.",
    price: 22.9,
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1974&auto=format&fit=crop",
    available: true,
  },
];

export const LS = {
  cats:   (ak) => `cats_v7_${ak}`,
  menu:   (ak) => `menu_v7_${ak}`,
  orders: (ak) => `orders_v1_${ak}`,
};
