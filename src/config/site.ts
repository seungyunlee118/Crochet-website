// Shop-wide settings. Edit these to match how you run the shop.

export const site = {
  name: "Croche",
  tagline: "Little crocheted friends, made by hand.",
  description:
    "Handmade crochet plushies and tiny accessories, stitched one at a time and shipped anywhere in the US.",
  // Shown in the footer and on the help page. Replace with your real address.
  email: "hello@example.com",
  // Leave empty to hide. Example: "https://instagram.com/yourshop"
  instagram: "",

  shipping: {
    // Amounts are in cents: 595 = $5.95
    flatRateCents: 595,
    freeOverCents: 5000,
    // Business days to pack an order after it's placed
    packDaysMin: 1,
    packDaysMax: 2,
    // Business days in transit once shipped
    transitMin: 3,
    transitMax: 5,
  },

  about: [
    "Every piece starts as a ball of yarn and a hook. Each one takes hours to make, so there are only a few of each and they do sell out.",
    "Because everything is stitched by hand, no two are exactly alike. Yours might have a slightly different smile than the one in the photo, and that's part of the charm.",
  ],

  // Review these before you open the shop. They appear on the help page.
  policies: {
    returns:
      "If something isn't right, email us within 14 days of delivery. Unused items in their original condition can be returned for a refund of the item price.",
    care: "Spot clean with cool water and a drop of mild soap, then let it air dry. Please don't put plushies in the washer or dryer.",
    safety:
      "Plushies use safety eyes and small parts. They're made for gifting and display, and aren't meant for children under 3.",
  },
} as const;
