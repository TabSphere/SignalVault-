import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'

import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowUp,
  TrendingUp,
  Crosshair,
  Zap,
  ChevronRight,
  Phone,
  Play,
  Pause,
  Volume2,
  Headphones,
} from 'lucide-react'

import { VoiceCallWidget } from '@/components/VoiceCallWidget'

// ── Font Loading ────────────────────────────────────────────
function useLoadFonts() {
  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [])
}

// ── Easing Tokens ───────────────────────────────────────────
const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number]
const easeInOut = [0.4, 0, 0.2, 1] as [number, number, number, number]

// ── Animation Variants ──────────────────────────────────────
const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOutExpo },
  },
}

const cardHover = {
  y: -2,
  transition: { duration: 0.3, ease: easeInOut },
}

// ── Types ───────────────────────────────────────────────────
type SignalStatus = 'CLOSED' | 'LIVE' | 'UPCOMING'
type Direction = 'BUY' | 'SELL'
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'
type SlotStatus = 'DELIVERED' | 'ACTIVE' | 'PENDING'

interface Signal {
  id: number
  asset: string
  status: SignalStatus
  direction?: Direction
  entry?: number
  stop?: number
  target?: number
  confidence?: number
  risk?: RiskLevel
  countdown?: string
  result?: string
  resultType?: 'WIN' | 'LOSS'
  pips?: number
  pipsLabel?: string
  time: string
  currentPrice?: number
  currentPips?: number
}

interface Position {
  asset: string
  direction: Direction
  entry: number
  current: number
  pnl: number
  stop: number
  target: number
  time: string
}

interface JournalEntry {
  asset: string
  direction: Direction
  date: string
  entry: number
  exit: number
  result: 'WIN' | 'LOSS'
  pnl: number
}

// ── Mock Data ───────────────────────────────────────────────
const signals: Signal[] = [
  {
    id: 1,
    asset: 'EUR/USD',
    status: 'CLOSED',
    direction: 'BUY',
    entry: 1.0842,
    stop: 1.0820,
    target: 1.0885,
    time: '09:00',
    result: 'HIT TARGET',
    resultType: 'WIN',
  },
  {
    id: 2,
    asset: 'GBP/JPY',
    status: 'LIVE',
    direction: 'SELL',
    entry: 192.45,
    stop: 193.10,
    target: 191.20,
    confidence: 88,
    risk: 'MEDIUM',
    countdown: '23:47 remaining',
    time: '11:30',
    currentPrice: 192.38,
    currentPips: -7,
    pips: 125,
    pipsLabel: '-65 pips',
  },
  {
    id: 3,
    asset: 'BTC/USD',
    status: 'UPCOMING',
    time: '14:00',
    countdown: 'Starts in 2h 14m',
  },
  {
    id: 4,
    asset: 'XAU/USD',
    status: 'UPCOMING',
    time: '16:30',
    countdown: 'Starts in 4h 44m',
  },
  {
    id: 5,
    asset: 'USD/CAD',
    status: 'UPCOMING',
    time: '19:00',
    countdown: 'Starts in 7h 14m',
  },
]

const timelineSlots = [
  { time: '09:00', asset: 'EUR/USD', status: 'DELIVERED' as SlotStatus },
  { time: '11:30', asset: 'GBP/JPY', status: 'ACTIVE' as SlotStatus },
  { time: '14:00', asset: 'BTC/USD', status: 'PENDING' as SlotStatus },
  { time: '16:30', asset: 'XAU/USD', status: 'PENDING' as SlotStatus },
  { time: '19:00', asset: 'USD/CAD', status: 'PENDING' as SlotStatus },
]

const positions: Position[] = [
  {
    asset: 'EUR/USD',
    direction: 'BUY',
    entry: 1.0842,
    current: 1.0871,
    pnl: 18.40,
    stop: 1.0820,
    target: 1.0885,
    time: '09:12',
  },
  {
    asset: 'GBP/JPY',
    direction: 'SELL',
    entry: 192.45,
    current: 192.38,
    pnl: 6.20,
    stop: 193.10,
    target: 191.20,
    time: '11:35',
  },
]

