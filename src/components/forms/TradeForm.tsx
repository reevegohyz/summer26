'use client'

import { useState } from 'react'
import { Trade, Ticker, Direction, SetupTag, Timeframe } from '@/types'

interface TradeFormProps {
  onSubmit: (trade: Omit<Trade, 'id' | 'user_id' | 'created_at'>) => Promise<void>
}

export default function TradeForm({ onSubmit }: TradeFormProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time_et: '',
    ticker: 'NVDA' as Ticker,
    direction: 'Long' as Direction,
    entry_price: '',
    exit_price: '',
    shares: '',
    setup_tag: 'VWAP Reclaim' as SetupTag,
    timeframe: '1min' as Timeframe,
    planned_stop: '',
    planned_target: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const entry = parseFloat(form.entry_price)
    const exit = parseFloat(form.exit_price)
    const shares = parseFloat(form.shares)
    const stop = parseFloat(form.planned_stop)
    const target = parseFloat(form.planned_target)

    const pnl = form.direction === 'Long'
      ? (exit - entry) * shares
      : (entry - exit) * shares

    const riskPerShare = Math.abs(entry - stop)
    const rewardPerShare = Math.abs(target - entry)
    const rr_realised = riskPerShare > 0 ? parseFloat((rewardPerShare / riskPerShare).toFixed(2)) : 0

    await onSubmit({
      ...form,
      entry_price: entry,
      exit_price: exit,
      shares,
      planned_stop: stop,
      planned_target: target,
      pnl: parseFloat(pnl.toFixed(2)),
      rr_realised,
    })

    setLoading(false)
  }

  const f = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 p-6 bg-gray-900 rounded-xl text-white">
      <div className="col-span-2 text-lg font-semibold">Log Trade</div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">Date</label>
        <input type="date" value={form.date} onChange={e => f('date', e.target.value)}
          className="bg-gray-800 rounded px-3 py-2 text-sm" required />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">Time (ET)</label>
        <input type="time" value={form.time_et} onChange={e => f('time_et', e.target.value)}
          className="bg-gray-800 rounded px-3 py-2 text-sm" required />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">Ticker</label>
        <select value={form.ticker} onChange={e => f('ticker', e.target.value)}
          className="bg-gray-800 rounded px-3 py-2 text-sm">
          {['NVDA', 'TSLA', 'OTHER'].map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">Direction</label>
        <select value={form.direction} onChange={e => f('direction', e.target.value)}
          className="bg-gray-800 rounded px-3 py-2 text-sm">
          {['Long', 'Short'].map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      {[['entry_price', 'Entry Price'], ['exit_price', 'Exit Price'], ['shares', 'Shares'],
        ['planned_stop', 'Planned Stop'], ['planned_target', 'Planned Target']].map(([field, label]) => (
        <div key={field} className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">{label}</label>
          <input type="number" step="0.0001" value={form[field as keyof typeof form]}
            onChange={e => f(field, e.target.value)}
            className="bg-gray-800 rounded px-3 py-2 text-sm" required />
        </div>
      ))}

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">Setup</label>
        <select value={form.setup_tag} onChange={e => f('setup_tag', e.target.value)}
          className="bg-gray-800 rounded px-3 py-2 text-sm">
          {['VWAP Reclaim', 'MACD Cross', 'RSI Reversal', 'Breakout', 'Other'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">Timeframe</label>
        <select value={form.timeframe} onChange={e => f('timeframe', e.target.value)}
          className="bg-gray-800 rounded px-3 py-2 text-sm">
          {['1min', '5min', '15min', '1H', '4H'].map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="col-span-2 flex flex-col gap-1">
        <label className="text-xs text-gray-400">Notes</label>
        <textarea value={form.notes} onChange={e => f('notes', e.target.value)}
          className="bg-gray-800 rounded px-3 py-2 text-sm h-20 resize-none" />
      </div>

      <div className="col-span-2">
        <button type="submit" disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 rounded py-2 text-sm font-medium transition-colors">
          {loading ? 'Saving...' : 'Save Trade'}
        </button>
      </div>
    </form>
  )
}