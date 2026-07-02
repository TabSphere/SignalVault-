import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

gsap.registerPlugin(ScrollTrigger)

const chartData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  balance: Math.round(100 * Math.pow(1.02, i)),
}))

const stats = [
  { value: '10,000+', label: 'Signals Delivered', color: 'text-[#00F0A0]' },
  { value: '12,400+', label: 'Active Traders', color: 'text-[#00E5FF]' },
  { value: '1:3.2', label: 'Risk/Reward Ratio', color: 'text-[#F0F0F0]' },
  { value: '24/7', label: 'AI Analysis', color: 'text-[#FFD700]' },
]

function AnimatedCounter({ value, color }: { value: string; color: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''))
    const prefix = value.match(/^[^0-9.]*/)?.[0] || ''
    const suffix = value.match(/[^0-9.]*$/)?.[0] || ''
    const isDecimal = value.includes('.')

    const obj = { val: 0 }
    gsap.to(obj, {
      val: numericValue,
      duration: 1.5,
      ease: "expo.out",
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      onUpdate: () => {
        const formatted = isDecimal
          ? obj.val.toFixed(1)
          : Math.round(obj.val).toLocaleString()
        el.textContent = `${prefix}${formatted}${suffix}`
      },
    })
  }, [value])

  return <span ref={ref} className={`font-mono text-[clamp(28px,3vw,40px)] font-medium leading-none tracking-[-0.02em] ${color}`}>0</span>
}

export default function PerformanceProof() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "expo.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })

      gsap.from(chartRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.3,
        ease: "expo.out",
        scrollTrigger: {
          trigger: chartRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="w-full bg-[#0A0A0A] py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[60%_40%]">
          {/* Left Column */}
          <div>
            <div ref={headerRef} className="mb-10">
              <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.1em] text-[#00E5FF]">
                Transparent Track Record
              </p>
              <h2 className="mb-3 text-[clamp(32px,3.5vw,48px)] font-bold leading-[1.1] tracking-[-0.02em] text-[#F0F0F0]">
                Historical Performance
              </h2>
              <p className="max-w-[420px] text-[14px] leading-[1.5] text-[#8A8F98]">
                Past signal analysis across thousands of market scenarios. Past performance is not indicative of future results.
              </p>
            </div>

            {/* Stat Grid */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-[16px] border border-[#222222] bg-[#111111] p-6 shadow-card">
                  <AnimatedCounter value={stat.value} color={stat.color} />
                  <p className="mt-2 text-[12px] font-medium tracking-wide text-[#5A5E66]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column — Chart */}
          <div ref={chartRef} className="rounded-[16px] border border-[#222222] bg-[#111111] p-6 shadow-card">
            <h4 className="mb-1 text-[clamp(18px,1.5vw,22px)] font-semibold leading-[1.3] text-[#F0F0F0]">
              Hypothetical Projection
            </h4>
            <p className="mb-4 text-[12px] tracking-wide text-[#5A5E66]">
              For educational purposes only. Not a guarantee of returns.
            </p>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00F0A0" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#00F0A0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" horizontal vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#5A5E66"
                    fontSize={12}
                    fontFamily="JetBrains Mono, monospace"
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'Days', position: 'insideBottom', offset: -5, fill: '#5A5E66', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#5A5E66"
                    fontSize={12}
                    fontFamily="JetBrains Mono, monospace"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `£${v.toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A1A',
                      border: '1px solid #222222',
                      borderRadius: '12px',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '12px',
                      color: '#F0F0F0',
                    }}
                    formatter={(value: number) => [`£${value.toLocaleString()}`, 'Balance']}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#00F0A0"
                    strokeWidth={2}
                    fill="url(#growthGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