const journalEntries: JournalEntry[] = [
  { asset: 'EUR/USD', direction: 'BUY', date: '15 Jan, 09:00', entry: 1.0842, exit: 1.0885, result: 'WIN', pnl: 24.50 },
  { asset: 'GBP/JPY', direction: 'SELL', date: '14 Jan, 11:30', entry: 192.80, exit: 191.50, result: 'WIN', pnl: 31.20 },
  { asset: 'BTC/USD', direction: 'BUY', date: '14 Jan, 14:00', entry: 66100, exit: 65800, result: 'LOSS', pnl: -18.40 },
  { asset: 'XAU/USD', direction: 'BUY', date: '14 Jan, 16:30', entry: 2338, exit: 2351, result: 'WIN', pnl: 28.90 },
  { asset: 'USD/CAD', direction: 'SELL', date: '13 Jan, 19:00', entry: 1.3710, exit: 1.3650, result: 'WIN', pnl: 22.10 },
  { asset: 'EUR/GBP', direction: 'BUY', date: '13 Jan, 09:00', entry: 0.8520, exit: 0.8545, result: 'WIN', pnl: 19.80 },
  { asset: 'AUD/USD', direction: 'SELL', date: '12 Jan, 11:30', entry: 0.6780, exit: 0.6810, result: 'LOSS', pnl: -15.60 },
  { asset: 'USD/JPY', direction: 'BUY', date: '12 Jan, 14:00', entry: 147.20, exit: 148.10, result: 'WIN', pnl: 26.40 },
  { asset: 'GBP/USD', direction: 'SELL', date: '11 Jan, 16:30', entry: 1.2750, exit: 1.2680, result: 'WIN', pnl: 29.50 },
  { asset: 'NAS100', direction: 'BUY', date: '11 Jan, 19:00', entry: 16800, exit: 16750, result: 'LOSS', pnl: -12.30 },
]

// ── Helpers ─────────────────────────────────────────────────
function formatPrice(n: number): string {
  return n < 10 ? n.toFixed(4) : n < 1000 ? n.toFixed(2) : n.toLocaleString()
}

function useGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning, Trader'
  if (hour < 18) return 'Good Afternoon, Trader'
  return 'Good Evening, Trader'
}

function useFormattedDate(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ── Sparkline Component ─────────────────────────────────────
function MiniSparkline({ color = '#00F0A0' }: { color?: string }) {
  const points = [20, 18, 22, 15, 25, 20, 28, 22, 30, 25]
  const w = 60
  const h = 20
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const pathD = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * w
      const y = h - ((v - min) / range) * h
      return `${i === 0 ? 'M' : 'L'}${x},${y}`
    })
    .join(' ')

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="inline-block ml-2">
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

