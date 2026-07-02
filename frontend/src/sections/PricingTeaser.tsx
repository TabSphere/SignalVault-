import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { Check } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const plans = [
  {
    name: 'Standard',
    price: '£29',
    badge: null,
    features: [
      '1 signal per day',
      'Email delivery',
      'Basic risk guide',
      '48h Support',
    ],
    cta: 'Get Started',
    featured: false,
  },
  {
    name: 'Pro',
    price: '£79',
    badge: 'MOST POPULAR',
    features: [
      '3 signals per day',
      'Instant alerts',
      'Risk calculator',
      'Entry / Stop / Target',
      'Priority Support',
    ],
    cta: 'Start Pro Trial',
    featured: true,
  },
  {
    name: 'VIP',
    price: '£149',
    badge: 'PREMIUM',
    features: [
      '5 signals per day',
      'Instant alerts',
      'AI Voice Calling',
      'Risk calculator',
      'Priority support',
    ],
    cta: 'Go VIP',
    featured: false,
  },
]

export default function PricingTeaser() {
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
          y: 40,
          opacity: 0,
          duration: 0.7,
          delay: i * 0.12,
          ease: "expo.out",
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        })
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
            Pricing
          </p>
          <h2 className="text-[clamp(32px,3.5vw,48px)] font-bold leading-[1.1] tracking-[-0.02em] text-[#F0F0F0]">
            Choose Your Edge
          </h2>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-[1000px] grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              ref={(el) => { cardsRef.current[i] = el }}
              className={`relative rounded-[24px] border bg-[#111111] p-8 transition-all duration-300 ${
                plan.featured
                  ? 'border-2 border-[#00E5FF] shadow-card-hover'
                  : 'border-[#222222] shadow-card hover:-translate-y-1 hover:border-[rgba(0,229,255,0.2)] hover:shadow-card-hover'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`mb-4 inline-block rounded-full px-3 py-1 text-[12px] font-medium tracking-wide ${
                  plan.featured
                    ? 'bg-[#1A1A1A] text-[#00E5FF]'
                    : 'bg-[#1A1A1A] text-[#FFD700]'
                }`}>
                  {plan.badge}
                </div>
              )}

              {/* Plan Name */}
              <h3 className="mb-2 text-[clamp(24px,2.5vw,32px)] font-semibold leading-[1.2] tracking-[-0.01em] text-[#F0F0F0]">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mb-6">
                <span className="font-mono text-[clamp(28px,3vw,40px)] font-medium tracking-[-0.02em] text-[#F0F0F0]">
                  {plan.price}
                </span>
                <span className="text-[14px] text-[#5A5E66]">/month</span>
              </div>

              {/* Features */}
              <ul className="mb-8 flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-[14px] text-[#8A8F98]">
                    <Check size={16} className="flex-shrink-0 text-[#00E5FF]" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.featured ? (
                <Link
                  to="/start"
                  className="block w-full rounded-[6px] bg-gradient-to-r from-[#00E5FF] to-[#00F0A0] py-3.5 text-center text-[15px] font-semibold text-[#050505] shadow-[0_0_20px_rgba(0,229,255,0.2)] transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
                >
                  {plan.cta}
                </Link>
              ) : (
                <Link
                  to="/start"
                  className="block w-full rounded-[6px] border border-[#333333] bg-transparent py-3.5 text-center text-[15px] font-medium text-[#F0F0F0] transition-all duration-200 hover:border-[#00E5FF] hover:bg-[#1A1A1A] active:scale-[0.97]"
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Text */}
        <p className="mt-8 text-center text-[14px] text-[#5A5E66]">
          All plans include a 7-day money-back guarantee. No questions asked.
        </p>
      </div>
    </section>
  )
}
