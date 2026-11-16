"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SiteNav } from "@/components/SiteNav";
import { CloseFooter } from "@/components/CloseFooter";
import { SITE, whatsappUrl } from "@/lib/site";

function SuccessBody() {
  const params = useSearchParams();
  const order = params.get("order") || params.get("external_reference");
  const status = params.get("status") || params.get("collection_status");
  const mode = params.get("mode");

  const pending = status === "pending";
  const manual = mode === "manual";

  return (
    <div className="wrap max-w-xl py-20">
      <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-accent">
        {pending ? "Pagamento em análise" : "Pedido recebido"}
      </p>
      <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] leading-tight">
        {pending
          ? "Estamos confirmando seu pagamento"
          : "Obrigada pela compra"}
      </h1>
      <p className="mt-4 text-muted">
        {manual
          ? "Seu pedido foi registrado. Em breve o pagamento online (Mercado Pago) estará ativo nesta loja — por enquanto a equipe confirma o pedido por e-mail."
          : pending
            ? "Assim que o Pix ou boleto for compensado, seguimos com o envio."
            : "Recebemos seu pedido. Você ganha um e-mail com os detalhes e o código de rastreio quando o pacote sair."}
      </p>
      {order && (
        <p className="mt-6 text-sm">
          Código do pedido:{" "}
          <span className="font-medium tracking-wide">{order}</span>
        </p>
      )}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn">
          Voltar à loja
        </Link>
        <a
          href={whatsappUrl(
            order
              ? `Olá! Fiz o pedido ${order} no site e preciso de ajuda.`
              : "Olá! Preciso de ajuda com um pedido do site.",
          )}
          className="btn btn--ghost"
        >
          {SITE.supportCta}
        </a>
      </div>
    </div>
  );
}

export default function PedidoSucessoPage() {
  return (
    <>
      <SiteNav />
      <main>
        <Suspense
          fallback={
            <div className="wrap py-20 font-display text-2xl">Carregando…</div>
          }
        >
          <SuccessBody />
        </Suspense>
      </main>
      <CloseFooter />
    </>
  );
}
