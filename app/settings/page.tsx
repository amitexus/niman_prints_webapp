'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Bot,
  Building2,
  Check,
  ChevronRight,
  Globe,
  LockKeyhole,
  Save,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';

import {
  initialBusinessSettings,
  initialNotificationSettings,
  initialOrderSettings,
  initialAISettings,
  regionalCurrencyOptions,
  businessRoles,
  type BusinessSettings,
  type NotificationSettings,
  type OrderSettings,
  type AISettings,
} from '@/lib/settings';

type SettingsTab =
  | 'business'
  | 'regional'
  | 'orders'
  | 'notifications'
  | 'ai'
  | 'roles';

const tabs: {
  id: SettingsTab;
  label: string;
  description: string;
  icon: typeof Building2;
}[] = [
  {
    id: 'business',
    label: 'Business profile',
    description: 'Business identity and contact information',
    icon: Building2,
  },
  {
    id: 'regional',
    label: 'Regional settings',
    description: 'Currency, timezone and date format',
    icon: Globe,
  },
  {
    id: 'orders',
    label: 'Order preferences',
    description: 'Default order and payment workflow',
    icon: ShoppingBag,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Choose which events need attention',
    icon: Bell,
  },
  {
    id: 'ai',
    label: 'AI configuration',
    description: 'Provider and model preferences',
    icon: Bot,
  },
  {
    id: 'roles',
    label: 'Team & permissions',
    description: 'Planned staff access levels',
    icon: ShieldCheck,
  },
];

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-300">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-canvas px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-accent"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-300">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-line bg-canvas px-4 py-3 text-sm text-white outline-none focus:border-accent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-4 last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="mt-1 text-xs text-muted">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? 'bg-accent' : 'bg-gray-700'
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('business');

  const [business, setBusiness] = useState<BusinessSettings>({
    ...initialBusinessSettings,
  });

  const [notifications, setNotifications] =
    useState<NotificationSettings>({
      ...initialNotificationSettings,
    });

  const [orderSettings, setOrderSettings] = useState<OrderSettings>({
    ...initialOrderSettings,
  });

  const [aiSettings, setAISettings] = useState<AISettings>({
    ...initialAISettings,
  });

  const [savedMessage, setSavedMessage] = useState('');

  function updateBusiness<K extends keyof BusinessSettings>(
    key: K,
    value: BusinessSettings[K],
  ) {
    setBusiness((previous) => ({ ...previous, [key]: value }));
    setSavedMessage('');
  }

  function saveSettings() {
    setSavedMessage('Your settings have been saved in this session.');
  }

  function resetCurrentTab() {
    if (!window.confirm('Reset this section to its default settings?')) {
      return;
    }

    if (activeTab === 'business' || activeTab === 'regional') {
      setBusiness({ ...initialBusinessSettings });
    }

    if (activeTab === 'notifications') {
      setNotifications({ ...initialNotificationSettings });
    }

    if (activeTab === 'orders') {
      setOrderSettings({ ...initialOrderSettings });
    }

    if (activeTab === 'ai') {
      setAISettings({ ...initialAISettings });
    }

    setSavedMessage('');
  }

  const activeTabInfo = tabs.find((tab) => tab.id === activeTab);
  const ActiveIcon = activeTabInfo?.icon ?? Settings2;

  return (
    <div className="min-h-screen bg-canvas text-white">
      <div className="border-b border-line px-5 py-6 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-muted">
              <Settings2 size={14} />
              Business configuration
              <ChevronRight size={13} />
              Settings
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Settings
            </h1>

            <p className="mt-2 text-sm text-muted">
              Manage your business preferences and application configuration.
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-300 sm:flex">
            <SlidersHorizontal size={14} />
            Prototype settings
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-5 py-7 md:px-8">
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <LockKeyhole className="mt-0.5 shrink-0 text-amber-400" size={18} />
          <div>
            <p className="text-sm font-medium text-amber-200">
              Local prototype configuration
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-400">
              Settings are currently held in browser memory. They are not yet
              stored in a database or applied to other modules. Backend
              persistence and real staff permissions will be added later.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Settings navigation */}
          <aside className="h-fit rounded-2xl border border-line bg-panel p-3">
            <p className="px-3 pb-3 pt-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Configuration
            </p>

            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const selected = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSavedMessage('');
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                      selected
                        ? 'bg-accent/15 text-white'
                        : 'text-gray-400 hover:bg-panel-hover hover:text-white'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={selected ? 'text-accent' : ''}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{tab.label}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {tab.description}
                      </p>
                    </div>

                    {selected && (
                      <ChevronRight size={15} className="text-accent" />
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Settings content */}
          <section className="min-w-0 rounded-2xl border border-line bg-panel p-5 md:p-7">
            <div className="mb-7 flex items-center gap-3 border-b border-line pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <ActiveIcon size={21} />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  {activeTabInfo?.label}
                </h2>
                <p className="mt-1 text-xs text-muted">
                  {activeTabInfo?.description}
                </p>
              </div>
            </div>

            {/* BUSINESS PROFILE */}
            {activeTab === 'business' && (
              <div className="space-y-8">
                <div>
                  <SectionHeading
                    title="Business identity"
                    description="Basic information displayed across your business."
                  />

                  <div className="grid gap-5 md:grid-cols-2">
                    <Field
                      label="Business name"
                      value={business.businessName}
                      onChange={(value) =>
                        updateBusiness('businessName', value)
                      }
                    />

                    <Field
                      label="Business tagline"
                      value={business.tagline}
                      onChange={(value) =>
                        updateBusiness('tagline', value)
                      }
                    />

                    <Field
                      label="Business email"
                      type="email"
                      value={business.email}
                      onChange={(value) => updateBusiness('email', value)}
                      placeholder="hello@example.com"
                    />

                    <Field
                      label="Phone number"
                      value={business.phone}
                      onChange={(value) => updateBusiness('phone', value)}
                      placeholder="+977..."
                    />

                    <Field
                      label="WhatsApp number"
                      value={business.whatsapp}
                      onChange={(value) =>
                        updateBusiness('whatsapp', value)
                      }
                      placeholder="+977..."
                    />
                  </div>
                </div>

                <div className="border-t border-line pt-7">
                  <SectionHeading
                    title="Business address"
                    description="Your registered or operating business location."
                  />

                  <div className="grid gap-5 md:grid-cols-2">
                    <Field
                      label="Address"
                      value={business.address}
                      onChange={(value) => updateBusiness('address', value)}
                    />

                    <Field
                      label="City / District"
                      value={business.city}
                      onChange={(value) => updateBusiness('city', value)}
                    />

                    <Field
                      label="Country"
                      value={business.country}
                      onChange={(value) => updateBusiness('country', value)}
                    />
                  </div>
                </div>

                <div className="border-t border-line pt-7">
                  <SectionHeading
                    title="Tax information"
                    description="Store your business tax identifiers for future records."
                  />

                  <Toggle
                    label="VAT registered"
                    description="Indicates whether the business is VAT registered."
                    checked={business.vatRegistered}
                    onChange={(checked) =>
                      updateBusiness('vatRegistered', checked)
                    }
                  />

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <Field
                      label="VAT number"
                      value={business.vatNumber}
                      onChange={(value) =>
                        updateBusiness('vatNumber', value)
                      }
                      placeholder="Enter VAT number"
                    />

                    <Field
                      label="PAN number"
                      value={business.panNumber}
                      onChange={(value) =>
                        updateBusiness('panNumber', value)
                      }
                      placeholder="Enter PAN number"
                    />
                  </div>

                  <p className="mt-4 text-xs leading-5 text-muted">
                    These fields only store business information. They do not
                    calculate tax, generate compliant tax invoices or file
                    VAT returns.
                  </p>
                </div>
              </div>
            )}

            {/* REGIONAL SETTINGS */}
            {activeTab === 'regional' && (
              <div className="space-y-7">
                <SectionHeading
                  title="Regional preferences"
                  description="Configure how amounts and dates are presented."
                />

                <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Globe size={17} className="text-accent" />
                    Base business currency: NPR
                  </div>
                  <p className="mt-2 text-xs leading-5 text-gray-400">
                    Niman Prints uses NPR as its base reporting currency.
                    Supplier purchases from India can use INR with a
                    transaction-specific exchange rate.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <SelectField
                    label="Base currency"
                    value={business.currency}
                    onChange={(value) =>
                      updateBusiness('currency', value as 'NPR')
                    }
                    options={regionalCurrencyOptions
                      .filter((currency) => currency.code === 'NPR')
                      .map((currency) => ({
                        label: `${currency.code} — ${currency.name}`,
                        value: currency.code,
                      }))}
                  />

                  <SelectField
                    label="Timezone"
                    value={business.timezone}
                    onChange={(value) => updateBusiness('timezone', value)}
                    options={[
                      {
                        label: 'Nepal Standard Time (UTC +05:45)',
                        value: 'Asia/Kathmandu',
                      },
                      {
                        label: 'India Standard Time (UTC +05:30)',
                        value: 'Asia/Kolkata',
                      },
                      {
                        label: 'UTC',
                        value: 'UTC',
                      },
                    ]}
                  />

                  <SelectField
                    label="Date format"
                    value={business.dateFormat}
                    onChange={(value) =>
                      updateBusiness(
                        'dateFormat',
                        value as BusinessSettings['dateFormat'],
                      )
                    }
                    options={[
                      { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
                      { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
                      { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
                    ]}
                  />

                  <Field
                    label="Order number prefix"
                    value={business.orderPrefix}
                    onChange={(value) =>
                      updateBusiness('orderPrefix', value.toUpperCase())
                    }
                    placeholder="NP"
                  />
                </div>

                <div className="border-t border-line pt-7">
                  <SectionHeading
                    title="Delivery defaults"
                    description="Default delivery values for new orders."
                  />

                  <div className="grid gap-5 md:grid-cols-2">
                    <Field
                      label="Default delivery charge (NPR)"
                      type="number"
                      value={business.defaultDeliveryCharge}
                      onChange={(value) =>
                        updateBusiness(
                          'defaultDeliveryCharge',
                          Number(value),
                        )
                      }
                    />

                    <Field
                      label="Free delivery above (NPR)"
                      type="number"
                      value={business.freeDeliveryThreshold}
                      onChange={(value) =>
                        updateBusiness(
                          'freeDeliveryThreshold',
                          Number(value),
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ORDER SETTINGS */}
            {activeTab === 'orders' && (
              <div>
                <SectionHeading
                  title="Order workflow"
                  description="Choose how new orders should be handled."
                />

                <Toggle
                  label="Require design approval"
                  description="Orders should be approved by the customer before printing."
                  checked={orderSettings.requireDesignApproval}
                  onChange={(checked) =>
                    setOrderSettings((previous) => ({
                      ...previous,
                      requireDesignApproval: checked,
                    }))
                  }
                />

                <Toggle
                  label="Allow partial payments"
                  description="Allow customers to pay an advance and settle the balance later."
                  checked={orderSettings.allowPartialPayment}
                  onChange={(checked) =>
                    setOrderSettings((previous) => ({
                      ...previous,
                      allowPartialPayment: checked,
                    }))
                  }
                />

                <Toggle
                  label="Automatically create production job"
                  description="Planned automation when an order enters the production workflow."
                  checked={orderSettings.autoCreateProductionJob}
                  onChange={(checked) =>
                    setOrderSettings((previous) => ({
                      ...previous,
                      autoCreateProductionJob: checked,
                    }))
                  }
                />

                <div className="mt-7 grid gap-5 border-t border-line pt-7 md:grid-cols-2">
                  <SelectField
                    label="Default payment status"
                    value={orderSettings.defaultPaymentStatus}
                    onChange={(value) =>
                      setOrderSettings((previous) => ({
                        ...previous,
                        defaultPaymentStatus:
                          value as OrderSettings['defaultPaymentStatus'],
                      }))
                    }
                    options={[
                      { label: 'Unpaid', value: 'Unpaid' },
                      {
                        label: 'Partially Paid',
                        value: 'Partially Paid',
                      },
                      { label: 'Paid', value: 'Paid' },
                    ]}
                  />

                  <SelectField
                    label="Default order status"
                    value={orderSettings.defaultOrderStatus}
                    onChange={(value) =>
                      setOrderSettings((previous) => ({
                        ...previous,
                        defaultOrderStatus:
                          value as OrderSettings['defaultOrderStatus'],
                      }))
                    }
                    options={[
                      { label: 'New', value: 'New' },
                      {
                        label: 'Design Approval',
                        value: 'Design Approval',
                      },
                      {
                        label: 'In Production',
                        value: 'In Production',
                      },
                    ]}
                  />
                </div>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div>
                <SectionHeading
                  title="Notification preferences"
                  description="Select the business events you want to be notified about."
                />

                <Toggle
                  label="New orders"
                  description="When a customer places a new order."
                  checked={notifications.newOrder}
                  onChange={(checked) =>
                    setNotifications((previous) => ({
                      ...previous,
                      newOrder: checked,
                    }))
                  }
                />

                <Toggle
                  label="Payment received"
                  description="When an order payment is recorded."
                  checked={notifications.paymentReceived}
                  onChange={(checked) =>
                    setNotifications((previous) => ({
                      ...previous,
                      paymentReceived: checked,
                    }))
                  }
                />

                <Toggle
                  label="Low stock alerts"
                  description="When inventory reaches its low-stock threshold."
                  checked={notifications.lowStock}
                  onChange={(checked) =>
                    setNotifications((previous) => ({
                      ...previous,
                      lowStock: checked,
                    }))
                  }
                />

                <Toggle
                  label="Production updates"
                  description="When a production job changes status."
                  checked={notifications.productionUpdates}
                  onChange={(checked) =>
                    setNotifications((previous) => ({
                      ...previous,
                      productionUpdates: checked,
                    }))
                  }
                />

                <Toggle
                  label="New marketing leads"
                  description="When a new lead is added to your pipeline."
                  checked={notifications.newLead}
                  onChange={(checked) =>
                    setNotifications((previous) => ({
                      ...previous,
                      newLead: checked,
                    }))
                  }
                />

                <Toggle
                  label="Daily business summary"
                  description="A planned daily overview of orders, revenue and production."
                  checked={notifications.dailySummary}
                  onChange={(checked) =>
                    setNotifications((previous) => ({
                      ...previous,
                      dailySummary: checked,
                    }))
                  }
                />

                <p className="mt-5 text-xs text-muted">
                  These preferences are not connected to email, WhatsApp or
                  push notifications yet.
                </p>
              </div>
            )}

            {/* AI CONFIGURATION */}
            {activeTab === 'ai' && (
              <div>
                <SectionHeading
                  title="AI configuration"
                  description="Prepare the application for future AI integrations."
                />

                <div className="mb-6 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-violet-200">
                    <Bot size={18} />
                    AI integration is not connected
                  </div>
                  <p className="mt-2 text-xs leading-5 text-gray-400">
                    AI Studio currently creates structured prompts. Actual
                    model responses will be enabled through a secure backend
                    integration.
                  </p>
                </div>

                <Toggle
                  label="Enable AI features"
                  description="Preference for enabling AI features after backend integration."
                  checked={aiSettings.enabled}
                  onChange={(checked) =>
                    setAISettings((previous) => ({
                      ...previous,
                      enabled: checked,
                    }))
                  }
                />

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <SelectField
                    label="AI provider"
                    value={aiSettings.provider}
                    onChange={(value) =>
                      setAISettings((previous) => ({
                        ...previous,
                        provider: value as AISettings['provider'],
                      }))
                    }
                    options={[
                      { label: 'OpenAI', value: 'OpenAI' },
                      { label: 'Other provider', value: 'Other' },
                    ]}
                  />

                  <Field
                    label="Model name"
                    value={aiSettings.model}
                    onChange={(value) =>
                      setAISettings((previous) => ({
                        ...previous,
                        model: value,
                      }))
                    }
                    placeholder="gpt-4.1-mini"
                  />
                </div>

                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">
                      Response creativity
                    </label>
                    <span className="text-sm font-semibold text-accent">
                      {aiSettings.temperature.toFixed(1)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={aiSettings.temperature}
                    onChange={(event) =>
                      setAISettings((previous) => ({
                        ...previous,
                        temperature: Number(event.target.value),
                      }))
                    }
                    className="w-full accent-violet-400"
                  />

                  <div className="mt-2 flex justify-between text-xs text-muted">
                    <span>More precise</span>
                    <span>More creative</span>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-line bg-canvas p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <LockKeyhole size={16} className="text-emerald-400" />
                    API security
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted">
                    Never enter an API key into this browser settings page.
                    Future API credentials will be stored securely as
                    server-side environment variables.
                  </p>
                </div>
              </div>
            )}

            {/* TEAM ROLES */}
            {activeTab === 'roles' && (
              <div>
                <SectionHeading
                  title="Team roles"
                  description="Planned access levels for your future team."
                />

                <div className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-sm font-medium text-amber-200">
                    Access control is not active yet
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-400">
                    These are role definitions for planning only. Users are
                    not authenticated or restricted by these roles yet.
                  </p>
                </div>

                <div className="space-y-3">
                  {businessRoles.map((role) => (
                    <div
                      key={role.id}
                      className="flex flex-col gap-3 rounded-xl border border-line bg-canvas p-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                        <ShieldCheck size={19} />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">
                          {role.name}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {role.description}
                        </p>
                      </div>

                      <span className="w-fit rounded-full border border-line px-3 py-1 text-xs text-muted">
                        Planned
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ACTIONS */}
            <div className="mt-9 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={resetCurrentTab}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-4 py-3 text-sm text-gray-300 transition hover:bg-panel-hover"
              >
                <RotateCcw size={15} />
                Reset section
              </button>

              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                {savedMessage && (
                  <span className="flex items-center justify-center gap-1.5 text-xs text-emerald-400">
                    <Check size={14} />
                    {savedMessage}
                  </span>
                )}

                <button
                  type="button"
                  onClick={saveSettings}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <Save size={16} />
                  Save changes
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 flex items-center justify-between text-xs text-muted">
          <span>Niman Prints Business OS</span>
          <span>Settings · Prototype</span>
        </div>
      </main>
    </div>
  );
}