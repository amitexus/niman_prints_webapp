
'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Plus, Search, Filter, Eye, X,
  ShoppingBag, Clock, CheckCircle2, Truck,
} from 'lucide-react';

type OrderStatus =
  | 'New'
  | 'Design Approval'
  | 'In Production'
  | 'Ready to Ship'
  | 'Shipped'
  | 'Delivered'
  | 'Completed'
  | 'Cancelled'
  | 'Returned';

type PaymentStatus = 'Paid' | 'Unpaid' | 'Partial' | 'Historical';

type DeliveryStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Returned';

type CODSettlementStatus =
  | 'Not Applicable'
  | 'Pending'
  | 'Partially Settled'
  | 'Settled';

type PaymentTransaction = {
  amount: number;
  method: 'Online' | 'COD' | 'Cash' | 'Bank Transfer' | 'Other';
  payment_date: string;
  reference: string;
  notes: string;
};

type ApiOrder = {
  id: string;
  business_id: string;
  order_number: string;
  customer_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  product_name: string;
  quantity: number;
  rate: number;
  delivery_charge: number;
  total_order: number;
  online_payment: number;
  cod_amount: number;
  delivery_type: string;
  cost: number;
  profit: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  order_date: string;
  created_at: string;
  updated_at: string;
  source?: string;
  delivery_status?: DeliveryStatus;
  cod_settlement_status?: CODSettlementStatus;
  cod_settled_amount?: number;
  payment_history?: PaymentTransaction[];
  delivered_at?: string | null;
};

type Order = {
  id: string;
  databaseId: string;
  customer: string;
  phone: string;
  product: string;
  quantity: number;
  amount: number;
  payment: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  codSettlementStatus: CODSettlementStatus;
  codSettledAmount: number;
  paymentHistory: PaymentTransaction[];
  deliveredAt: string | null;
  status: OrderStatus;
  date: string;
  rate: number;
  deliveryCharge: number;
  onlinePayment: number;
  codAmount: number;
  cost: number;
  profit: number;
  address: string;
  deliveryType: string;
  source: string;
};

const tabs = [
  'All',
  'New',
  'Design Approval',
  'In Production',
  'Ready to Ship',
  'Shipped',
  'Delivered',
  'Completed',
  'Cancelled',
  'Returned',
];

const statusStyles: Record<OrderStatus, string> = {
  New: 'bg-blue-400/10 text-blue-300',
  'Design Approval': 'bg-amber-400/10 text-amber-300',
  'In Production': 'bg-violet-400/10 text-violet-300',
  'Ready to Ship': 'bg-cyan-400/10 text-cyan-300',
  Shipped: 'bg-indigo-400/10 text-indigo-300',
  Delivered: 'bg-emerald-400/10 text-emerald-300',
  Completed: 'bg-green-400/10 text-green-300',
  Cancelled: 'bg-rose-400/10 text-rose-300',
  Returned: 'bg-orange-400/10 text-orange-300',
};

const currency = (amount: number) =>
  `NPR ${Number(amount || 0).toLocaleString('en-IN')}`;

function formatDate(value: string) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function mapOrder(item: ApiOrder): Order {
  return {
    id: item.order_number,
    databaseId: item.id,
    customer: item.customer_name || 'Unknown customer',
    phone: item.customer_phone || '',
    product: item.product_name || '—',
    quantity: Number(item.quantity || 0),
    amount: Number(item.total_order || 0),
    payment: item.payment_status || 'Unpaid',
    deliveryStatus: item.delivery_status || 'Pending',
    codSettlementStatus: item.cod_settlement_status || 'Not Applicable',
    codSettledAmount: Number(item.cod_settled_amount || 0),
    paymentHistory: item.payment_history || [],
    deliveredAt: item.delivered_at || null,
    status: item.status,
    date: formatDate(item.order_date || item.created_at),
    rate: Number(item.rate || 0),
    deliveryCharge: Number(item.delivery_charge || 0),
    onlinePayment: Number(item.online_payment || 0),
    codAmount: Number(item.cod_amount || 0),
    cost: Number(item.cost || 0),
    profit: Number(item.profit || 0),
    address: item.customer_address || '',
    deliveryType: item.delivery_type || '',
    source: item.source === 'excel_import' || item.source === 'historical'
      ? 'historical'
      : 'manual',
  };
}

