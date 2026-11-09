
export type SupplierCountry = 'Nepal' | 'India';

export type Supplier = {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  country: SupplierCountry;
  currency: 'NPR' | 'INR';
  category: string;
  openingBalance: number;
  notes: string;
};

export const initialSuppliers: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'Sonbarsa Sublimation Supplier',
    contactPerson: 'Sales Team',
    phone: '9876543210',
    email: '',
    address: 'Sonbarsa, Bihar, India',
    country: 'India',
    currency: 'INR',
    category: 'Sublimation Products',
    openingBalance: 0,
    notes: 'Mugs, bottles and sublimation blanks.',
  },
  {
    id: 'SUP-002',
    name: 'Printing Materials Supplier',
    contactPerson: 'Sales Representative',
    phone: '9800000001',
    email: '',
    address: 'Kathmandu, Nepal',
    country: 'Nepal',
    currency: 'NPR',
    category: 'Printing Materials',
    openingBalance: 0,
    notes: 'Sublimation ink and paper.',
  },
  {
    id: 'SUP-003',
    name: 'Packaging Supplier',
    contactPerson: 'Sales Team',
    phone: '9800000002',
    email: '',
    address: 'Birgunj, Nepal',
    country: 'Nepal',
    currency: 'NPR',
    category: 'Packaging',
    openingBalance: 0,
    notes: 'Boxes, bubble wrap and courier packaging.',
  },
];

export type PurchaseStatus =
  | 'Draft'
  | 'Ordered'
  | 'Partially Received'
  | 'Received'
  | 'Cancelled';

export type PurchaseOrder = {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  expectedDate: string;
  currency: 'NPR' | 'INR';
  exchangeRate: number;
  items: {
    inventoryItemId: string;
    itemName: string;
    quantity: number;
    unitCost: number;
    receivedQuantity: number;
  }[];
  subtotal: number;
  additionalCharges: number;
  total: number;
  nprEquivalent: number;
  paidAmount: number;
  status: PurchaseStatus;
  notes: string;
};

export const initialPurchases: PurchaseOrder[] = [
  {
    id: 'PO-001',
    supplierId: 'SUP-001',
    supplierName: 'Sonbarsa Sublimation Supplier',
    date: '2026-11-07',
    expectedDate: '2026-11-12',
    currency: 'INR',
    exchangeRate: 1.6,
    items: [
      {
        inventoryItemId: 'INV-001',
        itemName: '11oz White Sublimation Mug',
        quantity: 50,
        unitCost: 75,
        receivedQuantity: 0,
      },
    ],
    subtotal: 3750,
    additionalCharges: 150,
    total: 3900,
    nprEquivalent: 6240,
    paidAmount: 0,
    status: 'Ordered',
    notes: 'Illustrative cross-border purchase.',
  },
  {
    id: 'PO-002',
    supplierId: 'SUP-002',
    supplierName: 'Printing Materials Supplier',
    date: '2026-11-05',
    expectedDate: '2026-11-06',
    currency: 'NPR',
    exchangeRate: 1,
    items: [
      {
        inventoryItemId: 'INV-004',
        itemName: 'Sublimation Paper A4',
        quantity: 100,
        unitCost: 3,
        receivedQuantity: 100,
      },
    ],
    subtotal: 300,
    additionalCharges: 0,
    total: 300,
    nprEquivalent: 300,
    paidAmount: 300,
    status: 'Received',
    notes: 'Illustrative local purchase.',
  },
];
