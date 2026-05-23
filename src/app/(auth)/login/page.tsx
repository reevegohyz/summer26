'use client'

import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
  }

  return (
    <main className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <div className="bg-[#111827] rounded-xl p-10 flex flex-col items-center gap-6 w-80 border border-[#1f2937]">
        <div className="text-[#d4b896] text-xl font-medium">Trading Diary</div>
        <p className="text-[#6b7280] text-sm text-center">
          Track your trades. Measure your edge.
        </p>
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white text-gray-900 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Continue with Google
        </button>
      </div>
    </main>
  )
}