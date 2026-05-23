export type TradeType = 'equity' | 'options'
export type Direction = 'Buy' | 'Sell'
export type OptionType = 'CALL' | 'PUT'
export type SetupTag = 'VWAP Reclaim' | 'MACD Cross' | 'RSI Reversal' | 'Breakout' | 'Other'
export type Timeframe = '1min' | '5min' | '15min' | '1H' | '4H'

export interface Trade {
  id?: string
  user_id?: string
  trade_type: TradeType
  ticker: string
  trade_date: string
  time_et?: string
  direction: Direction
  quantity: number
  price: number
  gross_amount?: number
  net_amount?: number
  fees?: number
  option_type?: OptionType
  strike_price?: number
  expiry_date?: string
  multiplier?: number
  setup_tag?: SetupTag
  timeframe?: Timeframe
  planned_stop?: number
  planned_target?: number
  pnl?: number
  is_open?: boolean
  rsi?: number
  macd?: number
  macd_signal?: number
  macd_histogram?: number
  vwap?: number
  vwap_deviation_pct?: number
  volume?: number
  ma9?: number
  ma20?: number
  ma50?: number
  ma100?: number
  ma200?: number
  notes?: string
  created_at?: string
}

export interface PrepEntry {
  id?: string
  user_id?: string
  date: string
  bias: 'Bullish' | 'Bearish' | 'Neutral'
  key_levels?: string
  planned_setups?: string
  max_loss?: number
  notes?: string
  created_at?: string
}