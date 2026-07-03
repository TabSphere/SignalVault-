import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Signal {
  id: string
  asset: string
  asset_name: string
  direction: 'buy' | 'sell'
  entry_price: number
  stop_loss: number
  take_profit: number
  confidence: number
  status: 'active' | 'completed' | 'expired'
  result: 'win' | 'loss' | 'pending' | null
  pips: number | null
  created_at: string
}

export default function Signals() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchSignals() {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('signals')
        .select('*')
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (fetchError) {
        setError(fetchError.message)
        setSignals([])
      } else {
        setSignals((data as Signal[]) || [])
      }

      setLoading(false)
    }

    fetchSignals()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-[100dvh] bg-[#050505] px-6 py-16 lg:px-12">
      <div className="mx-auto max-w-[1280px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mb-4 text-[clamp(40px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.03em] text-[#F0F0F0]">
            Signals
          </h1>
          <p className="mb-10 max-w-2xl text-[16px] leading-[1.6] text-[#8A8F98]">
            Live and historical AI-generated trading signals. All signals are pulled directly from the Supabase database.
          </p>
        </motion.div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#00E5FF]" />
            <span className="ml-3 text-sm text-[#8A8F98]">Loading signals...</span>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-400">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Failed to load signals</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && signals.length === 0 && (
          <div className="rounded-xl border border-[#222222] bg-[#111111] p-10 text-center">
            <p className="text-[#8A8F98]">No signals found.</p>
          </div>
        )}

        {!loading && !error && signals.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {signals.map((signal, index) => {
              const isBuy = signal.direction === 'buy'
              const isWin = signal.result === 'win'
              const isLoss = signal.result === 'loss'

              return (
                <motion.div
                  key={signal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="rounded-xl border border-[#222222] bg-[#111111] p-6 transition-all duration-300 hover:border-[#333333]"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-[#F0F0F0]">{signal.asset}</h3>
                      <p className="text-sm text-[#5A5E66]">{signal.asset_name}</p>
                    </div>
                    <span
                      className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                        isBuy ? 'bg-[#00F0A0]/10 text-[#00F0A0]' : 'bg-[#FF3366]/10 text-[#FF3366]'
                      }`}
                    >
                      {isBuy ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {signal.direction.toUpperCase()}
                    </span>
                  </div>

                  <div className="mb-4 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-[#5A5E66]">ENTRY</p>
                      <p className="font-mono text-[#F0F0F0]">{Number(signal.entry_price).toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#5A5E66]">STOP</p>
                      <p className="font-mono text-[#F0F0F0]">{Number(signal.stop_loss).toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#5A5E66]">TARGET</p>
                      <p className="font-mono text-[#00F0A0]">{Number(signal.take_profit).toFixed(4)}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-[#5A5E66]">CONFIDENCE</span>
                      <span className="text-[#F0F0F0]">{signal.confidence}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#1A1A1A]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#00F0A0] to-[#00E5FF]"
                        style={{ width: `${signal.confidence}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#222222] pt-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        signal.status === 'active'
                          ? 'bg-[#00E5FF]/10 text-[#00E5FF]'
                          : signal.status === 'completed'
                            ? 'bg-[#00F0A0]/10 text-[#00F0A0]'
                            : 'bg-[#5A5E66]/10 text-[#5A5E66]'
                      }`}
                    >
                      {signal.status.toUpperCase()}
                    </span>

                    {signal.result && (
                      <span
                        className={`text-xs font-medium ${
                          isWin ? 'text-[#00F0A0]' : isLoss ? 'text-[#FF3366]' : 'text-[#5A5E66]'
                        }`}
                      >
                        {isWin ? '+' : isLoss ? '-' : ''}
                        {signal.pips !== null && signal.pips !== undefined ? `${signal.pips} pips` : signal.result.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-xs text-[#5A5E66]">
                    {new Date(signal.created_at).toLocaleString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
