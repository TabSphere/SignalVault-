import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Zap, Check, ArrowRight, TrendingUp, Gift } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CreditCalculator from '../components/CreditCalculator'

gsap.registerPlugin(ScrollTrigger)

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number]

const packages = [
  {
    name: 'Mini',
    price: 4.99,
    credits: 35,
    bonus: 0,
    description: 'Perfect first try',
    featured: false,
    color: '#8A8F98',
  },
  {
    name: 'Starter',
    price: 9.99,
    credits: 85,
    bonus: 10,
    description: 'Casual trading',
    featured: false,
    color: '#00E5FF',
  },
  {
    name: 'Trader',
    price: 14.99,
    credits: 150,
    bonus: 25,
    description: 'Most popular',
    featured: true,
    color: '#00F0A0',
  },
  {
    name: 'Pro',
    price: 19.99,
    credits: 250,
    bonus: 50,
    description: 'Power user',
    featured: false,
    color: '#FFD700',
  },
]

const features = [
  'No subscription — buy once, use anytime',
  'Credits never expire',
  'Signals cost 3-5 credits each',
  'Chat costs 1 credit per message',
  '7-day money-back guarantee',
]

export default function Credits() {
  const [balance] = useState(5)
  const sectionRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const calcRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.from(heroRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'expo.out',
      })

      // Cards stagger
      cardsRef.current.forEach((card, i) => {
        if (!card) return
        gsap.from(card, {
          y: 50,
          opacity: 0,
          duration: 0.7,
          delay: i * 0.12,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        })
      })

      // Calculator slide in
      gsap.from(calcRef.current, {
        x: 60,
        opacity: 0,
        duration: 0.6,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: calcRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const totalCredits = (credits: number, bonus: number) => credits + bonus

  return (
    <div ref={sectionRef} className="w-full bg-[#050505]">
      {/* Hero */}
      <section ref={heroRef} className="px-6 pb-12 pt-[96px] lg:px-12">
        <div className="mx-auto max-w-[1280px] text-center">
          <motion.p
            className="mb-4 text-[12px] font-medium uppercase tracking-[0.1em] text-[#00E5FF]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
          >
            SIMPLE PRICING
          </motion.p>

          <motion.h1
            className="mb-6 text-[clamp(40px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.03em] text-[#F0F0F0]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeOutExpo }}
          >
            Trading Signals from £4.99
          </motion.h1>

          <motion.p
            className="mx-auto mb-8 max-w-[560px] text-[18px] leading-[1.6] text-[#8A8F98]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: easeOutExpo }}
          >
            No subscription. Buy credits, use when you want. Signals cost 3-5 credits each.
          </motion.p>

          {/* Balance Display */}
          <motion.div
            className="mx-auto inline-flex items-center gap-3 rounded-2xl border border-[#222222] bg-[#111111] px-8 py-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4, ease: easeOutExpo }}
          >
            <Zap size={24} className="text-[#00E5FF]" />
            <div className="text-left">
              <p className="text-[12px] text-[#5A5E66]">Your Balance</p>
              <p className="text-[28px] font-bold text-[#F0F0F0]">{balance} credits</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Package Cards */}
      <section className="px-6 pb-16 lg:px-12">
        <div className="mx-auto grid max-w-[1000px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg, i) => (
            <div
              key={pkg.name}
              ref={(el) => { cardsRef.current[i] = el }}
              className={`relative rounded-[24px] border bg-[#111111] p-6 transition-all duration-300 ${
                pkg.featured
                  ? 'border-2 border-[#00F0A0] shadow-[0_0_20px_rgba(0,240,160,0.15)]'
                  : 'border-[#222222] hover:-translate-y-1 hover:border-[rgba(0,229,255,0.2)]'
              }`}
            >
              {pkg.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[#00F0A0] px-4 py-1 text-[11px] font-bold text-[#050505]">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {pkg.bonus > 0 && (
                <div className="absolute right-4 top-4">
                  <span className="flex items-center gap-1 rounded-full bg-[#FFD700]/10 px-2 py-1 text-[11px] font-medium text-[#FFD700]">
                    <Gift size={10} />
                    +{pkg.bonus} free
                  </span>
                </div>
              )}

              <h3
                className="mb-2 text-[clamp(20px,2vw,24px)] font-semibold"
                style={{ color: pkg.color }}
              >
                {pkg.name}
              </h3>

              <div className="mb-4">
                <span className="text-[clamp(28px,3vw,36px)] font-bold text-[#F0F0F0]">
                  £{pkg.price}
                </span>
              </div>

              <div className="mb-4 flex items-baseline gap-1">
                <span className="text-[24px] font-bold text-[#F0F0F0]">
                  {totalCredits(pkg.credits, pkg.bonus)}
                </span>
                <span className="text-[14px] text-[#5A5E66]">credits</span>
              </div>

              <p className="mb-6 text-[13px] text-[#5A5E66]">{pkg.description}</p>

              <div className="mb-6 space-y-2">
                <div className="flex items-center gap-2 text-[13px] text-[#8A8F98]">
                  <Check size={14} className="text-[#00F0A0]" />
                  ~{Math.floor(totalCredits(pkg.credits, pkg.bonus) / 5)} signals
                </div>
                <div className="flex items-center gap-2 text-[13px] text-[#8A8F98]">
                  <Check size={14} className="text-[#00F0A0]" />
                  {totalCredits(pkg.credits, pkg.bonus)} chat messages
                </div>
              </div>

              <button
                className={`w-full rounded-xl py-3 text-[15px] font-semibold transition-all duration-200 active:scale-[0.97] ${
                  pkg.featured
                    ? 'bg-gradient-to-r from-[#00E5FF] to-[#00F0A0] text-[#050505] shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:brightness-110'
                    : 'border border-[#333333] bg-transparent text-[#F0F0F0] hover:border-[#00E5FF] hover:bg-[#1A1A1A]'
                }`}
              >
                Buy {pkg.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Calculator + Features */}
      <section className="px-6 pb-16 lg:px-12">
        <div className="mx-auto grid max-w-[1000px] grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Calculator */}
          <div ref={calcRef}>
            <CreditCalculator />
          </div>

          {/* Features */}
          <div className="rounded-[24px] border border-[#222222] bg-[#111111] p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00E5FF]/10">
                <TrendingUp size={20} className="text-[#00E5FF]" />
              </div>
              <h3 className="text-[20px] font-semibold text-[#F0F0F0]">Why Credits?</h3>
            </div>

            <ul className="space-y-4">
              {features.map((feature, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <Check size={18} className="mt-0.5 shrink-0 text-[#00F0A0]" />
                  <span className="text-[14px] text-[#8A8F98]">{feature}</span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-8 rounded-xl bg-[#1A1A1A] p-4">
              <p className="text-[13px] text-[#5A5E66]">
                <strong className="text-[#F0F0F0]">Example:</strong> Buy Trader (£14.99, 175 credits).
                Generate 3 signals/day with analysis = 15 credits/day.
                Your credits last <span className="text-[#00F0A0]">11 days</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Referral Banner */}
      <section className="px-6 pb-24 lg:px-12">
        <motion.div
          className="mx-auto max-w-[1000px] rounded-[24px] border border-[rgba(0,229,255,0.2)] bg-[#111111] p-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Gift size={32} className="mx-auto mb-4 text-[#00E5FF]" />
          <h3 className="mb-2 text-[24px] font-bold text-[#F0F0F0]">Earn Free Credits</h3>
          <p className="mx-auto mb-6 max-w-[500px] text-[14px] text-[#8A8F98]">
            Invite friends to SignalVault and earn 10% of their first purchase as credits.
            They also get 10 bonus credits!
          </p>
          <Link
            to="/referrals"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00F0A0] px-6 py-3 text-[15px] font-semibold text-[#050505] transition-all hover:brightness-110"
          >
            Start Earning
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
