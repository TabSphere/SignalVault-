import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    title: 'AI-Powered Signal Engine',
    body: 'Our proprietary algorithm processes 50+ technical indicators across forex, crypto, and commodities in real-time. Machine learning models trained on years of market data identify potential trade setups for your review.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    large: true,
  },
  {
    title: 'Sub-Second Delivery',
    body: 'Signals arrive in under 2 seconds. No delays. No missed opportunities. Precision timing for informed trading decisions.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    large: false,
  },
  {
    title: 'Clear Entry & Exit',
    body: 'Every signal includes exact entry price, stop-loss, and take-profit levels. Zero ambiguity. Trade with clarity on your own platform.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
        <path d="M6 10l3 3 3-3 3 3 3-3" />
      </svg>
    ),
    large: false,
  },
  {
    title: 'Risk-Scored Signals',
    body: 'Each trade is rated LOW, MEDIUM, or HIGH risk. Adjust position sizing accordingly. Protect your capital with informed risk management.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    large: false,
  },
  {
    title: 'AI Voice Calling (VIP)',
    body: 'VIP members receive AI-powered voice calls for critical signal alerts. Never miss an important market opportunity, even when you are away from your screen.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    large: false,
  },
]

export default function WhySignalVault() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

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

      cardsRef.current.forEach((card, i) => {
        if (!card) return
        gsap.from(card, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          delay: i * 0.1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        })

        const icon = card.querySelector('.feature-icon')
        if (icon) {
          gsap.from(icon, {
            scale: 0.8,
            opacity: 0,
            duration: 0.4,
            delay: i * 0.1 + 0.1,
            ease: "expo.out",
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          })
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="w-full bg-[#050505] py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
        {/* Section Header */}
        <div ref={headerRef} className="mb-16 text-center">
          <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.1em] text-[#00E5FF]">
            Why SignalVault
          </p>
          <h2 className="text-[clamp(32px,3.5vw,48px)] font-bold leading-[1.1] tracking-[-0.02em] text-[#F0F0F0]">
            Built for Disciplined Traders
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              ref={(el) => { cardsRef.current[i] = el }}
              className={`group relative overflow-hidden rounded-[24px] border border-[#222222] bg-[#111111] p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(0,229,255,0.2)] hover:shadow-card-hover ${
                feature.large ? 'md:col-span-2 lg:col-span-1' : ''
              } ${i === 0 ? 'lg:row-span-2' : ''}`}
            >
              {/* Shine Effect */}
              <div className="absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.05)_45%,transparent_50%)] transition-transform duration-600 group-hover:translate-x-full" />

              <div className="feature-icon mb-4">
                {feature.icon}
              </div>
              <h3 className="mb-3 text-[clamp(18px,1.5vw,22px)] font-semibold leading-[1.3] text-[#F0F0F0]">
                {feature.title}
              </h3>
              <p className="text-[14px] leading-[1.5] text-[#8A8F98]">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
