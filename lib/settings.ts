
export type BusinessSettings = {
  businessName: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  country: string;
  currency: 'NPR';
  timezone: string;
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
  orderPrefix: string;
  defaultDeliveryCharge: number;
  freeDeliveryThreshold: number;
  vatRegistered: boolean;
  vatNumber: string;
  panNumber: string;
};

export const initialBusinessSettings: BusinessSettings = {
  businessName: 'Niman Prints',
  tagline: 'Personalized Gifts & Customized Printing',
  email: '',
  phone: '',
  whatsapp: '',
  address: 'Malangwa',
  city: 'Sarlahi',
  country: 'Nepal',
  currency: 'NPR',
  timezone: 'Asia/Kathmandu',
  dateFormat: 'YYYY-MM-DD',
  orderPrefix: 'NP',
  defaultDeliveryCharge: 100,
  freeDeliveryThreshold: 2000,
  vatRegistered: true,
  vatNumber: '',
  panNumber: '',
};

export type NotificationSettings = {
  newOrder: boolean;
  paymentReceived: boolean;
  lowStock: boolean;
  productionUpdates: boolean;
  newLead: boolean;
  dailySummary: boolean;
};

export const initialNotificationSettings: NotificationSettings = {
  newOrder: true,
  paymentReceived: true,
  lowStock: true,
  productionUpdates: true,
  newLead: true,
  dailySummary: false,
};

export type OrderSettings = {
  requireDesignApproval: boolean;
  allowPartialPayment: boolean;
  defaultPaymentStatus: 'Unpaid' | 'Partially Paid' | 'Paid';
  defaultOrderStatus: 'New' | 'Design Approval' | 'In Production';
  autoCreateProductionJob: boolean;
};

export const initialOrderSettings: OrderSettings = {
  requireDesignApproval: true,
  allowPartialPayment: true,
  defaultPaymentStatus: 'Unpaid',
  defaultOrderStatus: 'New',
  autoCreateProductionJob: false,
};

export type AISettings = {
  provider: 'OpenAI' | 'Other';
  model: string;
  enabled: boolean;
  temperature: number;
};

export const initialAISettings: AISettings = {
  provider: 'OpenAI',
  model: 'gpt-4.1-mini',
  enabled: false,
  temperature: 0.7,
};

export const regionalCurrencyOptions = [
  {
    code: 'NPR',
    name: 'Nepalese Rupee',
    symbol: 'Rs.',
  },
  {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
  },
];

export const businessRoles = [
  {
    id: 'owner',
    name: 'Owner',
    description: 'Full access to all business modules and settings.',
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Manage daily operations and business records.',
  },
  {
    id: 'sales',
    name: 'Sales Staff',
    description: 'Manage orders, customers and marketing leads.',
  },
  {
    id: 'production',
    name: 'Production Staff',
    description: 'Manage production jobs and quality checks.',
  },
  {
    id: 'accountant',
    name: 'Accountant',
    description: 'Manage finance, transactions and reports.',
  },
];
