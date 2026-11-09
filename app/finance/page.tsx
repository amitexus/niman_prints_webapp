
'use client';

import { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  Download,
  Plus,
  Search,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import {
  initialTransactions,
  type FinanceCategory,
  type FinanceTransaction,
  type FinanceTransactionType,
} from '@/lib/finance';

const categories: FinanceCategory[] = [
  'Sales',
  'Product Cost',
  'Advertising',
  'Packaging',
  'Delivery',
  'Salary',
  'Rent',
  'Utilities',
  'Equipment',
  'EMI',
  'Other',
];

const paymentMethods: FinanceTransaction['paymentMethod'][] = [
  'Cash',
  'Bank',
  'eSewa',
  'Khalti',
  'Other',
];

const formatNPR = (amount: number) =>
  `NPR ${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`;

const today = new Date().toISOString().slice(0, 10);

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

export default function FinancePage() {
  const [transactions, setTransactions] =
    useState<FinanceTransaction[]>(initialTransactions);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const [form, setForm] = useState({
    description: '',
    type: 'Expense' as FinanceTransactionType,
    category: 'Other' as FinanceCategory,
    amount: '',
    currency: 'NPR' as 'NPR' | 'INR',
    exchangeRate: '1',
    date: today,
    paymentMethod: 'Cash' as FinanceTransaction['paymentMethod'],
    reference: '',
    notes: '',
  });

  const totals = useMemo(() => {
    const income = transactions
      .filter((item) => item.type === 'Income')
      .reduce(
        (sum, item) => sum + item.amount * item.exchangeRate,
        0,
      );

    const expenses = transactions
      .filter((item) => item.type === 'Expense')
      .reduce(
        (sum, item) => sum + item.amount * item.exchangeRate,
        0,
      );

    return {
      income,
      expenses,
      profit: income - expenses,
      count: transactions.length,
    };
  }, [transactions]);

  const months = useMemo(() => {
    return Array.from(
      new Set(transactions.map((item) => item.date.slice(0, 7))),
    ).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((item) => {
        const matchesSearch = [
          item.description,
          item.category,
          item.reference,
          item.paymentMethod,
        ]
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchesType =
          typeFilter === 'All' || item.type === typeFilter;

        const matchesMonth =
          monthFilter === 'All' ||
          item.date.startsWith(monthFilter);

        return matchesSearch && matchesType && matchesMonth;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, search, typeFilter, monthFilter]);

  const monthlySummary = useMemo(() => {
    const selectedMonth =
      monthFilter === 'All' ? today.slice(0, 7) : monthFilter;

    const monthTransactions = transactions.filter((item) =>
      item.date.startsWith(selectedMonth),
    );

    const income = monthTransactions
      .filter((item) => item.type === 'Income')
      .reduce((sum, item) => sum + item.amount * item.exchangeRate, 0);

    const expenses = monthTransactions
      .filter((item) => item.type === 'Expense')
      .reduce((sum, item) => sum + item.amount * item.exchangeRate, 0);

    return {
      income,
      expenses,
      profit: income - expenses,
      label: selectedMonth,
    };
  }, [transactions, monthFilter]);

  const categoryExpenses = useMemo(() => {
    return categories
      .map((category) => ({
        category,
        amount: transactions
          .filter(
            (item) =>
              item.type === 'Expense' &&
              item.category === category &&
              (monthFilter === 'All' ||
                item.date.startsWith(monthFilter)),
          )
          .reduce(
            (sum, item) => sum + item.amount * item.exchangeRate,
            0,
          ),
      }))
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, monthFilter]);

  const maxExpense = Math.max(
    ...categoryExpenses.map((item) => item.amount),
    1,
  );

  function resetForm() {
    setForm({
      description: '',
      type: 'Expense',
      category: 'Other',
      amount: '',
      currency: 'NPR',
      exchangeRate: '1',
      date: today,
      paymentMethod: 'Cash',
      reference: '',
      notes: '',
    });
  }

  function saveTransaction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number(form.amount);
    const exchangeRate = Number(form.exchangeRate);

    if (
      !form.description.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !Number.isFinite(exchangeRate) ||
      exchangeRate <= 0
    ) {
      return;
    }

    const transaction: FinanceTransaction = {
      id: `TXN-${Date.now()}`,
      date: form.date,
      description: form.description.trim(),
      type: form.type,
      category: form.category,
      amount,
      currency: form.currency,
      exchangeRate,
      paymentMethod: form.paymentMethod,
      reference: form.reference.trim(),
      notes: form.notes.trim(),
    };

    setTransactions((current) => [transaction, ...current]);
    setShowModal(false);
    resetForm();
  }

  function deleteTransaction(id: string) {
    if (!window.confirm('Delete this transaction?')) return;

    setTransactions((current) =>
      current.filter((item) => item.id !== id),
    );
  }

  function exportCSV() {
    const headers = [
      'Date',
      'Description',
      'Type',
      'Category',
      'Original Amount',
      'Currency',
      'Exchange Rate',
      'NPR Equivalent',
      'Payment Method',
      'Reference',
      'Notes',
    ];

    const rows = filteredTransactions.map((item) => [
      item.date,
      item.description,
      item.type,
      item.category,
      item.amount,
      item.currency,
      item.exchangeRate,
      item.amount * item.exchangeRate,
      item.paymentMethod,
      item.reference,
      item.notes,
    ]);

    const escapeCSV = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(','))
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `niman-prints-finance-${today}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const displayedTransactions = showAll
    ? filteredTransactions
    : filteredTransactions.slice(0, 8);

  return (
    <main className="min-h-screen p-4 md:p-7 lg:p-9">
      <div className="mx-auto max-w-[1500px] space-y-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-muted">
              <span>Business</span>
              <span>/</span>
              <span className="text-white">Finance</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Finance & Accounting
            </h1>
            <p className="mt-2 text-sm text-muted">
              Track business income, expenses, cash flow and profitability.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 rounded-xl border border-line bg-panel px-4 py-2.5 text-sm text-white transition hover:bg-panel-hover"
            >
              <Download size={16} />
              Export CSV
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <Plus size={17} />
              Add transaction
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-200">
          <strong>Demo accounting data:</strong> These figures are sample
          transactions. This module currently stores changes in browser
          memory only. It is not connected to live orders, purchases,
          inventory, bank accounts or VAT records.
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Total income',
              value: formatNPR(totals.income),
              icon: ArrowDownLeft,
              color: 'text-emerald-400',
              note: 'All recorded income',
            },
            {
              label: 'Total expenses',
              value: formatNPR(totals.expenses),
              icon: ArrowUpRight,
              color: 'text-rose-400',
              note: 'All recorded expenses',
            },
            {
              label: 'Net balance',
              value: formatNPR(totals.profit),
              icon: Wallet,
              color: totals.profit >= 0 ? 'text-emerald-400' : 'text-rose-400',
              note: 'Income minus expenses',
            },
            {
              label: 'Transactions',
              value: String(totals.count),
              icon: Banknote,
              color: 'text-violet-400',
              note: 'Recorded entries',
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="surface rounded-2xl p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted">{item.label}</p>
                  <div className="rounded-xl bg-white/5 p-2.5">
                    <Icon size={18} className={item.color} />
                  </div>
                </div>
                <p className="mt-4 text-2xl font-semibold text-white">
                  {item.value}
                </p>
                <p className="mt-1 text-xs text-muted">{item.note}</p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
          <div className="surface rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-white">
                  Financial overview
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Summary for {monthlySummary.label}
                </p>
              </div>
              <div className="rounded-lg bg-white/5 p-2 text-muted">
                <CalendarDays size={17} />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-emerald-400/5 p-4">
                <p className="text-xs text-muted">Income</p>
                <p className="mt-2 text-lg font-semibold text-emerald-400">
                  {formatNPR(monthlySummary.income)}
                </p>
              </div>
              <div className="rounded-xl bg-rose-400/5 p-4">
                <p className="text-xs text-muted">Expenses</p>
                <p className="mt-2 text-lg font-semibold text-rose-400">
                  {formatNPR(monthlySummary.expenses)}
                </p>
              </div>
              <div className="rounded-xl bg-violet-400/5 p-4">
                <p className="text-xs text-muted">Net result</p>
                <p className="mt-2 text-lg font-semibold text-violet-300">
                  {formatNPR(monthlySummary.profit)}
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-5">
              <div>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-muted">Income</span>
                  <span className="text-emerald-400">
                    {formatNPR(monthlySummary.income)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{
                      width: `${
                        monthlySummary.income + monthlySummary.expenses > 0
                          ? (monthlySummary.income /
                              (monthlySummary.income +
                                monthlySummary.expenses)) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-muted">Expenses</span>
                  <span className="text-rose-400">
                    {formatNPR(monthlySummary.expenses)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-rose-400"
                    style={{
                      width: `${
                        monthlySummary.income + monthlySummary.expenses > 0
                          ? (monthlySummary.expenses /
                              (monthlySummary.income +
                                monthlySummary.expenses)) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 border-t border-line pt-4 text-xs text-muted">
              <TrendingUp size={15} />
              Net result is calculated from recorded transactions, not
              verified accounting profit.
            </div>
          </div>

          <div className="surface rounded-2xl p-5">
            <h2 className="font-semibold text-white">Expense breakdown</h2>
            <p className="mt-1 text-xs text-muted">
              Recorded expenses by category
            </p>

            {categoryExpenses.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted">
                No expenses recorded for this period.
              </p>
            ) : (
              <div className="mt-6 space-y-5">
                {categoryExpenses.slice(0, 7).map((item) => (
                  <div key={item.category}>
                    <div className="mb-2 flex justify-between gap-3 text-xs">
                      <span className="text-slate-300">
                        {item.category}
                      </span>
                      <span className="text-white">
                        {formatNPR(item.amount)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-violet-400"
                        style={{
                          width: `${(item.amount / maxExpense) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="surface overflow-hidden rounded-2xl">
          <div className="flex flex-col justify-between gap-4 border-b border-line p-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-semibold text-white">
                Transaction history
              </h2>
              <p className="mt-1 text-xs text-muted">
                Search, filter and manage business transactions.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search transactions..."
                  className="w-full rounded-xl border border-line bg-canvas py-2.5 pl-9 pr-3 text-sm text-white outline-none focus:border-accent sm:w-56"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm text-white outline-none"
              >
                <option value="All">All types</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>

              <select
                value={monthFilter}
                onChange={(event) => setMonthFilter(event.target.value)}
                className="rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm text-white outline-none"
              >
                <option value="All">All months</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-white/[0.025] text-xs text-muted">
                <tr>
                  <th className="px-5 py-4 font-medium">Transaction</th>
                  <th className="px-5 py-4 font-medium">Date</th>
                  <th className="px-5 py-4 font-medium">Category</th>
                  <th className="px-5 py-4 font-medium">Method</th>
                  <th className="px-5 py-4 font-medium">Original amount</th>
                  <th className="px-5 py-4 font-medium">NPR equivalent</th>
                  <th className="px-5 py-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {displayedTransactions.map((item) => (
                  <tr key={item.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">
                        {item.description}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {item.reference || item.id}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-300">
                      {item.date}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-300">
                      {item.category}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-300">
                      {item.paymentMethod}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          item.type === 'Income'
                            ? 'font-medium text-emerald-400'
                            : 'font-medium text-rose-400'
                        }
                      >
                        {item.type === 'Income' ? '+' : '-'}
                        {item.currency} {item.amount.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-white">
                      {formatNPR(item.amount * item.exchangeRate)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => deleteTransaction(item.id)}
                        title="Delete transaction"
                        className="rounded-lg p-2 text-muted transition hover:bg-rose-400/10 hover:text-rose-400"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                ))}

                {displayedTransactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-sm text-muted"
                    >
                      No transactions found. Try changing your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length > 8 && (
            <div className="border-t border-line p-4 text-center">
              <button
                onClick={() => setShowAll((current) => !current)}
                className="text-sm font-medium text-accent hover:underline"
              >
                {showAll ? 'Show less' : `View all ${filteredTransactions.length} transactions`}
              </button>
            </div>
          )}
        </section>

        <p className="text-center text-xs text-muted">
          Niman Prints Business OS · Finance module · Demo version
        </p>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-2xl rounded-2xl border border-line bg-panel shadow-2xl">
            <div className="flex items-center justify-between border-b border-line p-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Add transaction
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Record business income or expenses.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-muted hover:bg-white/5 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={saveTransaction} className="space-y-5 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Transaction type">
                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        type: event.target.value as FinanceTransactionType,
                        category:
                          event.target.value === 'Income'
                            ? 'Sales'
                            : 'Other',
                      }))
                    }
                    className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-white outline-none focus:border-accent"
                  >
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </Field>

                <Field label="Category">
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        category: event.target.value as FinanceCategory,
                      }))
                    }
                    className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-white outline-none focus:border-accent"
                  >
                    {categories
                      .filter((category) =>
                        form.type === 'Income'
                          ? category === 'Sales' || category === 'Other'
                          : category !== 'Sales',
                      )
                      .map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                  </select>
                </Field>
              </div>

              <Field label="Description">
                <input
                  required
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="e.g. Customer bottle order"
                  className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-white outline-none focus:border-accent"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Amount">
                  <input
                    required
                    min="0.01"
                    step="0.01"
                    type="number"
                    value={form.amount}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                    }
                    placeholder="Enter amount"
                    className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-white outline-none focus:border-accent"
                  />
                </Field>

                <Field label="Currency">
                  <select
                    value={form.currency}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        currency: event.target.value as 'NPR' | 'INR',
                        exchangeRate:
                          event.target.value === 'NPR' ? '1' : '',
                      }))
                    }
                    className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-white outline-none focus:border-accent"
                  >
                    <option value="NPR">NPR — Nepalese Rupee</option>
                    <option value="INR">INR — Indian Rupee</option>
                  </select>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Exchange rate (1 unit = NPR)">
                  <input
                    required
                    min="0.0001"
                    step="0.0001"
                    type="number"
                    value={form.exchangeRate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        exchangeRate: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-white outline-none focus:border-accent"
                  />
                </Field>

                <Field label="Date">
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-white outline-none focus:border-accent"
                  />
                </Field>
              </div>

              <div className="rounded-xl bg-white/[0.03] p-4">
                <p className="text-xs text-muted">NPR equivalent preview</p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {formatNPR(
                    (Number(form.amount) || 0) *
                      (Number(form.exchangeRate) || 0),
                  )}
                </p>
                {form.currency === 'INR' && (
                  <p className="mt-1 text-xs text-muted">
                    Enter the actual exchange rate used for this transaction.
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Payment method">
                  <select
                    value={form.paymentMethod}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        paymentMethod: event.target.value as FinanceTransaction['paymentMethod'],
                      }))
                    }
                    className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-white outline-none focus:border-accent"
                  >
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Reference number (optional)">
                  <input
                    value={form.reference}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        reference: event.target.value,
                      }))
                    }
                    placeholder="Order or invoice reference"
                    className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-white outline-none focus:border-accent"
                  />
                </Field>
              </div>

              <Field label="Notes (optional)">
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Additional details..."
                  className="w-full resize-none rounded-xl border border-line bg-canvas p-3 text-sm text-white outline-none focus:border-accent"
                />
              </Field>

              <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="rounded-xl border border-line px-5 py-3 text-sm text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
                >
                  Save transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