// ── Section 1: Dashboard Header ─────────────────────────────
function DashboardHeader() {
  const greeting = useGreeting()
  const date = useFormattedDate()

  return (
    <section className="w-full bg-[#050505] pt-[96px] pb-8">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
          >
            <h2
              className="text-[clamp(32px,3.5vw,48px)] font-bold text-[#F0F0F0] leading-[1.1] tracking-[-0.02em]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {greeting}
            </h2>
            <p
              className="text-sm text-[#5A5E66] mt-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {date}
            </p>
          </motion.div>

          {/* Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: easeOutExpo }}
            className="bg-[#111111] border border-[#222222] rounded-xl px-6 py-4"
          >
            <p
              className="text-xs text-[#5A5E66] tracking-[0.02em] font-medium"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Your Plan
            </p>
            <p
              className="text-[clamp(28px,3vw,40px)] font-medium text-[#F0F0F0] leading-none mt-1"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Pro
            </p>
            <p
              className="text-xs text-[#00E5FF] mt-1 flex items-center gap-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              3 signals per day
            </p>
          </motion.div>
        </div>

        {/* Signal Timeline Slots */}
        <motion.div
          className="flex gap-2 mt-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {timelineSlots.map((slot, i) => {
            const isDelivered = slot.status === 'DELIVERED'
            const isActive = slot.status === 'ACTIVE'
            return (
              <motion.div
                key={i}
                variants={staggerItem}
                custom={i}
                className="flex-1 text-center p-4 rounded-xl border transition-colors duration-300"
                style={{
                  background: isDelivered
                    ? 'rgba(0,240,160,0.08)'
                    : isActive
                      ? 'rgba(0,229,255,0.05)'
                      : '#111111',
                  borderColor: isDelivered
                    ? 'rgba(0,240,160,0.2)'
                    : isActive
                      ? 'rgba(0,229,255,0.3)'
                      : '#222222',
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span
                    className={`w-2 h-2 rounded-full ${isActive ? 'animate-pulse' : ''}`}
                    style={{
                      background: isDelivered
                        ? '#00F0A0'
                        : isActive
                          ? '#00E5FF'
                          : '#5A5E66',
                      boxShadow: isActive ? '0 0 8px rgba(0,229,255,0.6)' : 'none',
                    }}
                  />
                  <span
                    className="text-xs font-medium tracking-[0.02em]"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      color: isDelivered ? '#00F0A0' : isActive ? '#00E5FF' : '#5A5E66',
                    }}
                  >
                    {slot.status}
                  </span>
                </div>
                <p
                  className="text-[13px] text-[#F0F0F0] font-normal"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {slot.time}
                </p>
                <p
                  className="text-xs text-[#5A5E66]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {slot.asset}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

// ── Signal Card: Delivered ──────────────────────────────────
function DeliveredSignalCard({ signal }: { signal: Signal }) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={cardHover}
      className="bg-[#111111] border border-[#222222] rounded-xl p-6 opacity-70 hover:opacity-90 transition-all duration-300"
      style={{
        boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Top row */}
      <div className="flex justify-between items-center">
        <h4
          className="text-[clamp(18px,1.5vw,22px)] font-semibold text-[#F0F0F0] leading-[1.3]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {signal.asset}
        </h4>
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-medium px-3 py-1 rounded-full"
            style={{
              fontFamily: "'Inter', sans-serif",
              background: '#1A1A1A',
              color: '#5A5E66',
            }}
          >
            CLOSED
          </span>
          <span
            className="text-base font-normal"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: '#00F0A0',
            }}
          >
            +£24.50
          </span>
        </div>
      </div>

      {/* Body: 3-column grid */}
      <div className="grid grid-cols-3 gap-6 mt-5">
        <div>
          <p className="text-xs text-[#5A5E66] tracking-[0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
            ENTRY
          </p>
          <p
            className="text-[13px] text-[#5A5E66] line-through mt-1"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {formatPrice(signal.entry || 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#5A5E66] tracking-[0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
            STOP
          </p>
          <p
            className="text-[13px] text-[#5A5E66] mt-1"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {formatPrice(signal.stop || 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#5A5E66] tracking-[0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
            TARGET
          </p>
          <p
            className="text-[13px] text-[#5A5E66] mt-1"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {formatPrice(signal.target || 0)}
          </p>
        </div>
      </div>

      {/* Bottom */}
      <p
        className="text-xs font-medium tracking-[0.02em] mt-4"
        style={{ fontFamily: "'Inter', sans-serif", color: '#00F0A0' }}
      >
        Result: HIT TARGET
      </p>
    </motion.div>
  )
}

// ── Signal Card: Active ─────────────────────────────────────
function ActiveSignalCard({ signal }: { signal: Signal }) {
  const isBuy = signal.direction === 'BUY'
  const confidence = signal.confidence || 0

  return (
    <motion.div
      variants={staggerItem}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.15, ease: easeOutExpo }}
      whileHover={cardHover}
      className="relative bg-[#111111] rounded-xl p-6 border-2 border-[#00E5FF] transition-all duration-300"
      style={{
        boxShadow: isBuy
          ? '0 0 20px rgba(0,240,160,0.15)'
          : '0 0 20px rgba(255,51,102,0.15)',
        animation: 'borderGlow 2s ease-in-out infinite',
      }}
    >
      <style>{`
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(0,229,255,0.15); }
          50% { box-shadow: 0 0 20px rgba(0,229,255,0.35); }
        }
      `}</style>

      {/* Top row */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <h3
            className="text-[clamp(24px,2.5vw,32px)] font-semibold text-[#F0F0F0] leading-[1.2] tracking-[-0.01em]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {signal.asset}
          </h3>
          <span
            className="text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5"
            style={{
              fontFamily: "'Inter', sans-serif",
              background: '#00E5FF',
              color: '#050505',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-[#050505] animate-pulse" />
            LIVE NOW
          </span>
        </div>
        <div className="text-right">
          <p
            className="text-[13px] text-[#00E5FF]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {signal.countdown}
          </p>
          <span
            className="inline-block text-sm font-semibold px-4 py-1.5 rounded-full mt-1"
            style={{
              fontFamily: "'Inter', sans-serif",
              background: isBuy ? 'rgba(0,240,160,0.08)' : 'rgba(255,51,102,0.08)',
              color: isBuy ? '#00F0A0' : '#FF3366',
              border: `1px solid ${isBuy ? 'rgba(0,240,160,0.2)' : 'rgba(255,51,102,0.2)'}`,
            }}
          >
            {signal.direction}
          </span>
        </div>
      </div>

      {/* Signal details grid */}
      <div className="grid grid-cols-3 gap-6 mt-6">
        <div>
          <p className="text-xs text-[#5A5E66] tracking-[0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
            ENTRY PRICE
          </p>
          <p
            className="text-[clamp(28px,3vw,40px)] font-medium text-[#F0F0F0] mt-1 leading-none"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {formatPrice(signal.entry || 0)}
          </p>
        </div>
        <div>
          <p className="text-xs tracking-[0.02em]" style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(255,51,102,0.6)' }}>
            STOP LOSS
          </p>
          <p
            className="text-[clamp(28px,3vw,40px)] font-medium mt-1 leading-none"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: '#FF3366' }}
          >
            {formatPrice(signal.stop || 0)}
          </p>
          <p
            className="text-xs mt-1"
            style={{ fontFamily: "'Inter', sans-serif", color: '#FF3366' }}
          >
            {signal.pipsLabel}
          </p>
        </div>
        <div>
          <p className="text-xs tracking-[0.02em]" style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(0,240,160,0.6)' }}>
            TAKE PROFIT
          </p>
          <p
            className="text-[clamp(28px,3vw,40px)] font-medium mt-1 leading-none"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: '#00F0A0' }}
          >
            {formatPrice(signal.target || 0)}
          </p>
          <p
            className="text-xs mt-1"
            style={{ fontFamily: "'Inter', sans-serif", color: '#00F0A0' }}
          >
            +{signal.pips} pips
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#222222] my-4" />

      {/* Bottom row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Confidence bar */}
        <div className="flex-1 w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#5A5E66] tracking-[0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
              CONFIDENCE
            </span>
            <span
              className="text-[13px] text-[#F0F0F0]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {confidence}%
            </span>
          </div>
          <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden mt-2 w-full max-w-[200px]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 1, delay: 0.5, ease: easeOutExpo }}
              className="h-full rounded-full"
              style={{
                background: confidence > 70
                  ? 'linear-gradient(90deg, #00F0A0, #00E5FF)'
                  : confidence > 40
                    ? '#FFD700'
                    : '#FF3366',
              }}
            />
          </div>
        </div>

        {/* Risk + Actions */}
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-medium px-3 py-1 rounded-full"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: '#FFD700',
              border: '1px solid rgba(255,215,0,0.2)',
            }}
          >
            {signal.risk} RISK
          </span>
          <button
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-md transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
            style={{
              fontFamily: "'Inter', sans-serif",
              background: 'rgba(0,240,160,0.08)',
              color: '#00F0A0',
              border: '1px solid rgba(0,240,160,0.2)',
            }}
          >
            <ArrowUpRight size={14} /> Copy Signal
          </button>
          <button
            className="text-sm font-medium px-4 py-2 rounded-md transition-all duration-200 hover:bg-[#1A1A1A] hover:border-[#00E5FF] active:scale-[0.97]"
            style={{
              fontFamily: "'Inter', sans-serif",
              background: 'transparent',
              color: '#F0F0F0',
              border: '1px solid #333333',
            }}
          >
            Set Alert
          </button>
        </div>
      </div>

      {/* Current price ticker */}
      {signal.currentPrice && (
        <div className="mt-4 flex items-center">
          <span
            className="text-[13px]"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: signal.currentPips && signal.currentPips < 0 ? '#00F0A0' : '#FF3366',
            }}
          >
            Current: {formatPrice(signal.currentPrice)} ({signal.currentPips} pips)
          </span>
          <MiniSparkline color={signal.currentPips && signal.currentPips < 0 ? '#00F0A0' : '#FF3366'} />
        </div>
      )}

      {/* Voice Alert Widget */}
      <div className="mt-4">
        <VoiceCallWidget
          signalId={String(signal.id)}
          userId="demo-user"
          signalData={{
            asset_name: signal.asset,
            direction: signal.direction || 'BUY',
            entry_price: signal.entry || 0,
          }}
        />
      </div>
    </motion.div>
  )
}

