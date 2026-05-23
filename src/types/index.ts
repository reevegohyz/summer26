export type Ticker = 'NVDA' | 'TSLA' | 'OTHER'
export type Direction = 'Long' | 'Short'
export type SetupTag = 'VWAP Reclaim' | 'MACD Cross' | 'RSI Reversal' | 'Breakout' | 'Other'
export type Timeframe = '1min' | '5min' | '15min' | '1H' | '4H'

export interface Trade {
  id?: string
  user_id?: string
  prep_entry_id?: string | null
  date: string
  time_et: string
  ticker: Ticker
  direction: Direction
  entry_price: number
  exit_price: number
  shares: number
  setup_tag: SetupTag
  timeframe: Timeframe
  planned_stop: number
  planned_target: number
  pnl?: number
  rr_realised?: number
  rsi_at_entry?: number | null
  macd_at_entry?: number | null
  vwap_dev_at_entry?: number | null
  notes?: string
  created_at?: string
}