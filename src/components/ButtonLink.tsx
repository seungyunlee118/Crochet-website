import Link from "next/link";

export const buttonClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-strawberry px-7 py-3 text-[1.0625rem] font-semibold text-white transition-colors hover:bg-strawberry-deep active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-strawberry";

export function ButtonLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={buttonClass}>
      {children}
    </Link>
  );
}
