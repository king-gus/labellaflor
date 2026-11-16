# Variáveis Neon + Admin (para a dona da loja)

Quando for configurar o banco com a cliente, crie um projeto no [Neon](https://console.neon.tech) e cole estas variáveis na **Vercel → Project → Settings → Environment Variables**.

## Neon (obrigatórias para admin e pedidos)

| Variável | O que é | Onde pegar |
|----------|---------|------------|
| `DATABASE_URL` | Connection string **pooled** (com `-pooler` no host) | Neon → Project → Connect → **Pooled connection** → copiar URI |

Exemplo (formato):

```text
postgresql://USER:PASSWORD@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

### Opcional (só se for rodar migrations fora do app)

| Variável | O que é |
|----------|---------|
| `DATABASE_URL_UNPOOLED` | Connection string **direta** (sem pooler), útil para `psql` / migrations longas |

Para este projeto, **só `DATABASE_URL` (pooled) basta** no app da Vercel.

## Depois de criar o banco

1. No Neon → **SQL Editor**, cole e rode o arquivo `db/schema.sql` do repositório.
2. No admin (`/admin`), entre com a senha e clique em **Importar catálogo atual** (opcional).

## Admin da loja (não é Neon, mas precisa junto)

| Variável | O que é |
|----------|---------|
| `ADMIN_PASSWORD` | Senha para entrar em `/admin` |
| `ADMIN_SECRET` | Segredo para assinar o cookie de sessão (pode ser uma frase longa aleatória). Se vazio, usa `ADMIN_PASSWORD`. |

## Já usadas pela loja (fora do Neon)

| Variável | Uso |
|----------|-----|
| `NEXT_PUBLIC_SITE_URL` | URL pública (ex.: `https://labellaflor.vercel.app`) |
| `MERCADOPAGO_ACCESS_TOKEN` | Pagamento |
| `MERCADOPAGO_SANDBOX` | `true` / `false` |
| `SUPERFRETE_TOKEN` | Cotação de frete |
| `SUPERFRETE_ORIGIN_CEP` | CEP de origem |
| `SUPERFRETE_SANDBOX` | `true` / `false` |
| `SUPERFRETE_SERVICES` | Ex.: `1,2,17` |
| `SUPERFRETE_USER_AGENT` | Ex.: `LaBellaFlor/1.0 (email@...)` |

## Resumo mínimo para a cliente (Neon + admin)

```text
DATABASE_URL=postgresql://...-pooler.../neondb?sslmode=require
ADMIN_PASSWORD=********
ADMIN_SECRET=********
```
