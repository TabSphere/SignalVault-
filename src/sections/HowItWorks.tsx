import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    number: '01',
    title: 'Start with £100',
    body: 'Deposit just £100 to begin your compounding journey. No hidden fees. No minimum lock-in. Your capital, your control.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Get 5 Signals Daily',
    body: 'Our AI engine analyzes 50+ market indicators across forex, crypto, and indices. You get clear entry, exit, and stop-loss levels delivered instantly.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
        <path d="M6 10l3 3 3-3 3 3 3-3" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Trade & Compound',
    body: "Follow each signal's precise parameters. Re-invest profits. Watch your £100 compound toward £50,000 through disciplined, data-driven trading.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
        <line x1="12" y1="2" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22" />
        <line x1="2" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
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

      // Card animations with stagger
      cardsRef.current.forEach((card, i) => {
        if (!card) return
        gsap.from(card, {
          y: 40,
          opacity: 0,
          duration: 0.7,
          delay: i * 0.15,
          ease: "expo.out",
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        })

        // Step number animation
        const stepNum = card.querySelector('.step-number')
        if (stepNum) {
          gsap.from(stepNum, {
            scale: 0.8,
            opacity: 0,
            duration: 0.5,
            delay: i * 0.15 + 0.1,
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
    <section ref={sectionRef} className="w-full bg-[#0A0A0A] py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
        {/* Section Header */}
        <div ref={headerRef} className="mb-16">
          <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.1em] text-[#00E5FF]">
            How It Works
          </p>
          <h2 className="text-[clamp(32px,3.5vw,48px)] font-bold leading-[1.1] tracking-[-0.02em] text-[#F0F0F0]">
            Three Steps to Your Edge
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.number}
              ref={(el) => { cardsRef.current[i] = el }}
              className="group rounded-[16px] border border-[#222222] bg-[#111111] p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(0,229,255,0.2)] hover:shadow-card-hover"
            >
              <div className="step-number mb-4 font-mono text-[48px] font-bold text-[rgba(0,229,255,0.2)]">
                {step.number}
              </div>
              <div className="mb-4">
                {step.icon}
              </div>
              <h3 className="mb-3 text-[clamp(18px,1.5vw,22px)] font-semibold leading-[1.3] text-[#F0F0F0]">
                {step.title}
              </h3>
              <p className="text-[14px] leading-[1.5] text-[#8A8F98]">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
