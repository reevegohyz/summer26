'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Trade } from '@/types'

export default function DashboardPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrades = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('trades')
        .select('*')
        .order('trade_date', { ascending: false })
        .order('time_et', { ascending: false })
        .limit(10)
      setTrades(data || [])
      setLoading(false)
    }
    fetchTrades()
  }, [])

  const closedTrades = trades.filter(t => !t.is_open)
  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const wins = closedTrades.filter(t => (t.pnl || 0) > 0)
  const losses = closedTrades.filter(t => (t.pnl || 0) < 0)
  const winRate = closedTrades.length > 0 ? Math.round((wins.length / closedTrades.length) * 100) : 0
  const grossWins = wins.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const grossLosses = Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0))
  const profitFactor = grossLosses > 0 ? (grossWins / grossLosses).toFixed(2) : '—'
  const totalFees = trades.reduce((sum, t) => sum + (t.fees || 0), 0)

  const metrics = [
    { label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, green: totalPnl >= 0, sub: `${closedTrades.length} closed trades` },
    { label: 'Win Rate', value: `${winRate}%`, sub: `${wins.length} of ${closedTrades.length} trades` },
    { label: 'Profit Factor', value: profitFactor, sub: 'Gross W / L' },
    { label: 'Total Fees', value: `-$${totalFees.toFixed(2)}`, red: true, sub: 'Commission drag' },
  ]

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e5d5c0]">

      {/* Topbar */}
      <div className="px-6 py-4 border-b border-[#1f2937] flex justify-between items-center">
        <div className="text-[15px] font-medium">Dashboard</div>
        <div className="text-[12px] text-[#4b5563]">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="p-6 flex flex-col gap-5">

        {/* Metric cards */}
        <div className="grid grid-cols-4 gap-3">
          {metrics.map((m) => (
            <div key={m.label} className="bg-[#111827] rounded-lg p-4 border border-[#1f2937]">
              <div className="text-[11px] text-[#4b5563] mb-1">{m.label}</div>
              <div className={`text-xl font-medium ${m.green ? 'text-[#34d399]' : m.red ? 'text-[#f87171]' : 'text-[#e5d5c0]'}`}>
                {m.value}
              </div>
              <div className="text-[11px] text-[#374151] mt-1">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Recent trades */}
        <div className="bg-[#111827] rounded-lg border border-[#1f2937]">
          <div className="px-5 py-3 border-b border-[#1f2937] flex justify-between items-center">
            <div className="text-[12px] text-[#6b7280]">Recent trades</div>
            <a href="/trades" className="text-[11px] text-[#d4b896] hover:underline">View all →</a>
          </div>

          {loading ? (
            <div className="px-5 py-8 text-[13px] text-[#374151]">Loading...</div>
          ) : trades.length === 0 ? (
            <div className="px-5 py-8 text-[13px] text-[#374151]">No trades yet — import your first statement below.</div>
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[#1f2937]">
                  {['Time', 'Ticker', 'Type', 'Contract', 'Position', 'Price', 'P&L'].map(h => (
                    <th key={h} className="px-5 py-2 text-left text-[10px] text-[#374151] uppercase tracking-widest font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.map((trade, i) => (
                  <tr key={trade.id || i} className="border-b border-[#1a2234] hover:bg-[#1a2234] transition-colors">
                    <td className="px-5 py-3 text-[#6b7280]">{trade.time_et?.slice(0, 5) || '—'}</td>
                    <td className="px-5 py-3 font-medium text-[#e5d5c0]">{trade.ticker}</td>
                    <td className="px-5 py-3">
                      {trade.option_type ? (
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium
                          ${trade.option_type === 'CALL' ? 'bg-[#1e3a5f] text-[#93c5fd]' : 'bg-[#3b1f5e] text-[#c4b5fd]'}`}>
                          {trade.option_type}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#1f2937] text-[#6b7280]">EQ</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[#6b7280]">
                      {trade.option_type
                        ? `${trade.strike_price}${trade.option_type === 'CALL' ? 'C' : 'P'} ${trade.expiry_date?.slice(5).replace('-', '/') || ''}`
                        : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium
                        ${trade.is_open ? 'bg-[#422006] text-[#fb923c]' : 'bg-[#064e3b] text-[#6ee7b7]'}`}>
                        {trade.is_open ? 'Holding' : 'Closed'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#9ca3af]">${trade.price}</td>
                    <td className={`px-5 py-3 font-medium ${(trade.pnl || 0) >= 0 ? 'text-[#34d399]' : 'text-[#f87171]'}`}>
                      {trade.pnl != null ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Import drop zone */}
        <div
          className="border border-dashed border-[#1f2937] rounded-xl px-6 py-5 flex items-center justify-between gap-4 hover:border-[#d4b896] transition-colors cursor-pointer group"
          onClick={() => document.getElementById('statement-input')?.click()}
        >
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-[#1a2234] rounded-lg flex items-center justify-center text-[#d4b896] group-hover:bg-[#1f2937] transition-colors">
              <i className="ti ti-file-upload text-lg" aria-hidden="true" />
            </div>
            <div>
              <div className="text-[13px] font-medium text-[#e5d5c0]">Import Webull statement</div>
              <div className="text-[11px] text-[#4b5563] mt-0.5">Drop your PDF here — trades auto-populate above</div>
            </div>
          </div>
          <div className="text-[12px] text-[#d4b896] border border-[#d4b896] rounded-md px-3 py-1.5">
            Browse file
          </div>
          <input id="statement-input" type="file" accept=".pdf" className="hidden" />
        </div>

      </div>
    </div>
  )
}