function paymentStyle(payment: PaymentStatus) {
  if (payment === 'Paid') return 'bg-emerald-400/10 text-emerald-300';
  if (payment === 'Partial') return 'bg-amber-400/10 text-amber-300';
  if (payment === 'Historical') return 'bg-blue-400/10 text-blue-300';
  return 'bg-rose-400/10 text-rose-300';
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<
    'COD' | 'Cash' | 'Bank Transfer' | 'Other'
  >('COD');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');


  const [form, setForm] = useState({
    customer: '',
    address: '',
    phone: '',
    product: '',
    quantity: '1',
    rate: '',
    deliveryCharge: '0',
    paymentOption: 'COD' as 'COD' | 'Online' | 'Both',
    onlinePayment: '0',
    deliveryType: 'Branch-Door',
    cost: '0',
  });

  const quantity = Number(form.quantity) || 0;
  const rate = Number(form.rate) || 0;
  const deliveryCharge = Number(form.deliveryCharge) || 0;
  const cost = Number(form.cost) || 0;

  const totalOrder = quantity * rate + deliveryCharge;

  const onlinePayment =
    form.paymentOption === 'COD'
      ? 0
      : form.paymentOption === 'Online'
        ? totalOrder
        : Number(form.onlinePayment) || 0;

  const codAmount = Math.max(0, totalOrder - onlinePayment);

  const profit = totalOrder - cost - deliveryCharge;

  const paymentStatus =
    onlinePayment <= 0
      ? 'Unpaid'
      : onlinePayment >= totalOrder
        ? 'Paid'
        : 'Partial';

  async function loadOrders() {
    setLoading(true);
    setError('');

    try {
      const allOrders: ApiOrder[] = [];
      const batchSize = 500;
      let skip = 0;

      while (true) {
        const response = await fetch(
          `/api/orders?skip=${skip}&limit=${batchSize}`,
          { cache: 'no-store' }
        );

        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.detail || result?.message || 'Unable to load orders.');
        }

        const batch: ApiOrder[] = await response.json();
        allOrders.push(...batch);

        if (batch.length < batchSize) break;
        skip += batchSize;
      }

      setOrders(allOrders.map(mapOrder));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchText = [
        order.id,
        order.customer,
        order.phone,
        order.product,
      ].join(' ').toLowerCase();

      const matchesQuery = searchText.includes(query.toLowerCase());
      const matchesStatus =
        activeTab === 'All' || order.status === activeTab;

      return matchesQuery && matchesStatus;
    });
  }, [orders, query, activeTab]);

  const totalRevenue = orders
    .filter((order) => order.status !== 'Cancelled')
    .reduce((sum, order) => sum + order.amount, 0);

  const pendingOrders = orders.filter(
    (order) => !['Completed', 'Cancelled'].includes(order.status)
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === 'Completed'
  ).length;


  async function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');

    const qty = Number(form.quantity);
    const unitRate = Number(form.rate);
    const delivery = Number(form.deliveryCharge);
    const total = qty * unitRate + delivery;
    const online = onlinePayment;
    const cod = codAmount;
    const orderCost = Number(form.cost);

    if (
      !form.customer.trim() ||
      !form.address.trim() ||
      !form.phone.trim() ||
      !form.product.trim()
    ) {
      setError('Please complete all customer and product details.');
      setSaving(false);
      return;
    }

    if (
      qty <= 0 ||
      unitRate <= 0 ||
      delivery < 0 ||
      orderCost < 0 ||
      total <= 0
    ) {
      setError('Please enter valid quantity, rate, delivery charge and cost.');
      setSaving(false);
      return;
    }

    if (
      form.paymentOption === 'Both' &&
      (online <= 0 || online >= total)
    ) {
      setError('For Both payment, online payment must be greater than zero and less than the total order amount.');
      setSaving(false);
      return;
    }

    const payload = {
      customer_name: form.customer.trim(),
      customer_phone: form.phone.trim(),
      customer_address: form.address.trim(),
      product_name: form.product.trim(),
      quantity: qty,
      rate: unitRate,
      delivery_charge: delivery,
      total_order: total,
      online_payment: online,
      cod_amount: cod,
      delivery_type: form.deliveryType,
      cost: orderCost,
      profit: total - orderCost - delivery,
      status: 'New',
      payment_status: paymentStatus,
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.detail || result?.message || 'Could not create order.'
        );
      }

      await loadOrders();

      setActiveTab('All');
      setQuery('');

      setForm({
        customer: '',
        address: '',
        phone: '',
        product: '',
        quantity: '1',
        rate: '',
        deliveryCharge: '0',
        paymentOption: 'COD',
        onlinePayment: '0',
        deliveryType: 'Branch-Door',
        cost: '0',
      });

      setShowCreate(false);
      setNotice('Order created successfully.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not create order.'
      );
    } finally {
      setSaving(false);
    }
  }


  async function updateOrderStatus(order: Order, status: OrderStatus) {
    if (order.source === 'historical') {
      setError('Historical imported orders cannot be edited here.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');

    try {
      const response = await fetch(`/api/orders/${order.databaseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: order.customer,
          customer_phone: order.phone,
          customer_address: order.address,
          product_name: order.product,
          quantity: order.quantity,
          rate: order.rate,
          delivery_charge: order.deliveryCharge,
          total_order: order.amount,
          online_payment: order.onlinePayment,
          cod_amount: order.codAmount,
          delivery_type: order.deliveryType,
          cost: order.cost,
          profit: order.profit,
          status,
          payment_status: order.payment === 'Historical' ? 'Unpaid' : order.payment,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.detail || result?.message || 'Could not update order.');
      }

      await loadOrders();
      setSelectedOrder(null);
      setNotice('Order status updated successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update order.');
    } finally {
      setSaving(false);
    }
  }

  async function cancelOrder(order: Order) {
    if (order.source === 'historical') {
      setError('Historical imported orders cannot be cancelled here.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel order ${order.id}?`
    );

    if (!confirmed) return;

    setSaving(true);
    setError('');
    setNotice('');

    try {
      const response = await fetch(`/api/orders/${order.databaseId}`, {
        method: 'DELETE',
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.detail || result?.message || 'Could not cancel order.');
      }

      await loadOrders();
      setSelectedOrder(null);
      setNotice('Order cancelled successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not cancel order.');
    } finally {
      setSaving(false);
    }
  }


  async function updateDeliveryStatus(
    order: Order,
    deliveryStatus: DeliveryStatus
  ) {
    if (order.source === 'historical') {
      setError('Historical imported orders cannot be edited here.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');

    try {
      const response = await fetch(`/api/orders/${order.databaseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_status: deliveryStatus }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.detail || 'Could not update delivery status.');
      }

      await loadOrders();
      setSelectedOrder(mapOrder(result));

      setNotice('Delivery status updated successfully.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not update delivery status.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function recordPayment(order: Order) {
    const amount = Number(paymentAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter a valid payment amount.');
      return;
    }

    if (order.source === 'historical') {
      setError('Historical imported orders cannot be modified here.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');

    try {
      const response = await fetch(`/api/orders/${order.databaseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          method: paymentMethod,
          payment_date: new Date().toISOString(),
          reference: paymentReference.trim(),
          notes: paymentNotes.trim(),
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.detail || 'Could not record payment.');
      }

      await loadOrders();

      setSelectedOrder(mapOrder(result));
      setPaymentAmount('');
      setPaymentReference('');
      setPaymentNotes('');
      setNotice('Payment recorded successfully.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not record payment.'
      );
    } finally {
      setSaving(false);
    }
  }


  const statistics = [
    {
      label: 'Total Orders',
      value: orders.length.toLocaleString('en-IN'),
      icon: ShoppingBag,
      color: 'text-violet-300',
    },
    {
      label: 'Pending Orders',
      value: pendingOrders.toLocaleString('en-IN'),
      icon: Clock,
      color: 'text-amber-300',
    },
    {
      label: 'Completed Orders',
      value: completedOrders.toLocaleString('en-IN'),
      icon: CheckCircle2,
      color: 'text-emerald-300',
    },
    {
      label: 'Order Value',
      value: currency(totalRevenue),
      icon: Truck,
      color: 'text-blue-300',
    },
  ];

  return (
    <main className="min-w-0 flex-1">
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
          onClick={() => {
            setError('');
            setShowCreate(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-semibold text-white shadow-glow transition hover:bg-violet-400"
        >
          <Plus size={15} />
          Create Order
        </button>
      </header>

      <div className="mx-auto max-w-[1500px] space-y-6 p-5 md:p-8">
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

        <div className="flex items-center gap-3 rounded-xl border border-emerald-400/15 bg-emerald-400/[.05] px-4 py-3">
          <ShoppingBag size={17} className="text-emerald-300" />
          <div>
            <p className="text-[11px] font-semibold text-emerald-100">
              Live database connection
            </p>
            <p className="mt-1 text-[10px] text-emerald-100/50">
              Orders are loaded from your business database.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-400/20 bg-rose-400/[.06] px-4 py-3 text-xs text-rose-200">
            {error}
          </div>
        )}

        {notice && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[.06] px-4 py-3 text-xs text-emerald-200">
            {notice}
          </div>
        )}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statistics.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-line bg-panel p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-slate-400">{item.label}</p>
                  <Icon size={17} className={item.color} />
                </div>
                <p className="mt-4 text-xl font-semibold text-white">
                  {loading ? '...' : item.value}
                </p>
              </div>
            );
          })}
        </section>

        <section className="overflow-hidden rounded-2xl border border-line bg-panel">
          <div className="flex flex-col justify-between gap-4 border-b border-line p-5 lg:flex-row lg:items-center">
            <div>
              <h3 className="text-sm font-semibold text-white">All orders</h3>
              <p className="mt-1 text-[10px] text-slate-500">
                {loading ? 'Loading orders...' : `${filteredOrders.length} orders found`}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex min-w-[190px] flex-1 items-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2.5 lg:flex-none">
                <Search size={14} className="text-slate-500" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
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

          <div className="scrollbar-hide flex gap-2 overflow-x-auto border-b border-line px-5 py-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 rounded-lg px-3 py-2 text-[10px] font-medium transition ${activeTab === tab
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
                    key={order.databaseId}
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
                        {order.phone || 'No phone'}
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
                      <span className={`rounded-md px-2 py-1 text-[9px] ${paymentStyle(order.payment)}`}>
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
                        onClick={() => {
                          setError('');
                          setSelectedOrder(order);
                        }}
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

            {!loading && filteredOrders.length === 0 && (
              <div className="py-16 text-center">
                <ShoppingBag size={28} className="mx-auto text-slate-600" />
                <p className="mt-3 text-xs font-medium text-slate-300">
                  No orders found
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  Try another search or status filter.
                </p>
              </div>
            )}

            {loading && (
              <div className="py-16 text-center text-xs text-slate-500">
                Loading your orders...
              </div>
            )}
          </div>
        </section>
      </div>


      {/* Create order modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-2xl rounded-2xl border border-line bg-panel shadow-2xl">
            <div className="flex items-center justify-between border-b border-line p-5">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Create new order
                </h3>
                <p className="mt-1 text-[10px] text-slate-500">
                  Enter customer, product, delivery and payment details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={createOrder} className="max-h-[75vh] space-y-5 overflow-y-auto p-5">
              {/* Customer details */}
              <section>
                <h4 className="mb-3 text-xs font-semibold text-violet-300">
                  Customer details
                </h4>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[10px] text-slate-400">Customer name</span>
                    <input
                      required
                      value={form.customer}
                      onChange={(e) => setForm(p => ({ ...p, customer: e.target.value }))}
                      placeholder="Customer name"
                      className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] text-slate-400">Mobile number</span>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="98XXXXXXXX"
                      className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-[10px] text-slate-400">Full address</span>
                    <textarea
                      required
                      rows={2}
                      value={form.address}
                      onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))}
                      placeholder="Customer delivery address"
                      className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-[10px] text-slate-400">Delivery type</span>
                    <select
                      value={form.deliveryType}
                      onChange={(e) => setForm(p => ({ ...p, deliveryType: e.target.value }))}
                      className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                    >
                      <option value="Branch-Door">Branch-Door</option>
                      <option value="Branch">Branch-Branch</option>
                      <option value="Door">Door-Door</option>
                      <option value="Other">Door-Branch</option>
                    </select>
                  </label>
                </div>
              </section>

              <div className="border-t border-line" />

              {/* Product details */}
              <section>
                <h4 className="mb-3 text-xs font-semibold text-violet-300">
                  Product and pricing
                </h4>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-[10px] text-slate-400">Product name</span>
                    <input
                      required
                      value={form.product}
                      onChange={(e) => setForm(p => ({ ...p, product: e.target.value }))}
                      placeholder="e.g. Personalized Photo Mug"
                      className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] text-slate-400">Quantity</span>
                    <input
                      required
                      type="number"
                      min="0.01"
                      step="any"
                      value={form.quantity}
                      onChange={(e) => setForm(p => ({ ...p, quantity: e.target.value }))}
                      className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] text-slate-400">Rate per unit (NPR)</span>
                    <input
                      required
                      type="number"
                      min="0"
                      step="any"
                      value={form.rate}
                      onChange={(e) => setForm(p => ({ ...p, rate: e.target.value }))}
                      placeholder="0"
                      className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] text-slate-400">Delivery charge (NPR)</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={form.deliveryCharge}
                      onChange={(e) => setForm(p => ({ ...p, deliveryCharge: e.target.value }))}
                      className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] text-slate-400">Product cost (NPR)</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={form.cost}
                      onChange={(e) => setForm(p => ({ ...p, cost: e.target.value }))}
                      className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                    />
                  </label>
                </div>
              </section>

              {/* Payment */}
              <section className="rounded-xl border border-line bg-canvas/60 p-4">
                <h4 className="mb-3 text-xs font-semibold text-violet-300">
                  Payment details
                </h4>

                <p className="mb-2 text-[10px] text-slate-400">Payment option</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['COD', 'Online', 'Both'] as const).map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, paymentOption: option }))}
                      className={`rounded-lg border px-3 py-2.5 text-xs font-medium transition ${form.paymentOption === option
                          ? 'border-violet-400 bg-violet-500/15 text-violet-200'
                          : 'border-line text-slate-400 hover:text-white'
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {form.paymentOption === 'Both' && (
                  <label className="mt-4 block">
                    <span className="mb-2 block text-[10px] text-slate-400">
                      Online payment received (NPR)
                    </span>
                    <input
                      required
                      type="number"
                      min="0.01"
                      max={Math.max(0, totalOrder - 0.01)}
                      step="any"
                      value={form.onlinePayment}
                      onChange={(e) => setForm(p => ({ ...p, onlinePayment: e.target.value }))}
                      placeholder="Enter received amount"
                      className="w-full rounded-xl border border-line bg-panel px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                    />
                  </label>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-slate-500">Online payment</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {currency(onlinePayment)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">COD amount</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {currency(codAmount)}
                    </p>
                  </div>
                </div>
              </section>

              {/* Calculation summary */}
              <section className="rounded-xl border border-violet-400/20 bg-violet-500/[.06] p-4">
                <h4 className="mb-3 text-xs font-semibold text-violet-200">
                  Order calculation
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Product amount ({quantity} × {currency(rate)})</span>
                    <span>{currency(quantity * rate)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Delivery charge</span>
                    <span>{currency(deliveryCharge)}</span>
                  </div>
                  <div className="flex justify-between border-t border-line pt-3 font-semibold text-white">
                    <span>Total order</span>
                    <span>{currency(totalOrder)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Product cost</span>
                    <span>{currency(cost)}</span>
                  </div>
                  <div className="flex justify-between border-t border-line pt-3 font-semibold text-emerald-300">
                    <span>Profit (Ex Add)</span>
                    <span>{currency(profit)}</span>
                  </div>
                  <div className="flex justify-between pt-1 text-slate-400">
                    <span>Payment status</span>
                    <span>{paymentStatus}</span>
                  </div>
                </div>
              </section>

              {error && (
                <p className="rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-300">
                  {error}
                </p>
              )}

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
                  disabled={saving}
                  className="rounded-xl bg-violet-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Create order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-md rounded-2xl border border-line bg-panel p-5 shadow-2xl">
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
                ['Phone', selectedOrder.phone || '—'],
                ['Product', selectedOrder.product],
                ['Quantity', String(selectedOrder.quantity)],
                ['Order date', selectedOrder.date],
                ['Amount', currency(selectedOrder.amount)],
                ['Online payment', currency(selectedOrder.onlinePayment)],
                ['COD amount', currency(selectedOrder.codAmount)],
                ['Payment', selectedOrder.payment],
                ['Source', selectedOrder.source],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-b border-line pb-3 text-xs"
                >
                  <span className="text-slate-500">{label}</span>
                  <span className="text-right font-medium text-slate-200">
                    {value}
                  </span>
                </div>
              ))}
            </div>


            {/* Delivery and COD tracking */}
            <div className="mt-5 space-y-3 rounded-xl border border-line bg-canvas/50 p-4">
              <h4 className="text-xs font-semibold text-violet-300">
                Delivery tracking
              </h4>

              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-400">Delivery status</span>
                <span className="font-medium text-cyan-300">
                  {selectedOrder.deliveryStatus}
                </span>
              </div>

              {selectedOrder.source !== 'historical' && (
                <select
                  value={selectedOrder.deliveryStatus}
                  disabled={saving}
                  onChange={(event) =>
                    updateDeliveryStatus(
                      selectedOrder,
                      event.target.value as DeliveryStatus
                    )
                  }
                  className="w-full rounded-xl border border-line bg-panel px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                >
                  {['Pending', 'Shipped', 'Delivered', 'Returned'].map(
                    (status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    )
                  )}
                </select>
              )}

              {selectedOrder.deliveredAt && (
                <p className="text-[10px] text-slate-500">
                  Delivered on: {formatDate(selectedOrder.deliveredAt)}
                </p>
              )}

              <div className="border-t border-line pt-3">
                <h4 className="text-xs font-semibold text-violet-300">
                  COD settlement
                </h4>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-slate-500">COD amount</p>
                    <p className="mt-1 text-xs font-semibold text-white">
                      {currency(selectedOrder.codAmount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-500">COD received</p>
                    <p className="mt-1 text-xs font-semibold text-emerald-300">
                      {currency(selectedOrder.codSettledAmount)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500">
                    Settlement status
                  </span>
                  <span className="rounded-md bg-amber-400/10 px-2 py-1 text-[10px] text-amber-300">
                    {selectedOrder.codSettlementStatus}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all"
                    style={{
                      width: `${selectedOrder.codAmount > 0
                          ? Math.min(
                            100,
                            (selectedOrder.codSettledAmount /
                              selectedOrder.codAmount) *
                            100
                          )
                          : 0
                        }%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-[10px] text-slate-500">
                  Remaining COD:{' '}
                  {currency(
                    Math.max(
                      0,
                      selectedOrder.codAmount -
                      selectedOrder.codSettledAmount
                    )
                  )}
                </p>
              </div>
            </div>

            {/* Payment history */}
            <div className="mt-4 rounded-xl border border-line bg-canvas/50 p-4">
              <h4 className="text-xs font-semibold text-violet-300">
                Payment history
              </h4>

              {selectedOrder.paymentHistory.length === 0 ? (
                <p className="mt-3 text-[10px] text-slate-500">
                  No payment transactions recorded yet.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {selectedOrder.paymentHistory.map((payment, index) => (
                    <div
                      key={`${payment.payment_date}-${index}`}
                      className="flex justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-200">
                          {payment.method}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-500">
                          {formatDate(payment.payment_date)}
                        </p>
                        {payment.reference && (
                          <p className="mt-1 break-all text-[10px] text-slate-500">
                            Ref: {payment.reference}
                          </p>
                        )}
                        {payment.notes && (
                          <p className="mt-1 text-[10px] text-slate-500">
                            {payment.notes}
                          </p>
                        )}
                      </div>

                      <p className="shrink-0 text-xs font-semibold text-emerald-300">
                        {currency(payment.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Record a payment */}
            {selectedOrder.source !== 'historical' && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  recordPayment(selectedOrder);
                }}
                className="mt-4 space-y-3 rounded-xl border border-violet-400/20 bg-violet-500/[.04] p-4"
              >
                <h4 className="text-xs font-semibold text-violet-300">
                  Record payment received
                </h4>

                <label className="block">
                  <span className="mb-2 block text-[10px] text-slate-400">
                    Amount received (NPR)
                  </span>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(event) =>
                      setPaymentAmount(event.target.value)
                    }
                    placeholder="Enter amount"
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] text-slate-400">
                    Payment method
                  </span>
                  <select
                    value={paymentMethod}
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value as
                        | 'COD'
                        | 'Cash'
                        | 'Bank Transfer'
                        | 'Other'
                      )
                    }
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                  >
                    <option value="COD">COD settlement from courier</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] text-slate-400">
                    Reference (optional)
                  </span>
                  <input
                    value={paymentReference}
                    onChange={(event) =>
                      setPaymentReference(event.target.value)
                    }
                    placeholder="Transaction ID or receipt number"
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] text-slate-400">
                    Notes (optional)
                  </span>
                  <textarea
                    rows={2}
                    value={paymentNotes}
                    onChange={(event) =>
                      setPaymentNotes(event.target.value)
                    }
                    placeholder="Additional payment details"
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                  />
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-violet-500 py-3 text-xs font-semibold text-white transition hover:bg-violet-400 disabled:opacity-50"
                >
                  {saving ? 'Recording...' : 'Record payment'}
                </button>
              </form>
            )}


            {selectedOrder.source !== 'historical' && (
              <div className="mt-5 space-y-3">
                <label className="block">
                  <span className="mb-2 block text-[10px] font-medium text-slate-400">
                    Update order status
                  </span>
                  <select
                    value={selectedOrder.status}
                    disabled={saving}
                    onChange={(event) =>
                      updateOrderStatus(
                        selectedOrder,
                        event.target.value as OrderStatus
                      )
                    }
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                  >
                    {[
                      'New',
                      'Design Approval',
                      'In Production',
                      'Ready to Ship',
                      'Shipped',
                      'Delivered',
                      'Completed',
                      'Cancelled',
                      'Returned',
                    ].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  disabled={saving || selectedOrder.status === 'Cancelled'}
                  onClick={() => cancelOrder(selectedOrder)}
                  className="w-full rounded-xl border border-rose-400/20 py-3 text-xs font-semibold text-rose-300 transition hover:bg-rose-400/10 disabled:opacity-40"
                >
                  {saving ? 'Please wait...' : 'Cancel this order'}
                </button>
              </div>
            )}

            {selectedOrder.source === 'historical' && (
              <p className="mt-5 rounded-lg bg-white/[.03] p-3 text-[10px] text-slate-500">
                This is a historical imported order. Editing and cancellation are disabled.
              </p>
            )}

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-4 w-full rounded-xl bg-violet-500 py-3 text-xs font-semibold text-white hover:bg-violet-400"
            >
              Close details
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
