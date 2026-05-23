import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { base64 } = await req.json()

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: base64 },
          },
          {
            type: 'text',
            text: `Parse all trades from this Webull trade confirmation statement.
Return ONLY a JSON array, no other text or markdown.

For each trade return:
{
  "trade_type": "options" or "equity",
  "ticker": "TSLA",
  "trade_date": "YYYY-MM-DD",
  "time_et": "HH:MM:SS",
  "direction": "Buy" or "Sell",
  "quantity": number,
  "price": number (traded price),
  "gross_amount": number (positive for sells, negative for buys),
  "net_amount": number (after fees, positive for sells, negative for buys),
  "fees": number (absolute value of all fees combined),
  "option_type": "CALL" or "PUT" or null,
  "strike_price": number or null,
  "expiry_date": "YYYY-MM-DD" or null,
  "multiplier": 100 for options or 1 for equity,
  "pnl": null
}

Important:
- Times in the statement are GMT-4 (ET), keep as-is
- fees = absolute difference between gross_amount and net_amount
- pnl is null — it will be calculated later by matching buy/sell pairs
- Return raw JSON array only, no explanation`,
          }
        ]
      }]
    })
  })

  const data = await response.json()
  const text = data.content?.[0]?.text ?? '[]'

  try {
    const trades = JSON.parse(text.replace(/```json|```/g, '').trim())
    return NextResponse.json({ trades })
  } catch {
    return NextResponse.json({ trades: [], error: 'Parse failed', raw: text })
  }
}