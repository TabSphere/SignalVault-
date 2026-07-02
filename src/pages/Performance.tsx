import { useRef, useEffect } from 'react'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import { Link } from 'react-router'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Scatter, BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import {
  Check, X, ArrowDown,
} from 'lucide-react'

/* ─────────────────────── ease tokens ─────────────────────── */
const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number]

/* ═══════════════════════  DATA  ═════════════════════════════ */

const chartData = [
  { day: 1, balance: 100, change: 0, win: true },
  { day: 2, balance: 108, change: 8, win: true },
  { day: 3, balance: 115, change: 7, win: true },
  { day: 4, balance: 122, change: 7, win: true },
  { day: 5, balance: 119, change: -3, win: false },
  { day: 6, balance: 131, change: 12, win: true },
  { day: 7, balance: 142, change: 11, win: true },
  { day: 8, balance: 138, change: -4, win: false },
  { day: 9, balance: 156, change: 18, win: true },
  { day: 10, balance: 168, change: 12, win: true },
  { day: 11, balance: 165, change: -3, win: false },
  { day: 12, balance: 181, change: 16, win: true },
  { day: 13, balance: 195, change: 14, win: true },
  { day: 14, balance: 189, change: -6, win: false },
  { day: 15, balance: 210, change: 21, win: true },
  { day: 16, balance: 228, change: 18, win: true },
  { day: 17, balance: 221, change: -7, win: false },
  { day: 18, balance: 248, change: 27, win: true },
  { day: 19, balance: 267, change: 19, win: true },
  { day: 20, balance: 258, change: -9, win: false },
  { day: 21, balance: 285, change: 27, win: true },
  { day: 22, balance: 308, change: 23, win: true },
  { day: 23, balance: 298, change: -10, win: false },
  { day: 24, balance: 331, change: 33, win: true },
  { day: 25, balance: 358, change: 27, win: true },
  { day: 26, balance: 346, change: -12, win: false },
  { day: 27, balance: 384, change: 38, win: true },
  { day: 28, balance: 415, change: 31, win: true },
  { day: 29, balance: 402, change: -13, win: false },
  { day: 30, balance: 420, change: 18, win: true },
]

const winData = [
  { asset: 'Gold (XAU)', rate: 72 },
  { asset: 'EUR/USD', rate: 68 },
  { asset: 'GBP/JPY', rate: 65 },
  { asset: 'USD/CAD', rate: 63 },
  { asset: 'BTC/USD', rate: 61 },
  { asset: 'Indices', rate: 58 },
]

const distData = [
  { name: 'Forex', value: 45, color: '#00E5FF' },
  { name: 'Crypto', value: 25, color: '#00F0A0' },
  { name: 'Commodities', value: 20, color: '#FFD700' },
  { name: 'Indices', value: 10, color: '#8B5CF6' },
]

const monthlyData = [
  { month: 'Month 1', signals: 30, hits: 22, misses: 8, rate: 73.3, pnl: 340, balance: 1340 },
  { month: 'Month 2', signals: 30, hits: 20, misses: 10, rate: 66.7, pnl: 180, balance: 1520 },
  { month: 'Month 3', signals: 30, hits: 24, misses: 6, rate: 80.0, pnl: 420, balance: 1940 },
  { month: 'Month 4', signals: 30, hits: 21, misses: 9, rate: 70.0, pnl: 290, balance: 2230 },
  { month: 'Month 5', signals: 30, hits: 23, misses: 7, rate: 76.7, pnl: 380, balance: 2610 },
  { month: 'Month 6', signals: 30, hits: 19, misses: 11, rate: 63.3, pnl: 120, balance: 2730 },
  { month: 'Month 7', signals: 30, hits: 25, misses: 5, rate: 83.3, pnl: 510, balance: 3240 },
]

const weDoItems = [
  'Log every signal — wins and losses',
  'Show you the exact entry, stop, and target',
  'Update results in real-time as trades close',
  'Provide clear risk labels on every signal',
  'Backtest our strategies transparently',
]

const weDontItems = [
  'Hide losing trades or months',
  'Promise guaranteed profits',
  'Manipulate performance data',
  'Pressure you to deposit more',
  'Charge hidden fees',
]

/* ═════════════════════  ANIMATED NUMBER  ════════════════════ */

function AnimatedNumber({ target, prefix = '', suffix = '', decimals = 0, delay = 0 }: {
  target: number; prefix?: string; suffix?: string; decimals?: number; delay?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const mv = useMotionValue(0)
  const rounded = useTransform(mv, v =>
    prefix + v.toLocaleString('en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix
  )
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (!isInView) return
    const controls = animate(mv, target, {
      duration: 1.5,
      ease: easeOutExpo,
      delay,
    })
    return controls.stop
  }, [isInView, target, mv, delay])

  return <motion.span ref={ref}>{rounded}</motion.span>
}

