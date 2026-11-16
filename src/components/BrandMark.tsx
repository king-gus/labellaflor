import { SITE } from "@/lib/site";

/** Wordmark matching the logo: serif title + spaced BOUTIQUE */
export function BrandMark({
  tone = "dark",
  size = "md",
}: {
  tone?: "dark" | "light";
  size?: "sm" | "md" | "lg";
}) {
  const color = tone === "light" ? "text-white" : "text-accent";
  const title =
    size === "lg"
      ? "text-[1.65rem] md:text-[2rem]"
      : size === "sm"
        ? "text-[1.05rem]"
        : "text-[1.25rem] md:text-[1.35rem]";
  const sub =
    size === "lg"
      ? "text-[0.65rem] tracking-[0.42em]"
      : "text-[0.55rem] tracking-[0.38em]";

  return (
    <span className={`inline-flex flex-col items-center leading-none ${color}`}>
      <span className={`font-display ${title} tracking-[0.04em]`}>
        {SITE.shortName.toUpperCase()}
      </span>
      <span className={`mt-1 font-[family-name:var(--font-text)] font-medium uppercase ${sub}`}>
        Boutique
      </span>
    </span>
  );
}
