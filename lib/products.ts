
export type ProductCategory =
  | "Mugs"
  | "Bottles"
  | "Photo Frames"
  | "LED Lamps"
  | "Apparel"
  | "Gift Sets"
  | "Other";

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  lowStockAt: number;
  status: "Active" | "Draft" | "Archived";
  customization: string[];
};

export const productCategories: ProductCategory[] = [
  "Mugs",
  "Bottles",
  "Photo Frames",
  "LED Lamps",
  "Apparel",
  "Gift Sets",
  "Other",
];
