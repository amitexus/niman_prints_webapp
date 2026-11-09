
export type AnalyticsPeriod = '7D' | '30D' | '90D' | '12M';

export const analyticsSummary = {
  revenue: 84650,
  expenses: 53410,
  profit: 31240,
  orders: 126,
  customers: 94,
  averageOrderValue: 672,
  previousRevenue: 75020,
  previousOrders: 116,
};

export const revenueTrends = {
  '7D': [
    { label: 'Mon', revenue: 4200, expenses: 2600 },
    { label: 'Tue', revenue: 5600, expenses: 3100 },
    { label: 'Wed', revenue: 3800, expenses: 2400 },
    { label: 'Thu', revenue: 7200, expenses: 3900 },
    { label: 'Fri', revenue: 6100, expenses: 3500 },
    { label: 'Sat', revenue: 8500, expenses: 4200 },
    { label: 'Sun', revenue: 5200, expenses: 2900 },
  ],
  '30D': [
    { label: 'Week 1', revenue: 18500, expenses: 11900 },
    { label: 'Week 2', revenue: 21200, expenses: 13200 },
    { label: 'Week 3', revenue: 19800, expenses: 12600 },
    { label: 'Week 4', revenue: 25150, expenses: 15710 },
  ],
  '90D': [
    { label: 'Aug', revenue: 62000, expenses: 41000 },
    { label: 'Sep', revenue: 71500, expenses: 46500 },
    { label: 'Oct', revenue: 84650, expenses: 53410 },
  ],
  '12M': [
    { label: 'Dec', revenue: 38000, expenses: 29000 },
    { label: 'Jan', revenue: 42000, expenses: 31000 },
    { label: 'Feb', revenue: 45000, expenses: 33000 },
    { label: 'Mar', revenue: 51000, expenses: 36000 },
    { label: 'Apr', revenue: 48000, expenses: 35000 },
    { label: 'May', revenue: 55000, expenses: 39000 },
    { label: 'Jun', revenue: 59000, expenses: 40000 },
    { label: 'Jul', revenue: 62000, expenses: 41000 },
    { label: 'Aug', revenue: 62000, expenses: 41000 },
    { label: 'Sep', revenue: 71500, expenses: 46500 },
    { label: 'Oct', revenue: 84650, expenses: 53410 },
    { label: 'Nov', revenue: 0, expenses: 0 },
  ],
};

export const orderStatusBreakdown = [
  { status: 'New', count: 12 },
  { status: 'Design Approval', count: 18 },
  { status: 'In Production', count: 18 },
  { status: 'Ready to Ship', count: 14 },
  { status: 'Completed', count: 58 },
  { status: 'Cancelled', count: 6 },
];

export const topProducts = [
  {
    name: 'Customized 600ml Bottle',
    category: 'Bottles',
    unitsSold: 42,
    revenue: 29400,
    profit: 17850,
  },
  {
    name: 'Personalized Photo Mug',
    category: 'Mugs',
    unitsSold: 35,
    revenue: 13965,
    profit: 9765,
  },
  {
    name: 'Rotating LED Photo Lamp',
    category: 'LED Lamps',
    unitsSold: 14,
    revenue: 20986,
    profit: 11886,
  },
  {
    name: 'Customized 1000ml Bottle',
    category: 'Bottles',
    unitsSold: 18,
    revenue: 14400,
    profit: 6300,
  },
  {
    name: 'Personalized Photo Frame',
    category: 'Photo Frames',
    unitsSold: 17,
    revenue: 14450,
    profit: 9350,
  },
];

export const customerInsights = {
  newCustomers: 28,
  repeatCustomers: 66,
  repeatPurchaseRate: 70.2,
  averageCustomerValue: 900.5,
};

export const channelPerformance = [
  { channel: 'Facebook', orders: 62, revenue: 42500 },
  { channel: 'Instagram', orders: 31, revenue: 21800 },
  { channel: 'WhatsApp', orders: 22, revenue: 14200 },
  { channel: 'Pinterest', orders: 7, revenue: 6150 },
  { channel: 'Other', orders: 4, revenue: 0 },
];

export const expenseBreakdown = [
  { category: 'Product Cost', amount: 26500 },
  { category: 'Advertising', amount: 8500 },
  { category: 'Packaging', amount: 4200 },
  { category: 'Delivery', amount: 5600 },
  { category: 'Utilities', amount: 2100 },
  { category: 'Other', amount: 6510 },
];

export const businessTargets = {
  monthlyRevenue: 150000,
  monthlyOrders: 150,
  monthlyProfit: 50000,
};
