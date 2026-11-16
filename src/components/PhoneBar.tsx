import { SITE, whatsappUrl } from "@/lib/site";

export function PhoneBar() {
  return (
    <div className="phone-bar">
      <a href={whatsappUrl()} className="btn w-full">
        {SITE.cta}
      </a>
    </div>
  );
}
