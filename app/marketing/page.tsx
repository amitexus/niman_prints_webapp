
'use client';

import { useMemo, useState, type FormEvent } from 'react';
import {
  Plus,
  Search,
  Megaphone,
  MousePointerClick,
  MessageCircle,
  ShoppingBag,
  TrendingUp,
  Users,
  X,
  ExternalLink,
} from 'lucide-react';

import {
  initialCampaigns,
  initialLeads,
  type MarketingCampaign,
  type MarketingChannel,
  type CampaignObjective,
  type CampaignStatus,
  type MarketingLead,
  type MarketingLeadStatus,
} from '@/lib/marketing';

const money = (value: number) =>
  `NPR ${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const channels: MarketingChannel[] = [
  'Facebook',
  'Instagram',
  'TikTok',
  'Pinterest',
  'WhatsApp',
  'Other',
];

const objectives: CampaignObjective[] = [
  'Messages',
  'Sales',
  'Traffic',
  'Engagement',
  'Awareness',
  'Leads',
];

const statuses: CampaignStatus[] = [
  'Draft',
  'Scheduled',
  'Active',
  'Paused',
  'Completed',
];

const leadStatuses: MarketingLeadStatus[] = [
  'New',
  'Contacted',
  'Interested',
  'Converted',
  'Lost',
];

const statusStyle: Record<string, string> = {
  Active: 'bg-emerald-400/10 text-emerald-400',
  Completed: 'bg-blue-400/10 text-blue-400',
  Paused: 'bg-amber-400/10 text-amber-400',
  Draft: 'bg-slate-400/10 text-slate-300',
  Scheduled: 'bg-violet-400/10 text-violet-300',
  New: 'bg-blue-400/10 text-blue-400',
  Contacted: 'bg-violet-400/10 text-violet-300',
  Interested: 'bg-amber-400/10 text-amber-400',
  Converted: 'bg-emerald-400/10 text-emerald-400',
  Lost: 'bg-rose-400/10 text-rose-400',
};

function MetricCard({
  title,
  value,
  note,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  note: string;
  icon: typeof Megaphone;
  color: string;
}) {
  return (
    <div className="surface rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{title}</p>
        <div className="rounded-xl bg-white/5 p-2.5">
          <Icon size={18} className={color} />
        </div>
      </div>
      <p className="mt-4 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-muted">{note}</p>
    </div>
  );
}

export default function MarketingPage() {
  const [campaigns, setCampaigns] =
    useState<MarketingCampaign[]>(initialCampaigns);
  const [leads, setLeads] =
    useState<MarketingLead[]>(initialLeads);

  const [activeTab, setActiveTab] = useState<'Campaigns' | 'Leads'>(
    'Campaigns',
  );
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    channel: 'Facebook' as MarketingChannel,
    objective: 'Messages' as CampaignObjective,
    status: 'Draft' as CampaignStatus,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    dailyBudget: '300',
    totalBudget: '3000',
    notes: '',
  });

  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    source: 'Facebook' as MarketingChannel,
    campaignId: '',
    productInterest: '',
    estimatedValue: '0',
    notes: '',
  });

  const metrics = useMemo(() => {
    const active = campaigns.filter((item) => item.status === 'Active');
    const spend = campaigns.reduce((sum, item) => sum + item.spend, 0);
    const revenue = campaigns.reduce((sum, item) => sum + item.revenue, 0);
    const impressions = campaigns.reduce(
      (sum, item) => sum + item.impressions,
      0,
    );
    const clicks = campaigns.reduce((sum, item) => sum + item.clicks, 0);
    const messages = campaigns.reduce(
      (sum, item) => sum + item.messages,
      0,
    );
    const orders = campaigns.reduce((sum, item) => sum + item.orders, 0);

    return {
      active: active.length,
      spend,
      revenue,
      impressions,
      clicks,
      messages,
      orders,
      ctr: impressions ? (clicks / impressions) * 100 : 0,
      roas: spend ? revenue / spend : 0,
      costPerMessage: messages ? spend / messages : 0,
      costPerOrder: orders ? spend / orders : 0,
    };
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((item) => {
      const matchesSearch = [
        item.name,
        item.channel,
        item.objective,
        item.id,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());

      return (
        matchesSearch &&
        (channelFilter === 'All' || item.channel === channelFilter) &&
        (statusFilter === 'All' || item.status === statusFilter)
      );
    });
  }, [campaigns, search, channelFilter, statusFilter]);

  const filteredLeads = useMemo(() => {
    return leads.filter((item) => {
      const matchesSearch = [
        item.name,
        item.phone,
        item.productInterest,
        item.source,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());

      return (
        matchesSearch &&
        (channelFilter === 'All' || item.source === channelFilter) &&
        (statusFilter === 'All' || item.status === statusFilter)
      );
    });
  }, [leads, search, channelFilter, statusFilter]);

  const leadStats = useMemo(() => {
    const converted = leads.filter(
      (item) => item.status === 'Converted',
    );
    const pipeline = leads
      .filter((item) => !['Converted', 'Lost'].includes(item.status))
      .reduce((sum, item) => sum + item.estimatedValue, 0);

    return {
      total: leads.length,
      converted: converted.length,
      pipeline,
      conversionRate: leads.length
        ? (converted.length / leads.length) * 100
        : 0,
    };
  }, [leads]);

  function saveCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const dailyBudget = Number(campaignForm.dailyBudget);
    const totalBudget = Number(campaignForm.totalBudget);

    if (
      !campaignForm.name.trim() ||
      !Number.isFinite(dailyBudget) ||
      !Number.isFinite(totalBudget) ||
      dailyBudget < 0 ||
      totalBudget < 0
    ) {
      return;
    }

    const campaign: MarketingCampaign = {
      id: `CMP-${Date.now()}`,
      name: campaignForm.name.trim(),
      channel: campaignForm.channel,
      objective: campaignForm.objective,
      status: campaignForm.status,
      startDate: campaignForm.startDate,
      endDate: campaignForm.endDate,
      dailyBudget,
      totalBudget,
      spend: 0,
      impressions: 0,
      clicks: 0,
      messages: 0,
      leads: 0,
      orders: 0,
      revenue: 0,
      notes: campaignForm.notes.trim(),
    };

    setCampaigns((current) => [campaign, ...current]);
    setShowCampaignModal(false);
    setCampaignForm({
      name: '',
      channel: 'Facebook',
      objective: 'Messages',
      status: 'Draft',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      dailyBudget: '300',
      totalBudget: '3000',
      notes: '',
    });
  }

  function saveLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!leadForm.name.trim() || !leadForm.phone.trim()) return;

    const lead: MarketingLead = {
      id: `LEAD-${Date.now()}`,
      name: leadForm.name.trim(),
      phone: leadForm.phone.trim(),
      source: leadForm.source,
      campaignId: leadForm.campaignId,
      productInterest: leadForm.productInterest.trim(),
      status: 'New',
      estimatedValue: Math.max(0, Number(leadForm.estimatedValue) || 0),
      date: new Date().toISOString().slice(0, 10),
      notes: leadForm.notes.trim(),
    };

    setLeads((current) => [lead, ...current]);
    setShowLeadModal(false);
    setLeadForm({
      name: '',
      phone: '',
      source: 'Facebook',
      campaignId: '',
      productInterest: '',
      estimatedValue: '0',
      notes: '',
    });
  }

  function updateCampaignStatus(id: string, status: CampaignStatus) {
    setCampaigns((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status } : item,
      ),
    );
  }

  function updateLeadStatus(id: string, status: MarketingLeadStatus) {
    setLeads((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status } : item,
      ),
    );
  }

  function exportCampaigns() {
    const headers = [
      'Campaign',
      'Channel',
      'Objective',
      'Status',
      'Budget',
      'Spend',
      'Impressions',
      'Clicks',
      'Messages',
      'Leads',
      'Orders',
      'Revenue',
      'ROAS',
    ];

    const rows = filteredCampaigns.map((item) => [
      item.name,
      item.channel,
      item.objective,
      item.status,
      item.totalBudget,
      item.spend,
      item.impressions,
      item.clicks,
      item.messages,
      item.leads,
      item.orders,
      item.revenue,
      item.spend ? (item.revenue / item.spend).toFixed(2) : '0',
    ]);

    const escape = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escape).join(','))
      .join('\n');

    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'niman-prints-campaigns.csv';
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
              <span className="text-white">Marketing</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Marketing Studio
            </h1>
            <p className="mt-2 text-sm text-muted">
              Manage campaigns, measure performance and convert leads into customers.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportCampaigns}
              className="rounded-xl border border-line bg-panel px-4 py-2.5 text-sm text-white hover:bg-panel-hover"
            >
              Export campaigns
            </button>
            <button
              onClick={() =>
                activeTab === 'Campaigns'
                  ? setShowCampaignModal(true)
                  : setShowLeadModal(true)
              }
              className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              <Plus size={17} />
              {activeTab === 'Campaigns' ? 'New campaign' : 'Add lead'}
            </button>
          </div>
        </header>

        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-200">
          <strong>Demo mode:</strong> Campaign performance is sample data.
          No live Meta, Instagram, TikTok or Pinterest advertising accounts
          are connected. Changes are currently held in browser memory and
          will reset when the page is refreshed.
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Advertising spend"
            value={money(metrics.spend)}
            note="Recorded campaign spend"
            icon={Megaphone}
            color="text-violet-400"
          />
          <MetricCard
            title="Attributed revenue"
            value={money(metrics.revenue)}
            note="Revenue entered for campaigns"
            icon={TrendingUp}
            color="text-emerald-400"
          />
          <MetricCard
            title="Messages received"
            value={metrics.messages.toLocaleString()}
            note={`${money(metrics.costPerMessage)} average cost/message`}
            icon={MessageCircle}
            color="text-sky-400"
          />
          <MetricCard
            title="Orders attributed"
            value={metrics.orders.toLocaleString()}
            note={`${money(metrics.costPerOrder)} average cost/order`}
            icon={ShoppingBag}
            color="text-amber-400"
          />
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="surface rounded-2xl p-5">
            <p className="text-xs text-muted">Active campaigns</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {metrics.active}
            </p>
          </div>
          <div className="surface rounded-2xl p-5">
            <p className="text-xs text-muted">Total impressions</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {metrics.impressions.toLocaleString()}
            </p>
          </div>
          <div className="surface rounded-2xl p-5">
            <p className="text-xs text-muted">Click-through rate</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {metrics.ctr.toFixed(2)}%
            </p>
          </div>
          <div className="surface rounded-2xl p-5">
            <p className="text-xs text-muted">Return on ad spend</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {metrics.roas.toFixed(2)}x
            </p>
          </div>
        </section>

        <section className="surface rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-white">Lead pipeline</h2>
              <p className="mt-1 text-xs text-muted">
                Follow up with potential customers and track conversions.
              </p>
            </div>
            <Users size={20} className="text-violet-400" />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white/[0.03] p-4">
              <p className="text-xs text-muted">Total leads</p>
              <p className="mt-2 text-xl font-semibold text-white">
                {leadStats.total}
              </p>
            </div>
            <div className="rounded-xl bg-white/[0.03] p-4">
              <p className="text-xs text-muted">Converted leads</p>
              <p className="mt-2 text-xl font-semibold text-emerald-400">
                {leadStats.converted}
              </p>
              <p className="mt-1 text-xs text-muted">
                {leadStats.conversionRate.toFixed(1)}% conversion rate
              </p>
            </div>
            <div className="rounded-xl bg-white/[0.03] p-4">
              <p className="text-xs text-muted">Open pipeline value</p>
              <p className="mt-2 text-xl font-semibold text-violet-300">
                {money(leadStats.pipeline)}
              </p>
            </div>
          </div>
        </section>

        <section className="surface overflow-hidden rounded-2xl">
          <div className="flex flex-col gap-4 border-b border-line p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-white">Marketing workspace</h2>
              <p className="mt-1 text-xs text-muted">
                Campaigns and incoming leads.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('Campaigns')}
                className={`rounded-lg px-4 py-2 text-sm ${
                  activeTab === 'Campaigns'
                    ? 'bg-accent text-white'
                    : 'bg-white/5 text-muted hover:text-white'
                }`}
              >
                Campaigns
              </button>
              <button
                onClick={() => setActiveTab('Leads')}
                className={`rounded-lg px-4 py-2 text-sm ${
                  activeTab === 'Leads'
                    ? 'bg-accent text-white'
                    : 'bg-white/5 text-muted hover:text-white'
                }`}
              >
                Leads
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-5 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  activeTab === 'Campaigns'
                    ? 'Search campaigns...'
                    : 'Search leads...'
                }
                className="w-full rounded-xl border border-line bg-canvas py-2.5 pl-9 pr-3 text-sm text-white outline-none focus:border-accent"
              />
            </div>

            <select
              value={channelFilter}
              onChange={(event) => setChannelFilter(event.target.value)}
              className="rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm text-white outline-none"
            >
              <option value="All">All channels</option>
              {channels.map((channel) => (
                <option key={channel} value={channel}>
                  {channel}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm text-white outline-none"
            >
              <option value="All">All statuses</option>
              {(activeTab === 'Campaigns' ? statuses : leadStatuses).map(
                (status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ),
              )}
            </select>
          </div>

          {activeTab === 'Campaigns' ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-white/[0.025] text-xs text-muted">
                  <tr>
                    <th className="px-5 py-4 font-medium">Campaign</th>
                    <th className="px-5 py-4 font-medium">Channel</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Spend</th>
                    <th className="px-5 py-4 font-medium">Messages</th>
                    <th className="px-5 py-4 font-medium">Orders</th>
                    <th className="px-5 py-4 font-medium">Revenue</th>
                    <th className="px-5 py-4 font-medium">ROAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredCampaigns.map((campaign) => (
                    <tr
                      key={campaign.id}
                      className="transition hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-white">
                          {campaign.name}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {campaign.objective} · {campaign.id}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {campaign.channel}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={campaign.status}
                          onChange={(event) =>
                            updateCampaignStatus(
                              campaign.id,
                              event.target.value as CampaignStatus,
                            )
                          }
                          className={`rounded-full border-0 px-3 py-1.5 text-xs outline-none ${statusStyle[campaign.status]}`}
                        >
                          {statuses.map((status) => (
                            <option
                              key={status}
                              value={status}
                              className="bg-panel text-white"
                            >
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {money(campaign.spend)}
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {campaign.messages}
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {campaign.orders}
                      </td>
                      <td className="px-5 py-4 text-white">
                        {money(campaign.revenue)}
                      </td>
                      <td className="px-5 py-4 font-medium text-emerald-400">
                        {campaign.spend
                          ? `${(campaign.revenue / campaign.spend).toFixed(2)}x`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                  {filteredCampaigns.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-12 text-center text-muted"
                      >
                        No campaigns found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-white/[0.025] text-xs text-muted">
                  <tr>
                    <th className="px-5 py-4 font-medium">Lead</th>
                    <th className="px-5 py-4 font-medium">Product interest</th>
                    <th className="px-5 py-4 font-medium">Source</th>
                    <th className="px-5 py-4 font-medium">Date</th>
                    <th className="px-5 py-4 font-medium">Est. value</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-4">
                        <p className="font-medium text-white">{lead.name}</p>
                        <p className="mt-1 text-xs text-muted">
                          {lead.phone}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {lead.productInterest || 'Not specified'}
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {lead.source}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-300">
                        {lead.date}
                      </td>
                      <td className="px-5 py-4 text-white">
                        {money(lead.estimatedValue)}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={lead.status}
                          onChange={(event) =>
                            updateLeadStatus(
                              lead.id,
                              event.target.value as MarketingLeadStatus,
                            )
                          }
                          className={`rounded-full border-0 px-3 py-1.5 text-xs outline-none ${statusStyle[lead.status]}`}
                        >
                          {leadStatuses.map((status) => (
                            <option
                              key={status}
                              value={status}
                              className="bg-panel text-white"
                            >
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {filteredLeads.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-12 text-center text-muted"
                      >
                        No leads found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="surface flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-white">
              Advertising platform integrations
            </h3>
            <p className="mt-1 text-xs text-muted">
              Connect advertising accounts later to import real campaign data.
            </p>
          </div>
          <span className="flex items-center gap-2 text-xs text-amber-300">
            <ExternalLink size={15} />
            Integrations planned
          </span>
        </div>
      </div>

      {showCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-2xl rounded-2xl border border-line bg-panel shadow-2xl">
            <div className="flex items-center justify-between border-b border-line p-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Create campaign
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Add a campaign to your marketing workspace.
                </p>
              </div>
              <button
                onClick={() => setShowCampaignModal(false)}
                className="rounded-lg p-2 text-muted hover:bg-white/5 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={saveCampaign} className="space-y-4 p-5">
              <label className="block space-y-2">
                <span className="text-xs text-muted">Campaign name</span>
                <input
                  required
                  value={campaignForm.name}
                  onChange={(event) =>
                    setCampaignForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. 600ml Bottle — Gym Audience"
                  className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-white outline-none focus:border-accent"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-xs text-muted">Channel</span>
                  <select
                    value={campaignForm.channel}
                    onChange={(event) =>
                      setCampaignForm((current) => ({
                        ...current,
                        channel: event.target.value as MarketingChannel,
                      }))
                    }
                    className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-white"
                  >
                    {channels.map((channel) => (
                      <option key={channel} value={channel}>
                        {channel}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-xs text-muted">Objective</span>
                  <select
                    value={campaignForm.objective}
                    onChange={(event) =>
                      setCampaignForm((current) => ({
                        ...current,
                        objective: event.target.value as CampaignObjective,
                      }))
                    }
                    className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-white"
                  >
                    {objectives.map((objective) => (
                      <option key={objective} value={objective}>
                        {objective}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-xs text-muted">Daily budget (NPR)</span>
                  <input
                    required
                    min="0"
                    type="number"
                    value={campaignForm.dailyBudget}
                    onChange={(event) =>
                      setCampaignForm((current) => ({
                        ...current,
                        dailyBudget: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-white"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-xs text-muted">Total budget (NPR)</span>
                  <input
                    required
                    min="0"
                    type="number"
                    value={campaignForm.totalBudget}
                    onChange={(event) =>
                      setCampaignForm((current) => ({
                        ...current,
                        totalBudget: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-white"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-xs text-muted">Start date</span>
                  <input
                    required
                    type="date"
                    value={campaignForm.startDate}
                    onChange={(event) =>
                      setCampaignForm((current) => ({
                        ...current,
                        startDate: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-white"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-xs text-muted">End date</span>
                  <input
                    type="date"
                    min={campaignForm.startDate}
                    value={campaignForm.endDate}
                    onChange={(event) =>
                      setCampaignForm((current) => ({
                        ...current,
                        endDate: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-white"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-xs text-muted">Initial status</span>
                <select
                  value={campaignForm.status}
                  onChange={(event) =>
                    setCampaignForm((current) => ({
                      ...current,
                      status: event.target.value as CampaignStatus,
                    }))
                  }
                  className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-white"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-xs text-muted">Notes</span>
                <textarea
                  rows={2}
                  value={campaignForm.notes}
                  onChange={(event) =>
                    setCampaignForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Audience, creative or campaign notes..."
                  className="w-full resize-none rounded-xl border border-line bg-canvas p-3 text-sm text-white"
                />
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowCampaignModal(false)}
                  className="rounded-xl border border-line px-5 py-3 text-sm text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
                >
                  Create campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-xl rounded-2xl border border-line bg-panel shadow-2xl">
            <div className="flex items-center justify-between border-b border-line p-5">
              <div>
                <h2 className="text-lg font-semibold text-white">Add lead</h2>
                <p className="mt-1 text-xs text-muted">
                  Record a new marketing inquiry.
                </p>
              </div>
              <button
                onClick={() => setShowLeadModal(false)}
                className="rounded-lg p-2 text-muted hover:bg-white/5 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={saveLead} className="space-y-4 p-5">
              <label className="block space-y-2">
                <span className="text-xs text-muted">Customer name</span>
                <input
                  required
                  value={leadForm.name}
                  onChange={(event) =>
                    setLeadForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Customer or business name"
                  className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-white"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-xs text-muted">Phone number</span>
                  <input
                    required
                    value={leadForm.phone}
                    onChange={(event) =>
                      setLeadForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="98XXXXXXXX"
                    className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-white"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-xs text-muted">Source</span>
                  <select
                    value={leadForm.source}
                    onChange={(event) =>
                      setLeadForm((current) => ({
                        ...current,
                        source: event.target.value as MarketingChannel,
                      }))
                    }
                    className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-white"
                  >
                    {channels.map((channel) => (
                      <option key={channel} value={channel}>
                        {channel}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-xs text-muted">Campaign</span>
                <select
                  value={leadForm.campaignId}
                  onChange={(event) =>
                    setLeadForm((current) => ({
                      ...current,
                      campaignId: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-white"
                >
                  <option value="">No campaign linked</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-xs text-muted">Product interest</span>
                <input
                  value={leadForm.productInterest}
                  onChange={(event) =>
                    setLeadForm((current) => ({
                      ...current,
                      productInterest: event.target.value,
                    }))
                  }
                  placeholder="e.g. Customized 600ml bottle"
                  className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-white"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs text-muted">
                  Estimated order value (NPR)
                </span>
                <input
                  type="number"
                  min="0"
                  value={leadForm.estimatedValue}
                  onChange={(event) =>
                    setLeadForm((current) => ({
                      ...current,
                      estimatedValue: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-white"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs text-muted">Notes</span>
                <textarea
                  rows={2}
                  value={leadForm.notes}
                  onChange={(event) =>
                    setLeadForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Inquiry details and follow-up notes..."
                  className="w-full resize-none rounded-xl border border-line bg-canvas p-3 text-sm text-white"
                />
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowLeadModal(false)}
                  className="rounded-xl border border-line px-5 py-3 text-sm text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
                >
                  Save lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
