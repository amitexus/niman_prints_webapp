export const stats = [
  { label: 'Total revenue', value: 'NPR 84,650', change: '+12.8%', note: 'vs. previous 30 days', icon: 'revenue' },
  { label: 'Orders received', value: '126', change: '+8.2%', note: 'vs. previous 30 days', icon: 'orders' },
  { label: 'Net profit', value: 'NPR 31,240', change: '+6.4%', note: 'estimated · demo data', icon: 'profit' },
  { label: 'Pending production', value: '18', change: 'Needs attention', note: 'orders awaiting completion', icon: 'production' }
];

export const orders = [
  { id: '#NP-1086', customer: 'Sanjay Shah', product: 'Custom 750ml Bottle', date: 'Today, 10:42 AM', amount: 'NPR 699', status: 'In production', initials: 'SS', tone: 'violet' },
  { id: '#NP-1085', customer: 'Prakriti Yadav', product: 'Personalized Photo Mug', date: 'Today, 09:18 AM', amount: 'NPR 399', status: 'Design approval', initials: 'PY', tone: 'blue' },
  { id: '#NP-1084', customer: 'Aarav Enterprises', product: 'Corporate Gift Set · 25 pcs', date: 'Yesterday', amount: 'NPR 12,500', status: 'Ready to ship', initials: 'AE', tone: 'amber' },
  { id: '#NP-1083', customer: 'Ritika Jha', product: 'Rotating LED Photo Lamp', date: 'Yesterday', amount: 'NPR 1,499', status: 'Completed', initials: 'RJ', tone: 'green' },
  { id: '#NP-1082', customer: 'Kiran Medical', product: 'Doctor Theme Bottle · 5 pcs', date: 'Nov 07, 2026', amount: 'NPR 3,250', status: 'Completed', initials: 'KM', tone: 'pink' }
];

export const activities = [
  { title: 'New order received', detail: 'Sanjay Shah · #NP-1086', time: '12 min ago', color: 'bg-violet-400' },
  { title: 'Design approved', detail: 'Prakriti Yadav · #NP-1085', time: '1 hour ago', color: 'bg-sky-400' },
  { title: 'Stock running low', detail: '11oz white sublimation mugs · 8 left', time: '3 hours ago', color: 'bg-amber-400' },
  { title: 'Order dispatched', detail: 'Aarav Enterprises · #NP-1081', time: 'Yesterday', color: 'bg-emerald-400' }
];
