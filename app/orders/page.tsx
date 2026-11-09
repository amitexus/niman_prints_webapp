
'use client';

import { useMemo, useState } from 'react';
import {
  Plus, Search, Filter, Download, Eye, X,
  ShoppingBag, Clock, CheckCircle2, Truck,
  ChevronDown, CalendarDays
} from 'lucide-react';

type OrderStatus =
  | 'New'
  | 'Design Approval'
  | 'In Production'
  | 'Ready to Ship'
  | 'Completed'
  | 'Cancelled';

type Order = {
  id: string;
  customer: string;
  phone: string;
  product: string;
  quantity: number;
  amount: number;
  payment: 'Paid' | 'Unpaid' | 'Partial';
  status: OrderStatus;
  date: string;
};

const initialOrders: Order[] = [
  {
    id: 'NP-1026',
    customer: 'Priya Sharma',
    phone: '98XXXXXXXX',
    product: 'Personalized Photo Mug',
    quantity: 2,
    amount: 798,
    payment: 'Paid',
    status: 'In Production',
    date: 'Nov 09, 2026',
  },
  {
    id: 'NP-1025',
    customer: 'Rahul Kumar',
    phone: '98XXXXXXXX',
    product: 'Customized Water Bottle',
    quantity: 1,
    amount: 999,
    payment: 'Paid',
    status: 'Design Approval',
    date: 'Nov 09, 2026',
  },
  {
    id: 'NP-1024',
    customer: 'Anjali Singh',
    phone: '98XXXXXXXX',
    product: 'LED Rotating Photo Lamp',
    quantity: 1,
    amount: 1499,
    payment: 'Partial',
    status: 'Ready to Ship',
    date: 'Nov 08, 2026',
  },
  {
    id: 'NP-1023',
    customer: 'Amit Verma',
    phone: '98XXXXXXXX',
    product: 'Customized T-Shirt',
    quantity: 3,
    amount: 1800,
    payment: 'Paid',
    status: 'Completed',
    date: 'Nov 08, 2026',
  },
  {
    id: 'NP-1022',
    customer: 'Sneha Gupta',
    phone: '98XXXXXXXX',
    product: 'Personalized Photo Frame',
    quantity: 1,
    amount: 850,
    payment: 'Unpaid',
    status: 'New',
    date: 'Nov 07, 2026',
  },
  {
    id: 'NP-1021',
    customer: 'Ravi Thakur',
    phone: '98XXXXXXXX',
    product: 'Printed Sports Bottle',
    quantity: 2,
    amount: 1400,
    payment: 'Paid',
    status: 'Cancelled',
    date: 'Nov 07, 2026',
  },
];

const statusStyles: Record<OrderStatus, string> = {
  New: 'bg-blue-400/10 text-blue-300',
  'Design Approval': 'bg-amber-400/10 text-amber-300',
  'In Production': 'bg-violet-400/10 text-violet-300',
  'Ready to Ship': 'bg-cyan-400/10 text-cyan-300',
  Completed: 'bg-emerald-400/10 text-emerald-300',
  Cancelled: 'bg-rose-400/10 text-rose-300',
};

const tabs = [
  'All',
  'New',
  'Design Approval',
  'In Production',
  'Ready to Ship',
  'Completed',
  'Cancelled',
];

const currency = (amount: number) =>
  `NPR ${amount.toLocaleString('en-IN')}`;

