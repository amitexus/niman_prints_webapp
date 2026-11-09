
export type FinanceCategory =
  | 'Sales'
  | 'Product Cost'
  | 'Advertising'
  | 'Packaging'
  | 'Delivery'
  | 'Salary'
  | 'Rent'
  | 'Utilities'
  | 'Equipment'
  | 'EMI'
  | 'Other';

export type FinanceTransactionType =
  | 'Income'
  | 'Expense';

export type FinanceTransaction = {
  id: string;
  date: string;
  description: string;
  type: FinanceTransactionType;
  category: FinanceCategory;
  amount: number;
  currency: 'NPR' | 'INR';
  exchangeRate: number;
  paymentMethod: 'Cash' | 'Bank' | 'eSewa' | 'Khalti' | 'Other';
  reference: string;
  notes: string;
};

export const initialTransactions: FinanceTransaction[] = [
  {
    id: 'TXN-001',
    date: '2026-11-09',
    description: 'Customized bottle order',
    type: 'Income',
    category: 'Sales',
    amount: 1000,
    currency: 'NPR',
    exchangeRate: 1,
    paymentMethod: 'eSewa',
    reference: 'NP-1086',
    notes: 'Customer payment received.',
  },
  {
    id: 'TXN-002',
    date: '2026-11-09',
    description: 'Facebook advertising',
    type: 'Expense',
    category: 'Advertising',
    amount: 300,
    currency: 'NPR',
    exchangeRate: 1,
    paymentMethod: 'Bank',
    reference: 'META-001',
    notes: 'Daily advertising expense.',
  },
  {
    id: 'TXN-003',
    date: '2026-11-08',
    description: 'Sublimation materials purchase',
    type: 'Expense',
    category: 'Product Cost',
    amount: 2500,
    currency: 'INR',
    exchangeRate: 1.6,
    paymentMethod: 'Cash',
    reference: 'PUR-001',
    notes: 'Illustrative India supplier purchase.',
  },
  {
    id: 'TXN-004',
    date: '2026-11-08',
    description: 'Courier and delivery charges',
    type: 'Expense',
    category: 'Delivery',
    amount: 250,
    currency: 'NPR',
    exchangeRate: 1,
    paymentMethod: 'Cash',
    reference: 'DEL-001',
    notes: '',
  },
  {
    id: 'TXN-005',
    date: '2026-11-07',
    description: 'Personalized photo mug order',
    type: 'Income',
    category: 'Sales',
    amount: 799,
    currency: 'NPR',
    exchangeRate: 1,
    paymentMethod: 'Bank',
    reference: 'NP-1085',
    notes: 'Illustrative customer payment.',
  },
  {
    id: 'TXN-006',
    date: '2026-11-07',
    description: 'Packaging materials',
    type: 'Expense',
    category: 'Packaging',
    amount: 450,
    currency: 'NPR',
    exchangeRate: 1,
    paymentMethod: 'Cash',
    reference: 'PKG-001',
    notes: '',
  },
  {
    id: 'TXN-007',
    date: '2026-11-06',
    description: 'Business electricity',
    type: 'Expense',
    category: 'Utilities',
    amount: 1200,
    currency: 'NPR',
    exchangeRate: 1,
    paymentMethod: 'Bank',
    reference: 'UTIL-001',
    notes: 'Illustrative business expense.',
  },
];

export type FinancialTarget = {
  monthlyRevenueTarget: number;
  monthlyProfitTarget: number;
  currency: 'NPR';
};

export const initialFinancialTargets: FinancialTarget = {
  monthlyRevenueTarget: 150000,
  monthlyProfitTarget: 50000,
  currency:'NPR'
};
