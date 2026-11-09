
'use client';

import { useMemo, useState } from 'react';
import {
  Search, Plus, X, Users, Building2, ShoppingCart,
  Wallet, Eye, Pencil, Trash2, Phone, MapPin,
  PackageCheck, ArrowDownToLine, AlertCircle,
} from 'lucide-react';

import {
  initialSuppliers,
  initialPurchases,
  type Supplier,
  type PurchaseOrder,
  type SupplierCountry,
  type PurchaseStatus,
} from '@/lib/suppliers';

import { initialInventory } from '@/lib/inventory';

const money = (amount: number, currency: 'NPR' | 'INR') =>
  `${currency} ${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`;

const supplierEmpty = {
  name: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  country: 'Nepal' as SupplierCountry,
  category: 'General',
  openingBalance: '0',
  notes: '',
};

const purchaseEmpty = {
  supplierId: '',
  inventoryItemId: '',
  quantity: '1',
  unitCost: '0',
  currency: 'NPR' as 'NPR' | 'INR',
  exchangeRate: '1',
  additionalCharges: '0',
  paidAmount: '0',
  expectedDate: '',
  notes: '',
};

const statusStyles: Record<PurchaseStatus, string> = {
  Draft: 'bg-slate-400/10 text-slate-300',
  Ordered: 'bg-blue-400/10 text-blue-300',
  'Partially Received': 'bg-amber-400/10 text-amber-300',
  Received: 'bg-emerald-400/10 text-emerald-300',
  Cancelled: 'bg-rose-400/10 text-rose-300',
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [purchases, setPurchases] = useState(initialPurchases);

  const [query, setQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [purchaseFilter, setPurchaseFilter] = useState('All');

  const [supplierModal, setSupplierModal] = useState(false);
  const [purchaseModal, setPurchaseModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseOrder | null>(null);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);

  const [supplierForm, setSupplierForm] = useState(supplierEmpty);
  const [purchaseForm, setPurchaseForm] = useState(purchaseEmpty);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesSearch =
        `${supplier.name} ${supplier.contactPerson} ${supplier.phone} ${supplier.address}`
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesCountry =
        countryFilter === 'All' || supplier.country === countryFilter;

      return matchesSearch && matchesCountry;
    });
  }, [suppliers, query, countryFilter]);

  const filteredPurchases = purchases.filter(purchase =>
    purchaseFilter === 'All' || purchase.status === purchaseFilter
  );

  const indiaSuppliers = suppliers.filter(s => s.country === 'India').length;
  const nepalSuppliers = suppliers.filter(s => s.country === 'Nepal').length;

  const outstandingNPR = purchases
    .filter(p => p.status !== 'Cancelled')
    .reduce((sum, p) => sum + Math.max(0, p.nprEquivalent - p.paidAmount * p.exchangeRate), 0)
    + suppliers.reduce((sum, s) => sum + s.openingBalance * (s.currency === 'INR' ? 1.6 : 1), 0);

  const purchaseValueNPR = purchases
    .filter(p => p.status !== 'Cancelled')
    .reduce((sum, p) => sum + p.nprEquivalent, 0);

  function openAddSupplier() {
    setEditingSupplierId(null);
    setSupplierForm(supplierEmpty);
    setSupplierModal(true);
  }

  function openEditSupplier(supplier: Supplier) {
    setEditingSupplierId(supplier.id);
    setSupplierForm({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      country: supplier.country,
      category: supplier.category,
      openingBalance: String(supplier.openingBalance),
      notes: supplier.notes,
    });
    setSupplierModal(true);
    setSelectedSupplier(null);
  }

  function saveSupplier(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const openingBalance = Number(supplierForm.openingBalance);

    if (!Number.isFinite(openingBalance) || openingBalance < 0) {
      alert('Enter a valid opening balance.');
      return;
    }

    const updated: Supplier = {
      id: editingSupplierId ?? `SUP-${Date.now()}`,
      name: supplierForm.name.trim(),
      contactPerson: supplierForm.contactPerson.trim(),
      phone: supplierForm.phone.trim(),
      email: supplierForm.email.trim(),
      address: supplierForm.address.trim(),
      country: supplierForm.country,
      currency: supplierForm.country === 'India' ? 'INR' : 'NPR',
      category: supplierForm.category.trim() || 'General',
      openingBalance,
      notes: supplierForm.notes.trim(),
    };

    if (editingSupplierId) {
      setSuppliers(previous =>
        previous.map(s => s.id === editingSupplierId ? updated : s)
      );
    } else {
      setSuppliers(previous => [updated, ...previous]);
    }

    setSupplierModal(false);
    setEditingSupplierId(null);
    setSupplierForm(supplierEmpty);
  }

  function deleteSupplier(id: string) {
    const hasPurchases = purchases.some(
      purchase => purchase.supplierId === id && purchase.status !== 'Cancelled'
    );

    if (hasPurchases) {
      alert('This supplier has purchase records. Cancel or retain those records before deleting the supplier.');
      return;
    }

    if (!window.confirm('Delete this supplier?')) return;

    setSuppliers(previous => previous.filter(s => s.id !== id));
    setSelectedSupplier(null);
  }

  function openNewPurchase() {
    if (suppliers.length === 0) {
      alert('Add a supplier before creating a purchase order.');
      return;
    }

    setPurchaseForm({
      ...purchaseEmpty,
      supplierId: suppliers[0].id,
      inventoryItemId: initialInventory[0]?.id ?? '',
      currency: suppliers[0].currency,
      exchangeRate: suppliers[0].currency === 'INR' ? '1.6' : '1',
    });

    setPurchaseModal(true);
  }

  function savePurchase(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const supplier = suppliers.find(s => s.id === purchaseForm.supplierId);
    const inventoryItem = initialInventory.find(
      item => item.id === purchaseForm.inventoryItemId
    );

    const quantity = Number(purchaseForm.quantity);
    const unitCost = Number(purchaseForm.unitCost);
    const charges = Number(purchaseForm.additionalCharges);
    const exchangeRate = Number(purchaseForm.exchangeRate);
    const paidAmount = Number(purchaseForm.paidAmount);

    if (!supplier || !inventoryItem) {
      alert('Select a valid supplier and inventory item.');
      return;
    }

    if (
      !Number.isInteger(quantity) || quantity <= 0 ||
      !Number.isFinite(unitCost) || unitCost < 0 ||
      !Number.isFinite(charges) || charges < 0 ||
      !Number.isFinite(exchangeRate) || exchangeRate <= 0 ||
      !Number.isFinite(paidAmount) || paidAmount < 0
    ) {
      alert('Please enter valid purchase amounts and quantities.');
      return;
    }

    const subtotal = quantity * unitCost;
    const total = subtotal + charges;

    if (paidAmount > total) {
      alert('Paid amount cannot exceed the purchase total.');
      return;
    }

    const currency = purchaseForm.currency;
    const rate = currency === 'NPR' ? 1 : exchangeRate;

    const newPurchase: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      date: new Date().toISOString().slice(0, 10),
      expectedDate: purchaseForm.expectedDate,
      currency,
      exchangeRate: rate,
      items: [{
        inventoryItemId: inventoryItem.id,
        itemName: inventoryItem.name,
        quantity,
        unitCost,
        receivedQuantity: 0,
      }],
      subtotal,
      additionalCharges: charges,
      total,
      nprEquivalent: total * rate,
      paidAmount,
      status: 'Ordered',
      notes: purchaseForm.notes.trim(),
    };

    setPurchases(previous => [newPurchase, ...previous]);
    setPurchaseModal(false);
    setPurchaseForm(purchaseEmpty);
  }

  function receivePurchase(purchase: PurchaseOrder) {
    if (purchase.status === 'Received' || purchase.status === 'Cancelled') return;

    const remaining = purchase.items.reduce(
      (sum, item) => sum + item.quantity - item.receivedQuantity,
      0
    );

    if (remaining <= 0) return;

    if (!window.confirm(`Mark all remaining ${remaining} units as received?`)) {
      return;
    }

    const updated: PurchaseOrder = {
      ...purchase,
      items: purchase.items.map(item => ({
        ...item,
        receivedQuantity: item.quantity,
      })),
      status: 'Received',
    };

    setPurchases(previous =>
      previous.map(p => p.id === purchase.id ? updated : p)
    );

    setSelectedPurchase(updated);
    alert('Purchase marked as received. Inventory synchronization will be enabled in the integration phase.');
  }

  function cancelPurchase(purchase: PurchaseOrder) {
    if (purchase.status === 'Received') {
      alert('A received purchase cannot be cancelled here. Use a stock adjustment for returned goods.');
      return;
    }

    if (!window.confirm('Cancel this purchase order?')) return;

    setPurchases(previous =>
      previous.map(p =>
        p.id === purchase.id ? { ...p, status: 'Cancelled' } : p
      )
    );

    setSelectedPurchase(null);
  }

  return (
    <main className="min-w-0 flex-1">
      {/* Header */}
      <header className="sticky top-0 z-20 flex min-h-[76px] items-center justify-between gap-3 border-b border-line bg-[#090b12]/90 px-5 backdrop-blur-xl md:px-8">
        <div>
          <p className="text-[10px] text-slate-500">
            Workspace / Operations / Suppliers
          </p>
          <h1 className="mt-1 text-[17px] font-semibold text-white">
            Suppliers & Purchases
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={openAddSupplier}
            className="flex items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-xs text-slate-300 hover:bg-white/5"
          >
            <Users size={14} />
            <span className="hidden sm:inline">Add supplier</span>
          </button>
          <button
            onClick={openNewPurchase}
            className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-400"
          >
            <Plus size={15} />
            New purchase
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] space-y-6 p-5 md:p-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-violet-300">
            Procurement and vendor relationships
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Manage your suppliers
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Track Nepal and India suppliers, purchase orders and payments.
          </p>
        </div>

        <div className="rounded-xl border border-amber-400/15 bg-amber-400/[.05] px-4 py-3">
          <p className="text-[11px] font-semibold text-amber-100">
            Preview mode · Sample supplier and purchase data
          </p>
          <p className="mt-1 text-[10px] text-amber-100/55">
            Changes are temporary. Receiving a purchase updates its status only; shared inventory synchronization is not connected yet.
          </p>
        </div>

        {/* Summary cards */}
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total suppliers', value: suppliers.length, icon: Users, color: 'text-violet-300' },
            { label: 'Nepal suppliers', value: nepalSuppliers, icon: Building2, color: 'text-blue-300' },
            { label: 'India suppliers', value: indiaSuppliers, icon: MapPin, color: 'text-amber-300' },
            { label: 'Purchase value (NPR equiv.)', value: money(purchaseValueNPR, 'NPR'), icon: ShoppingCart, color: 'text-emerald-300' },
          ].map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-2xl border border-line bg-panel p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-slate-400">{card.label}</p>
                  <Icon size={17} className={card.color} />
                </div>
                <p className="mt-4 text-xl font-semibold text-white">{card.value}</p>
              </div>
            );
          })}
        </section>

        {/* Supplier directory */}
        <section className="overflow-hidden rounded-2xl border border-line bg-panel">
          <div className="flex flex-col justify-between gap-4 border-b border-line p-5 lg:flex-row lg:items-center">
            <div>
              <h3 className="text-sm font-semibold text-white">Supplier directory</h3>
              <p className="mt-1 text-[10px] text-slate-500">{filteredSuppliers.length} suppliers</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex min-w-[190px] flex-1 items-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2.5 lg:flex-none">
                <Search size={14} className="text-slate-500" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search suppliers..."
                  className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-600"
                />
              </div>
              <select
                value={countryFilter}
                onChange={e => setCountryFilter(e.target.value)}
                className="rounded-xl border border-line bg-canvas px-3 py-2.5 text-xs text-slate-300 outline-none"
              >
                <option value="All">All countries</option>
                <option value="Nepal">Nepal</option>
                <option value="India">India</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="bg-white/[.015] text-[9px] uppercase tracking-wider text-slate-600">
                  <th className="px-5 py-4">Supplier</th>
                  <th className="px-3 py-4">Country</th>
                  <th className="px-3 py-4">Category</th>
                  <th className="px-3 py-4">Currency</th>
                  <th className="px-3 py-4">Purchases</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map(supplier => {
                  const supplierPurchases = purchases.filter(
                    p => p.supplierId === supplier.id && p.status !== 'Cancelled'
                  );

                  return (
                    <tr key={supplier.id} className="border-t border-line/70 text-[11px] hover:bg-white/[.02]">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-200">{supplier.name}</p>
                        <p className="mt-1 text-[9px] text-slate-500">{supplier.contactPerson} · {supplier.phone}</p>
                      </td>
                      <td className="px-3 py-4 text-slate-300">{supplier.country}</td>
                      <td className="px-3 py-4 text-slate-400">{supplier.category}</td>
                      <td className="px-3 py-4 font-semibold text-slate-200">{supplier.currency}</td>
                      <td className="px-3 py-4 text-slate-300">{supplierPurchases.length}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setSelectedSupplier(supplier)}
                            title="View supplier"
                            className="rounded-lg border border-line p-2 text-slate-400 hover:text-violet-300"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => openEditSupplier(supplier)}
                            title="Edit supplier"
                            className="rounded-lg border border-line p-2 text-slate-400 hover:text-violet-300"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => deleteSupplier(supplier.id)}
                            title="Delete supplier"
                            className="rounded-lg border border-line p-2 text-slate-400 hover:text-rose-300"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredSuppliers.length === 0 && (
              <p className="py-12 text-center text-xs text-slate-500">No suppliers found.</p>
            )}
          </div>
        </section>

        {/* Purchase orders */}
        <section className="overflow-hidden rounded-2xl border border-line bg-panel">
          <div className="flex flex-col justify-between gap-3 border-b border-line p-5 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-sm font-semibold text-white">Purchase orders</h3>
              <p className="mt-1 text-[10px] text-slate-500">
                Purchase and goods-receipt tracking
              </p>
            </div>
            <select
              value={purchaseFilter}
              onChange={e => setPurchaseFilter(e.target.value)}
              className="rounded-xl border border-line bg-canvas px-3 py-2.5 text-xs text-slate-300 outline-none"
            >
              <option value="All">All purchase statuses</option>
              <option>Draft</option>
              <option>Ordered</option>
              <option>Partially Received</option>
              <option>Received</option>
              <option>Cancelled</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="bg-white/[.015] text-[9px] uppercase tracking-wider text-slate-600">
                  <th className="px-5 py-4">Purchase ID</th>
                  <th className="px-3 py-4">Supplier</th>
                  <th className="px-3 py-4">Date</th>
                  <th className="px-3 py-4">Total</th>
                  <th className="px-3 py-4">Paid</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map(purchase => (
                  <tr key={purchase.id} className="border-t border-line/70 text-[11px] hover:bg-white/[.02]">
                    <td className="px-5 py-4 font-semibold text-slate-200">{purchase.id}</td>
                    <td className="px-3 py-4 text-slate-300">{purchase.supplierName}</td>
                    <td className="px-3 py-4 text-slate-400">{purchase.date}</td>
                    <td className="px-3 py-4 font-semibold text-white">
                      {money(purchase.total, purchase.currency)}
                    </td>
                    <td className="px-3 py-4 text-slate-300">
                      {money(purchase.paidAmount, purchase.currency)}
                    </td>
                    <td className="px-3 py-4">
                      <span className={`rounded-md px-2 py-1 text-[9px] ${statusStyles[purchase.status]}`}>
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedPurchase(purchase)}
                        className="rounded-lg border border-line px-3 py-2 text-[10px] text-slate-300 hover:text-violet-300"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPurchases.length === 0 && (
              <p className="py-12 text-center text-xs text-slate-500">No purchase orders found.</p>
            )}
          </div>
        </section>

        {/* Outstanding balance note */}
        <section className="rounded-2xl border border-line bg-panel p-5">
          <div className="flex items-start gap-3">
            <Wallet size={18} className="mt-0.5 text-amber-300" />
            <div>
              <h3 className="text-sm font-semibold text-white">Estimated outstanding balance</h3>
              <p className="mt-2 text-xl font-semibold text-amber-200">
                {money(outstandingNPR, 'NPR')}
              </p>
              <p className="mt-2 text-[10px] leading-5 text-slate-500">
                This estimate converts INR using each purchase's stored exchange rate and includes supplier opening balances. It is a preview calculation, not a reconciled accounting ledger.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Supplier create/edit modal */}
      {supplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-lg rounded-2xl border border-line bg-panel shadow-2xl">
            <div className="flex items-center justify-between border-b border-line p-5">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {editingSupplierId ? 'Edit supplier' : 'Add supplier'}
                </h3>
                <p className="mt-1 text-[10px] text-slate-500">Supplier contact and payment details.</p>
              </div>
              <button onClick={() => setSupplierModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/5">
                <X size={17} />
              </button>
            </div>

            <form onSubmit={saveSupplier} className="space-y-4 p-5">
              {[
                { key: 'name', label: 'Supplier / business name', required: true },
                { key: 'contactPerson', label: 'Contact person', required: false },
                { key: 'phone', label: 'Phone number', required: true },
                { key: 'email', label: 'Email address', required: false },
                { key: 'address', label: 'Full address', required: true },
                { key: 'category', label: 'Supply category', required: false },
              ].map(field => (
                <label key={field.key} className="block">
                  <span className="mb-2 block text-[10px] text-slate-400">{field.label}</span>
                  <input
                    required={field.required}
                    type={field.key === 'email' ? 'email' : 'text'}
                    value={supplierForm[field.key as keyof typeof supplierForm]}
                    onChange={e => setSupplierForm(p => ({ ...p, [field.key]: e.target.value }))}
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                  />
                </label>
              ))}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[10px] text-slate-400">Country</span>
                  <select
                    value={supplierForm.country}
                    onChange={e => setSupplierForm(p => ({ ...p, country: e.target.value as SupplierCountry }))}
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none"
                  >
                    <option>Nepal</option>
                    <option>India</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] text-slate-400">Opening balance ({supplierForm.country === 'India' ? 'INR' : 'NPR'})</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={supplierForm.openingBalance}
                    onChange={e => setSupplierForm(p => ({ ...p, openingBalance: e.target.value }))}
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-[10px] text-slate-400">Notes</span>
                <textarea
                  rows={3}
                  value={supplierForm.notes}
                  onChange={e => setSupplierForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none"
                />
              </label>

              <div className="flex justify-end gap-2 border-t border-line pt-4">
                <button type="button" onClick={() => setSupplierModal(false)} className="rounded-xl border border-line px-4 py-2.5 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="rounded-xl bg-violet-500 px-5 py-2.5 text-xs font-semibold text-white">
                  {editingSupplierId ? 'Save changes' : 'Add supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase create modal */}
      {purchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-lg rounded-2xl border border-line bg-panel shadow-2xl">
            <div className="flex items-center justify-between border-b border-line p-5">
              <div>
                <h3 className="text-sm font-semibold text-white">Create purchase order</h3>
                <p className="mt-1 text-[10px] text-slate-500">Record a supplier purchase.</p>
              </div>
              <button onClick={() => setPurchaseModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/5">
                <X size={17} />
              </button>
            </div>

            <form onSubmit={savePurchase} className="space-y-4 p-5">
              <label className="block">
                <span className="mb-2 block text-[10px] text-slate-400">Supplier</span>
                <select
                  required
                  value={purchaseForm.supplierId}
                  onChange={e => {
                    const supplier = suppliers.find(s => s.id === e.target.value);
                    setPurchaseForm(p => ({
                      ...p,
                      supplierId: e.target.value,
                      currency: supplier?.currency ?? 'NPR',
                      exchangeRate: supplier?.currency === 'INR' ? '1.6' : '1',
                    }));
                  }}
                  className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} · {s.country}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] text-slate-400">Inventory item</span>
                <select
                  required
                  value={purchaseForm.inventoryItemId}
                  onChange={e => setPurchaseForm(p => ({ ...p, inventoryItemId: e.target.value }))}
                  className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none"
                >
                  {initialInventory.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-2 block text-[10px] text-slate-400">Quantity</span>
                  <input required type="number" min="1" step="1" value={purchaseForm.quantity} onChange={e => setPurchaseForm(p => ({ ...p, quantity: e.target.value }))} className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[10px] text-slate-400">Unit cost ({purchaseForm.currency})</span>
                  <input required type="number" min="0" step="any" value={purchaseForm.unitCost} onChange={e => setPurchaseForm(p => ({ ...p, unitCost: e.target.value }))} className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-2 block text-[10px] text-slate-400">Currency</span>
                  <select value={purchaseForm.currency} onChange={e => setPurchaseForm(p => ({ ...p, currency: e.target.value as 'NPR' | 'INR', exchangeRate: e.target.value === 'NPR' ? '1' : '1.6' }))} className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none">
                    <option value="NPR">NPR</option>
                    <option value="INR">INR</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[10px] text-slate-400">NPR per 1 {purchaseForm.currency}</span>
                  <input required type="number" min="0.0001" step="any" disabled={purchaseForm.currency === 'NPR'} value={purchaseForm.exchangeRate} onChange={e => setPurchaseForm(p => ({ ...p, exchangeRate: e.target.value }))} className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none disabled:opacity-50" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-2 block text-[10px] text-slate-400">Additional charges ({purchaseForm.currency})</span>
                  <input type="number" min="0" step="any" value={purchaseForm.additionalCharges} onChange={e => setPurchaseForm(p => ({ ...p, additionalCharges: e.target.value }))} className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[10px] text-slate-400">Amount paid ({purchaseForm.currency})</span>
                  <input type="number" min="0" step="any" value={purchaseForm.paidAmount} onChange={e => setPurchaseForm(p => ({ ...p, paidAmount: e.target.value }))} className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none" />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-[10px] text-slate-400">Expected delivery date</span>
                <input type="date" value={purchaseForm.expectedDate} onChange={e => setPurchaseForm(p => ({ ...p, expectedDate: e.target.value }))} className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none" />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] text-slate-400">Purchase notes</span>
                <textarea rows={2} value={purchaseForm.notes} onChange={e => setPurchaseForm(p => ({ ...p, notes: e.target.value }))} className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none" />
              </label>

              <div className="rounded-xl border border-line bg-canvas p-3">
                <p className="text-[10px] text-slate-500">Estimated purchase total</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {money(
                    Number(purchaseForm.quantity || 0) * Number(purchaseForm.unitCost || 0) + Number(purchaseForm.additionalCharges || 0),
                    purchaseForm.currency
                  )}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  NPR equivalent: {money(
                    (Number(purchaseForm.quantity || 0) * Number(purchaseForm.unitCost || 0) + Number(purchaseForm.additionalCharges || 0)) *
                    (purchaseForm.currency === 'NPR' ? 1 : Number(purchaseForm.exchangeRate || 0)),
                    'NPR'
                  )}
                </p>
              </div>

              <div className="flex justify-end gap-2 border-t border-line pt-4">
                <button type="button" onClick={() => setPurchaseModal(false)} className="rounded-xl border border-line px-4 py-2.5 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="rounded-xl bg-violet-500 px-5 py-2.5 text-xs font-semibold text-white">Create purchase</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier detail modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-md rounded-2xl border border-line bg-panel p-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] text-slate-500">Supplier profile</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{selectedSupplier.name}</h3>
              </div>
              <button onClick={() => setSelectedSupplier(null)} className="rounded-lg p-2 text-slate-400"><X size={17} /></button>
            </div>

            <div className="mt-5 space-y-4">
              {[
                ['Contact person', selectedSupplier.contactPerson || 'Not provided'],
                ['Phone', selectedSupplier.phone],
                ['Email', selectedSupplier.email || 'Not provided'],
                ['Address', selectedSupplier.address],
                ['Country', selectedSupplier.country],
                ['Currency', selectedSupplier.currency],
                ['Category', selectedSupplier.category],
                ['Opening balance', money(selectedSupplier.openingBalance, selectedSupplier.currency)],
                ['Notes', selectedSupplier.notes || 'No notes'],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-line pb-3">
                  <p className="text-[9px] text-slate-500">{label}</p>
                  <p className="mt-1 break-words text-xs text-slate-200">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-2">
              <button onClick={() => openEditSupplier(selectedSupplier)} className="flex-1 rounded-xl bg-violet-500 py-3 text-xs font-semibold text-white">
                Edit supplier
              </button>
              <button onClick={() => setSelectedSupplier(null)} className="flex-1 rounded-xl border border-line py-3 text-xs text-slate-300">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase detail modal */}
      {selectedPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-md rounded-2xl border border-line bg-panel p-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] text-slate-500">Purchase order · {selectedPurchase.id}</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{selectedPurchase.supplierName}</h3>
              </div>
              <button onClick={() => setSelectedPurchase(null)} className="rounded-lg p-2 text-slate-400"><X size={17} /></button>
            </div>

            <div className="mt-5 space-y-4">
              {[
                ['Purchase date', selectedPurchase.date],
                ['Expected date', selectedPurchase.expectedDate || 'Not set'],
                ['Status', selectedPurchase.status],
                ['Currency', selectedPurchase.currency],
                ['Subtotal', money(selectedPurchase.subtotal, selectedPurchase.currency)],
                ['Additional charges', money(selectedPurchase.additionalCharges, selectedPurchase.currency)],
                ['Total', money(selectedPurchase.total, selectedPurchase.currency)],
                ['NPR equivalent', money(selectedPurchase.nprEquivalent, 'NPR')],
                ['Paid amount', money(selectedPurchase.paidAmount, selectedPurchase.currency)],
                ['Outstanding', money(Math.max(0, selectedPurchase.total - selectedPurchase.paidAmount), selectedPurchase.currency)],
                ['Notes', selectedPurchase.notes || 'No notes'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-line pb-3">
                  <p className="text-[10px] text-slate-500">{label}</p>
                  <p className="text-right text-xs text-slate-200">{value}</p>
                </div>
              ))}

              <div>
                <p className="mb-2 text-[10px] text-slate-500">Purchase items</p>
                {selectedPurchase.items.map(item => (
                  <div key={item.inventoryItemId} className="rounded-xl border border-line bg-canvas p-3">
                    <p className="text-xs font-medium text-slate-200">{item.itemName}</p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Ordered: {item.quantity} · Received: {item.receivedQuantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {selectedPurchase.status !== 'Received' && selectedPurchase.status !== 'Cancelled' && (
                <button
                  onClick={() => receivePurchase(selectedPurchase)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/10 py-3 text-xs font-semibold text-emerald-300"
                >
                  <PackageCheck size={14} />
                  Mark received
                </button>
              )}
              {selectedPurchase.status !== 'Received' && selectedPurchase.status !== 'Cancelled' && (
                <button
                  onClick={() => cancelPurchase(selectedPurchase)}
                  className="rounded-xl border border-rose-400/20 px-3 py-3 text-xs text-rose-300"
                >
                  Cancel order
                </button>
              )}
              <button onClick={() => setSelectedPurchase(null)} className="flex-1 rounded-xl border border-line py-3 text-xs text-slate-300">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
