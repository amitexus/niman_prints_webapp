
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Users, UserPlus, Search, X, Eye, Pencil, Trash2,
  MessageCircle, ShoppingBag, TrendingUp, Building2,
  ChevronDown, MapPin, Mail, Phone, StickyNote,
} from 'lucide-react';

import type {
  Customer,
  CustomerType,
} from '@/lib/customers';

type ApiCustomer = {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  type: CustomerType;
  total_orders: number;
  total_spent: number;
  last_order: string | null;
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type CustomerOrder = {
  id: string;
  order_number: string;
  product_name: string;
  quantity: number;
  total_order: number;
  order_date: string;
  status: string;
  payment_status: string;
  delivery_status: string;
};

type CustomerOrderDetails = {
  id: string;
  order_number: string;
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
  status: string;
  payment_status: string;
  delivery_status: string;
  cod_settlement_status: string;
  cod_settled_amount: number;
  payment_history: Array<Record<string, unknown>>;
  order_date: string;
  delivered_at: string | null;
  source: string;
};

function mapCustomer(customer: ApiCustomer): Customer {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    type: customer.type,
    totalOrders: customer.total_orders,
    totalSpent: customer.total_spent,
    lastOrder: customer.last_order
      ? new Date(customer.last_order).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      : 'No orders yet',
    notes: customer.notes,
  };
}

const money = (amount: number) =>
  `NPR ${amount.toLocaleString('en-IN')}`;
function getOrderStatusStyle(status: string) {
  const styles: Record<string, string> = {
    New: 'bg-blue-400/10 text-blue-300',
    Pending: 'bg-amber-400/10 text-amber-300',
    Processing: 'bg-violet-400/10 text-violet-300',
    Shipped: 'bg-cyan-400/10 text-cyan-300',
    Delivered: 'bg-emerald-400/10 text-emerald-300',
    Cancelled: 'bg-rose-400/10 text-rose-300',
    Returned: 'bg-orange-400/10 text-orange-300',
    Paid: 'bg-emerald-400/10 text-emerald-300',
    Unpaid: 'bg-amber-400/10 text-amber-300',
    PartiallyPaid: 'bg-blue-400/10 text-blue-300',
  };

  return styles[status] || 'bg-slate-400/10 text-slate-300';
}