// ── Signal Card: Upcoming ───────────────────────────────────
function UpcomingSignalCard({ signal }: { signal: Signal }) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -1, opacity: 0.7, transition: { duration: 0.3, ease: easeInOut } }}
      className="bg-[#111111] border border-[#222222] rounded-xl p-6 opacity-50 hover:border-[#333333] transition-all duration-300"
    >
      <div className="flex justify-between items-center">
        <h4
          className="text-[clamp(18px,1.5vw,22px)] font-semibold text-[#5A5E66] leading-[1.3]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {signal.asset}
        </h4>
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-medium px-3 py-1 rounded-full"
            style={{
              fontFamily: "'Inter', sans-serif",
              background: '#1A1A1A',
              color: '#5A5E66',
            }}
          >
            UPCOMING
          </span>
          <span
            className="text-[13px] text-[#00E5FF]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {signal.countdown}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-[#5A5E66]" style={{ fontFamily: "'Inter', sans-serif" }}>
          Signal will appear at {signal.time} GMT
        </p>
      </div>

      <p
        className="text-xs text-[#5A5E66] tracking-[0.02em]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        Scheduled: {signal.time} GMT
      </p>
    </motion.div>
  )
}

// ── Section 2: Signal Timeline (Main Feed) ──────────────────
function SignalTimeline() {
  return (
    <section className="w-full bg-[#050505] py-8 pb-16">
      <div className="max-w-[900px] mx-auto px-6 lg:px-12">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-xs text-[#5A5E66] tracking-[0.02em] font-medium uppercase mb-6"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Today&apos;s Signals
        </motion.p>

        <motion.div
          className="flex flex-col gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {signals.map((signal) => {
            if (signal.status === 'CLOSED') {
              return <DeliveredSignalCard key={signal.id} signal={signal} />
            }
            if (signal.status === 'LIVE') {
              return <ActiveSignalCard key={signal.id} signal={signal} />
            }
            return <UpcomingSignalCard key={signal.id} signal={signal} />
          })}
        </motion.div>
      </div>
    </section>
  )
}

