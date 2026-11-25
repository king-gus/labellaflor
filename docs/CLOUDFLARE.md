# Deploy na Cloudflare (conta da cliente)

A loja roda em **Cloudflare Workers** via `@opennextjs/cloudflare` (OpenNext).

## O que a cliente precisa

1. Conta Cloudflare (Workers habilitado)
2. Login no Wrangler (ou Workers Builds conectado ao GitHub)
3. Bucket **R2** chamado `labellaflor-products` (fotos dos produtos)
4. As mesmas variáveis de ambiente da loja (ver abaixo)

### Criar o bucket R2

No painel Cloudflare → **R2** → Create bucket → nome: `labellaflor-products`  
(O binding já está em `wrangler.jsonc` como `PRODUCT_IMAGES`.)

As imagens **não** vão para o Neon: o arquivo fica no R2; no Neon só as URLs (`/api/media/...`).

## Deploy pela linha de comando

```bash
npx wrangler login
npm run deploy
```

Isso faz build OpenNext + `wrangler deploy` do worker `labellaflor`.

## Variáveis / Secrets no Cloudflare

No dashboard: **Workers & Pages → labellaflor → Settings → Variables and Secrets**  
Ou via CLI:

```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put ADMIN_EMAIL
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_SECRET
npx wrangler secret put MERCADOPAGO_ACCESS_TOKEN
npx wrangler secret put SUPERFRETE_TOKEN
```

### Lista completa (texto plano ou secret)

| Nome | Secret? | Exemplo |
|------|---------|---------|
| `NEXT_PUBLIC_SITE_URL` | não (plain) | `https://labellaflor.<subdomain>.workers.dev` ou domínio custom |
| `DATABASE_URL` | sim | Neon pooled |
| `ADMIN_EMAIL` | sim | `nathaliasacheti@hotmail.com` (dona / conta Cloudflare) |
| `ADMIN_PASSWORD` | sim | senha |
| `ADMIN_SECRET` | sim | frase longa |
| `MERCADOPAGO_ACCESS_TOKEN` | sim | token MP |
| `MERCADOPAGO_SANDBOX` | não | `false` |
| `SUPERFRETE_TOKEN` | sim | token SuperFrete |
| `SUPERFRETE_ORIGIN_CEP` | não | CEP 8 dígitos |
| `SUPERFRETE_SANDBOX` | não | `false` |
| `SUPERFRETE_SERVICES` | não | `1,2,17` |
| `SUPERFRETE_USER_AGENT` | não | `LaBellaFlor/1.0 (nathaliasacheti@hotmail.com)` |

## Domínio da cliente

Workers → **labellaflor** → **Custom Domains** → adicionar o domínio que já está na Cloudflare dela.

Atualize `NEXT_PUBLIC_SITE_URL` para esse domínio (necessário para retorno do Mercado Pago).

## Preview local (runtime Workers)

```bash
npm run preview
```

## GitHub (opcional)

Em Cloudflare → Workers → **Settings → Builds**: conectar o repo `king-gus/labellaflor`, branch `master`, comando de deploy `npm run deploy` (ou o build command do OpenNext conforme o painel).

## Nota sobre Vercel

O projeto ainda pode subir na Vercel se quiser, mas o caminho oficial desta loja passa a ser **Cloudflare Workers**.
