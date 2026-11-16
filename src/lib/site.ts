export const SITE = {
  name: "La Bella Flor Boutique",
  shortName: "La Bella Flor",
  tagline: "chic · casual · moderna",
  city: "Caraguatatuba",
  region: "Litoral Norte de São Paulo",
  whatsapp: "5511982972080",
  whatsappDisplay: "WhatsApp",
  instagram: "https://www.instagram.com/labellaflor.boutique",
  handle: "@labellaflor.boutique",
  shipping: "Envios para todo o Brasil",
  cta: "Comprar no WhatsApp",
} as const;

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${SITE.whatsapp}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function productWhatsAppMessage(productName: string, price: string) {
  return `Olá! Vi a ${productName} (${price}) no site da La Bella Flor e quero comprar.`;
}
