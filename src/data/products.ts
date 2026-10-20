// Your product list. To add a product, copy one block and change the details.
// Prices are in cents (3400 = $34.00).
// Stock is how many of a piece you've put up for sale in total. The shop subtracts paid orders
// on its own, so don't lower it after a sale. Made more? Add them to the number. (See README.)
// Images live in /public/products. Real photos (.jpg or .webp, square) work best.

// Each category has its own page in src/app/shop/<category>/page.tsx
export type Category = "plushies" | "accessories";

export type Product = {
  slug: string;
  name: string;
  category: Category;
  priceCents: number;
  stock: number;
  image: string;
  // Soft background behind the photo, picked to match the yarn
  tint: string;
  summary: string;
  description: string;
  size: string;
  materials: string;
  featured?: boolean;
};

export const categories: Record<Category, { name: string; blurb: string }> = {
  plushies: {
    name: "Plushies",
    blurb: "Soft friends to hug, gift or keep on a shelf.",
  },
  accessories: {
    name: "Accessories",
    blurb: "Tiny crocheted things for your keys, bag and hair.",
  },
};

export const products: Product[] = [
  {
    slug: "mochi-the-bunny",
    name: "Mochi the Bunny",
    category: "plushies",
    priceCents: 3400,
    stock: 3,
    image: "/products/bunny.svg",
    tint: "#FFE0E7",
    summary: "Bunny, 8 in tall",
    description:
      "Mochi has floppy-ish ears, round cheeks and a body just right for one-handed squeezes. Stitched tightly in soft cotton yarn so it keeps its shape.",
    size: "About 8 in tall, 5 in wide",
    materials: "Cotton yarn, polyester fiberfill, safety eyes",
    featured: true,
  },
  {
    slug: "pudding-the-bear",
    name: "Pudding the Bear",
    category: "plushies",
    priceCents: 3800,
    stock: 2,
    image: "/products/bear.svg",
    tint: "#FBE8CF",
    summary: "Bear, 9 in tall",
    description:
      "A caramel-colored bear with a cream muzzle and tummy. Pudding sits up on its own, so it's happy on a desk or a bookshelf.",
    size: "About 9 in tall, 6 in wide",
    materials: "Cotton yarn, polyester fiberfill, safety eyes",
    featured: true,
  },
  {
    slug: "lily-the-frog",
    name: "Lily the Frog",
    category: "plushies",
    priceCents: 3000,
    stock: 4,
    image: "/products/frog.svg",
    tint: "#DDF0DF",
    summary: "Frog, 6 in tall",
    description:
      "A mint green frog with a wide smile and big round eyes on top of its head. Small enough to tuck into a bag.",
    size: "About 6 in tall, 7 in wide",
    materials: "Cotton yarn, polyester fiberfill, safety eyes",
    featured: true,
  },
  {
    slug: "peep-the-chick",
    name: "Peep the Chick",
    category: "plushies",
    priceCents: 2400,
    stock: 5,
    image: "/products/chick.svg",
    tint: "#FFF1C9",
    summary: "Chick, 5 in tall",
    description:
      "A round little chick with a three-feather tuft and stubby wings. The smallest plushie in the shop, and a sweet add-on gift.",
    size: "About 5 in tall, 5 in wide",
    materials: "Cotton yarn, polyester fiberfill, safety eyes",
    featured: true,
  },
  {
    slug: "tofu-the-cat",
    name: "Tofu the Cat",
    category: "plushies",
    priceCents: 3600,
    stock: 1,
    image: "/products/cat.svg",
    tint: "#F7EEE6",
    summary: "Cat, 8 in tall",
    description:
      "An oatmeal cat with pink ears, one toasty spot and a curled tail. Tofu is a one-of-a-kind color mix.",
    size: "About 8 in tall, 6 in wide",
    materials: "Cotton yarn, polyester fiberfill, safety eyes",
  },
  {
    slug: "inky-the-octopus",
    name: "Inky the Octopus",
    category: "plushies",
    priceCents: 3200,
    stock: 0,
    image: "/products/octopus.svg",
    tint: "#ECE6FA",
    summary: "Octopus, 6 in tall",
    description:
      "A lavender octopus with five wiggly legs. Each leg is stitched separately and sewn on by hand.",
    size: "About 6 in tall, 7 in wide",
    materials: "Cotton yarn, polyester fiberfill, safety eyes",
  },
  {
    slug: "strawberry-keychain",
    name: "Strawberry Keychain",
    category: "accessories",
    priceCents: 1200,
    stock: 8,
    image: "/products/strawberry-keychain.svg",
    tint: "#FDE3E3",
    summary: "Keychain, 3 in",
    description:
      "A tiny smiling strawberry on a silver-tone key ring. Clip it to your keys, a zipper or a bag strap.",
    size: "About 3 in tall without the ring",
    materials: "Cotton yarn, polyester fiberfill, metal key ring",
  },
  {
    slug: "daisy-hair-clips",
    name: "Daisy Hair Clips",
    category: "accessories",
    priceCents: 1400,
    stock: 6,
    image: "/products/daisy-clips.svg",
    tint: "#E3F1E5",
    summary: "Set of 2 clips",
    description:
      "Two white daisies with butter-yellow centers, each on a snap clip. Light enough to wear all day.",
    size: "Flowers about 2 in across",
    materials: "Cotton yarn, metal snap clips",
  },
  {
    slug: "mushroom-bag-charm",
    name: "Mushroom Bag Charm",
    category: "accessories",
    priceCents: 1300,
    stock: 5,
    image: "/products/mushroom-charm.svg",
    tint: "#FBE8CF",
    summary: "Bag charm, 3 in",
    description:
      "A red-capped mushroom with white spots and a sleepy smile, on a lobster clasp that hooks onto bags and belt loops.",
    size: "About 3 in tall without the clasp",
    materials: "Cotton yarn, polyester fiberfill, metal clasp",
  },
  {
    slug: "heart-keychain",
    name: "Heart Keychain",
    category: "accessories",
    priceCents: 1000,
    stock: 10,
    image: "/products/heart-keychain.svg",
    tint: "#FFE5EC",
    summary: "Keychain, 2.5 in",
    description:
      "A puffy pink heart with a little face. Small, squishy and easy to give away.",
    size: "About 2.5 in tall without the ring",
    materials: "Cotton yarn, polyester fiberfill, metal key ring",
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
