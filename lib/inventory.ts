
export type InventoryCategory =
  | 'Finished Products'
  | 'Raw Materials'
  | 'Packaging'
  | 'Accessories';

export type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  category: InventoryCategory;
  unit: string;
  stock: number;
  lowStockAt: number;
  costPerUnit: number;
  supplier: string;
};

export const initialInventory: InventoryItem[] = [
  {
    id: 'INV-001',
    name: '11oz White Sublimation Mug',
    sku: 'MUG-11-W',
    category: 'Finished Products',
    unit: 'pcs',
    stock: 45,
    lowStockAt: 10,
    costPerUnit: 120,
    supplier: 'Sonbarsa Supplier',
  },
  {
    id: 'INV-002',
    name: '600ml Sublimation Bottle',
    sku: 'BOT-600',
    category: 'Finished Products',
    unit: 'pcs',
    stock: 28,
    lowStockAt: 8,
    costPerUnit: 250,
    supplier: 'Sonbarsa Supplier',
  },
  {
    id: 'INV-003',
    name: '1000ml Sport Bottle',
    sku: 'BOT-1000',
    category: 'Finished Products',
    unit: 'pcs',
    stock: 12,
    lowStockAt: 5,
    costPerUnit: 450,
    supplier: 'Sonbarsa Supplier',
  },
  {
    id: 'INV-004',
    name: 'Sublimation Paper A4',
    sku: 'MAT-PAPER-A4',
    category: 'Raw Materials',
    unit: 'sheets',
    stock: 180,
    lowStockAt: 50,
    costPerUnit: 3,
    supplier: 'Printing Materials Supplier',
  },
  {
    id: 'INV-005',
    name: 'Sublimation Ink Set',
    sku: 'MAT-INK-SET',
    category: 'Raw Materials',
    unit: 'sets',
    stock: 2,
    lowStockAt: 3,
    costPerUnit: 1800,
    supplier: 'Printing Materials Supplier',
  },
  {
    id: 'INV-006',
    name: 'Heat Resistant Tape',
    sku: 'MAT-TAPE',
    category: 'Raw Materials',
    unit: 'rolls',
    stock: 8,
    lowStockAt: 3,
    costPerUnit: 120,
    supplier: 'Local Supplier',
  },
  {
    id: 'INV-007',
    name: 'Courier Packaging Box',
    sku: 'PKG-BOX',
    category: 'Packaging',
    unit: 'pcs',
    stock: 75,
    lowStockAt: 20,
    costPerUnit: 15,
    supplier: 'Packaging Supplier',
  },
  {
    id: 'INV-008',
    name: 'Bubble Wrap',
    sku: 'PKG-BUBBLE',
    category: 'Packaging',
    unit: 'meters',
    stock: 35,
    lowStockAt: 10,
    costPerUnit: 12,
    supplier: 'Packaging Supplier',
  },
  {
    id: 'INV-009',
    name: 'Mug Gift Box',
    sku: 'PKG-MUG',
    category: 'Packaging',
    unit: 'pcs',
    stock: 8,
    lowStockAt: 15,
    costPerUnit: 18,
    supplier: 'Packaging Supplier',
  },
  {
    id: 'INV-010',
    name: 'LED Photo Lamp Base',
    sku: 'ACC-LED-BASE',
    category: 'Accessories',
    unit: 'pcs',
    stock: 10,
    lowStockAt: 4,
    costPerUnit: 350,
    supplier: 'Sonbarsa Supplier',
  },
];

export type StockMovement = {
  id: string;
  itemId: string;
  itemName: string;
  type: 'Stock In' | 'Stock Out' | 'Adjustment';
  quantity: number;
  date: string;
  reference: string;
};

export const initialMovements: StockMovement[] = [
  {
    id: 'MOV-001',
    itemId: 'INV-001',
    itemName: '11oz White Sublimation Mug',
    type: 'Stock In',
    quantity: 20,
    date: '2026-11-09',
    reference: 'PUR-001',
  },
  {
    id: 'MOV-002',
    itemId: 'INV-002',
    itemName: '600ml Sublimation Bottle',
    type: 'Stock Out',
    quantity: 2,
    date: '2026-11-09',
    reference: 'ORD-1086',
  },
  {
    id: 'MOV-003',
    itemId: 'INV-005',
    itemName: 'Sublimation Ink Set',
    type: 'Stock In',
    quantity: 1,
    date: '2026-11-08',
    reference: 'PUR-002',
  },
];
