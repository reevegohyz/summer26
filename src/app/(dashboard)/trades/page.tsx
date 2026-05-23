'use client'

import { createClient } from '@/lib/supabase'
import TradeForm from '@/components/forms/TradeForm'
import { Trade } from '@/types'

export default function TradesPage() {
  const supabase = createClient()

  const handleSubmit = async (trade: Omit<Trade, 'id' | 'user_id' | 'created_at'>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return alert('Not logged in')

    const { error } = await supabase.from('trades').insert({
      ...trade,
      user_id: user.id,
    })

    if (error) {
      console.error(error)
      alert('Error saving trade')
    } else {
      alert('Trade saved!')
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-2xl mx-auto">
        <TradeForm onSubmit={handleSubmit} />
      </div>
    </main>
  )
}