
'use client';

import { useMemo, useState } from 'react';
import {
  Search, Plus, X, Eye, Clock3, CheckCircle2, Factory,
  PackageCheck, AlertTriangle, ClipboardList, 
} from 'lucide-react';

import {
  initialProductionJobs,
  productionStages,
  type ProductionJob,
  type ProductionStatus,
  type ProductionPriority,
} from '@/lib/production';

const statusStyles: Record<ProductionStatus, string> = {
  'Design Pending': 'bg-amber-400/10 text-amber-300',
  'Design Approved': 'bg-blue-400/10 text-blue-300',
  Printing: 'bg-violet-400/10 text-violet-300',
  'Quality Check': 'bg-orange-400/10 text-orange-300',
  'Ready to Ship': 'bg-emerald-400/10 text-emerald-300',
  Dispatched: 'bg-slate-400/10 text-slate-300',
};

const priorityStyles: Record<ProductionPriority, string> = {
  Normal: 'text-slate-400',
  High: 'text-amber-300',
  Urgent: 'text-rose-300',
};

const emptyForm = {
  orderId: '',
  customer: '',
  product: '',
  quantity: '1',
  status: 'Design Pending' as ProductionStatus,
  priority: 'Normal' as ProductionPriority,
  dueDate: '',
  assignedTo: 'Production Team',
  notes: '',
};

