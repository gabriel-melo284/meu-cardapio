export const STORE = {
  name: "Umami Fit - Gourmet",
  address: "Santa Mônica",
  city: "Uberlândia",
  opensAt: "08:00",
  closesAt: "18:00",
  banner: "/banner_1584x396.jpg",
  logo: "/umami-logo.png",

  // PIX
  pixChave: "+5534998970471",
  pixTitulo: "Umami Fit - Pagamento",

  // ✅ WhatsApp (somente dígitos com DDI e DDD)
  whatsPhone: "5534998970471",
};

export const DEFAULT_CATEGORIES = [/* ...como já está... */];
export const DEFAULT_MENU = [/* ...como já está... */];

export const LS = {
  cats:   (ak) => `cats_v7_${ak}`,
  menu:   (ak) => `menu_v7_${ak}`,
  orders: (ak) => `orders_v1_${ak}`,
};
