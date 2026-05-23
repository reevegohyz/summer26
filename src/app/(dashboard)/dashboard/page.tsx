'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Trade, OptionType, Direction, TradeType } from '@/types'

const emptyForm = {
  trade_date: new Date().toISOString().split('T')[0],
  time_et: '',
  ticker: 'TSLA',
  direction: 'Buy' as Direction,
  trade_type: 'options' as TradeType,
  option_type: 'CALL' as OptionType,
  strike_price: '',
  expiry_date: '',
  quantity: '',
  price: '',
  fees: '',
  rsi: '', macd: '', vwap: '',
  ma9: '', ma20: '', ma50: '', ma100: '', ma200: '',
  notes: '',
}

export default function DashboardPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

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

  useEffect(() => { fetchTrades() }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  const f = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const netAmount = form.price && form.quantity
    ? (parseFloat(form.price) * parseFloat(form.quantity) * (form.trade_type === 'options' ? 100 : 1)) + (parseFloat(form.fees) || 0)
    : null

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { alert('Not logged in'); setSaving(false); return }

    const payload = {
      user_id: user.id,
      trade_type: form.trade_type,
      ticker: form.ticker,
      trade_date: form.trade_date,
      time_et: form.time_et || null,
      direction: form.direction,
      quantity: parseFloat(form.quantity),
      price: parseFloat(form.price),
      fees: parseFloat(form.fees) || 0,
      option_type: form.trade_type === 'options' ? form.option_type : null,
      strike_price: form.strike_price ? parseFloat(form.strike_price) : null,
      expiry_date: form.expiry_date || null,
      multiplier: form.trade_type === 'options' ? 100 : 1,
      rsi: form.rsi ? parseFloat(form.rsi) : null,
      macd: form.macd ? parseFloat(form.macd) : null,
      vwap: form.vwap ? parseFloat(form.vwap) : null,
      ma9: form.ma9 ? parseFloat(form.ma9) : null,
      ma20: form.ma20 ? parseFloat(form.ma20) : null,
      ma50: form.ma50 ? parseFloat(form.ma50) : null,
      ma100: form.ma100 ? parseFloat(form.ma100) : null,
      ma200: form.ma200 ? parseFloat(form.ma200) : null,
      notes: form.notes || null,
      is_open: true,
      pnl: null,
    }

    const { error } = await supabase.from('trades').insert(payload)
    if (error) { alert('Error: ' + error.message) }
    else {
      setForm(emptyForm)
      setShowForm(false)
      fetchTrades()
    }
    setSaving(false)
  }

  const inputCls = 'w-full bg-[#0d1117] border border-[#1f2937] rounded-md px-3 py-2 text-[12px] text-[#e5d5c0] focus:outline-none focus:border-[#d4b896]'
  const labelCls = 'text-[11px] text-[#4b5563] mb-1 block'

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
            <div className="px-5 py-8 text-[13px] text-[#374151]">No trades yet — import your first statement below or enter manually.</div>
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
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${trade.option_type === 'CALL' ? 'bg-[#1e3a5f] text-[#93c5fd]' : 'bg-[#3b1f5e] text-[#c4b5fd]'}`}>
                          {trade.option_type}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#1f2937] text-[#6b7280]">EQ</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[#6b7280]">
                      {trade.option_type ? `${trade.strike_price}${trade.option_type === 'CALL' ? 'C' : 'P'} ${trade.expiry_date?.slice(5).replace('-', '/') || ''}` : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${trade.is_open ? 'bg-[#422006] text-[#fb923c]' : 'bg-[#064e3b] text-[#6ee7b7]'}`}>
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
        <div className="border border-dashed border-[#1f2937] rounded-xl overflow-hidden">
          <div
            className="px-6 py-5 flex items-center justify-between gap-4 hover:border-[#d4b896] transition-colors cursor-pointer group"
            onClick={() => document.getElementById('statement-input')?.click()}
          >
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 bg-[#1a2234] rounded-lg flex items-center justify-center text-[#d4b896]">
                <i className="ti ti-file-upload text-lg" aria-hidden="true" />
              </div>
              <div>
                <div className="text-[13px] font-medium text-[#e5d5c0]">Import Webull statement</div>
                <div className="text-[11px] text-[#4b5563] mt-0.5">Drop your PDF here — trades auto-populate above</div>
              </div>
            </div>
            <div className="text-[12px] text-[#d4b896] border border-[#d4b896] rounded-md px-3 py-1.5">Browse file</div>
            <input id="statement-input" type="file" accept=".pdf" className="hidden" />
          </div>

          {/* Toggle */}
          <button
            onClick={() => setShowForm(v => !v)}
            className="w-full px-6 py-2.5 border-t border-[#1f2937] text-[11px] text-[#4b5563] hover:text-[#9ca3af] hover:bg-[#111827] transition-colors text-left flex items-center gap-2"
          >
            <i className={`ti ${showForm ? 'ti-chevron-up' : 'ti-chevron-down'} text-xs`} aria-hidden="true" />
            {showForm ? 'Hide manual entry' : 'Enter trade manually instead'}
          </button>

          {/* Manual entry form */}
          {showForm && (
            <div className="px-6 py-5 border-t border-[#1f2937] bg-[#0d1117] flex flex-col gap-4">

              {/* Trade type toggle */}
              <div className="flex gap-2">
                {(['options', 'equity'] as TradeType[]).map(t => (
                  <button key={t} onClick={() => f('trade_type', t)}
                    className={`text-[11px] px-3 py-1.5 rounded-md border capitalize transition-colors
                      ${form.trade_type === t ? 'border-[#d4b896] text-[#d4b896] bg-[#1a2234]' : 'border-[#1f2937] text-[#4b5563]'}`}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Row 1 */}
              <div className="grid grid-cols-4 gap-3">
                <div><label className={labelCls}>Date</label><input type="date" value={form.trade_date} onChange={e => f('trade_date', e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Time (ET)</label><input type="time" value={form.time_et} onChange={e => f('time_et', e.target.value)} className={inputCls} /></div>
                <div>
                  <label className={labelCls}>Ticker</label>
                  <select value={form.ticker} onChange={e => f('ticker', e.target.value)} className={inputCls}>
                    {['TSLA', 'NVDA', 'MSFT', 'CRWD', 'OTHER'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Direction</label>
                  <div className="flex gap-2 mt-0.5">
                    {(['Buy', 'Sell'] as Direction[]).map(d => (
                      <button key={d} onClick={() => f('direction', d)}
                        className={`flex-1 text-[11px] py-2 rounded-md border transition-colors
                          ${form.direction === d
                            ? d === 'Buy' ? 'border-[#34d399] text-[#34d399] bg-[#064e3b33]' : 'border-[#f87171] text-[#f87171] bg-[#450a0a33]'
                            : 'border-[#1f2937] text-[#4b5563]'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Options fields */}
              {form.trade_type === 'options' && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Option type</label>
                    <div className="flex gap-2 mt-0.5">
                      {(['CALL', 'PUT'] as OptionType[]).map(o => (
                        <button key={o} onClick={() => f('option_type', o)}
                          className={`flex-1 text-[11px] py-2 rounded-md border transition-colors
                            ${form.option_type === o
                              ? o === 'CALL' ? 'border-[#93c5fd] text-[#93c5fd] bg-[#1e3a5f44]' : 'border-[#c4b5fd] text-[#c4b5fd] bg-[#3b1f5e44]'
                              : 'border-[#1f2937] text-[#4b5563]'}`}>
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div><label className={labelCls}>Strike price</label><input type="number" placeholder="430.00" value={form.strike_price} onChange={e => f('strike_price', e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Expiry date</label><input type="date" value={form.expiry_date} onChange={e => f('expiry_date', e.target.value)} className={inputCls} /></div>
                </div>
              )}

              {/* Execution */}
              <div className="grid grid-cols-3 gap-3">
                <div><label className={labelCls}>{form.trade_type === 'options' ? 'Contracts' : 'Shares'}</label><input type="number" placeholder="3" value={form.quantity} onChange={e => f('quantity', e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Price</label><input type="number" placeholder="1.84" step="0.0001" value={form.price} onChange={e => f('price', e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Fees</label><input type="number" placeholder="1.80" step="0.01" value={form.fees} onChange={e => f('fees', e.target.value)} className={inputCls} /></div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#1f2937]" />

              {/* Indicators */}
              <div>
                <div className="text-[10px] text-[#374151] uppercase tracking-widest mb-3">Technical indicators at entry — optional</div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[['RSI', 'rsi'], ['MACD', 'macd'], ['VWAP', 'vwap']].map(([l, k]) => (
                    <div key={k}><label className={labelCls}>{l}</label><input type="number" step="0.0001" placeholder="—" value={form[k as keyof typeof form]} onChange={e => f(k, e.target.value)} className={inputCls} /></div>
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {[['MA9', 'ma9'], ['MA20', 'ma20'], ['MA50', 'ma50'], ['MA100', 'ma100'], ['MA200', 'ma200']].map(([l, k]) => (
                    <div key={k}><label className={labelCls}>{l}</label><input type="number" step="0.01" placeholder="—" value={form[k as keyof typeof form]} onChange={e => f(k, e.target.value)} className={inputCls} /></div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={labelCls}>Notes</label>
                <textarea value={form.notes} onChange={e => f('notes', e.target.value)} placeholder="Optional trade notes..." rows={2}
                  className={`${inputCls} resize-none`} />
              </div>

              {/* Net amount preview + save */}
              <div className="flex items-center justify-between gap-4">
                <div className="bg-[#111827] rounded-lg px-4 py-2.5 flex items-center gap-3 border border-[#1f2937]">
                  <span className="text-[11px] text-[#4b5563]">Net amount</span>
                  <span className="text-[14px] font-medium text-[#e5d5c0]">
                    {netAmount != null ? `$${netAmount.toFixed(2)}` : '—'}
                  </span>
                </div>
                <button onClick={handleSave} disabled={saving || !form.quantity || !form.price}
                  className="bg-[#d4b896] hover:bg-[#c4a882] disabled:bg-[#1f2937] disabled:text-[#374151] text-[#0d1117] font-medium text-[13px] px-6 py-2.5 rounded-lg transition-colors">
                  {saving ? 'Saving...' : 'Save trade'}
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  )
}