function formatDate(date: string) {
  if (!date) return 'Not set';

  return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ProductionPage() {
  const [jobs, setJobs] = useState(initialProductionJobs);
  const [query, setQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState('All');
  const [selectedJob, setSelectedJob] = useState<ProductionJob | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const searchMatch =
        `${job.id} ${job.orderId} ${job.customer} ${job.product}`
          .toLowerCase()
          .includes(query.toLowerCase());

      const statusMatch =
        activeStatus === 'All' || job.status === activeStatus;

      return searchMatch && statusMatch;
    });
  }, [jobs, query, activeStatus]);

  const activeJobs = jobs.filter(job => job.status !== 'Dispatched');
  const completedJobs = jobs.filter(job => job.status === 'Dispatched');
  const urgentJobs = activeJobs.filter(job => job.priority === 'Urgent');
  const readyJobs = jobs.filter(job => job.status === 'Ready to Ship');

  function updateStatus(id: string, status: ProductionStatus) {
    setJobs(previous =>
      previous.map(job => job.id === id ? { ...job, status } : job)
    );

    setSelectedJob(previous =>
      previous?.id === id ? { ...previous, status } : previous
    );
  }

  function createJob(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newJob: ProductionJob = {
      id: `JOB-${String(Date.now()).slice(-6)}`,
      orderId: form.orderId.trim() || 'Not linked',
      customer: form.customer.trim(),
      product: form.product.trim(),
      quantity: Math.max(1, Number(form.quantity)),
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate,
      assignedTo: form.assignedTo.trim() || 'Unassigned',
      notes: form.notes.trim(),
    };

    setJobs(previous => [newJob, ...previous]);
    setModalOpen(false);
    setForm(emptyForm);
  }

  const tabs = ['All', ...productionStages];

  return (
    <main className="min-w-0 flex-1">
      {/* Header */}
      <header className="sticky top-0 z-20 flex min-h-[76px] items-center justify-between gap-3 border-b border-line bg-[#090b12]/90 px-5 backdrop-blur-xl md:px-8">
        <div>
          <p className="text-[10px] text-slate-500">
            Workspace / Operations / Production
          </p>
          <h1 className="mt-1 text-[17px] font-semibold text-white">
            Production Management
          </h1>
        </div>

        <button
          onClick={() => {
            setForm(emptyForm);
            setModalOpen(true);
          }}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-400"
        >
          <Plus size={15} />
          New Job
        </button>
      </header>

      <div className="mx-auto max-w-[1500px] space-y-6 p-5 md:p-8">
        {/* Page introduction */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-violet-300">
            Workshop operations
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Manage your production workflow
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Track every customized order from design approval to dispatch.
          </p>
        </div>

        {/* Demo notice */}
        <div className="rounded-xl border border-amber-400/15 bg-amber-400/[.05] px-4 py-3">
          <p className="text-[11px] font-semibold text-amber-100">
            Preview mode · Sample production jobs
          </p>
          <p className="mt-1 text-[10px] text-amber-100/55">
            Changes are temporary and reset when this page is refreshed.
          </p>
        </div>

        {/* KPI cards */}
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Active jobs',
              value: activeJobs.length,
              icon: Factory,
              color: 'text-violet-300',
            },
            {
              label: 'Ready to ship',
              value: readyJobs.length,
              icon: PackageCheck,
              color: 'text-emerald-300',
            },
            {
              label: 'Urgent jobs',
              value: urgentJobs.length,
              icon: AlertTriangle,
              color: 'text-rose-300',
            },
            {
              label: 'Dispatched',
              value: completedJobs.length,
              icon: CheckCircle2,
              color: 'text-blue-300',
            },
          ].map(item => {
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
                  {item.value}
                </p>
              </div>
            );
          })}
        </section>

        {/* Workflow overview */}
        <section className="rounded-2xl border border-line bg-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Production pipeline
              </h3>
              <p className="mt-1 text-[10px] text-slate-500">
                Jobs grouped by current stage
              </p>
            </div>
            <ClipboardList size={18} className="text-violet-300" />
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
            {productionStages.map((stage, index) => {
              const count = jobs.filter(job => job.status === stage).length;

              return (
                <button
                  key={stage}
                  onClick={() => setActiveStatus(stage)}
                  className={`rounded-xl border p-3 text-left transition ${
                    activeStatus === stage
                      ? 'border-violet-400/50 bg-violet-400/10'
                      : 'border-line bg-canvas hover:border-slate-600'
                  }`}
                >
                  <p className="text-[9px] leading-4 text-slate-400">
                    {stage}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {count}
                  </p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-violet-400"
                      style={{
                        width: `${jobs.length ? (count / jobs.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-[9px] text-slate-600">
                    {index + 1} / 6 stage
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Job queue */}
        <section className="overflow-hidden rounded-2xl border border-line bg-panel">
          <div className="flex flex-col justify-between gap-4 border-b border-line p-5 lg:flex-row lg:items-center">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Production queue
              </h3>
              <p className="mt-1 text-[10px] text-slate-500">
                {filteredJobs.length} jobs displayed
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex min-w-[190px] flex-1 items-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2.5 lg:flex-none">
                <Search size={14} className="text-slate-500" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search jobs, orders..."
                  className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-600"
                />
              </div>

              <select
                value={activeStatus}
                onChange={e => setActiveStatus(e.target.value)}
                className="max-w-[180px] rounded-xl border border-line bg-canvas px-3 py-2.5 text-xs text-slate-300 outline-none"
              >
                {tabs.map(tab => (
                  <option key={tab} value={tab}>{tab}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead>
                <tr className="bg-white/[.015] text-[9px] uppercase tracking-wider text-slate-600">
                  <th className="px-5 py-4">Job / Order</th>
                  <th className="px-3 py-4">Customer / Product</th>
                  <th className="px-3 py-4">Quantity</th>
                  <th className="px-3 py-4">Priority</th>
                  <th className="px-3 py-4">Due date</th>
                  <th className="px-3 py-4">Current stage</th>
                  <th className="px-5 py-4">Details</th>
                </tr>
              </thead>

              <tbody>
                {filteredJobs.map(job => (
                  <tr
                    key={job.id}
                    className="border-t border-line/70 text-[11px] transition hover:bg-white/[.02]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-200">{job.id}</p>
                      <p className="mt-1 text-[9px] text-slate-500">
                        {job.orderId}
                      </p>
                    </td>

                    <td className="px-3 py-4">
                      <p className="font-medium text-slate-200">{job.customer}</p>
                      <p className="mt-1 text-[9px] text-slate-500">
                        {job.product}
                      </p>
                    </td>

                    <td className="px-3 py-4 text-slate-300">
                      {job.quantity} pcs
                    </td>

                    <td className="px-3 py-4">
                      <span className={`text-[10px] font-semibold ${priorityStyles[job.priority]}`}>
                        {job.priority === 'Urgent' && '● '}
                        {job.priority}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-slate-400">
                      {formatDate(job.dueDate)}
                    </td>

                    <td className="px-3 py-4">
                      <select
                        value={job.status}
                        onChange={e => updateStatus(
                          job.id,
                          e.target.value as ProductionStatus
                        )}
                        className={`max-w-[155px] rounded-lg border border-line bg-canvas px-2 py-2 text-[10px] outline-none ${statusStyles[job.status]}`}
                      >
                        {productionStages.map(stage => (
                          <option key={stage} value={stage}>
                            {stage}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[10px] text-slate-300 hover:border-violet-400/40 hover:text-violet-300"
                      >
                        <Eye size={12} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredJobs.length === 0 && (
              <div className="py-14 text-center">
                <Factory size={28} className="mx-auto text-slate-600" />
                <p className="mt-3 text-xs text-slate-300">
                  No production jobs found
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  Change the search or stage filter.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Workflow guidance */}
        <section className="rounded-2xl border border-line bg-panel p-5">
          <h3 className="text-sm font-semibold text-white">
            Production workflow guide
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[
              ['01', 'Design Pending', 'Prepare the artwork and send it for customer approval.'],
              ['02', 'Design Approved', 'Confirm the approved design and production specifications.'],
              ['03', 'Printing', 'Print the customized product using the correct process.'],
              ['04', 'Quality Check', 'Inspect print quality, spelling, color and product condition.'],
              ['05', 'Ready to Ship', 'Pack the approved product and prepare dispatch details.'],
              ['06', 'Dispatched', 'Record that the order has left for delivery.'],
            ].map(([number, title, description]) => (
              <div key={number} className="flex gap-3 rounded-xl border border-line bg-canvas p-3">
                <span className="text-xs font-semibold text-violet-300">{number}</span>
                <div>
                  <p className="text-[11px] font-semibold text-slate-200">{title}</p>
                  <p className="mt-1 text-[10px] leading-5 text-slate-500">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* New production job modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-lg rounded-2xl border border-line bg-panel shadow-2xl">
            <div className="flex items-center justify-between border-b border-line p-5">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Create production job
                </h3>
                <p className="mt-1 text-[10px] text-slate-500">
                  Add an order to your production queue.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={createJob} className="space-y-4 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[10px] text-slate-400">Order ID (optional)</span>
                  <input
                    value={form.orderId}
                    onChange={e => setForm(p => ({ ...p, orderId: e.target.value }))}
                    placeholder="#NP-1087"
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] text-slate-400">Customer name</span>
                  <input
                    required
                    value={form.customer}
                    onChange={e => setForm(p => ({ ...p, customer: e.target.value }))}
                    placeholder="Customer or company"
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-[10px] text-slate-400">Product</span>
                <input
                  required
                  value={form.product}
                  onChange={e => setForm(p => ({ ...p, product: e.target.value }))}
                  placeholder="e.g. Customized 600ml Bottle"
                  className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[10px] text-slate-400">Quantity</span>
                  <input
                    required
                    min="1"
                    type="number"
                    value={form.quantity}
                    onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] text-slate-400">Due date</span>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[10px] text-slate-400">Priority</span>
                  <select
                    value={form.priority}
                    onChange={e => setForm(p => ({ ...p, priority: e.target.value as ProductionPriority }))}
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none"
                  >
                    <option>Normal</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] text-slate-400">Starting stage</span>
                  <select
                    value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value as ProductionStatus }))}
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none"
                  >
                    {productionStages.map(stage => (
                      <option key={stage}>{stage}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-[10px] text-slate-400">Assigned team or person</span>
                <input
                  value={form.assignedTo}
                  onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))}
                  placeholder="Production Team"
                  className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none focus:border-violet-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] text-slate-400">Production notes</span>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Design requirements, print instructions, packaging..."
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
                  Create job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Production job details */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-md rounded-2xl border border-line bg-panel p-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] text-slate-500">
                  Production job · {selectedJob.id}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  {selectedJob.product}
                </h3>
                <p className="mt-1 text-[10px] text-slate-500">
                  {selectedJob.orderId}
                </p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {[
                ['Customer', selectedJob.customer],
                ['Quantity', `${selectedJob.quantity} pieces`],
                ['Priority', selectedJob.priority],
                ['Due date', formatDate(selectedJob.dueDate)],
                ['Assigned to', selectedJob.assignedTo],
                ['Notes', selectedJob.notes || 'No notes'],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-line pb-3">
                  <p className="text-[9px] text-slate-500">{label}</p>
                  <p className="mt-1 text-xs text-slate-200">{value}</p>
                </div>
              ))}

              <div>
                <p className="mb-2 text-[9px] text-slate-500">Update production stage</p>
                <select
                  value={selectedJob.status}
                  onChange={e => updateStatus(
                    selectedJob.id,
                    e.target.value as ProductionStatus
                  )}
                  className="w-full rounded-xl border border-line bg-canvas px-3 py-3 text-xs text-white outline-none"
                >
                  {productionStages.map(stage => (
                    <option key={stage}>{stage}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setSelectedJob(null)}
              className="mt-5 w-full rounded-xl border border-line py-3 text-xs text-slate-300 hover:bg-white/5"
            >
              Close details
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