const typeStyles: Record<CustomerType, string> = {
  Individual: 'bg-blue-400/10 text-blue-300',
  Corporate: 'bg-violet-400/10 text-violet-300',
  Wholesale: 'bg-amber-400/10 text-amber-300',
};

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  type: 'Individual' as CustomerType,
  notes: '',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [purchaseOrders, setPurchaseOrders] = useState<CustomerOrder[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);

  const [selectedOrder, setSelectedOrder] =
    useState<CustomerOrderDetails | null>(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [orderDetailsError, setOrderDetailsError] = useState('');

  async function openOrderDetails(orderId: string) {
    setSelectedOrderId(orderId);
    setOrderDetailsOpen(true);
    setSelectedOrder(null);
    setOrderDetailsError('');

    try {
      setOrderDetailsLoading(true);

      const response = await fetch(
        `/api/orders/${encodeURIComponent(orderId)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to load order details.');
      }

      setSelectedOrder(data);
    } catch (err) {
      setOrderDetailsError(
        err instanceof Error
          ? err.message
          : 'Unable to load order details.'
      );
    } finally {
      setOrderDetailsLoading(false);
    }
  }

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/customers?active_only=true');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Failed to load customers');
        }

        setCustomers(data.map(mapCustomer));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Something went wrong'
        );
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);

  useEffect(() => {
    if (!selectedCustomer) {
      setPurchaseOrders([]);
      setHistoryError('');
      return;
    }

    const customerId = selectedCustomer.id;

    async function loadPurchaseHistory() {
      try {
        setHistoryLoading(true);
        setHistoryError('');

        const response = await fetch(
          `/api/orders?customer_id=${encodeURIComponent(customerId)}&limit=100`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Failed to load purchase history');
        }

        setPurchaseOrders(data);
      } catch (err) {
        setHistoryError(
          err instanceof Error ? err.message : 'Unable to load purchase history'
        );
      } finally {
        setHistoryLoading(false);
      }
    }

    loadPurchaseHistory();
  }, [selectedCustomer]);

  const filtered = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch =
        `${customer.name} ${customer.phone} ${customer.email} ${customer.address}`
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesType =
        activeType === 'All' || customer.type === activeType;

      return matchesSearch && matchesType;
    });
  }, [customers, query, activeType]);

  const totalSpent = customers.reduce(
    (sum, customer) => sum + customer.totalSpent, 0
  );

  const totalOrders = customers.reduce(
    (sum, customer) => sum + customer.totalOrders, 0
  );

  const repeatCustomers = customers.filter(
    customer => customer.totalOrders > 1
  ).length;

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(customer: Customer) {
    setEditingId(customer.id);
    setForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      type: customer.type,
      notes: customer.notes,
    });
    setModalOpen(true);
    setSelectedCustomer(null);
  }

  async function saveCustomer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (saving) return;

    try {
      setSaving(true);
      setError('');

      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        type: form.type,
        notes: form.notes.trim(),
      };

      const response = await fetch(
        editingId
          ? `/api/customers/${editingId}`
          : '/api/customers',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || 'Failed to save customer'
        );
      }

      const savedCustomer = mapCustomer(data);

      if (editingId) {
        setCustomers(previous =>
          previous.map(customer =>
            customer.id === editingId
              ? savedCustomer
              : customer
          )
        );
      } else {
        setCustomers(previous => [
          savedCustomer,
          ...previous,
        ]);
      }

      setModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong'
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteCustomer(id: string) {
    const confirmed = window.confirm(
      'Archive this customer? The record will remain in your database.'
    );

    if (!confirmed) return;

    try {
      setError('');

      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || 'Failed to archive customer'
        );
      }

      setCustomers(previous =>
        previous.filter(customer => customer.id !== id)
      );

      setSelectedCustomer(null);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong'
      );
    }
  }

  function openWhatsApp(phone: string) {
    const number = phone.replace(/\D/g, '');
    const internationalNumber =
      number.startsWith('977') ? number : `977${number}`;

    window.open(
      `https://wa.me/${internationalNumber}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  return (
    <main className="min-w-0 flex-1">
      {/* Header */}
      <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-line bg-[#090b12]/90 px-5 backdrop-blur-xl md:px-8">
        <div>
          <p className="text-[10px] text-slate-500">
            Workspace / Relationships / Customers
          </p>
          <h1 className="mt-1 text-[17px] font-semibold text-white">
            Customer Management
          </h1>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-semibold text-white shadow-glow hover:bg-violet-400"
        >
          <UserPlus size={15} />
          Add Customer
        </button>
      </header>

      <div className="mx-auto max-w-[1500px] space-y-6 p-5 md:p-8">
        {/* Heading */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-violet-300">
            Customer relationships
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Know your customers
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Manage customer profiles, purchase history and relationships.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="rounded-xl border border-violet-400/15 bg-violet-400/[.05] px-4 py-3">
            <p className="text-[11px] font-medium text-violet-200">
              Loading customers from database...
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/[.05] px-4 py-3">
            <p className="text-[11px] font-semibold text-red-200">
              Could not load customers
            </p>
            <p className="mt-1 text-[10px] text-red-200/70">
              {error}
            </p>
          </div>
        )}

        {/* Statistics */}
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Total customers',
              value: customers.length,
              icon: Users,
              color: 'text-violet-300',
            },
            {
              label: 'Repeat customers',
              value: repeatCustomers,
              icon: TrendingUp,
              color: 'text-emerald-300',
            },
            {
              label: 'Total orders',
              value: totalOrders,
              icon: ShoppingBag,
              color: 'text-blue-300',
            },
            {
              label: 'Lifetime spending',
              value: money(totalSpent),
              icon: Building2,
              color: 'text-amber-300',
            },
          ].map(item => {
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

        {/* Customer directory */}
        <section className="overflow-hidden rounded-2xl border border-line bg-panel">
          <div className="flex flex-col justify-between gap-4 border-b border-line p-5 lg:flex-row lg:items-center">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Customer directory
              </h3>
              <p className="mt-1 text-[10px] text-slate-500">
                {filtered.length} customers found
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex min-w-[190px] flex-1 items-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2.5 lg:flex-none">
                <Search size={14} className="text-slate-500" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search customers..."
                  className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-600"
                />
              </div>

              <select
                value={activeType}
                onChange={e => setActiveType(e.target.value)}
                className="rounded-xl border border-line bg-canvas px-3 py-2.5 text-xs text-slate-300 outline-none"
              >
                <option value="All">All types</option>
                <option value="Individual">Individual</option>
                <option value="Corporate">Corporate</option>
                <option value="Wholesale">Wholesale</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="bg-white/[.015] text-[9px] uppercase tracking-wider text-slate-600">
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-3 py-4">Customer type</th>
                  <th className="px-3 py-4">Orders</th>
                  <th className="px-3 py-4">Lifetime value</th>
                  <th className="px-3 py-4">Last order</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(customer => (
                  <tr
                    key={customer.id}
                    className="border-t border-line/70 text-[11px] transition hover:bg-white/[.02]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-400/10 text-xs font-semibold text-violet-300">
                          {customer.name
                            .split(' ')
                            .map(part => part[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">
                            {customer.name}
                          </p>
                          <p className="mt-1 text-[9px] text-slate-500">
                            {customer.phone}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      <span className={`rounded-md px-2 py-1 text-[9px] ${typeStyles[customer.type]}`}>
                        {customer.type}
                      </span>
                    </td>

                    <td className="px-3 py-4 text-slate-300">
                      {customer.totalOrders}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 font-semibold text-white">
                      {money(customer.totalSpent)}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-slate-400">
                      {customer.lastOrder}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          title="View customer"
                          className="rounded-lg border border-line p-2 text-slate-400 hover:text-violet-300"
                        >
                          <Eye size={13} />
                        </button>

                        <button
                          onClick={() => openEdit(customer)}
                          title="Edit customer"
                          className="rounded-lg border border-line p-2 text-slate-400 hover:text-violet-300"
                        >
                          <Pencil size={13} />
                        </button>

                        <button
                          onClick={() => openWhatsApp(customer.phone)}
                          title="Contact on WhatsApp"
                          className="rounded-lg border border-line p-2 text-slate-400 hover:text-emerald-300"
                        >
                          <MessageCircle size={13} />
                        </button>

                        <button
                          onClick={() => deleteCustomer(customer.id)}
                          title="Delete customer"
                          className="rounded-lg border border-line p-2 text-slate-400 hover:text-rose-300"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="py-14 text-center">
                <Users size={28} className="mx-auto text-slate-600" />
                <p className="mt-3 text-xs text-slate-300">
                  No customers found
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  Try changing your search or customer type.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Add / Edit customer */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-lg rounded-2xl border border-line bg-panel shadow-2xl">
            <div className="flex items-center justify-between border-b border-line p-5">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {editingId ? 'Edit customer' : 'Add new customer'}
                </h3>
                <p className="mt-1 text-[10px] text-slate-500">
                  Customer contact and business information.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={saveCustomer} className="space-y-4 p-5">
              {[
                { label: 'Customer name', key: 'name', placeholder: 'Full name or company', type: 'text' },
                { label: 'Phone number', key: 'phone', placeholder: '98XXXXXXXX', type: 'tel' },
                { label: 'Email address', key: 'email', placeholder: 'customer@example.com', type: 'email' },
                { label: 'Address', key: 'address', placeholder: 'City, District, Nepal', type: 'text' },
              ].map(field => (
                <label key={field.key} className="block">
                  <span className="mb-2 block text-[10px] font-medium text-slate-400">
                    {field.label}
                  </span>
                  <input
                    required={field.key === 'name' || field.key === 'phone'}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.key as keyof typeof form]}
                    onChange={e => setForm(previous => ({
                      ...previous,
                      [field.key]: e.target.value,
                    }))}
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                  />
                </label>
              ))}

              <label className="block">
                <span className="mb-2 block text-[10px] font-medium text-slate-400">
                  Customer type
                </span>
                <select
                  value={form.type}
                  onChange={e => setForm(previous => ({
                    ...previous,
                    type: e.target.value as CustomerType,
                  }))}
                  className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none"
                >
                  <option>Individual</option>
                  <option>Corporate</option>
                  <option>Wholesale</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-medium text-slate-400">
                  Customer notes
                </span>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={e => setForm(previous => ({
                    ...previous,
                    notes: e.target.value,
                  }))}
                  placeholder="Preferences, requirements, special instructions..."
                  className="w-full resize-y rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                />
              </label>

              <div className="flex justify-end gap-2 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-line px-4 py-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-violet-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-violet-400"
                >
                  {editingId ? 'Save changes' : 'Add customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer details */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-md rounded-2xl border border-line bg-panel p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500">Customer profile</p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  {selectedCustomer.name}
                </h3>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {[
                { icon: Phone, label: 'Phone', value: selectedCustomer.phone },
                { icon: Mail, label: 'Email', value: selectedCustomer.email || 'Not provided' },
                { icon: MapPin, label: 'Address', value: selectedCustomer.address || 'Not provided' },
                { icon: ShoppingBag, label: 'Total orders', value: String(selectedCustomer.totalOrders) },
                { icon: TrendingUp, label: 'Lifetime spending', value: money(selectedCustomer.totalSpent) },
                { icon: StickyNote, label: 'Notes', value: selectedCustomer.notes || 'No notes' },
              ].map(item => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="flex gap-3 border-b border-line pb-3">
                    <Icon size={15} className="mt-0.5 text-violet-300" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] text-slate-500">{item.label}</p>
                      <p className="mt-1 break-words text-xs text-slate-200">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Purchase History */}
            <div className="mt-6 border-t border-line pt-5">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-xs font-semibold text-white">
                  Purchase History
                </h4>
                <span className="text-[10px] text-slate-500">
                  {purchaseOrders.length} orders
                </span>
              </div>

              {historyLoading && (
                <p className="py-4 text-center text-[11px] text-violet-300">
                  Loading purchase history...
                </p>
              )}

              {historyError && (
                <p className="py-3 text-[11px] text-red-300">
                  {historyError}
                </p>
              )}

              {!historyLoading && !historyError && purchaseOrders.length === 0 && (
                <p className="rounded-xl border border-line bg-canvas p-4 text-center text-[11px] text-slate-500">
                  No purchase history found.
                </p>
              )}

              {!historyLoading && purchaseOrders.length > 0 && (
                <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                  {purchaseOrders.map(order => (
                    <div
                      key={order.id}
                      className="rounded-xl border border-line bg-canvas p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold text-white">
                            {order.product_name}
                          </p>
                          <button
                            type="button"
                            onClick={() => openOrderDetails(order.id)}
                            className="mt-1 text-left text-[10px] font-medium text-violet-300 transition hover:text-violet-200 hover:underline"
                          >
                            {order.order_number} <span>↗</span>
                          </button>
                          <p className="mt-1 text-[9px] text-slate-500">
                            {new Date(order.order_date).toLocaleDateString('en-GB')}
                            {' · '}Qty: {order.quantity}
                          </p>
                        </div>

                        <p className="whitespace-nowrap text-xs font-semibold text-white">
                          {money(order.total_order)}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className={`rounded-md px-2 py-1 text-[9px] ${getOrderStatusStyle(order.status)}`}>
                          {order.status}
                        </span>

                        <span className={`rounded-md px-2 py-1 text-[9px] ${getOrderStatusStyle(order.payment_status)}`}>
                          {order.payment_status}
                        </span>

                        <span className={`rounded-md px-2 py-1 text-[9px] ${getOrderStatusStyle(order.delivery_status)}`}>
                          {order.delivery_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => openWhatsApp(selectedCustomer.phone)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/10 py-3 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20"
              >
                <MessageCircle size={14} />
                WhatsApp
              </button>

              <button
                onClick={() => openEdit(selectedCustomer)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-500 py-3 text-xs font-semibold text-white hover:bg-violet-400"
              >
                <Pencil size={14} />
                Edit profile
              </button>
            </div>
          </div>
        
        </div>
      )}

      {/* Order Details Modal */}
      {orderDetailsOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-lg rounded-2xl border border-line bg-panel shadow-2xl">

            <div className="flex items-center justify-between border-b border-line p-5">
              <div>
                <p className="text-[10px] text-violet-300">
                  Customer Purchase
                </p>
                <h3 className="mt-1 text-sm font-semibold text-white">
                  Order Details
                </h3>
                <p className="mt-1 text-[10px] text-slate-500">
                  {selectedOrder?.order_number || selectedOrderId}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOrderDetailsOpen(false);
                  setSelectedOrder(null);
                  setSelectedOrderId(null);
                  setOrderDetailsError('');
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5"
              >
                <X size={17} />
              </button>
            </div>

            <div className="max-h-[75vh] space-y-5 overflow-y-auto p-5">

              {orderDetailsLoading && (
                <p className="py-10 text-center text-xs text-violet-300">
                  Loading order details...
                </p>
              )}

              {orderDetailsError && (
                <p className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-xs text-red-300">
                  {orderDetailsError}
                </p>
              )}

              {!orderDetailsLoading && !orderDetailsError && selectedOrder && (
                <>
                  <div className="rounded-xl border border-line bg-canvas p-4">
                    <p className="text-[10px] text-slate-500">Product</p>
                    <h4 className="mt-1 text-sm font-semibold text-white">
                      {selectedOrder.product_name}
                    </h4>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Order date: {new Date(selectedOrder.order_date).toLocaleString('en-GB')}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className={`rounded-md px-2 py-1 text-[9px] ${getOrderStatusStyle(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                      <span className={`rounded-md px-2 py-1 text-[9px] ${getOrderStatusStyle(selectedOrder.payment_status)}`}>
                        {selectedOrder.payment_status}
                      </span>
                      <span className={`rounded-md px-2 py-1 text-[9px] ${getOrderStatusStyle(selectedOrder.delivery_status)}`}>
                        {selectedOrder.delivery_status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 text-xs font-semibold text-white">
                      Order Information
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Quantity', value: String(selectedOrder.quantity) },
                        { label: 'Unit price', value: money(selectedOrder.rate) },
                        { label: 'Delivery charge', value: money(selectedOrder.delivery_charge) },
                        { label: 'Delivery type', value: selectedOrder.delivery_type },
                        { label: 'Online payment', value: money(selectedOrder.online_payment) },
                        { label: 'COD amount', value: money(selectedOrder.cod_amount) },
                      ].map(item => (
                        <div key={item.label} className="rounded-xl border border-line bg-canvas p-3">
                          <p className="text-[9px] text-slate-500">{item.label}</p>
                          <p className="mt-1 text-xs font-medium text-slate-200">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-violet-400/20 bg-violet-400/5 p-4">
                    <p className="text-[10px] text-violet-300">
                      Total Order Value
                    </p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {money(selectedOrder.total_order)}
                    </p>
                  </div>

                  <div>
                    <h4 className="mb-3 text-xs font-semibold text-white">
                      Customer Information
                    </h4>
                    <div className="space-y-3 rounded-xl border border-line bg-canvas p-4">
                      <div>
                        <p className="text-[9px] text-slate-500">Customer name</p>
                        <p className="mt-1 text-xs text-slate-200">
                          {selectedOrder.customer_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500">Phone</p>
                        <p className="mt-1 text-xs text-slate-200">
                          {selectedOrder.customer_phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500">Delivery address</p>
                        <p className="mt-1 text-xs text-slate-200">
                          {selectedOrder.customer_address || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 text-xs font-semibold text-white">
                      COD Settlement
                    </h4>
                    <div className="rounded-xl border border-line bg-canvas p-4">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500">Settlement status</span>
                        <span className="text-slate-200">
                          {selectedOrder.cod_settlement_status}
                        </span>
                      </div>
                      <div className="mt-3 flex justify-between text-[10px]">
                        <span className="text-slate-500">Settled amount</span>
                        <span className="font-semibold text-white">
                          {money(selectedOrder.cod_settled_amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500">
                    Payment records: {selectedOrder.payment_history.length}
                    <span className="mx-2">·</span>
                    Source: {selectedOrder.source}
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-line p-4">
              <button
                type="button"
                onClick={() => {
                  setOrderDetailsOpen(false);
                  setSelectedOrder(null);
                  setSelectedOrderId(null);
                  setOrderDetailsError('');
                }}
                className="w-full rounded-xl border border-line py-3 text-xs font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

