
export type MarketingChannel =
  | 'Facebook'
  | 'Instagram'
  | 'TikTok'
  | 'Pinterest'
  | 'WhatsApp'
  | 'Other';

export type CampaignStatus =
  | 'Draft'
  | 'Scheduled'
  | 'Active'
  | 'Paused'
  | 'Completed';

export type CampaignObjective =
  | 'Messages'
  | 'Sales'
  | 'Traffic'
  | 'Engagement'
  | 'Awareness'
  | 'Leads';

export type MarketingCampaign = {
  id: string;
  name: string;
  channel: MarketingChannel;
  objective: CampaignObjective;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  dailyBudget: number;
  totalBudget: number;
  spend: number;
  impressions: number;
  clicks: number;
  messages: number;
  leads: number;
  orders: number;
  revenue: number;
  notes: string;
};

export const initialCampaigns: MarketingCampaign[] = [
  {
    id: 'CMP-001',
    name: '600ml Personalized Bottle — Office',
    channel: 'Facebook',
    objective: 'Messages',
    status: 'Active',
    startDate: '2026-11-05',
    endDate: '2026-11-15',
    dailyBudget: 300,
    totalBudget: 3300,
    spend: 1200,
    impressions: 18500,
    clicks: 245,
    messages: 38,
    leads: 25,
    orders: 8,
    revenue: 5600,
    notes: 'Demo campaign. Office and corporate audience.',
  },
  {
    id: 'CMP-002',
    name: 'Personalized Photo Mug',
    channel: 'Instagram',
    objective: 'Messages',
    status: 'Active',
    startDate: '2026-11-07',
    endDate: '2026-11-14',
    dailyBudget: 200,
    totalBudget: 1400,
    spend: 400,
    impressions: 9200,
    clicks: 132,
    messages: 21,
    leads: 16,
    orders: 5,
    revenue: 1995,
    notes: 'Demo campaign. Personalized gift audience.',
  },
  {
    id: 'CMP-003',
    name: 'Kids Customized Bottles',
    channel: 'Facebook',
    objective: 'Sales',
    status: 'Paused',
    startDate: '2026-10-25',
    endDate: '2026-11-05',
    dailyBudget: 250,
    totalBudget: 3000,
    spend: 2100,
    impressions: 28500,
    clicks: 410,
    messages: 62,
    leads: 42,
    orders: 13,
    revenue: 9093,
    notes: 'Demo campaign. School and parent audience.',
  },
  {
    id: 'CMP-004',
    name: 'Niman Prints Product Showcase',
    channel: 'Pinterest',
    objective: 'Traffic',
    status: 'Completed',
    startDate: '2026-10-01',
    endDate: '2026-10-20',
    dailyBudget: 100,
    totalBudget: 2000,
    spend: 1500,
    impressions: 42000,
    clicks: 860,
    messages: 12,
    leads: 8,
    orders: 3,
    revenue: 2997,
    notes: 'Demo campaign. Product discovery traffic.',
  },
  {
    id: 'CMP-005',
    name: 'Corporate Gift Collection',
    channel: 'Facebook',
    objective: 'Leads',
    status: 'Draft',
    startDate: '2026-11-12',
    endDate: '2026-11-25',
    dailyBudget: 400,
    totalBudget: 5600,
    spend: 0,
    impressions: 0,
    clicks: 0,
    messages: 0,
    leads: 0,
    orders: 0,
    revenue: 0,
    notes: 'Plan to target offices and businesses.',
  },
];

export type MarketingLeadStatus =
  | 'New'
  | 'Contacted'
  | 'Interested'
  | 'Converted'
  | 'Lost';

export type MarketingLead = {
  id: string;
  name: string;
  phone: string;
  source: MarketingChannel;
  campaignId: string;
  productInterest: string;
  status: MarketingLeadStatus;
  estimatedValue: number;
  date: string;
  notes: string;
};

export const initialLeads: MarketingLead[] = [
  {
    id: 'LEAD-001',
    name: 'Ramesh Kumar',
    phone: '98XXXXXXXX',
    source: 'Facebook',
    campaignId: 'CMP-001',
    productInterest: '600ml Personalized Bottle',
    status: 'Interested',
    estimatedValue: 700,
    date: '2026-11-09',
    notes: 'Asked about name customization.',
  },
  {
    id: 'LEAD-002',
    name: 'Anita Sharma',
    phone: '97XXXXXXXX',
    source: 'Instagram',
    campaignId: 'CMP-002',
    productInterest: 'Personalized Photo Mug',
    status: 'Contacted',
    estimatedValue: 399,
    date: '2026-11-09',
    notes: 'Sent product details on WhatsApp.',
  },
  {
    id: 'LEAD-003',
    name: 'Suresh Enterprises',
    phone: '98XXXXXXXX',
    source: 'Facebook',
    campaignId: 'CMP-001',
    productInterest: 'Corporate Bottles',
    status: 'New',
    estimatedValue: 7000,
    date: '2026-11-08',
    notes: 'Potential bulk order.',
  },
  {
    id: 'LEAD-004',
    name: 'Priya Yadav',
    phone: '98XXXXXXXX',
    source: 'Pinterest',
    campaignId: 'CMP-004',
    productInterest: 'Photo Frame',
    status: 'Converted',
    estimatedValue: 850,
    date: '2026-11-07',
    notes: 'Converted to a customer.',
  },
];

export const marketingGoals = {
  monthlyAdBudget: 15000,
  monthlyRevenueTarget: 100000,
  monthlyOrdersTarget: 100,
};
