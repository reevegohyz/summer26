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
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/png', data: base64 },
          },
          {
            type: 'text',
            text: `Read the technical indicator values displayed on this trading chart.
Return ONLY a JSON object, no other text or markdown.

Extract whatever is visible from:
{
  "rsi": number or null,
  "macd": number or null,
  "macd_signal": number or null,
  "macd_histogram": number or null,
  "vwap": number or null,
  "volume": number or null,
  "ma9": number or null,
  "ma20": number or null,
  "ma50": number or null,
  "ma100": number or null,
  "ma200": number or null
}

Read the exact numbers shown in the chart legend/labels. Return null for any not visible.
Return raw JSON only.`
          }
        ]
      }]
    })
  })

  const data = await response.json()
  const text = data.content?.[0]?.text ?? '{}'

  try {
    const indicators = JSON.parse(text.replace(/```json|```/g, '').trim())
    return NextResponse.json({ indicators })
  } catch {
    return NextResponse.json({ indicators: {} })
  }
}