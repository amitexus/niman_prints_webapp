
'use client';

import { useMemo, useState } from 'react';
import {
  Search, Plus, X, Package, AlertTriangle, TrendingUp,
  Boxes, ArrowDownToLine, ArrowUpFromLine, History,
  Pencil, Trash2, CheckCircle2,
} from 'lucide-react';

import {
  initialInventory,
  initialMovements,
  type InventoryItem,
  type InventoryCategory,
  type StockMovement,
} from '@/lib/inventory';

const money = (value: number) =>
  `NPR ${value.toLocaleString('en-IN')}`;

const categories: InventoryCategory[] = [
  'Finished Products',
  'Raw Materials',
  'Packaging',
  'Accessories',
];

const emptyForm = {
  name: '',
  sku: '',
  category: 'Finished Products' as InventoryCategory,
  unit: 'pcs',
  stock: '0',
  lowStockAt: '5',
  costPerUnit: '0',
  supplier: '',
};

const movementStyles = {
  'Stock In': 'text-emerald-300 bg-emerald-400/10',
  'Stock Out': 'text-rose-300 bg-rose-400/10',
  Adjustment: 'text-amber-300 bg-amber-400/10',
};

export default function InventoryPage() {
  const [items, setItems] = useState(initialInventory);
  const [movements, setMovements] = useState(initialMovements);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [movementOpen, setMovementOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [movementForm, setMovementForm] = useState({
    itemId: '',
    type: 'Stock In' as StockMovement['type'],
    quantity: '1',
    reference: '',
  });

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch =
        `${item.name} ${item.sku} ${item.supplier}`
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesCategory =
        activeCategory === 'All' || item.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [items, query, activeCategory]);

  const lowStockItems = items.filter(
    item => item.stock <= item.lowStockAt
  );

  const totalUnits = items.reduce(
    (sum, item) => sum + item.stock, 0
  );

  const inventoryValue = items.reduce(
    (sum, item) => sum + item.stock * item.costPerUnit, 0
  );

  const outOfStock = items.filter(item => item.stock === 0).length;

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item: InventoryItem) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      sku: item.sku,
      category: item.category,
      unit: item.unit,
      stock: String(item.stock),
      lowStockAt: String(item.lowStockAt),
      costPerUnit: String(item.costPerUnit),
      supplier: item.supplier,
    });
    setModalOpen(true);
  }

  function saveItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const stock = Number(form.stock);
    const threshold = Number(form.lowStockAt);
    const cost = Number(form.costPerUnit);

    if (
      !Number.isFinite(stock) ||
      !Number.isFinite(threshold) ||
      !Number.isFinite(cost) ||
      stock < 0 ||
      threshold < 0 ||
      cost < 0
    ) {
      alert('Enter valid non-negative numbers.');
      return;
    }

    const duplicateSku = items.some(
      item =>
        item.sku.toLowerCase() === form.sku.trim().toLowerCase() &&
        item.id !== editingId
    );

    if (duplicateSku) {
      alert('This SKU already exists. Please use a unique SKU.');
      return;
    }

    const updated: InventoryItem = {
      id: editingId ?? `INV-${Date.now()}`,
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category,
      unit: form.unit.trim() || 'pcs',
      stock,
      lowStockAt: threshold,
      costPerUnit: cost,
      supplier: form.supplier.trim(),
    };

    if (editingId) {
      setItems(previous =>
        previous.map(item => item.id === editingId ? updated : item)
      );
    } else {
      setItems(previous => [updated, ...previous]);
    }

    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function deleteItem(id: string) {
    if (!window.confirm('Delete this inventory item?')) return;

    setItems(previous => previous.filter(item => item.id !== id));
    setSelectedItem(null);
  }

  function openMovement(item?: InventoryItem) {
    setMovementForm({
      itemId: item?.id ?? items[0]?.id ?? '',
      type: 'Stock In',
      quantity: '1',
      reference: '',
    });
    setMovementOpen(true);
  }

  function saveMovement(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const quantity = Number(movementForm.quantity);
    const item = items.find(i => i.id === movementForm.itemId);

    if (!item || !Number.isInteger(quantity) || quantity <= 0) {
      alert('Select an item and enter a valid whole-number quantity.');
      return;
    }

    let newStock = item.stock;

    if (movementForm.type === 'Stock In') {
      newStock += quantity;
    } else if (movementForm.type === 'Stock Out') {
      if (quantity > item.stock) {
        alert('Insufficient stock for this stock-out movement.');
        return;
      }
      newStock -= quantity;
    } else {
      newStock = quantity;
    }

    const updatedMovement: StockMovement = {
      id: `MOV-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      type: movementForm.type,
      quantity,
      date: new Date().toISOString().slice(0, 10),
      reference: movementForm.reference.trim() || 'Manual entry',
    };

    setItems(previous =>
      previous.map(i =>
        i.id === item.id ? { ...i, stock: newStock } : i
      )
    );

    setMovements(previous => [updatedMovement, ...previous]);
    setMovementOpen(false);
  }

  return (
    <main className="min-w-0 flex-1">
      {/* Header */}
      <header className="sticky top-0 z-20 flex min-h-[76px] items-center justify-between gap-3 border-b border-line bg-[#090b12]/90 px-5 backdrop-blur-xl md:px-8">
        <div>
          <p className="text-[10px] text-slate-500">
            Workspace / Operations / Inventory
          </p>
          <h1 className="mt-1 text-[17px] font-semibold text-white">
            Inventory Management
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => openMovement()}
            className="flex items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-xs text-slate-300 hover:bg-white/5"
          >
            <History size={14} />
            <span className="hidden sm:inline">Stock movement</span>
          </button>

          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-400"
          >
            <Plus size={15} />
            Add item
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] space-y-6 p-5 md:p-8">
        {/* Intro */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-violet-300">
            Stock and materials
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Control your inventory
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Track products, raw materials, packaging and stock movements.
          </p>
        </div>

        {/* Demo notice */}
        <div className="rounded-xl border border-amber-400/15 bg-amber-400/[.05] px-4 py-3">
          <p className="text-[11px] font-semibold text-amber-100">
            Preview mode · Sample inventory data
          </p>
          <p className="mt-1 text-[10px] text-amber-100/55">
            Changes are temporary until database integration.
          </p>
        </div>

        {/* KPI cards */}
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Inventory items',
              value: items.length,
              icon: Boxes,
              color: 'text-violet-300',
            },
            {
              label: 'Total units',
              value: totalUnits.toLocaleString('en-IN'),
              icon: Package,
              color: 'text-blue-300',
            },
            {
              label: 'Inventory value',
              value: money(inventoryValue),
              icon: TrendingUp,
              color: 'text-emerald-300',
            },
            {
              label: 'Low stock alerts',
              value: lowStockItems.length,
              icon: AlertTriangle,
              color: 'text-amber-300',
            },
          ].map(card => {
            const Icon = card.icon;

            return (
              <div key={card.label} className="rounded-2xl border border-line bg-panel p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-slate-400">{card.label}</p>
                  <Icon size={17} className={card.color} />
                </div>
                <p className="mt-4 text-xl font-semibold text-white">
                  {card.value}
                </p>
              </div>
            );
          })}
        </section>

        {/* Alerts */}
        {(lowStockItems.length > 0 || outOfStock > 0) && (
          <section className="rounded-2xl border border-amber-400/20 bg-amber-400/[.04] p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle size={17} className="text-amber-300" />
              <h3 className="text-sm font-semibold text-white">
                Inventory attention required
              </h3>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {outOfStock > 0 && (
                <span className="rounded-lg bg-rose-400/10 px-3 py-2 text-[10px] text-rose-300">
                  {outOfStock} out-of-stock items
                </span>
              )}

              {lowStockItems.map(item => (
                <span
                  key={item.id}
                  className="rounded-lg bg-amber-400/10 px-3 py-2 text-[10px] text-amber-200"
                >
                  {item.name}: {item.stock} {item.unit} left
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Inventory table */}
        <section className="overflow-hidden rounded-2xl border border-line bg-panel">
          <div className="flex flex-col justify-between gap-4 border-b border-line p-5 lg:flex-row lg:items-center">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Inventory items
              </h3>
              <p className="mt-1 text-[10px] text-slate-500">
                {filteredItems.length} items displayed
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex min-w-[180px] flex-1 items-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2.5 lg:flex-none">
                <Search size={14} className="text-slate-500" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search items..."
                  className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-600"
                />
              </div>

              <select
                value={activeCategory}
                onChange={e => setActiveCategory(e.target.value)}
                className="max-w-[190px] rounded-xl border border-line bg-canvas px-3 py-2.5 text-xs text-slate-300 outline-none"
              >
                <option value="All">All categories</option>
                {categories.map(category => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead>
                <tr className="bg-white/[.015] text-[9px] uppercase tracking-wider text-slate-600">
                  <th className="px-5 py-4">Item</th>
                  <th className="px-3 py-4">Category</th>
                  <th className="px-3 py-4">Available stock</th>
                  <th className="px-3 py-4">Unit cost</th>
                  <th className="px-3 py-4">Stock value</th>
                  <th className="px-3 py-4">Stock status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.map(item => {
                  const low = item.stock <= item.lowStockAt;
                  const out = item.stock === 0;

                  return (
                    <tr key={item.id} className="border-t border-line/70 text-[11px] hover:bg-white/[.02]">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-200">{item.name}</p>
                        <p className="mt-1 text-[9px] text-slate-500">
                          {item.sku} · {item.supplier}
                        </p>
                      </td>

                      <td className="px-3 py-4 text-slate-400">
                        {item.category}
                      </td>

                      <td className="px-3 py-4 font-semibold text-white">
                        {item.stock} <span className="font-normal text-slate-500">{item.unit}</span>
                        <p className="mt-1 text-[9px] font-normal text-slate-600">
                          Alert at {item.lowStockAt}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-3 py-4 text-slate-300">
                        {money(item.costPerUnit)}
                      </td>

                      <td className="whitespace-nowrap px-3 py-4 font-semibold text-slate-200">
                        {money(item.stock * item.costPerUnit)}
                      </td>

                      <td className="px-3 py-4">
                        <span className={`rounded-md px-2 py-1 text-[9px] ${
                          out
                            ? 'bg-rose-400/10 text-rose-300'
                            : low
                              ? 'bg-amber-400/10 text-amber-300'
                              : 'bg-emerald-400/10 text-emerald-300'
                        }`}>
                          {out ? 'Out of stock' : low ? 'Low stock' : 'In stock'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          <button
                            title="Stock movement"
                            onClick={() => openMovement(item)}
                            className="rounded-lg border border-line p-2 text-slate-400 hover:text-emerald-300"
                          >
                            <History size={13} />
                          </button>

                          <button
                            title="Edit item"
                            onClick={() => openEdit(item)}
                            className="rounded-lg border border-line p-2 text-slate-400 hover:text-violet-300"
                          >
                            <Pencil size={13} />
                          </button>

                          <button
                            title="Delete item"
                            onClick={() => deleteItem(item.id)}
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

            {filteredItems.length === 0 && (
              <div className="py-14 text-center">
                <Package size={28} className="mx-auto text-slate-600" />
                <p className="mt-3 text-xs text-slate-300">No inventory items found</p>
              </div>
            )}
          </div>
        </section>

        {/* Stock movement history */}
        <section className="overflow-hidden rounded-2xl border border-line bg-panel">
          <div className="flex items-center justify-between border-b border-line p-5">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Stock movement history
              </h3>
              <p className="mt-1 text-[10px] text-slate-500">
                Recent inventory transactions
              </p>
            </div>
            <History size={18} className="text-violet-300" />
          </div>

          <div className="divide-y divide-line/70">
            {movements.slice(0, 8).map(movement => (
              <div key={movement.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                    movement.type === 'Stock In'
                      ? 'bg-emerald-400/10 text-emerald-300'
                      : movement.type === 'Stock Out'
                        ? 'bg-rose-400/10 text-rose-300'
                        : 'bg-amber-400/10 text-amber-300'
                  }`}>
                    {movement.type === 'Stock In'
                      ? <ArrowDownToLine size={15} />
                      : movement.type === 'Stock Out'
                        ? <ArrowUpFromLine size={15} />
                        : <History size={15} />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium text-slate-200">
                      {movement.itemName}
                    </p>
                    <p className="mt-1 text-[9px] text-slate-500">
                      {movement.id} · {movement.reference} · {movement.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`rounded-md px-2 py-1 text-[9px] ${movementStyles[movement.type]}`}>
                    {movement.type}
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {movement.type === 'Stock Out' ? '-' : '+'}
                    {movement.quantity}
                  </span>
                </div>
              </div>
            ))}

            {movements.length === 0 && (
              <p className="py-8 text-center text-xs text-slate-500">
                No stock movements recorded yet.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Add/Edit inventory modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-lg rounded-2xl border border-line bg-panel shadow-2xl">
            <div className="flex items-center justify-between border-b border-line p-5">
              <h3 className="text-sm font-semibold text-white">
                {editingId ? 'Edit inventory item' : 'Add inventory item'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/5">
                <X size={17} />
              </button>
            </div>

            <form onSubmit={saveItem} className="space-y-4 p-5">
              {[
                { key: 'name', label: 'Item name', placeholder: 'Enter item name', type: 'text' },
                { key: 'sku', label: 'SKU / Item code', placeholder: 'Unique item code', type: 'text' },
                { key: 'supplier', label: 'Supplier', placeholder: 'Supplier name', type: 'text' },
              ].map(field => (
                <label key={field.key} className="block">
                  <span className="mb-2 block text-[10px] text-slate-400">{field.label}</span>
                  <input
                    required={field.key !== 'supplier'}
                    value={form[field.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                  />
                </label>
              ))}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[10px] text-slate-400">Category</span>
                  <select
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value as InventoryCategory }))}
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none"
                  >
                    {categories.map(category => <option key={category}>{category}</option>)}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] text-slate-400">Unit</span>
                  <input
                    required
                    value={form.unit}
                    onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                    placeholder="pcs, sheets, rolls..."
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none"
                  />
                </label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'stock', label: 'Opening stock' },
                  { key: 'lowStockAt', label: 'Alert threshold' },
                  { key: 'costPerUnit', label: 'Unit cost (NPR)' },
                ].map(field => (
                  <label key={field.key} className="block">
                    <span className="mb-2 block text-[9px] text-slate-400">{field.label}</span>
                    <input
                      required
                      type="number"
                      min="0"
                      step="any"
                      value={form[field.key as keyof typeof form]}
                      onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                      className="w-full rounded-xl border border-line bg-canvas px-2 py-3 text-xs text-white outline-none focus:border-violet-400"
                    />
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-2 border-t border-line pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-line px-4 py-2.5 text-xs text-slate-400">
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-violet-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-violet-400">
                  {editingId ? 'Save changes' : 'Add item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock movement modal */}
      {movementOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-md rounded-2xl border border-line bg-panel shadow-2xl">
            <div className="flex items-center justify-between border-b border-line p-5">
              <div>
                <h3 className="text-sm font-semibold text-white">Record stock movement</h3>
                <p className="mt-1 text-[10px] text-slate-500">Update available inventory quantities.</p>
              </div>
              <button onClick={() => setMovementOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/5">
                <X size={17} />
              </button>
            </div>

            <form onSubmit={saveMovement} className="space-y-4 p-5">
              <label className="block">
                <span className="mb-2 block text-[10px] text-slate-400">Inventory item</span>
                <select
                  required
                  value={movementForm.itemId}
                  onChange={e => setMovementForm(p => ({ ...p, itemId: e.target.value }))}
                  className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none"
                >
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} · {item.stock} {item.unit} available
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] text-slate-400">Movement type</span>
                <select
                  value={movementForm.type}
                  onChange={e => setMovementForm(p => ({ ...p, type: e.target.value as StockMovement['type'] }))}
                  className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none"
                >
                  <option>Stock In</option>
                  <option>Stock Out</option>
                  <option>Adjustment</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] text-slate-400">
                  {movementForm.type === 'Adjustment' ? 'New total stock quantity' : 'Quantity'}
                </span>
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={movementForm.quantity}
                  onChange={e => setMovementForm(p => ({ ...p, quantity: e.target.value }))}
                  className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] text-slate-400">Reference / Reason</span>
                <input
                  value={movementForm.reference}
                  onChange={e => setMovementForm(p => ({ ...p, reference: e.target.value }))}
                  placeholder="Purchase ID, order ID or reason"
                  className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                />
              </label>

              <div className="flex justify-end gap-2 border-t border-line pt-4">
                <button type="button" onClick={() => setMovementOpen(false)} className="rounded-xl border border-line px-4 py-2.5 text-xs text-slate-400">
                  Cancel
                </button>
                <button type="submit" disabled={items.length === 0} className="rounded-xl bg-violet-500 px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-40">
                  Save movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
