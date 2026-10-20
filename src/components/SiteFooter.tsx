import Link from "next/link";
import { site } from "@/config/site";
import { Scallop } from "./Scallop";

export function SiteFooter() {
  return (
    <footer className="on-dark mt-24 text-milk">
      <Scallop id="footer-edge" flip className="-mb-px text-cocoa" />
      <div className="stitched bg-cocoa">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-10 pb-12 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-6">
          <div>
            <p className="font-display text-3xl font-bold">{site.name.toLowerCase()}</p>
            <p className="mt-3 max-w-[34ch] text-milk/80">{site.description}</p>
          </div>
          <nav aria-label="Shop">
            <h2 className="text-lg font-semibold">Shop</h2>
            <ul className="mt-3 space-y-1">
              <FooterLink href="/shop">Shop all</FooterLink>
              <FooterLink href="/shop/plushies">Plushies</FooterLink>
              <FooterLink href="/shop/accessories">Accessories</FooterLink>
            </ul>
          </nav>
          <nav aria-label="Help">
            <h2 className="text-lg font-semibold">Help</h2>
            <ul className="mt-3 space-y-1">
              <FooterLink href="/help#shipping">Shipping</FooterLink>
              <FooterLink href="/help#returns">Returns</FooterLink>
              <FooterLink href="/help#care">Care</FooterLink>
              <li>
                <a href={`mailto:${site.email}`} className="inline-flex min-h-10 items-center text-milk/85 hover:text-milk hover:underline">
                  {site.email}
                </a>
              </li>
              {site.instagram && (
                <li>
                  <a href={site.instagram} className="inline-flex min-h-10 items-center text-milk/85 hover:text-milk hover:underline">
                    Instagram
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </div>
        <p className="mx-auto max-w-6xl border-t border-milk/15 px-4 py-5 text-sm text-milk/75 sm:px-6">
          © {site.name}. Payments are processed securely by Stripe.
        </p>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="inline-flex min-h-10 items-center text-milk/85 hover:text-milk hover:underline">
        {children}
      </Link>
    </li>
  );
}
