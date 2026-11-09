
export type CustomerType = 'Individual' | 'Corporate' | 'Wholesale';

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  type: CustomerType;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  notes: string;
};

export const initialCustomers: Customer[] = [
  {
    id: 'CUS-001',
    name: 'Sanjay Shah',
    phone: '9812345678',
    email: 'sanjay@example.com',
    address: 'Kathmandu, Nepal',
    type: 'Individual',
    totalOrders: 5,
    totalSpent: 4250,
    lastOrder: 'Nov 09, 2026',
    notes: 'Prefers WhatsApp communication.',
  },
  {
    id: 'CUS-002',
    name: 'Prakriti Yadav',
    phone: '9823456789',
    email: 'prakriti@example.com',
    address: 'Malangwa, Sarlahi',
    type: 'Individual',
    totalOrders: 3,
    totalSpent: 1897,
    lastOrder: 'Nov 09, 2026',
    notes: 'Interested in personalized gifts.',
  },
  {
    id: 'CUS-003',
    name: 'Aarav Enterprises',
    phone: '9801234567',
    email: 'aarav@example.com',
    address: 'Butwal, Nepal',
    type: 'Corporate',
    totalOrders: 8,
    totalSpent: 42500,
    lastOrder: 'Nov 08, 2026',
    notes: 'Corporate gift orders. Ask for logo before production.',
  },
  {
    id: 'CUS-004',
    name: 'Ritika Jha',
    phone: '9845678901',
    email: 'ritika@example.com',
    address: 'Janakpur, Nepal',
    type: 'Individual',
    totalOrders: 1,
    totalSpent: 1499,
    lastOrder: 'Nov 08, 2026',
    notes: 'First-time customer.',
  },
  {
    id: 'CUS-005',
    name: 'Kiran Medical',
    phone: '9856789012',
    email: 'kiran@example.com',
    address: 'Birgunj, Nepal',
    type: 'Corporate',
    totalOrders: 6,
    totalSpent: 18500,
    lastOrder: 'Nov 07, 2026',
    notes: 'Interested in bulk customized bottles.',
  },
  {
    id: 'CUS-006',
    name: 'Rahul Kumar',
    phone: '9867890123',
    email: 'rahul@example.com',
    address: 'Lalitpur, Nepal',
    type: 'Individual',
    totalOrders: 2,
    totalSpent: 1998,
    lastOrder: 'Nov 06, 2026',
    notes: '',
  },
  {
    id: 'CUS-007',
    name: 'Everest Gift Suppliers',
    phone: '9878901234',
    email: 'everest@example.com',
    address: 'Pokhara, Nepal',
    type: 'Wholesale',
    totalOrders: 12,
    totalSpent: 68500,
    lastOrder: 'Nov 05, 2026',
    notes: 'Wholesale enquiries. Discuss bulk pricing.',
  },
];
