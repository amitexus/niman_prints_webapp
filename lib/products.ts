
export type ProductCategory =
  | 'Mugs'
  | 'Bottles'
  | 'Photo Frames'
  | 'LED Lamps'
  | 'Apparel'
  | 'Gift Sets'
  | 'Other';

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  lowStockAt: number;
  status: 'Active' | 'Draft' | 'Archived';
  customization: string[];
};

export const initialProducts: Product[] = [
  {
    id: 'PRD-001',
    name: 'Personalized 11oz Photo Mug',
    sku: 'MUG-001',
    category: 'Mugs',
    costPrice: 120,
    sellingPrice: 399,
    stock: 45,
    lowStockAt: 10,
    status: 'Active',
    customization: ['Photo', 'Name', 'Text', 'Design'],
  },
  {
    id: 'PRD-002',
    name: 'Customized 600ml Bottle',
    sku: 'BOT-001',
    category: 'Bottles',
    costPrice: 250,
    sellingPrice: 700,
    stock: 28,
    lowStockAt: 8,
    status: 'Active',
    customization: ['Name', 'Photo', 'Logo'],
  },
  {
    id: 'PRD-003',
    name: 'Customized 1000ml Bottle',
    sku: 'BOT-002',
    category: 'Bottles',
    costPrice: 450,
    sellingPrice: 800,
    stock: 12,
    lowStockAt: 5,
    status: 'Active',
    customization: ['Name', 'Photo', 'Logo'],
  },
  {
    id: 'PRD-004',
    name: 'Rotating LED Photo Lamp',
    sku: 'LED-001',
    category: 'LED Lamps',
    costPrice: 650,
    sellingPrice: 1499,
    stock: 8,
    lowStockAt: 5,
    status: 'Active',
    customization: ['Photos', 'Name', 'Message'],
  },
  {
    id: 'PRD-005',
    name: 'Personalized Photo Frame',
    sku: 'FRM-001',
    category: 'Photo Frames',
    costPrice: 300,
    sellingPrice: 850,
    stock: 15,
    lowStockAt: 5,
    status: 'Active',
    customization: ['Photo', 'Name', 'Message'],
  },
  {
    id: 'PRD-006',
    name: 'Customized Printed T-Shirt',
    sku: 'TSH-001',
    category: 'Apparel',
    costPrice: 350,
    sellingPrice: 799,
    stock: 20,
    lowStockAt: 5,
    status: 'Active',
    customization: ['Photo', 'Name', 'Text', 'Size'],
  },
  {
    id: 'PRD-007',
    name: 'Corporate Gift Set',
    sku: 'GFT-001',
    category: 'Gift Sets',
    costPrice: 700,
    sellingPrice: 1250,
    stock: 4,
    lowStockAt: 5,
    status: 'Active',
    customization: ['Logo', 'Name', 'Message'],
  },
];

export const productCategories: ProductCategory[] = [
  'Mugs',
  'Bottles',
  'Photo Frames',
  'LED Lamps',
  'Apparel',
  'Gift Sets',
  'Other',
];