/* ═══════════════════  SCROLL REVEAL WRAPPER  ════════════════ */

function Reveal({ children, delay = 0, className = '', y = 30 }: {
  children: React.ReactNode; delay?: number; className?: string; y?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: easeOutExpo }}
    >
      {children}
    </motion.div>
  )
}

/* ═════════════════════  CUSTOM CHART TOOLTIP  ═══════════════ */

interface ChartPoint {
  day: number
  balance: number
  change: number
  win: boolean
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) return null
  const data = payload[0].payload as ChartPoint
  return (
    <div className="rounded-[12px] border border-[#333333] bg-[#1A1A1A] px-4 py-3 shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
      <p className="mb-1 text-[12px] font-medium uppercase tracking-[0.02em] text-[#5A5E66]">
        Day {label}
      </p>
      <p className="font-mono text-[16px] font-medium text-[#F0F0F0]">
        £{data.balance.toLocaleString()}
      </p>
      <p className={`text-[12px] font-medium tracking-[0.02em] ${data.win ? 'text-[#00F0A0]' : 'text-[#FF3366]'}`}>
        {data.win ? '+' : ''}£{data.change.toLocaleString()}
      </p>
    </div>
  )
}

/* ═════════════════════  MAIN PAGE  ═════════════════════════= */

export default function Performance() {
  return (
    <>
      <HeroSection />
      <GrowthChartSection />
      <MonthlyBreakdownSection />
      <WinRateAnalyticsSection />
      <TheMathSection />
      <TransparencySection />
    </>
  )
}

/* ──────────────────── Section 1: Hero ────────────────────── */

