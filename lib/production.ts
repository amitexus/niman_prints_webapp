
export type ProductionStatus =
  | 'Design Pending'
  | 'Design Approved'
  | 'Printing'
  | 'Quality Check'
  | 'Ready to Ship'
  | 'Dispatched';

export type ProductionPriority = 'Normal' | 'High' | 'Urgent';

export type ProductionJob = {
  id: string;
  orderId: string;
  customer: string;
  product: string;
  quantity: number;
  status: ProductionStatus;
  priority: ProductionPriority;
  dueDate: string;
  assignedTo: string;
  notes: string;
};

export const productionStages: ProductionStatus[] = [
  'Design Pending',
  'Design Approved',
  'Printing',
  'Quality Check',
  'Ready to Ship',
  'Dispatched',
];

export const initialProductionJobs: ProductionJob[] = [
  {
    id: 'JOB-001',
    orderId: '#NP-1086',
    customer: 'Sanjay Shah',
    product: 'Customized 750ml Bottle',
    quantity: 1,
    status: 'Printing',
    priority: 'High',
    dueDate: '2026-11-10',
    assignedTo: 'Production Team',
    notes: 'Print customer-approved name and design.',
  },
  {
    id: 'JOB-002',
    orderId: '#NP-1085',
    customer: 'Prakriti Yadav',
    product: 'Personalized Photo Mug',
    quantity: 2,
    status: 'Design Pending',
    priority: 'Normal',
    dueDate: '2026-11-10',
    assignedTo: 'Design Team',
    notes: 'Waiting for customer design approval.',
  },
  {
    id: 'JOB-003',
    orderId: '#NP-1084',
    customer: 'Aarav Enterprises',
    product: 'Corporate Gift Set',
    quantity: 25,
    status: 'Quality Check',
    priority: 'Urgent',
    dueDate: '2026-11-09',
    assignedTo: 'Production Team',
    notes: 'Check logo alignment and packaging.',
  },
  {
    id: 'JOB-004',
    orderId: '#NP-1083',
    customer: 'Ritika Jha',
    product: 'Rotating LED Photo Lamp',
    quantity: 1,
    status: 'Ready to Ship',
    priority: 'Normal',
    dueDate: '2026-11-11',
    assignedTo: 'Packing Team',
    notes: 'Verify all photos before dispatch.',
  },
  {
    id: 'JOB-005',
    orderId: '#NP-1082',
    customer: 'Kiran Medical',
    product: 'Doctor Theme Bottle',
    quantity: 5,
    status: 'Design Approved',
    priority: 'High',
    dueDate: '2026-11-10',
    assignedTo: 'Production Team',
    notes: 'Five bottles with individual names.',
  },
  {
    id: 'JOB-006',
    orderId: '#NP-1081',
    customer: 'Rahul Kumar',
    product: 'Customized T-Shirt',
    quantity: 2,
    status: 'Dispatched',
    priority: 'Normal',
    dueDate: '2026-11-08',
    assignedTo: 'Packing Team',
    notes: 'Completed and dispatched.',
  },
];