// ── Section 3: Active Trades ────────────────────────────────
function ActiveTrades() {
  return (
    <section className="w-full bg-[#0A0A0A] py-12">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="flex items-center gap-3 mb-6"
        >
          <h3
            className="text-[clamp(24px,2.5vw,32px)] font-semibold text-[#F0F0F0] leading-[1.2] tracking-[-0.01em]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Your Active Positions
          </h3>
          <span
            className="text-xs font-medium px-3 py-1 rounded-full"
            style={{
              fontFamily: "'Inter', sans-serif",
              background: 'rgba(0,229,255,0.1)',
              color: '#00E5FF',
            }}
          >
            2 Open
          </span>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.1, ease: easeOutExpo }}
          className="overflow-x-auto"
        >
          {/* Column headers */}
          <div className="grid grid-cols-8 gap-4 px-4 pb-3 border-b border-[#222222]">
            {['Asset', 'Direction', 'Entry', 'Current', 'P&L', 'Stop', 'Target', 'Time'].map(
              (h) => (
                <span
                  key={h}
                  className="text-xs text-[#5A5E66] tracking-[0.02em] font-medium uppercase"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {h}
                </span>
              )
            )}
          </div>

          {/* Data rows */}
          {positions.map((pos, i) => {
            const isBuy = pos.direction === 'BUY'
            const isProfit = pos.pnl > 0
            return (
              <motion.div
                key={pos.asset}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.05 * i }}
                className="grid grid-cols-8 gap-4 px-4 py-4 border-b border-[#222222] hover:bg-[#1A1A1A] transition-colors duration-150 rounded-md items-center"
              >
                <span
                  className="text-base text-[#F0F0F0] font-normal"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {pos.asset}
                </span>
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full w-fit"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    background: isBuy ? 'rgba(0,240,160,0.08)' : 'rgba(255,51,102,0.08)',
                    color: isBuy ? '#00F0A0' : '#FF3366',
                  }}
                >
                  {pos.direction}
                </span>
                <span
                  className="text-[13px] text-[#8A8F98]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {formatPrice(pos.entry)}
                </span>
                <span
                  className="text-[13px] text-[#F0F0F0]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {formatPrice(pos.current)}
                </span>
                <span
                  className="text-[13px] flex items-center gap-1"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: isProfit ? '#00F0A0' : '#FF3366',
                  }}
                >
                  {isProfit ? <ArrowUp size={12} /> : <ArrowDownRight size={12} />}
                  {isProfit ? '+' : ''}£{Math.abs(pos.pnl).toFixed(2)}
                </span>
                <span
                  className="text-[13px] text-[#5A5E66]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {formatPrice(pos.stop)}
                </span>
                <span
                  className="text-[13px]"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: '#00F0A0' }}
                >
                  {formatPrice(pos.target)}
                </span>
                <span
                  className="text-[13px] text-[#5A5E66]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {pos.time}
                </span>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