function HeroSection() {
  return (
    <section className="w-full bg-[#0A0A0A] px-6 pb-[48px] pt-[96px] lg:px-12">
      <div className="mx-auto max-w-[1280px]">
        {/* Eyebrow */}
        <motion.p
          className="mb-4 text-center text-[12px] font-medium uppercase tracking-[0.1em] text-[#00E5FF]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
        >
          PERFORMANCE TRACK RECORD
        </motion.p>

        {/* Title */}
        <motion.h1
          className="mb-6 text-center text-[clamp(40px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.03em] text-[#F0F0F0]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: easeOutExpo }}
        >
          <span className="text-[#00F0A0]" style={{ textShadow: '0 0 40px rgba(0,240,160,0.2)' }}>Historical</span>{' '}
          Track Record
          <br />
          Signal Performance Data
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mx-auto mb-[48px] max-w-[600px] text-center text-[18px] leading-[1.6] text-[#8A8F98]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: easeOutExpo }}
        >
          Every signal is logged and tracked for transparency. Past performance is not indicative of future results.
          This data is for educational purposes only.
        </motion.p>

        {/* Stats Banner */}
        <motion.div
          className="grid grid-cols-2 gap-4 rounded-[24px] border border-[#222222] bg-[#111111] px-4 py-6 sm:grid-cols-3 md:px-8 lg:grid-cols-4 lg:px-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: easeOutExpo }}
        >
          <StatBlock value={10247} label="Total Signals" color="#F0F0F0" delay={0.6} />
          <StatBlock value={156000} label="Signals Delivered" color="#00E5FF" delay={0.7} />
          <StatBlock value={3.2} suffix="" label="Avg Risk/Reward" color="#F0F0F0" decimals={1} prefix="1:" delay={0.8} />
          <StatBlock value={12400} label="Active Traders" color="#FFD700" delay={0.9} colSpan />
        </motion.div>
      </div>
    </section>
  )
}

function StatBlock({ value, label, color, prefix = '', suffix = '', decimals = 0, delay = 0, colSpan = false }: {
  value: number; label: string; color: string; prefix?: string; suffix?: string; decimals?: number; delay?: number; colSpan?: boolean
}) {
  return (
    <div className={`flex flex-col items-center gap-1 border-r border-[#222222] px-2 py-2 last:border-r-0 ${colSpan ? 'col-span-2 sm:col-span-1' : ''} sm:px-4`}>
      <span className="font-mono text-[clamp(28px,3vw,40px)] font-medium leading-[1] tracking-[-0.02em]" style={{ color }}>
        {prefix}<AnimatedNumber target={value} decimals={decimals} delay={delay} />{suffix}
      </span>
      <span className="text-center text-[12px] font-medium uppercase tracking-[0.02em] text-[#5A5E66]">
        {label}
      </span>
    </div>
  )
}

/* ─────────────── Section 2: Growth Chart ─────────────────── */

function GrowthChartSection() {
  const scatterWins = chartData.filter(d => d.win).map(d => ({ day: d.day, balance: d.balance }))
  const scatterLosses = chartData.filter(d => !d.win).map(d => ({ day: d.day, balance: d.balance }))

  return (
    <section className="w-full bg-[#050505] px-6 py-[64px] lg:px-12">
      <div className="mx-auto max-w-[1000px]">
        {/* Section Header */}
        <Reveal>
          <p className="mb-3 text-center text-[12px] font-medium uppercase tracking-[0.1em] text-[#00F0A0]">
            HYPOTHETICAL EXAMPLE
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mb-4 text-center text-[clamp(32px,3.5vw,48px)] font-bold leading-[1.1] tracking-[-0.02em] text-[#F0F0F0]">
            Educational Illustration
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mb-8 max-w-[600px] text-center text-[14px] leading-[1.5] text-[#8A8F98]">
            This chart is a hypothetical projection for educational purposes only.
            It does not represent guaranteed or predicted returns. Your results will vary.
          </p>
        </Reveal>

        {/* Chart Card */}
        <Reveal delay={0.2} y={40}>
          <div className="rounded-[24px] border border-[#222222] bg-[#111111] p-4 md:p-6">
            {/* Top Row */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h4 className="text-[clamp(18px,1.5vw,22px)] font-semibold leading-[1.3] text-[#F0F0F0]">
                30-Day Balance Growth
              </h4>
              <div className="flex gap-6">
                <span className="flex items-center gap-2 text-[14px] text-[#F0F0F0]">
                  <span className="inline-block h-[2px] w-5 bg-[#00E5FF]" /> Balance
                </span>
                <span className="flex items-center gap-2 text-[14px] text-[#00F0A0]">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#00F0A0]" /> Win
                </span>
                <span className="flex items-center gap-2 text-[14px] text-[#FF3366]">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#FF3366]" /> Loss
                </span>
              </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={450}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#00E5FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#5A5E66', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
                  axisLine={{ stroke: '#222222' }}
                  tickLine={false}
                  tickCount={10}
                />
                <YAxis
                  tick={{ fill: '#5A5E66', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `£${v.toLocaleString()}`}
                  domain={[0, 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#00E5FF"
                  strokeWidth={2}
                  fill="url(#areaGrad)"
                  animationDuration={2000}
                  animationEasing="ease-out"
                />
                <Scatter data={scatterWins} dataKey="balance" fill="#00F0A0" r={4} stroke="#111111" strokeWidth={2} />
                <Scatter data={scatterLosses} dataKey="balance" fill="#FF3366" r={4} stroke="#111111" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>

            {/* Bottom Row */}
            <div className="mt-4 flex items-center justify-between">
              <span className="font-mono text-[13px] text-[#5A5E66]">Day 1</span>
              <span className="font-mono text-[13px] text-[#5A5E66]">Hypothetical projection for educational purposes only</span>
            </div>
          </div>
        </Reveal>

        {/* Annotation */}
        <Reveal delay={0.4}>
          <p className="mx-auto mt-6 max-w-[700px] text-center text-[14px] leading-[1.5] text-[#5A5E66]">
            This illustration uses hypothetical compounding for educational demonstration only.
            It does not predict or guarantee any specific returns. Trading involves significant risk of loss.
            Past performance is not indicative of future results.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ────────────── Section 3: Monthly Breakdown ─────────────── */

function MonthlyBreakdownSection() {
  return (
    <section className="w-full bg-[#0A0A0A] px-6 py-[64px] lg:px-12">
      <div className="mx-auto max-w-[900px]">
        <Reveal>
          <p className="mb-3 text-center text-[12px] font-medium uppercase tracking-[0.1em] text-[#00E5FF]">
            HISTORICAL DATA
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mb-10 text-center text-[clamp(32px,3.5vw,48px)] font-bold leading-[1.1] tracking-[-0.02em] text-[#F0F0F0]">
            Historical Signal Analysis
          </h2>
        </Reveal>

        <Reveal delay={0.15} y={30}>
          <div className="overflow-x-auto rounded-[16px] border border-[#222222]">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-[#1A1A1A]">
                  {['Month', 'Signals', 'Hits', 'Misses', 'Hit Rate', 'Net P&L', 'Balance'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[12px] font-medium uppercase tracking-[0.02em] text-[#5A5E66]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((row, i) => (
                  <motion.tr
                    key={row.month}
                    className="border-b border-[#222222] transition-colors duration-150 hover:bg-[#1A1A1A]"
                    style={{ backgroundColor: i % 2 === 0 ? '#111111' : 'transparent' }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                  >
                    <td className="px-4 py-3 font-mono text-[13px] text-[#F0F0F0]">{row.month}</td>
                    <td className="px-4 py-3 font-mono text-[13px] text-[#F0F0F0]">{row.signals}</td>
                    <td className="px-4 py-3 font-mono text-[13px] text-[#00F0A0]">{row.hits}</td>
                    <td className="px-4 py-3 font-mono text-[13px] text-[#FF3366]">{row.misses}</td>
                    <td className={`px-4 py-3 font-mono text-[13px] font-medium ${row.rate >= 75 ? 'text-[#00F0A0]' : row.rate >= 65 ? 'text-[#FFD700]' : 'text-[#8A8F98]'}`}>
                      {row.rate.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 font-mono text-[13px] text-[#00F0A0]">+£{row.pnl.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-[13px] text-[#F0F0F0]">£{row.balance.toLocaleString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ──────────── Section 4: Win Rate Analytics ──────────────── */

function WinRateAnalyticsSection() {
  return (
    <section className="w-full bg-[#050505] px-6 py-[64px] lg:px-12">
      <div className="mx-auto max-w-[1280px]">
        <Reveal>
          <p className="mb-3 text-center text-[12px] font-medium uppercase tracking-[0.1em] text-[#00E5FF]">
            SIGNAL ANALYTICS
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mb-10 text-center text-[clamp(32px,3.5vw,48px)] font-bold leading-[1.1] tracking-[-0.02em] text-[#F0F0F0]">
            Where We Win
          </h2>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left — Win Rate Bar Chart */}
          <Reveal delay={0.15} y={40}>
            <div className="rounded-[24px] border border-[#222222] bg-[#111111] p-6">
              <h4 className="mb-6 text-[clamp(18px,1.5vw,22px)] font-semibold leading-[1.3] text-[#F0F0F0]">
                Win Rate by Market
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={winData} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#5A5E66', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} unit="%" />
                  <YAxis dataKey="asset" type="category" tick={{ fill: '#F0F0F0', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333333', borderRadius: '12px' }}
                    itemStyle={{ color: '#F0F0F0', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}
                    formatter={(v: number) => [`${v}%`, 'Win Rate']}
                  />
                  <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={24}>
                    {winData.map((entry, i) => (
                      <Cell key={i} fill={entry.rate >= 65 ? '#00F0A0' : '#FFD700'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Reveal>

          {/* Right — Signal Distribution Donut */}
          <Reveal delay={0.25} y={40}>
            <div className="rounded-[24px] border border-[#222222] bg-[#111111] p-6">
              <h4 className="mb-6 text-[clamp(18px,1.5vw,22px)] font-semibold leading-[1.3] text-[#F0F0F0]">
                Signal Distribution
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distData}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#111111"
                    strokeWidth={2}
                    animationBegin={300}
                    animationDuration={800}
                  >
                    {distData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333333', borderRadius: '12px' }}
                    itemStyle={{ color: '#F0F0F0', fontFamily: "'Inter', sans-serif", fontSize: '13px' }}
                    formatter={(v: number) => [`${v}%`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
                {distData.map(d => (
                  <span key={d.name} className="flex items-center gap-2 text-[13px] text-[#8A8F98]">
                    <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name} ({d.value}%)
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ─────────────── Section 5: The Math ─────────────────────── */

function TheMathSection() {
  return (
    <section className="w-full bg-[#0A0A0A] px-6 py-[128px] lg:px-12">
      <div className="mx-auto max-w-[800px]">
        <Reveal>
          <p className="mb-3 text-center text-[12px] font-medium uppercase tracking-[0.1em] text-[#00E5FF]">
            EDUCATIONAL EXAMPLE
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mb-4 text-center text-[clamp(32px,3.5vw,48px)] font-bold leading-[1.1] tracking-[-0.02em] text-[#F0F0F0]">
            How Compounding Works (Educational)
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mx-auto mb-[48px] max-w-[600px] text-center text-[16px] leading-[1.6] text-[#8A8F98]">
            This is a purely educational illustration of how compounding math works.
            It does not predict, guarantee, or project any actual returns.
          </p>
        </Reveal>

        {/* Step 1 */}
        <StepCard number="£100" color="#FFD700" label="Example Starting Capital"
          body="For illustration purposes only. Start with whatever capital you are comfortable risking. Never trade with money you cannot afford to lose."
          delay={0.2} />

        <ArrowConnector delay={0.35} />

        {/* Step 2 */}
        <StepCard number="~3-5%" color="#00F0A0" label="Hypothetical Daily Example"
          body="This is a purely hypothetical example for educational purposes. Actual market returns vary significantly and losses are possible on any trade."
          delay={0.45} />

        <ArrowConnector delay={0.6} />

        {/* Step 3 */}
        <StepCard number="?" color="#00E5FF" label="Your Results Will Vary"
          body="There are no guaranteed returns in trading. Your actual results depend on market conditions, execution, risk management, and many other factors."
          delay={0.7} />

        {/* Formula Box */}
        <Reveal delay={0.9} y={20}>
          <div className="mt-[48px] rounded-[16px] border border-[#222222] bg-[#050505] px-6 py-6 text-center">
            <p className="font-mono text-[clamp(16px,2vw,24px)] font-medium text-[#F0F0F0]">
              Compounding Formula (Educational Example)
            </p>
            <p className="mt-2 text-[12px] font-medium uppercase tracking-[0.02em] text-[#5A5E66]">
              Capital × (1 + daily rate)^days. For educational illustration only. Not a prediction.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function StepCard({ number, color, label, body, delay }: { number: string; color: string; label: string; body: string; delay: number }) {
  return (
    <Reveal delay={delay} y={40}>
      <div className="mx-auto max-w-[500px] rounded-[24px] border border-[#222222] bg-[#111111] px-8 py-10 text-center">
        <p className="mb-2 font-mono text-[clamp(28px,3vw,40px)] font-medium leading-[1] tracking-[-0.02em]" style={{ color }}>
          {number}
        </p>
        <h4 className="mb-3 text-[clamp(18px,1.5vw,22px)] font-semibold leading-[1.3] text-[#F0F0F0]">
          {label}
        </h4>
        <p className="text-[14px] leading-[1.5] text-[#8A8F98]">
          {body}
        </p>
      </div>
    </Reveal>
  )
}

function ArrowConnector({ delay }: { delay: number }) {
  return (
    <motion.div
      className="my-4 flex justify-center"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, ease: easeOutExpo }}
    >
      <ArrowDown className="h-8 w-8 text-[#00E5FF]" strokeWidth={2} />
    </motion.div>
  )
}

/* ────────── Section 6: Transparency Promise ──────────────── */

function TransparencySection() {
  return (
    <section className="w-full bg-[#050505] px-6 py-[128px] lg:px-12">
      <div className="mx-auto max-w-[700px]">
        <Reveal>
          <p className="mb-3 text-center text-[12px] font-medium uppercase tracking-[0.1em] text-[#00F0A0]">
            OUR COMMITMENT
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mb-10 text-center text-[clamp(32px,3.5vw,48px)] font-bold leading-[1.1] tracking-[-0.02em] text-[#F0F0F0]">
            Transparent & Educational
          </h2>
        </Reveal>

        {/* Two-column checklists */}
        <div className="mb-10 grid gap-8 md:grid-cols-2">
          {/* We Do */}
          <div>
            <h4 className="mb-4 text-[16px] font-semibold text-[#00F0A0]">We Do</h4>
            <ul className="flex flex-col gap-3">
              {weDoItems.map((item, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: easeOutExpo }}
                >
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#00F0A0]" strokeWidth={2} />
                  <span className="text-[14px] leading-[1.5] text-[#F0F0F0]">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* We Don't */}
          <div>
            <h4 className="mb-4 text-[16px] font-semibold text-[#FF3366]">We Don't</h4>
            <ul className="flex flex-col gap-3">
              {weDontItems.map((item, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: easeOutExpo }}
                >
                  <X className="mt-0.5 h-5 w-5 shrink-0 text-[#FF3366]" strokeWidth={2} />
                  <span className="text-[14px] leading-[1.5] text-[#5A5E66] line-through">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <motion.p
          className="mx-auto mb-10 max-w-[560px] text-center text-[14px] leading-[1.5] text-[#5A5E66]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Trading carries inherent risk. These results reflect historical backtesting and live performance
          under specific market conditions. Your results may vary based on execution timing, slippage,
          and market volatility. Never trade with capital you cannot afford to lose.
        </motion.p>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5, ease: easeOutExpo }}
        >
          <Link
            to="/start"
            className="inline-block rounded-[6px] bg-gradient-to-r from-[#00E5FF] to-[#00F0A0] px-7 py-3.5 text-[15px] font-semibold text-[#050505] shadow-[0_0_20px_rgba(0,229,255,0.2)] transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
          >
            Start Receiving Signals
          </Link>
          <p className="mt-3 text-[12px] font-medium uppercase tracking-[0.02em] text-[#5A5E66]">
            7-day money-back guarantee. Trading involves risk.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
