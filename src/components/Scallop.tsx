// A row of crochet shell stitches: each scallop is a fan of stitches worked from one point.
// Fills with currentColor, so set the color with a text-* class.

type Props = {
  id: string;
  flip?: boolean;
  className?: string;
};

const fan = [32, 58, 90, 122, 148].map((deg) => {
  const r = (deg * Math.PI) / 180;
  return `M22 5L${(22 + 18 * Math.cos(r)).toFixed(1)} ${(4 + 18 * Math.sin(r)).toFixed(1)}`;
});

export function Scallop({ id, flip, className }: Props) {
  return (
    <svg
      aria-hidden="true"
      className={`block h-[26px] w-full ${flip ? "-scale-y-100" : ""} ${className ?? ""}`}
    >
      <defs>
        <pattern id={id} width="44" height="26" patternUnits="userSpaceOnUse">
          <path d="M0 0H44V4A22 22 0 0 1 0 4Z" fill="currentColor" />
          <path d={fan.join("")} stroke="#fff" strokeOpacity=".28" strokeWidth="1.6" strokeLinecap="round" />
          <path
            d="M41.5 4A19.5 19.5 0 0 1 2.5 4"
            fill="none"
            stroke="#fff"
            strokeOpacity=".22"
            strokeWidth="1.6"
            strokeDasharray="2 3.2"
            strokeLinecap="round"
          />
        </pattern>
      </defs>
      <rect width="100%" height="26" fill={`url(#${id})`} />
    </svg>
  );
}
