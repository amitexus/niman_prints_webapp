
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bot,
  Boxes,
  ChevronDown,
  Gift,
  LayoutDashboard,
  Megaphone,
  PanelLeftClose,
  Settings,
  ShoppingCart,
  ClipboardList,
  CreditCard,
  Users,
  Warehouse,
} from 'lucide-react';

const groups = [
  {
    label: 'WORKSPACE',
    items: [
      { name: 'Overview', href: '/', icon: LayoutDashboard },
      { name: 'Orders', href: '/orders', icon: ShoppingCart, count: '12' },
      { name: 'Products', href: '/products', icon: Gift },
      { name: 'Customers', href: '/customers', icon: Users },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { name: 'Production', href: '/production', icon: ClipboardList, count: '18' },
      { name: 'Inventory', href: '/inventory', icon: Warehouse },
      { name: 'Suppliers', href: '/suppliers', icon: Boxes },
      { name: 'Finance', href: '/finance', icon: CreditCard },
    ],
  },
  {
    label: 'GROWTH',
    items: [
      { name: 'Marketing', href: '/marketing', icon: Megaphone },
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
      { name: 'AI Studio', href: '/ai-studio', icon: Bot, tag: 'BETA' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? 'w-[82px]' : 'w-[258px]'
      } hidden shrink-0 flex-col border-r border-line bg-[#0d1019] transition-all duration-200 lg:flex`}
    >
      <div className="flex h-[76px] items-center justify-between border-b border-line px-5">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600 shadow-glow">
            <Gift size={20} className="text-white" />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[15px] font-bold tracking-[.16em] text-white">
                NIMAN<span className="text-violet-300">.</span>
              </p>
              <p className="mt-0.5 whitespace-nowrap text-[9px] font-semibold tracking-[.22em] text-slate-500">
                PRINTS BUSINESS OS
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white"
          aria-label="Toggle sidebar"
        >
          <PanelLeftClose
            size={16}
            className={collapsed ? 'rotate-180' : ''}
          />
        </button>
      </div>

      <div className="scrollbar-hide flex-1 overflow-y-auto px-3 py-6">
        {!collapsed && (
          <div className="mb-3 flex items-center justify-between px-3">
            <span className="text-[10px] font-bold tracking-[.16em] text-slate-600">
              MAIN MENU
            </span>
            <ChevronDown size={13} className="text-slate-600" />
          </div>
        )}

        {groups.map((group) => (
          <div key={group.label} className="mb-7">
            {!collapsed && (
              <p className="mb-2 px-3 text-[9px] font-bold tracking-[.17em] text-slate-600">
                {group.label}
              </p>
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const selected =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] font-medium transition ${
                      selected
                        ? 'bg-violet-500/15 text-violet-200 ring-1 ring-violet-400/20'
                        : 'text-slate-400 hover:bg-white/[.04] hover:text-slate-100'
                    }`}
                  >
                    <Icon
                      size={17}
                      className={
                        selected
                          ? 'shrink-0 text-violet-300'
                          : 'shrink-0 text-slate-500 group-hover:text-slate-300'
                      }
                    />

                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.name}</span>

                        {'count' in item && (
                          <span className="rounded-md bg-white/[.06] px-1.5 py-0.5 text-[10px] text-slate-400">
                            {item.count}
                          </span>
                        )}

                        {'tag' in item && (
                          <span className="rounded bg-violet-400/15 px-1.5 py-0.5 text-[8px] font-bold text-violet-300">
                            {item.tag}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-line p-3">
        <Link
          href="/settings"
          title={collapsed ? 'Settings' : undefined}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] text-slate-400 hover:bg-white/[.04] hover:text-white ${
            pathname.startsWith('/settings') ? 'bg-white/5 text-white' : ''
          }`}
        >
          <Settings size={17} />
          {!collapsed && 'Settings'}
        </Link>

        <div
          className={`mt-3 flex items-center gap-3 rounded-xl border border-line bg-white/[.025] p-2.5 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-orange-300 to-rose-500 text-[10px] font-bold text-slate-950">
            AK
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-slate-200">
                Business owner
              </p>
              <p className="text-[10px] text-slate-500">Niman Prints</p>
            </div>
          )}

          {!collapsed && (
            <ChevronDown size={14} className="text-slate-500" />
          )}
        </div>
      </div>
    </aside>
  );
}
