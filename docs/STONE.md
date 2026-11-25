# Credenciais Stone (Pagar.me) — passo a passo

A loja usa a **API Pagar.me v5** (Stone online). O checkout cria um **Payment Link** e redireciona a cliente para pagar com Pix, cartão ou boleto.

Contato da conta da loja: `nathaliasacheti@hotmail.com`

## 1. Entrar no painel Stone / Pagar.me

1. Abra [https://dash.pagar.me](https://dash.pagar.me) (ou o painel Stone que a conta usa).
2. Faça login com o e-mail/senha da conta **Stone** da La Bella Flor.
3. Se ainda não tem conta online, peça ativação de **Pagar.me / Stone Connect** no suporte Stone ou no gerente da conta.

## 2. Ambiente de teste (recomendado primeiro)

1. No painel, escolha o modo **Teste** / **Sandbox** (às vezes um switch “Live / Test”).
2. Vá em **Configurações** → **Chaves de API** (ou **API Keys** / **Credenciais**).
3. Copie a **chave secreta de teste**:
   - começa com `sk_test_...`
4. Guarde em local seguro (senha / gerenciador). **Nunca** cole no chat, no código do site nem no GitHub.

Com `sk_test_...` a loja chama automaticamente a API de sandbox:

`https://sdx-api.pagar.me/core/v5`

## 3. Ambiente de produção (quando for vender de verdade)

1. No painel, mude para **Produção** / **Live**.
2. Em **Chaves de API**, copie a **chave secreta de produção**:
   - começa com `sk_...` (sem `test`)
3. Confirme que a conta está **aprovada** para receber Pix/cartão/boleto (KYC / documentos).

Com `sk_...` de produção a loja chama:

`https://api.pagar.me/core/v5`

## 4. Colocar a chave no Cloudflare (Worker da loja)

No dashboard Cloudflare da cliente → **Workers & Pages** → **labellaflor** → **Settings** → **Variables and Secrets**:

| Nome | Tipo | Valor |
|------|------|--------|
| `PAGARME_SECRET_KEY` | Secret | `sk_test_...` ou `sk_...` |
| `NEXT_PUBLIC_SITE_URL` | Plain text | `https://www.labellaflorboutique.com.br` (ou o workers.dev enquanto o domínio não estiver ativo) |

Opcional:

| Nome | Tipo | Valor |
|------|------|--------|
| `PAGARME_PAYMENT_METHODS` | Plain | `credit_card,pix,boleto` (padrão) |
| `PAGARME_BASE_URL` | Plain | só se quiser forçar URL da API |

Ou pela CLI (já logado no Wrangler da conta da cliente):

```bash
npx wrangler secret put PAGARME_SECRET_KEY
```

Cole a chave quando pedir e Enter. Depois faça um novo deploy (ou aguarde o próximo push em `master`/`main` no GitHub Actions).

## 5. Testar o fluxo

1. No admin (`/admin`), cadastre um produto de teste com preço baixo.
2. No site, adicione ao carrinho → checkout → preencha entrega → escolha frete → **Pagar**.
3. Você deve ser redirecionada para a página de pagamento Stone/Pagar.me.
4. Em **teste**, use os cartões/Pix de sandbox da documentação Pagar.me.
5. Ao concluir, a URL de retorno usa `NEXT_PUBLIC_SITE_URL` + `/pedido/sucesso?order=...`.

Se `PAGARME_SECRET_KEY` **não** estiver configurada, o pedido é salvo em modo **manual** (sem redirecionar para a Stone) — a equipe confirma por e-mail.

## 6. Segurança

- Use **só** a chave **secreta** (`sk_...`) no Worker (servidor). Não use chave pública no front se não for necessário.
- Não commite `.dev.vars` nem a chave no Git.
- Em produção, remova a chave de teste e coloque a de live.
- Se a chave vazar, **revogue** no painel e gere outra.

## Resumo rápido

1. Login em [dash.pagar.me](https://dash.pagar.me)  
2. Chaves de API → copiar `sk_test_...` (teste) ou `sk_...` (produção)  
3. Cloudflare → Worker `labellaflor` → secret `PAGARME_SECRET_KEY`  
4. Confirmar `NEXT_PUBLIC_SITE_URL`  
5. Testar um pedido no site  

Dúvidas da conta Stone: suporte Stone / gerente da conta da cliente (`nathaliasacheti@hotmail.com`).