export default function OrdersPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [form, setForm] = useState({
    customer: '',
    phone: '',
    product: '',
    quantity: '1',
    amount: '',
  });

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesQuery =
        `${order.id} ${order.customer} ${order.product}`
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesStatus =
        activeTab === 'All' || order.status === activeTab;

      return matchesQuery && matchesStatus;
    });
  }, [orders, query, activeTab]);

  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, order) => sum + order.amount, 0);

  const pendingOrders = orders.filter(
    (o) => !['Completed', 'Cancelled'].includes(o.status)
  ).length;

  const completedOrders = orders.filter(
    (o) => o.status === 'Completed'
  ).length;

  function createOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newOrder: Order = {
      id: `NP-${1027 + orders.length - initialOrders.length}`,
      customer: form.customer,
      phone: form.phone,
      product: form.product,
      quantity: Number(form.quantity),
      amount: Number(form.amount),
      payment: 'Unpaid',
      status: 'New',
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
    };

    setOrders((previous) => [newOrder, ...previous]);
    setActiveTab('All');
    setQuery('');
    setForm({
      customer: '',
      phone: '',
      product: '',
      quantity: '1',
      amount: '',
    });
    setShowCreate(false);
  }

  return (
    <main className="min-w-0 flex-1">
      {/* Header */}
      <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-line bg-[#090b12]/90 px-5 backdrop-blur-xl md:px-8">
        <div>
          <p className="text-[10px] text-slate-500">
            Workspace / Operations / Orders
          </p>
          <h1 className="mt-1 text-[17px] font-semibold text-white">
            Orders Management
          </h1>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-semibold text-white shadow-glow transition hover:bg-violet-400"
        >
          <Plus size={15} />
          Create Order
        </button>
      </header>

      <div className="mx-auto max-w-[1500px] space-y-6 p-5 md:p-8">
        {/* Page heading */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-violet-300">
            Order operations
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Manage your orders
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Track customized products from order placement to delivery.
          </p>
        </div>

        {/* Demo notice */}
        <div className="flex items-center gap-3 rounded-xl border border-amber-400/15 bg-amber-400/[.05] px-4 py-3">
          <ShoppingBag size={17} className="text-amber-300" />
          <div>
            <p className="text-[11px] font-semibold text-amber-100">
              Preview mode · Sample orders
            </p>
            <p className="text-[10px] text-amber-100/50">
              Orders are stored temporarily in browser memory. Database integration comes later.
            </p>
          </div>
        </div>

        {/* Statistics */}
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Total Orders',
              value: orders.length,
              icon: ShoppingBag,
              color: 'text-violet-300',
            },
            {
              label: 'Pending Orders',
              value: pendingOrders,
              icon: Clock,
              color: 'text-amber-300',
            },
            {
              label: 'Completed Orders',
              value: completedOrders,
              icon: CheckCircle2,
              color: 'text-emerald-300',
            },
            {
              label: 'Order Value',
              value: currency(totalRevenue),
              icon: Truck,
              color: 'text-blue-300',
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-line bg-panel p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-slate-400">
                    {item.label}
                  </p>
                  <Icon size={17} className={item.color} />
                </div>
                <p className="mt-4 text-xl font-semibold text-white">
                  {item.value}
                </p>
              </div>
            );
          })}
        </section>

        {/* Orders table */}
        <section className="overflow-hidden rounded-2xl border border-line bg-panel">
          <div className="flex flex-col justify-between gap-4 border-b border-line p-5 lg:flex-row lg:items-center">
            <div>
              <h3 className="text-sm font-semibold text-white">
                All orders
              </h3>
              <p className="mt-1 text-[10px] text-slate-500">
                {filteredOrders.length} orders found
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex min-w-[190px] flex-1 items-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2.5 lg:flex-none">
                <Search size={14} className="text-slate-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search orders..."
                  className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-600"
                />
              </div>

              <button
                onClick={() => {
                  setQuery('');
                  setActiveTab('All');
                }}
                className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-xs text-slate-400 hover:text-white"
              >
                <Filter size={14} />
                Reset
              </button>
            </div>
          </div>

          {/* Status filters */}
          <div className="scrollbar-hide flex gap-2 overflow-x-auto border-b border-line px-5 py-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 rounded-lg px-3 py-2 text-[10px] font-medium transition ${
                  activeTab === tab
                    ? 'bg-violet-500/15 text-violet-200'
                    : 'text-slate-500 hover:bg-white/5 hover:text-white'
                }`}
              >
                {tab}
                {tab === 'All' && (
                  <span className="ml-2 text-[9px] opacity-60">
                    {orders.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="bg-white/[.015] text-[9px] uppercase tracking-wider text-slate-600">
                  <th className="px-5 py-4">Order ID</th>
                  <th className="px-3 py-4">Customer</th>
                  <th className="px-3 py-4">Product</th>
                  <th className="px-3 py-4">Quantity</th>
                  <th className="px-3 py-4">Amount</th>
                  <th className="px-3 py-4">Payment</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-line/70 text-[11px] transition hover:bg-white/[.02]"
                  >
                    <td className="whitespace-nowrap px-5 py-4">
                      <p className="font-semibold text-violet-300">
                        {order.id}
                      </p>
                      <p className="mt-1 text-[9px] text-slate-600">
                        {order.date}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-3 py-4">
                      <p className="font-medium text-slate-200">
                        {order.customer}
                      </p>
                      <p className="mt-1 text-[9px] text-slate-500">
                        {order.phone}
                      </p>
                    </td>

                    <td className="max-w-[180px] truncate px-3 py-4 text-slate-400">
                      {order.product}
                    </td>

                    <td className="px-3 py-4 text-slate-300">
                      {order.quantity}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 font-semibold text-white">
                      {currency(order.amount)}
                    </td>

                    <td className="px-3 py-4">
                      <span className={`rounded-md px-2 py-1 text-[9px] ${
                        order.payment === 'Paid'
                          ? 'bg-emerald-400/10 text-emerald-300'
                          : order.payment === 'Partial'
                            ? 'bg-amber-400/10 text-amber-300'
                            : 'bg-rose-400/10 text-rose-300'
                      }`}>
                        {order.payment}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <span className={`whitespace-nowrap rounded-md px-2 py-1 text-[9px] ${statusStyles[order.status]}`}>
                        {order.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-lg border border-line p-2 text-slate-400 hover:border-violet-400/30 hover:text-violet-300"
                        aria-label={`View ${order.id}`}
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="py-16 text-center">
                <ShoppingBag
                  size={28}
                  className="mx-auto text-slate-600"
                />
                <p className="mt-3 text-xs font-medium text-slate-300">
                  No orders found
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  Try another search or status filter.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Create order modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-lg rounded-2xl border border-line bg-panel shadow-2xl">
            <div className="flex items-center justify-between border-b border-line p-5">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Create new order
                </h3>
                <p className="mt-1 text-[10px] text-slate-500">
                  Enter the customer and product information.
                </p>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={createOrder} className="space-y-4 p-5">
              {[
                { label: 'Customer name', key: 'customer', placeholder: 'Enter customer name', type: 'text' },
                { label: 'Phone number', key: 'phone', placeholder: '98XXXXXXXX', type: 'tel' },
                { label: 'Product name', key: 'product', placeholder: 'e.g. Personalized Mug', type: 'text' },
                { label: 'Quantity', key: 'quantity', placeholder: '1', type: 'number' },
                { label: 'Total amount (NPR)', key: 'amount', placeholder: 'Enter amount', type: 'number' },
              ].map((field) => (
                <label key={field.key} className="block">
                  <span className="mb-2 block text-[10px] font-medium text-slate-400">
                    {field.label}
                  </span>
                  <input
                    required
                    type={field.type}
                    min={field.type === 'number' ? '1' : undefined}
                    placeholder={field.placeholder}
                    value={form[field.key as keyof typeof form]}
                    onChange={(e) =>
                      setForm((previous) => ({
                        ...previous,
                        [field.key]: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none transition focus:border-violet-400"
                  />
                </label>
              ))}

              <div className="flex justify-end gap-2 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-xl border border-line px-4 py-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-violet-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-violet-400"
                >
                  Create order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order details modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-line bg-panel p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500">Order details</p>
                <h3 className="mt-1 text-lg font-semibold text-violet-300">
                  {selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {[
                ['Customer', selectedOrder.customer],
                ['Phone', selectedOrder.phone],
                ['Product', selectedOrder.product],
                ['Quantity', String(selectedOrder.quantity)],
                ['Order date', selectedOrder.date],
                ['Amount', currency(selectedOrder.amount)],
                ['Payment', selectedOrder.payment],
                ['Status', selectedOrder.status],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-line pb-3 text-xs">
                  <span className="text-slate-500">{label}</span>
                  <span className="text-right font-medium text-slate-200">{value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-5 w-full rounded-xl bg-violet-500 py-3 text-xs font-semibold text-white hover:bg-violet-400"
            >
              Close details
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
