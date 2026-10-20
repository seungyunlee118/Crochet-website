"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop/plushies", label: "Plushies" },
  { href: "/shop/accessories", label: "Accessories" },
  { href: "/help", label: "Help" },
];

export function MainNav({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className={className}>
      <ul className="-mx-2 flex flex-wrap">
        {links.map(({ href, label }) => {
          const current = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-full px-2 font-semibold underline-offset-[6px] decoration-2 hover:underline ${
                  current ? "underline" : ""
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
