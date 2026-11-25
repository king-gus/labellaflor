# Deploy na Cloudflare (conta da cliente)

A loja roda em **Cloudflare Workers** via `@opennextjs/cloudflare` (OpenNext).

## O que a cliente precisa

1. Conta Cloudflare (`nathaliasacheti@hotmail.com`) com **e-mail verificado**
2. Abrir [Workers onboarding](https://dash.cloudflare.com/413dcccffa252cb46d832d037bfd165d/workers/onboarding) (subdomínio `labellaflor.workers.dev` já registrado)
3. Habilitar **R2** no dashboard e criar o bucket `labellaflor-products`
4. Login no Wrangler (ou Workers Builds conectado ao GitHub)
5. As mesmas variáveis de ambiente da loja (ver abaixo)

### Bloqueios comuns na conta nova

- Sem verificar o e-mail: deploy Workers falha com código `10034`
- Sem habilitar R2 no dashboard: criar bucket falha com código `10042`

### Criar o bucket R2

No painel Cloudflare → **R2** → Create bucket → nome: `labellaflor-products`  
(O binding já está em `wrangler.jsonc` como `PRODUCT_IMAGES`.)

As imagens **não** vão para o Neon: o arquivo fica no R2; no Neon só as URLs (`/api/media/...`).

## Região (América do Sul)

- **Neon:** `aws-sa-east-1` (São Paulo)
- **Worker:** `placement.region = aws:sa-east-1` no `wrangler.jsonc` (roda no data center Cloudflare mais próximo de São Paulo)

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
npx wrangler secret put PAGARME_SECRET_KEY
npx wrangler secret put SUPERFRETE_TOKEN
```

Passo a passo das chaves Stone: [STONE.md](./STONE.md).

### Lista completa (texto plano ou secret)

| Nome | Secret? | Exemplo |
|------|---------|---------|
| `NEXT_PUBLIC_SITE_URL` | não (plain) | `https://labellaflor.<subdomain>.workers.dev` ou domínio custom |
| `DATABASE_URL` | sim | Neon pooled |
| `ADMIN_EMAIL` | sim | `nathaliasacheti@hotmail.com` (dona / conta Cloudflare) |
| `ADMIN_PASSWORD` | sim | senha |
| `ADMIN_SECRET` | sim | frase longa |
| `PAGARME_SECRET_KEY` | sim | `sk_test_...` ou `sk_...` (Stone/Pagar.me) |
| `PAGARME_PAYMENT_METHODS` | não | `credit_card,pix,boleto` |
| `SUPERFRETE_TOKEN` | sim | token SuperFrete |
| `SUPERFRETE_ORIGIN_CEP` | não | CEP 8 dígitos |
| `SUPERFRETE_SANDBOX` | não | `false` |
| `SUPERFRETE_SERVICES` | não | `1,2,17` |
| `SUPERFRETE_USER_AGENT` | não | `LaBellaFlor/1.0 (nathaliasacheti@hotmail.com)` |

## Domínio da cliente (`www.labellaflorboutique.com.br`)

O `wrangler.jsonc` já declara Custom Domains para:

- `www.labellaflorboutique.com.br` (principal)
- `labellaflorboutique.com.br` (apex)

### 1. Colocar o domínio na conta Cloudflare da cliente

Hoje a zona **ainda não existe** na conta `nathaliasacheti@hotmail.com`.

1. Dashboard → [Add a site](https://dash.cloudflare.com/413dcccffa252cb46d832d037bfd165d/add-site) → `labellaflorboutique.com.br`
2. Plano Free basta
3. Cloudflare mostra 2 nameservers (ex.: `xxx.ns.cloudflare.com`)
4. No [Registro.br](https://registro.br) → domínio → DNS → trocar nameservers para os da Cloudflare
5. Esperar propagação (minutos a algumas horas) até o status da zona ficar **Active**

### 2. Ligar o domínio ao Worker

Depois do primeiro deploy do Worker `labellaflor`, o Wrangler cria os Custom Domains automaticamente pelas `routes` do `wrangler.jsonc`.

Ou no painel: Workers → **labellaflor** → Settings → Domains & Routes → Add → Custom Domain.

### 3. URL pública da loja

```text
NEXT_PUBLIC_SITE_URL=https://www.labellaflorboutique.com.br
```

(necessário para retorno do pagamento Stone / Pagar.me)

## Preview local (runtime Workers)

```bash
npm run preview
```

## GitHub Actions (push → Cloudflare)

O workflow [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) faz deploy automático em todo push em **`master`** ou **`main`**.

### Secrets no GitHub (`king-gus/labellaflor`)

Repo → **Settings → Secrets and variables → Actions** → New repository secret:

| Secret | Valor |
|--------|--------|
| `CLOUDFLARE_ACCOUNT_ID` | `413dcccffa252cb46d832d037bfd165d` |
| `CLOUDFLARE_API_TOKEN` | Token com template **Edit Cloudflare Workers** (conta da cliente) |

Criar o token: [Account API tokens](https://dash.cloudflare.com/413dcccffa252cb46d832d037bfd165d/api-tokens) → Create Token → **Edit Cloudflare Workers** → restringir à conta `Nathaliasacheti@hotmail.com's Account`.

Depois do primeiro push (ou **Actions → Deploy Cloudflare → Run workflow**), o Worker sobe em:

`https://labellaflor.labellaflor.workers.dev`

Secrets da loja (`ADMIN_*`, `DATABASE_URL`, etc.) continuam no **dashboard do Worker** (o deploy usa `--keep-vars` para não apagá-los).

### Alternativa: Workers Builds

Em Cloudflare → Workers → **Settings → Builds**: conectar o repo `king-gus/labellaflor`, branch `master`, comando `npm run deploy`.

## Nota sobre Vercel

O projeto ainda pode subir na Vercel se quiser, mas o caminho oficial desta loja passa a ser **Cloudflare Workers**.
