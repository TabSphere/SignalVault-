import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'

gsap.registerPlugin(ScrollTrigger)

interface SignalData {
  asset: string
  type: 'BUY' | 'SELL'
  time: string
  entry: string
  stopLoss: string
  takeProfit: string
  confidence: number
  risk: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface DbSignal {
  id: string
  asset: string
  asset_name: string
  direction: 'buy' | 'sell'
  entry_price: number
  stop_loss: number
  take_profit: number
  confidence: number
  created_at: string
}

function formatPrice(n: number): string {
  if (n >= 1000) {
    return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  return n.toFixed(4)
}

function riskFromConfidence(c: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (c >= 85) return 'LOW'
  if (c >= 60) return 'MEDIUM'
  return 'HIGH'
}

function SignalCard({ signal }: { signal: SignalData }) {
  const isBuy = signal.type === 'BUY'
  const riskColor =
    signal.risk === 'LOW'
      ? 'text-[#00F0A0]'
      : signal.risk === 'MEDIUM'
        ? 'text-[#FFD700]'
        : 'text-[#FF3366]'

  return (
    <div className="w-full rounded-[16px] border border-[#222222] bg-[#111111] p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(0,229,255,0.2)] hover:shadow-card-hover">
      {/* Top Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h4 className="text-[clamp(18px,1.5vw,22px)] font-semibold text-[#F0F0F0]">{signal.asset}</h4>
          <span
            className={`rounded-full px-3 py-1 text-[12px] font-medium uppercase tracking-wide ${
              isBuy
                ? 'bg-[rgba(0,240,160,0.08)] text-[#00F0A0]'
                : 'bg-[rgba(255,51,102,0.08)] text-[#FF3366]'
            }`}
          >
            {signal.type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[13px] text-[#5A5E66]">{signal.time}</span>
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${isBuy ? 'bg-[#00F0A0]' : 'bg-[#FF3366]'}`}
            ></span>
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${isBuy ? 'bg-[#00F0A0]' : 'bg-[#FF3366]'}`}
            ></span>
          </span>
        </div>
      </div>

      {/* Middle Row */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <p className="mb-1 text-[12px] font-medium tracking-wide text-[#5A5E66]">Entry</p>
          <p className={`font-mono text-[16px] ${isBuy ? 'text-[#00F0A0]' : 'text-[#F0F0F0]'}`}>
            {signal.entry}
          </p>
        </div>
        <div>
          <p className="mb-1 text-[12px] font-medium tracking-wide text-[#5A5E66]">Stop Loss</p>
          <p className="font-mono text-[16px] text-[#FF3366]">{signal.stopLoss}</p>
        </div>
        <div>
          <p className="mb-1 text-[12px] font-medium tracking-wide text-[#5A5E66]">Take Profit</p>
          <p className={`font-mono text-[16px] ${isBuy ? 'text-[#00F0A0]' : 'text-[#F0F0F0]'}`}>
            {signal.takeProfit}
          </p>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-medium tracking-wide text-[#5A5E66]">Confidence</span>
          <div className="h-2 w-24 overflow-hidden rounded-full bg-[#1A1A1A]">
            <div
              className="h-full rounded-full bg-[#00F0A0] transition-all duration-1000"
              style={{ width: `${signal.confidence}%` }}
            />
          </div>
          <span className="font-mono text-[13px] text-[#F0F0F0]">{signal.confidence}%</span>
        </div>
        <span className={`text-[12px] font-medium uppercase tracking-wide ${riskColor}`}>
          {signal.risk}
        </span>
      </div>
    </div>
  )
}

export default function LiveSignalsPreview() {
  const [signals, setSignals] = useState<SignalData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    let cancelled = false

    async function fetchSignals() {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('signals')
        .select('id, asset, asset_name, direction, entry_price, stop_loss, take_profit, confidence, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      if (cancelled) return

      if (fetchError) {
        setError(fetchError.message)
        setSignals([])
      } else {
        const mapped: SignalData[] =
          (data as DbSignal[] | null)?.map((s) => ({
            asset: s.asset_name || s.asset,
            type: s.direction.toUpperCase() as 'BUY' | 'SELL',
            time: `${new Date(s.created_at).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })} GMT`,
            entry: formatPrice(Number(s.entry_price)),
            stopLoss: formatPrice(Number(s.stop_loss)),
            takeProfit: formatPrice(Number(s.take_profit)),
            confidence: s.confidence,
            risk: riskFromConfidence(s.confidence),
          })) || []
        setSignals(mapped)
      }

      setLoading(false)
    }

    fetchSignals()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!sectionRef.current || signals.length === 0) return

    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })

      cardsRef.current.forEach((card, i) => {
        if (!card) return
        gsap.from(card, {
          x: -20,
          opacity: 0,
          duration: 0.5,
          delay: i * 0.12,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [signals])

  return (
    <section ref={sectionRef} className="w-full bg-[#050505] py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
        {/* Section Header */}
        <div ref={headerRef} className="mb-12">
          <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.1em] text-[#00F0A0]">
            Today&apos;s Signals
          </p>
          <h2 className="mb-3 text-[clamp(32px,3.5vw,48px)] font-bold leading-[1.1] tracking-[-0.02em] text-[#F0F0F0]">
            Precision Signals. Zero Guesswork.
          </h2>
          <p className="max-w-[560px] text-[16px] leading-[1.6] text-[#8A8F98]">
            This is exactly what you receive — clear entry, stop, and target prices for every signal.
          </p>
        </div>

        {/* Signal Cards */}
        <div className="mx-auto flex max-w-[900px] flex-col gap-4">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[180px] w-full rounded-[16px]" />
            ))}

          {!loading && error && (
            <div className="rounded-[16px] border border-[#222222] bg-[#111111] p-6 text-center text-sm text-[#FF3366]">
              Could not load signals: {error}
            </div>
          )}

          {!loading &&
            !error &&
            signals.map((signal, i) => (
              <div key={signal.asset + signal.time} ref={(el) => { cardsRef.current[i] = el }}>
                <SignalCard signal={signal} />
              </div>
            ))}
        </div>

        {/* CTA Row */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/start"
            className="inline-flex items-center gap-2 rounded-[6px] bg-gradient-to-r from-[#00E5FF] to-[#00F0A0] px-7 py-3.5 text-[15px] font-semibold text-[#050505] shadow-[0_0_20px_rgba(0,229,255,0.2)] transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
          >
            Start Receiving Signals
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/dashboard"
            className="text-[14px] text-[#00E5FF] transition-colors hover:underline"
          >
            View Full Dashboard →
          </Link>
        </div>
      </div>
    </section>
  )
}
