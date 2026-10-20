import Link from "next/link";
import { site } from "@/config/site";
import { Scallop } from "./Scallop";
import { MainNav } from "./MainNav";
import { BagButton } from "./BagButton";

export function SiteHeader() {
  return (
    <header className="on-dark relative z-10 text-milk">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="stitched bg-strawberry">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-10 gap-y-1 px-4 pt-4 pb-2 sm:px-6 sm:py-5">
          <Link
            href="/"
            className="font-display text-[2.1rem] leading-none font-bold tracking-tight"
          >
            {site.name.toLowerCase()}
          </Link>
          <BagButton className="ml-auto sm:order-last" />
          <MainNav className="w-full sm:w-auto" />
        </div>
      </div>
      <Scallop id="header-edge" className="-mt-px text-strawberry" />
    </header>
  );
}
