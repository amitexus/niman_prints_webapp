
'use client';

import { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  Wallet,
  Target,
  BarChart3,
  Download,
} from 'lucide-react';

import {
  analyticsSummary,
  revenueTrends,
  orderStatusBreakdown,
  topProducts,
  customerInsights,
  channelPerformance,
  expenseBreakdown,
  businessTargets,
  type AnalyticsPeriod,
} from '@/lib/analytics';

const money = (value: number) =>
  `NPR ${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const statusColors: Record<string, string> = {
  New: 'bg-sky-400',
  'Design Approval': 'bg-violet-400',
  'In Production': 'bg-amber-400',
  'Ready to Ship': 'bg-cyan-400',
  Completed: 'bg-emerald-400',
  Cancelled: 'bg-rose-400',
};

function Metric({
  title,
  value,
  change,
  note,
  icon: Icon,
  positive = true,
}: {
  title: string;
  value: string;
  change: string;
  note: string;
  icon: typeof Wallet;
  positive?: boolean;
}) {
  return (
    <div className="surface rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{title}</p>
        <div className="rounded-xl bg-white/5 p-2.5">
          <Icon size={18} className="text-violet-400" />
        </div>
      </div>
      <p className="mt-4 text-2xl font-semibold text-white">{value}</p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        <span
          className={`flex items-center gap-1 ${
            positive ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {positive ? (
            <TrendingUp size={13} />
          ) : (
            <TrendingDown size={13} />
          )}
          {change}
        </span>
        <span className="text-muted">{note}</span>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('30D');

  const trendData = revenueTrends[period];

  const trendMaximum = Math.max(
    ...trendData.map((item) => Math.max(item.revenue, item.expenses)),
    1,
  );

  const totalTrendRevenue = trendData.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );

  const totalTrendExpenses = trendData.reduce(
    (sum, item) => sum + item.expenses,
    0,
  );

  const totalOrders = orderStatusBreakdown.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  const totalExpenses = expenseBreakdown.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  const maxProductRevenue = Math.max(
    ...topProducts.map((item) => item.revenue),
    1,
  );

  const maxChannelRevenue = Math.max(
    ...channelPerformance.map((item) => item.revenue),
    1,
  );

  const maxExpense = Math.max(
    ...expenseBreakdown.map((item) => item.amount),
    1,
  );

  const targetProgress = useMemo(
    () => ({
      revenue: Math.min(
        (analyticsSummary.revenue / businessTargets.monthlyRevenue) * 100,
        100,
      ),
      orders: Math.min(
        (analyticsSummary.orders / businessTargets.monthlyOrders) * 100,
        100,
      ),
      profit: Math.min(
        (analyticsSummary.profit / businessTargets.monthlyProfit) * 100,
        100,
      ),
    }),
    [],
  );

  function exportReport() {
    const rows = [
      ['Niman Prints Analytics Report'],
      ['Metric', 'Value'],
      ['Revenue', analyticsSummary.revenue],
      ['Expenses', analyticsSummary.expenses],
      ['Net Profit', analyticsSummary.profit],
      ['Orders', analyticsSummary.orders],
      ['Customers', analyticsSummary.customers],
      ['Average Order Value', analyticsSummary.averageOrderValue],
      [],
      ['Product', 'Units Sold', 'Revenue', 'Profit'],
      ...topProducts.map((item) => [
        item.name,
        item.unitsSold,
        item.revenue,
        item.profit,
      ]),
      [],
      ['Channel', 'Orders', 'Revenue'],
      ...channelPerformance.map((item) => [
        item.channel,
        item.orders,
        item.revenue,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? '').replace(/"/g, '""')}"`,
          )
          .join(','),
      )
      .join('\n');

    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
    );

    const link = document.createElement('a');
    link.href = url;
    link.download = 'niman-prints-analytics-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen p-4 md:p-7 lg:p-9">
      <div className="mx-auto max-w-[1500px] space-y-7">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-muted">
              <span>Business</span>
              <span>/</span>
              <span className="text-white">Analytics</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Business Intelligence
            </h1>
            <p className="mt-2 text-sm text-muted">
              Understand revenue, products, customers and business performance.
            </p>
          </div>

          <button
            onClick={exportReport}
            className="flex items-center justify-center gap-2 rounded-xl border border-line bg-panel px-4 py-2.5 text-sm text-white transition hover:bg-panel-hover"
          >
            <Download size={16} />
            Export report
          </button>
        </header>

        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-200">
          <strong>Demo analytics:</strong> All figures are illustrative
          sample data. These reports are not yet calculated from your actual
          orders, inventory, finance or marketing records.
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            title="Total revenue"
            value={money(analyticsSummary.revenue)}
            change="+12.8%"
            note="vs previous period"
            icon={Wallet}
          />
          <Metric
            title="Net profit"
            value={money(analyticsSummary.profit)}
            change="+6.4%"
            note="estimated demo figure"
            icon={TrendingUp}
          />
          <Metric
            title="Total orders"
            value={String(analyticsSummary.orders)}
            change="+8.2%"
            note="vs previous period"
            icon={ShoppingBag}
          />
          <Metric
            title="Customers"
            value={String(analyticsSummary.customers)}
            change="+11.5%"
            note="illustrative total"
            icon={Users}
          />
        </section>

        <section className="surface rounded-2xl p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-white">Revenue performance</h2>
              <p className="mt-1 text-xs text-muted">
                Revenue and expenses across the selected reporting period.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['7D', '30D', '90D', '12M'] as AnalyticsPeriod[]).map(
                (item) => (
                  <button
                    key={item}
                    onClick={() => setPeriod(item)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                      period === item
                        ? 'bg-accent text-white'
                        : 'bg-white/5 text-muted hover:text-white'
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-5 text-xs">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
              Revenue
            </span>
            <span className="flex items-center gap-2 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
              Expenses
            </span>
          </div>

          <div className="mt-7 flex h-64 items-end gap-3 overflow-x-auto pb-2 sm:gap-5">
            {trendData.map((item) => (
              <div
                key={item.label}
                className="flex min-w-0 flex-1 flex-col items-center gap-3"
              >
                <div className="flex h-52 w-full items-end justify-center gap-1.5">
                  <div
                    title={`Revenue: ${money(item.revenue)}`}
                    className="w-full max-w-9 rounded-t-lg bg-violet-400 transition-all hover:opacity-80"
                    style={{
                      height: `${(item.revenue / trendMaximum) * 100}%`,
                      minHeight: item.revenue ? '4px' : '0px',
                    }}
                  />
                  <div
                    title={`Expenses: ${money(item.expenses)}`}
                    className="w-full max-w-9 rounded-t-lg bg-sky-400 transition-all hover:opacity-80"
                    style={{
                      height: `${(item.expenses / trendMaximum) * 100}%`,
                      minHeight: item.expenses ? '4px' : '0px',
                    }}
                  />
                </div>
                <span className="whitespace-nowrap text-[11px] text-muted">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 border-t border-line pt-5 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted">Period revenue</p>
              <p className="mt-1 font-semibold text-violet-300">
                {money(totalTrendRevenue)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Period expenses</p>
              <p className="mt-1 font-semibold text-sky-300">
                {money(totalTrendExpenses)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Period net result</p>
              <p className="mt-1 font-semibold text-white">
                {money(totalTrendRevenue - totalTrendExpenses)}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <div className="surface rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-white">Order status</h2>
                <p className="mt-1 text-xs text-muted">
                  Distribution across all order stages.
                </p>
              </div>
              <ShoppingBag size={19} className="text-violet-400" />
            </div>

            <div className="mt-6 flex h-4 overflow-hidden rounded-full bg-white/5">
              {orderStatusBreakdown.map((item) => (
                <div
                  key={item.status}
                  title={`${item.status}: ${item.count}`}
                  className={`${statusColors[item.status]} transition-all`}
                  style={{
                    width: `${(item.count / totalOrders) * 100}%`,
                  }}
                />
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {orderStatusBreakdown.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${statusColors[item.status]}`}
                    />
                    <span className="text-sm text-slate-300">
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted">
                      {((item.count / totalOrders) * 100).toFixed(1)}%
                    </span>
                    <span className="w-7 text-right text-sm font-medium text-white">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-white">Customer insights</h2>
                <p className="mt-1 text-xs text-muted">
                  New and returning customer activity.
                </p>
              </div>
              <Users size={19} className="text-sky-400" />
            </div>

            <div className="mt-7 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/[0.03] p-4">
                <p className="text-xs text-muted">New customers</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {customerInsights.newCustomers}
                </p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-4">
                <p className="text-xs text-muted">Repeat customers</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {customerInsights.repeatCustomers}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Repeat purchase rate</span>
                <span className="font-semibold text-emerald-400">
                  {customerInsights.repeatPurchaseRate}%
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{
                    width: `${customerInsights.repeatPurchaseRate}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-6 border-t border-line pt-5">
              <p className="text-xs text-muted">Average customer value</p>
              <p className="mt-1 text-xl font-semibold text-white">
                {money(customerInsights.averageCustomerValue)}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <div className="surface rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-white">Top products</h2>
                <p className="mt-1 text-xs text-muted">
                  Highest revenue-generating products.
                </p>
              </div>
              <BarChart3 size={19} className="text-violet-400" />
            </div>

            <div className="mt-6 space-y-5">
              {topProducts.map((product, index) => (
                <div key={product.name}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs text-muted">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted">
                          {product.unitsSold} units sold · {product.category}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-medium text-white">
                      {money(product.revenue)}
                    </p>
                  </div>
                  <div className="ml-10 h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-violet-400"
                      style={{
                        width: `${(product.revenue / maxProductRevenue) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="ml-10 mt-1 text-[11px] text-muted">
                    Estimated product profit: {money(product.profit)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-white">Sales channels</h2>
                <p className="mt-1 text-xs text-muted">
                  Revenue attributed to each source.
                </p>
              </div>
              <TrendingUp size={19} className="text-emerald-400" />
            </div>

            <div className="mt-6 space-y-5">
              {channelPerformance.map((channel) => (
                <div key={channel.channel}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-300">
                      {channel.channel}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-white">
                        {money(channel.revenue)}
                      </span>
                      <span className="ml-2 text-xs text-muted">
                        {channel.orders} orders
                      </span>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-sky-400"
                      style={{
                        width: `${(channel.revenue / maxChannelRevenue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <div className="surface rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-white">Expense breakdown</h2>
                <p className="mt-1 text-xs text-muted">
                  Business spending by category.
                </p>
              </div>
              <Wallet size={19} className="text-rose-400" />
            </div>

            <div className="mt-6 space-y-5">
              {expenseBreakdown.map((item) => (
                <div key={item.category}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-300">{item.category}</span>
                    <span className="font-medium text-white">
                      {money(item.amount)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-rose-400"
                      style={{
                        width: `${(item.amount / maxExpense) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-line pt-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted">Total expenses</span>
                <span className="font-semibold text-white">
                  {money(totalExpenses)}
                </span>
              </div>
            </div>
          </div>

          <div className="surface rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-white">Business targets</h2>
                <p className="mt-1 text-xs text-muted">
                  Progress against monthly business goals.
                </p>
              </div>
              <Target size={19} className="text-violet-400" />
            </div>

            <div className="mt-7 space-y-7">
              {[
                {
                  label: 'Revenue target',
                  current: analyticsSummary.revenue,
                  target: businessTargets.monthlyRevenue,
                  progress: targetProgress.revenue,
                },
                {
                  label: 'Orders target',
                  current: analyticsSummary.orders,
                  target: businessTargets.monthlyOrders,
                  progress: targetProgress.orders,
                },
                {
                  label: 'Profit target',
                  current: analyticsSummary.profit,
                  target: businessTargets.monthlyProfit,
                  progress: targetProgress.profit,
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-slate-300">
                      {item.label}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {item.progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-violet-400 transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {typeof item.current === 'number' &&
                    item.label === 'Orders target'
                      ? `${item.current} / ${item.target} orders`
                      : `${money(item.current)} / ${money(item.target)}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="pb-3 text-center text-xs text-muted">
          Niman Prints Business OS · Analytics module · Demo data
        </footer>
      </div>
    </main>
  );
}
