# La Bella Flor Boutique

Site e vitrine online da **La Bella Flor Boutique** (Caraguatatuba) — chic · casual · moderna.

Pedidos via WhatsApp: [wa.me/5511982972080](https://wa.me/5511982972080)

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js (App Router) + OpenNext Cloudflare Workers
- TypeScript + Tailwind CSS
- Neon Postgres (São Paulo) + admin em `/admin`
- Frete: SuperFrete · Pagamento: Stone / Pagar.me (Payment Links)
- Tipografia: EB Garamond + Jost · Cor da marca: `#006078`

## Pagamento (Stone)

Passo a passo das credenciais: [docs/STONE.md](./docs/STONE.md).

Secret no Worker: `PAGARME_SECRET_KEY` (`sk_test_...` ou `sk_...`).

## Deploy

Ver [docs/CLOUDFLARE.md](./docs/CLOUDFLARE.md). Preview local Workers: `npm run preview`.
