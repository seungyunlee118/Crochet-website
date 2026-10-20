import type { Metadata } from "next";
import { site } from "@/config/site";
import { packDays, shippingLine } from "@/lib/money";

export const metadata: Metadata = { title: "Shipping, returns and care" };

export default function HelpPage() {
  const { shipping, policies } = site;
  const sections = [
    {
      id: "shipping",
      title: "Shipping",
      body: [
        `We ship to addresses in the United States. ${shippingLine}.`,
        `Orders are packed within ${packDays} business days and usually arrive ${shipping.transitMin}–${shipping.transitMax} business days after that.`,
      ],
    },
    { id: "returns", title: "Returns", body: [policies.returns] },
    { id: "care", title: "Caring for your piece", body: [policies.care] },
    { id: "safety", title: "Safety", body: [policies.safety] },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6 sm:pt-12">
      <h1 className="text-[clamp(2.4rem,6vw,3.5rem)] font-bold">Shipping, returns and care</h1>
      <div className="mt-10 space-y-12">
        {sections.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-6">
            <h2 id={`${s.id}-title`} className="text-[1.75rem] font-bold">
              {s.title}
            </h2>
            <div className="mt-3 max-w-[62ch] space-y-3 text-lg">
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>
        ))}
        <section id="contact" aria-labelledby="contact-title" className="scroll-mt-6">
          <h2 id="contact-title" className="text-[1.75rem] font-bold">
            Questions?
          </h2>
          <p className="mt-3 text-lg">
            Email{" "}
            <a href={`mailto:${site.email}`} className="font-semibold underline decoration-2 underline-offset-4 hover:text-strawberry">
              {site.email}
            </a>{" "}
            about an order, a custom color or anything else.
          </p>
        </section>
      </div>
    </div>
  );
}
