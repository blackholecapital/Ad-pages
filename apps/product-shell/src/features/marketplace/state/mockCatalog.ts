export type CatalogProduct = {
  id: string;
  title: string;
  priceUsdc: number;
  image: string;
};

export const mockCatalog: CatalogProduct[] = [
  {
    id: "skin-neon-viper",
    title: "Neon Viper",
    priceUsdc: 9.99,
    image: "/demo/marketplace/skin-neon-viper.png",
  },
  {
    id: "skin-carbon-haze",
    title: "Carbon Haze",
    priceUsdc: 12.5,
    image: "/demo/marketplace/skin-carbon-haze.png",
  },
  {
    id: "skin-crimson-arc",
    title: "Crimson Arc",
    priceUsdc: 7.25,
    image: "/demo/marketplace/skin-crimson-arc.png",
  },
];
