import { ButtonLink } from "@/components/ButtonLink";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-12 sm:px-6 sm:pt-16">
      <h1 className="text-[clamp(2.4rem,6vw,3.5rem)] font-bold">This page wandered off</h1>
      <p className="mt-3 text-lg">The link might be old, or the piece may have been retired.</p>
      <div className="mt-7">
        <ButtonLink href="/shop">Browse the shop</ButtonLink>
      </div>
    </div>
  );
}
