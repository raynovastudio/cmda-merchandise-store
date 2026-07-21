import cargoShirt from "@/assets/product-cargo-shirt.jpg";
import faceCap from "@/assets/product-face-cap.jpg";
import polo from "@/assets/product-polo.jpg";
import magazine from "@/assets/product-magazine.jpg";
import handbook from "@/assets/product-handbook.jpg";

export type Availability = "in-stock" | "pre-order";

export type ProductColor = {
  name: string;
  hex: string;
};

export type Product = {
  id: string;
  name: string;
  category: "Apparel" | "Publications";
  price: number;
  image: string;
  shortDescription: string;
  description: string;
  sizes: string[] | null;
  colors: ProductColor[] | null;
  availability: Availability;
  featured?: boolean;
  isNew?: boolean;
  bestSeller?: boolean;
};

const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export const products: Product[] = [
  {
    id: "cmda-cargo-shirt",
    name: "CMDA Cargo Shirt",
    category: "Apparel",
    price: 14000,
    image: cargoShirt,
    shortDescription:
      "Signature plum cargo shirt with utility pockets — a versatile mission staple.",
    description:
      "Crafted from a soft, breathable cotton blend, the CMDA Cargo Shirt is designed for the field, the ward, and everywhere in between. Utility pockets, a relaxed cut, and the CMDA plum finish make it an unmistakable everyday piece.",
    sizes: APPAREL_SIZES,
    colors: [
      { name: "Plum", hex: "#8B2C6B" },
      { name: "Navy", hex: "#1B2A4A" },
      { name: "Olive", hex: "#4A5D23" },
    ],
    availability: "in-stock",
    featured: true,
    bestSeller: true,
  },
  {
    id: "cmda-face-cap",
    name: "CMDA Face Cap",
    category: "Apparel",
    price: 5000,
    image: faceCap,
    shortDescription:
      "Structured embroidered cap in signature CMDA plum. One size, adjustable fit.",
    description:
      "A clean, structured 6-panel cap with subtle CMDA embroidery. Adjustable back strap fits comfortably across sizes. The perfect finishing touch for conferences, outreaches, and casual wear.",
    sizes: null,
    colors: [
      { name: "Plum", hex: "#8B2C6B" },
      { name: "Black", hex: "#1A1A1A" },
      { name: "White", hex: "#FFFFFF" },
    ],
    availability: "in-stock",
    featured: true,
    isNew: true,
  },
  {
    id: "wholeness-outreach-polo",
    name: "Wholeness Missions Outreach Polo",
    category: "Apparel",
    price: 10000,
    image: polo,
    shortDescription:
      "Premium pique polo with green trim — the official outreach uniform.",
    description:
      "Worn on outreaches across the country, the Wholeness Missions Polo is made from breathable pique cotton with reinforced stitching and Nigerian-green collar trim. Built for long days of service.",
    sizes: APPAREL_SIZES,
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Navy", hex: "#1B2A4A" },
      { name: "Black", hex: "#1A1A1A" },
    ],
    availability: "pre-order",
    featured: true,
  },
  {
    id: "wholeness-magazine",
    name: "Wholeness Magazine",
    category: "Publications",
    price: 3000,
    image: magazine,
    shortDescription:
      "The flagship CMDA Nigeria magazine — stories, teaching, and mission dispatches.",
    description:
      "Each issue of Wholeness gathers testimonies, teaching, and mission reports from across CMDA Nigeria. Beautifully printed on premium stock, it's a keepsake for every member and supporter.",
    sizes: null,
    colors: null,
    availability: "in-stock",
    isNew: true,
  },
  {
    id: "logo-exploration-handbook",
    name: "Logo Exploration Handbook",
    category: "Publications",
    price: 1500,
    image: handbook,
    shortDescription:
      "A concise guide to the meaning and use of the CMDA Nigeria identity.",
    description:
      "This slim handbook walks through the story behind the CMDA Nigeria mark — the cross, the dove, the flag — and the principles that guide how our identity is used across chapters and campaigns.",
    sizes: null,
    colors: null,
    availability: "pre-order",
  },
];

export const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

export const getProduct = (id: string) => products.find((p) => p.id === id);
