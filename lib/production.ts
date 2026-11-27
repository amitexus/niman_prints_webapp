
export type ProductionStatus =
  | 'Design Pending'
  | 'Design Approved'
  | 'Printing'
  | 'Quality Check'
  | 'Ready to Ship'
  | 'Dispatched';

export type ProductionPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

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
  history: ProductionHistoryEntry[];
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
    history: [],
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
    history: [],
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
    history: [],
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
    history: [],
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
    history: [],
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
    history: [],
  },
];

// Backend production API types

export type BackendProductionStatus =
  | "Pending Design"
  | "Design Approval"
  | "Printing"
  | "Quality Check"
  | "Packaging"
  | "Ready for Dispatch"
  | "Completed"
  | "Cancelled";

export type BackendProductionPriority =
  | "Low"
  | "Normal"
  | "High"
  | "Urgent";

export type ProductionHistoryEntry = {
  from_status: string | null;
  to_status: string;
  changed_by: string;
  notes: string;
  changed_at: string;
};

export type ProductionApiJob = {
  id: string;
  business_id: string;
  order_id: string | null;
  order_number: string | null;
  customer_name: string | null;
  product_name: string;
  quantity: number;
  priority: BackendProductionPriority;
  status: BackendProductionStatus;
  assigned_to: string | null;
  due_date: string | null;
  design_instructions: string;
  production_notes: string;
  created_at: string;
  updated_at: string;
  history: ProductionHistoryEntry[];
};


export function mapProductionJob(job: ProductionApiJob): ProductionJob {
  const statusMap: Record<BackendProductionStatus, ProductionStatus> = {
    "Pending Design": "Design Pending",
    "Design Approval": "Design Approved",
    "Printing": "Printing",
    "Quality Check": "Quality Check",
    "Packaging": "Quality Check",
    "Ready for Dispatch": "Ready to Ship",
    "Completed": "Dispatched",
    "Cancelled": "Dispatched",
  };

  return {
    id: job.id,
    orderId: job.order_number || "Not linked",
    customer: job.customer_name || "Customer details unavailable",
    product: job.product_name,
    quantity: job.quantity,
    status: statusMap[job.status],
    priority: job.priority === "Urgent" ? "Urgent" : job.priority,
    dueDate: job.due_date || "",
    assignedTo: job.assigned_to || "Unassigned",
    notes: job.production_notes || job.design_instructions || "",
    history: job.history || [],
  };
}