// ── Section 4: Today's Summary ──────────────────────────────
function TodaySummary() {
  const stats = [
    {
      icon: <TrendingUp size={24} style={{ color: '#00E5FF' }} />,
      value: '2/3',
      label: 'Signals Today (Pro)',
      color: '#F0F0F0',
    },
    {
      icon: <Crosshair size={24} style={{ color: '#00F0A0' }} />,
      value: '—',
      label: "Your Trading Journal",
      color: '#00F0A0',
    },
    {
      icon: <ArrowUp size={24} style={{ color: '#00F0A0' }} />,
      value: 'Track',
      label: "Your Own Results",
      color: '#00F0A0',
      delta: 'All P&L is your own',
    },
    {
      icon: <Zap size={24} style={{ color: '#FFD700' }} />,
      value: 'Pro Plan',
      label: '3 Signals/Day',
      color: '#FFD700',
      delta: 'Upgrade to VIP for 5',
      deltaColor: '#00E5FF',
    },
  ]

  return (
    <section className="w-full bg-[#050505] py-8">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={staggerItem}
              custom={i}
              whileHover={cardHover}
              className="bg-[#111111] border border-[#222222] rounded-xl p-6 text-center hover:border-[rgba(0,229,255,0.3)] transition-all duration-300"
              style={{
                boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.4)',
              }}
            >
              <div className="flex justify-center mb-3">{stat.icon}</div>
              <p
                className="text-[clamp(28px,3vw,40px)] font-medium leading-none"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: stat.color }}
              >
                {stat.value}
              </p>
              <p
                className="text-xs text-[#5A5E66] tracking-[0.02em] font-medium mt-2"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {stat.label}
              </p>
              {stat.delta && (
                <p
                  className="text-xs mt-1"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    color: (stat.deltaColor || '#00F0A0'),
                  }}
                >
                  {stat.delta}
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Section 5: Trading Journal ──────────────────────────────
function TradingJournal() {
  return (
    <section className="w-full bg-[#0A0A0A] pt-16 pb-32">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="flex justify-between items-center mb-6"
        >
          <h3
            className="text-[clamp(24px,2.5vw,32px)] font-semibold text-[#F0F0F0] leading-[1.2] tracking-[-0.01em]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Trading Journal
          </h3>
          <span
            className="text-xs text-[#5A5E66] tracking-[0.02em]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Last 10 Signals
          </span>
        </motion.div>

        {/* Journal list */}
        <motion.div
          className="flex flex-col gap-1"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {journalEntries.map((entry, i) => {
            const isWin = entry.result === 'WIN'
            return (
              <motion.div
                key={`${entry.asset}-${i}`}
                variants={staggerItem}
                custom={i}
                whileHover={{ backgroundColor: '#1A1A1A' }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 px-6 py-4 bg-[#111111] border border-[#222222] rounded-lg transition-colors duration-150"
              >
                {/* Left group */}
                <div className="flex items-center gap-4 sm:gap-6">
                  <span
                    className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      background: entry.direction === 'BUY' ? 'rgba(0,240,160,0.08)' : 'rgba(255,51,102,0.08)',
                      color: entry.direction === 'BUY' ? '#00F0A0' : '#FF3366',
                    }}
                  >
                    {entry.direction}
                  </span>
                  <span
                    className="text-base text-[#F0F0F0] font-normal"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {entry.asset}
                  </span>
                  <span
                    className="text-[13px] text-[#5A5E66] hidden sm:block"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {entry.date}
                  </span>
                </div>

                {/* Center group */}
                <div className="hidden md:flex items-center gap-6">
                  <span
                    className="text-[13px] text-[#5A5E66]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {formatPrice(entry.entry)}
                  </span>
                  <ChevronRight size={14} className="text-[#5A5E66]" />
                  <span
                    className="text-[13px] text-[#F0F0F0]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {formatPrice(entry.exit)}
                  </span>
                </div>

                {/* Right group */}
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs font-medium px-3 py-1 rounded-full"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      background: isWin ? 'rgba(0,240,160,0.08)' : 'rgba(255,51,102,0.08)',
                      color: isWin ? '#00F0A0' : '#FF3366',
                    }}
                  >
                    {entry.result}
                  </span>
                  <span
                    className="text-[13px] font-medium"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: isWin ? '#00F0A0' : '#FF3366',
                    }}
                  >
                    {isWin ? '+' : ''}£{Math.abs(entry.pnl).toFixed(2)}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* View Full History link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="text-center mt-6"
        >
          <a
            href="/performance"
            className="text-sm text-[#00E5FF] hover:underline transition-all duration-200 inline-flex items-center gap-1"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            View Full History <ChevronRight size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

// ── Voice Call Section ────────────────────────────────────
function VoiceCallSection() {
  const [calls] = useState([
    {
      id: '1',
      asset: 'XAUUSD',
      status: 'completed',
      mode: 'tts',
      recording_url: 'https://example.com/audio1.mp3',
      transcript: 'SignalVault VIP Alert. Gold. Buy signal...',
      created_at: '2024-01-15T09:00:00Z',
    },
  ])
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isVip] = useState(true) // TODO: check from auth
  const [isCalling, setIsCalling] = useState(false)

  const handlePlay = (_url: string, id: string) => {
    if (isPlaying === id) {
      setIsPlaying(null)
    } else {
      setIsPlaying(id)
      // In real app: new Audio(url).play()
    }
  }

  const handleCallMe = async () => {
    if (!phoneNumber) return
    setIsCalling(true)
    // TODO: call edge function
    setTimeout(() => setIsCalling(false), 3000)
  }

  return (
    <section className="w-full bg-[#0A0A0A] py-12">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="flex items-center gap-3 mb-6"
        >
          <h3
            className="text-[clamp(24px,2.5vw,32px)] font-semibold text-[#F0F0F0] leading-[1.2] tracking-[-0.01em]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            AI Voice Alerts
          </h3>
          <span
            className="text-xs font-medium px-3 py-1 rounded-full"
            style={{
              fontFamily: "'Inter', sans-serif",
              background: 'rgba(0,229,255,0.1)',
              color: '#00E5FF',
            }}
          >
            VIP
          </span>
        </motion.div>

        {!isVip ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-[#222222] bg-[#111111] p-8 text-center"
          >
            <Headphones size={32} className="mx-auto mb-4 text-[#5A5E66]" />
            <h4 className="text-lg font-semibold text-[#F0F0F0] mb-2">Voice Alerts Available</h4>
            <p className="text-sm text-[#8A8F98] mb-4">
              Upgrade to VIP to receive AI voice calls for every signal
            </p>
            <a
              href="/credits"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00F0A0] px-6 py-3 text-sm font-semibold text-[#050505] transition-all hover:brightness-110"
            >
              <Zap size={14} />
              Upgrade to VIP
            </a>
          </motion.div>
        ) : (
          <>
            {/* Call Me Now */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-6 rounded-2xl border border-[#222222] bg-[#111111] p-6"
            >
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-3 flex-1 w-full">
                  <Phone size={20} className="text-[#00E5FF]" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+44 7700 900000"
                    className="flex-1 bg-[#1A1A1A] rounded-xl px-4 py-3 text-sm text-[#F0F0F0] placeholder-[#5A5E66] outline-none focus:ring-1 focus:ring-[#00E5FF]/30"
                  />
                </div>
                <button
                  onClick={handleCallMe}
                  disabled={!phoneNumber || isCalling}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00F0A0] px-6 py-3 text-sm font-semibold text-[#050505] transition-all hover:brightness-110 disabled:opacity-30"
                >
                  {isCalling ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Phone size={14} />
                      </motion.div>
                      Calling...
                    </>
                  ) : (
                    <>
                      <Phone size={14} />
                      Call Me Now
                    </>
                  )}
                </button>
              </div>
              <p className="mt-3 text-xs text-[#5A5E66]">
                Enter your phone number to receive a real AI voice call with your latest signal
              </p>
            </motion.div>

            {/* Call History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h4 className="text-sm font-medium text-[#5A5E66] mb-3 uppercase tracking-wider">
                Recent Voice Alerts
              </h4>
              <div className="space-y-2">
                {calls.map((call) => (
                  <motion.div
                    key={call.id}
                    className="flex items-center justify-between rounded-xl border border-[#222222] bg-[#111111] px-4 py-3"
                    whileHover={{ backgroundColor: '#1A1A1A' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00E5FF]/10">
                        {call.mode === 'call' ? (
                          <Phone size={14} className="text-[#00E5FF]" />
                        ) : (
                          <Volume2 size={14} className="text-[#00E5FF]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#F0F0F0]">{call.asset}</p>
                        <p className="text-xs text-[#5A5E66]">
                          {call.mode === 'call' ? 'Phone call' : 'Audio alert'} • {new Date(call.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {call.recording_url && (
                        <button
                          onClick={() => handlePlay(call.recording_url, call.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A1A1A] text-[#00E5FF] transition-all hover:bg-[#00E5FF]/10"
                        >
                          {isPlaying === call.id ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                      )}
                      <span
                        className="text-xs font-medium px-2 py-1 rounded-full"
                        style={{
                          background: call.status === 'completed' ? 'rgba(0,240,160,0.08)' : 'rgba(255,215,0,0.08)',
                          color: call.status === 'completed' ? '#00F0A0' : '#FFD700',
                        }}
                      >
                        {call.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}

// ── Compact Footer ──────────────────────────────────────────
function CompactFooter() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="w-full bg-[#050505] border-t border-[#222222] py-6"
    >
      <p
        className="text-xs text-[#5A5E66] tracking-[0.02em] text-center px-6"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        SignalVault provides educational trading signals only. We are not a broker and do not execute trades.
        All trading decisions are your own responsibility. Trading involves significant risk of loss.
        For educational purposes only.
      </p>
    </motion.footer>
  )
}

// ── Main Dashboard Page ─────────────────────────────────────
export default function Dashboard() {
  useLoadFonts()

  return (
    <div className="min-h-[100dvh] bg-[#050505]">
      <DashboardHeader />
      <SignalTimeline />
      <ActiveTrades />
      <TodaySummary />
      <TradingJournal />
      <VoiceCallSection />
      <CompactFooter />
    </div>
  )
}
