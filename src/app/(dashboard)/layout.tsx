'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    section: 'Main',
    links: [
      { href: '/dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' },
      { href: '/trades', label: 'Trade Log', icon: 'ti-list' },
    ],
  },
  {
    section: 'Analysis',
    links: [
      { href: '/insights', label: 'Insights', icon: 'ti-chart-line' },
      { href: '/edge', label: 'Edge Test', icon: 'ti-test-pipe' },
    ],
  },
  {
    section: 'Session',
    links: [
      { href: '/prep', label: 'Prep', icon: 'ti-clipboard' },
    ],
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-[#0d1117] overflow-hidden">
      <aside className="w-[200px] bg-[#111827] border-r border-[#1f2937] flex flex-col flex-shrink-0">
        <div className="px-4 pt-5 pb-5">
          <div className="text-[#d4b896] text-sm font-medium">Trading Diary</div>
          <div className="text-[#6b7280] text-[11px] mt-0.5">v1.0</div>
        </div>

        <nav className="flex flex-col flex-1">
          {navItems.map((group) => (
            <div key={group.section}>
              <div className="px-4 pt-3 pb-1 text-[10px] text-[#374151] tracking-widest uppercase">
                {group.section}
              </div>
              {group.links.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2.5 px-4 py-2.5 text-[13px] border-l-2 transition-colors
                      ${isActive
                        ? 'text-[#d4b896] bg-[#1a2234] border-[#d4b896]'
                        : 'text-[#6b7280] border-transparent hover:text-[#9ca3af] hover:bg-[#1a2234]'
                      }`}
                  >
                    <i className={`ti ${link.icon} text-base`} aria-hidden="true" />
                    {link.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-[#1f2937]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#1a2234] border border-[#d4b896] flex items-center justify-center text-[11px] font-medium text-[#d4b896]">
              RG
            </div>
            <span className="text-[12px] text-[#9ca3af]">Reeve</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}