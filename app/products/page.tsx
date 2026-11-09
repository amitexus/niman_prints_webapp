
'use client';

import { useMemo, useState } from 'react';
import {
  Plus, Search, Package, Boxes, TrendingUp,
  AlertTriangle, Pencil, Trash2, X, Filter,
  ChevronDown, Tag, IndianRupee
} from 'lucide-react';

import {
  initialProducts,
  productCategories,
  type Product,
  type ProductCategory,
} from '@/lib/products';

const money = (value: number) =>
  `NPR ${value.toLocaleString('en-IN')}`;

const emptyForm = {
  name: '',
  sku: '',
  category: 'Mugs' as ProductCategory,
  costPrice: '',
  sellingPrice: '',
  stock: '',
  lowStockAt: '5',
  customization: 'Name, Photo',
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        `${product.name} ${product.sku} ${product.category}`
          .toLowerCase()
          .includes(query.toLowerCase());

      return matchesSearch &&
        (category === 'All' || product.category === category);
    });
  }, [products, query, category]);

  const activeCount = products.filter(p => p.status === 'Active').length;
  const lowStock = products.filter(
    p => p.stock <= p.lowStockAt && p.status !== 'Archived'
  ).length;

  const inventoryValue = products.reduce(
    (sum, p) => sum + p.stock * p.costPrice, 0
  );

  const expectedProfit = products.reduce(
    (sum, p) => sum + p.stock * (p.sellingPrice - p.costPrice), 0
  );

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      costPrice: String(product.costPrice),
      sellingPrice: String(product.sellingPrice),
      stock: String(product.stock),
      lowStockAt: String(product.lowStockAt),
      customization: product.customization.join(', '),
    });
    setModalOpen(true);
  }

  function saveProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cost = Number(form.costPrice);
    const selling = Number(form.sellingPrice);
    const stock = Number(form.stock);
    const threshold = Number(form.lowStockAt);

    if (
      !form.name.trim() ||
      !form.sku.trim() ||
      !Number.isFinite(cost) ||
      !Number.isFinite(selling) ||
      !Number.isInteger(stock) ||
      !Number.isInteger(threshold) ||
      cost < 0 || selling < 0 || stock < 0 || threshold < 0
    ) {
      return;
    }

    const productData: Product = {
      id: editingId ?? `PRD-${Date.now()}`,
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category,
      costPrice: cost,
      sellingPrice: selling,
      stock,
      lowStockAt: threshold,
      status: 'Active',
      customization: form.customization
        .split(',')
        .map(value => value.trim())
        .filter(Boolean),
    };

    if (editingId) {
      setProducts(previous =>
        previous.map(p => p.id === editingId ? productData : p)
      );
    } else {
      setProducts(previous => [productData, ...previous]);
    }

    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function deleteProduct(id: string) {
    if (window.confirm('Delete this product? This cannot be undone.')) {
      setProducts(previous => previous.filter(p => p.id !== id));
    }
  }

  return (
    <main className="min-w-0 flex-1">
      <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-line bg-[#090b12]/90 px-5 backdrop-blur-xl md:px-8">
        <div>
          <p className="text-[10px] text-slate-500">
            Workspace / Catalog / Products
          </p>
          <h1 className="mt-1 text-[17px] font-semibold text-white">
            Products Management
          </h1>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-semibold text-white shadow-glow hover:bg-violet-400"
        >
          <Plus size={15} />
          Add Product
        </button>
      </header>

      <div className="mx-auto max-w-[1500px] space-y-6 p-5 md:p-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-violet-300">
            Product catalog
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Manage your products
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Control your catalog, pricing, margins and stock.
          </p>
        </div>

        <div className="rounded-xl border border-amber-400/15 bg-amber-400/[.05] px-4 py-3">
          <p className="text-[11px] font-semibold text-amber-100">
            Preview mode · Sample product data
          </p>
          <p className="mt-1 text-[10px] text-amber-100/55">
            Changes currently remain in browser memory and reset on refresh.
          </p>
        </div>

        {/* Summary cards */}
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Total products',
              value: products.length,
              icon: Package,
              color: 'text-violet-300',
            },
            {
              label: 'Active products',
              value: activeCount,
              icon: Tag,
              color: 'text-emerald-300',
            },
            {
              label: 'Low stock alerts',
              value: lowStock,
              icon: AlertTriangle,
              color: 'text-amber-300',
            },
            {
              label: 'Inventory cost value',
              value: money(inventoryValue),
              icon: Boxes,
              color: 'text-blue-300',
            },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl border border-line bg-panel p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-slate-400">{item.label}</p>
                  <Icon size={17} className={item.color} />
                </div>
                <p className="mt-4 text-xl font-semibold text-white">
                  {item.value}
                </p>
              </div>
            );
          })}
        </section>

        {/* Inventory insights */}
        <section className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-panel p-4">
            <p className="text-[11px] text-slate-400">Potential gross profit at current stock</p>
            <p className="mt-2 text-xl font-semibold text-emerald-300">
              {money(expectedProfit)}
            </p>
            <p className="mt-1 text-[10px] text-slate-600">
              Before packaging, advertising, labour and other expenses.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-panel p-4">
            <p className="text-[11px] text-slate-400">Average product margin</p>
            <p className="mt-2 text-xl font-semibold text-white">
              {products.length
                ? `${(products.reduce((sum, p) =>
                    sum + (p.sellingPrice > 0
                      ? (p.sellingPrice - p.costPrice) / p.sellingPrice
                      : 0), 0) / products.length * 100).toFixed(1)}%`
                : '0%'}
            </p>
            <p className="mt-1 text-[10px] text-slate-600">
              Average of individual product gross margins.
            </p>
          </div>
        </section>

        {/* Search and filters */}
        <section className="overflow-hidden rounded-2xl border border-line bg-panel">
          <div className="flex flex-col justify-between gap-3 border-b border-line p-5 md:flex-row md:items-center">
            <div>
              <h3 className="text-sm font-semibold text-white">Product catalog</h3>
              <p className="mt-1 text-[10px] text-slate-500">
                {filtered.length} products displayed
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex min-w-[180px] flex-1 items-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2.5">
                <Search size={14} className="text-slate-500" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-600"
                />
              </div>

              <div className="relative">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="h-full appearance-none rounded-xl border border-line bg-canvas py-2.5 pl-3 pr-9 text-xs text-slate-300 outline-none"
                >
                  <option value="All">All categories</option>
                  {productCategories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>
          </div>

          {/* Product table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead>
                <tr className="bg-white/[.015] text-[9px] uppercase tracking-wider text-slate-600">
                  <th className="px-5 py-4">Product</th>
                  <th className="px-3 py-4">Category</th>
                  <th className="px-3 py-4">Cost price</th>
                  <th className="px-3 py-4">Selling price</th>
                  <th className="px-3 py-4">Profit / unit</th>
                  <th className="px-3 py-4">Stock</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(product => {
                  const profit = product.sellingPrice - product.costPrice;
                  const isLow = product.stock <= product.lowStockAt;

                  return (
                    <tr key={product.id} className="border-t border-line/70 text-[11px] hover:bg-white/[.02]">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{product.name}</p>
                        <p className="mt-1 text-[9px] text-slate-600">{product.sku}</p>
                      </td>
                      <td className="px-3 py-4 text-slate-400">{product.category}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-300">{money(product.costPrice)}</td>
                      <td className="whitespace-nowrap px-3 py-4 font-semibold text-white">{money(product.sellingPrice)}</td>
                      <td className="whitespace-nowrap px-3 py-4 font-semibold text-emerald-300">{money(profit)}</td>
                      <td className="px-3 py-4">
                        <span className={isLow ? 'font-semibold text-amber-300' : 'text-slate-300'}>
                          {product.stock} {isLow && '· Low'}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <span className="rounded-md bg-emerald-400/10 px-2 py-1 text-[9px] text-emerald-300">
                          {product.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEdit(product)}
                            title="Edit product"
                            className="rounded-lg border border-line p-2 text-slate-400 hover:text-violet-300"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            title="Delete product"
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

            {filtered.length === 0 && (
              <p className="py-14 text-center text-xs text-slate-500">
                No products found.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Create / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-xl rounded-2xl border border-line bg-panel shadow-2xl">
            <div className="flex items-center justify-between border-b border-line p-5">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {editingId ? 'Edit product' : 'Add new product'}
                </h3>
                <p className="mt-1 text-[10px] text-slate-500">
                  Enter product information and pricing.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={saveProduct} className="grid gap-4 p-5 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-2 block text-[10px] text-slate-400">Product name</span>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Customized Photo Mug"
                  className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                />
              </label>

              <label>
                <span className="mb-2 block text-[10px] text-slate-400">SKU</span>
                <input
                  required
                  value={form.sku}
                  onChange={e => setForm({ ...form, sku: e.target.value })}
                  placeholder="MUG-001"
                  className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                />
              </label>

              <label>
                <span className="mb-2 block text-[10px] text-slate-400">Category</span>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value as ProductCategory })}
                  className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none"
                >
                  {productCategories.map(c => <option key={c}>{c}</option>)}
                </select>
              </label>

              {[
                ['Cost price (NPR)', 'costPrice'],
                ['Selling price (NPR)', 'sellingPrice'],
                ['Available stock', 'stock'],
                ['Low-stock threshold', 'lowStockAt'],
              ].map(([label, key]) => (
                <label key={key}>
                  <span className="mb-2 block text-[10px] text-slate-400">{label}</span>
                  <input
                    required
                    type="number"
                    min="0"
                    step={key.includes('Price') ? '0.01' : '1'}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                  />
                </label>
              ))}

              <label className="sm:col-span-2">
                <span className="mb-2 block text-[10px] text-slate-400">
                  Customization options (comma separated)
                </span>
                <input
                  value={form.customization}
                  onChange={e => setForm({ ...form, customization: e.target.value })}
                  placeholder="Name, Photo, Logo, Text"
                  className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                />
              </label>

              <div className="sm:col-span-2 rounded-xl bg-white/[.025] p-3">
                <p className="text-[10px] text-slate-500">Profit per unit</p>
                <p className="mt-1 text-lg font-semibold text-emerald-300">
                  {money(Math.max(0, Number(form.sellingPrice || 0) - Number(form.costPrice || 0)))}
                </p>
              </div>

              <div className="flex justify-end gap-2 border-t border-line pt-4 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-line px-4 py-2.5 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-violet-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-violet-400"
                >
                  {editingId ? 'Save changes' : 'Create product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
