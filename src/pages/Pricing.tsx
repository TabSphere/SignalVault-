import { useState } from 'react'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Lock, CreditCard, RefreshCw, Shield } from 'lucide-react'

/* ─────────────────────── ease tokens ─────────────────────── */
const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number]
const easeInOut = [0.4, 0, 0.2, 1] as [number, number, number, number]

/* ═════════════════════  SCROLL REVEAL  ══════════════════════ */

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

/* ═══════════════════════  DATA  ═════════════════════════════ */

type Billing = 'monthly' | 'yearly'

interface Plan {
  name: string
  price: { monthly: number; yearly: number }
  color: string
  featured?: boolean
  badge?: { text: string; bg: string; color: string; border?: string }
  features: string[]
  ctaText: string
  ctaStyle: 'primary' | 'secondary' | 'gold'
  subtext: string
  subtextColor: string
}

const plans: Plan[] = [
  {
    name: 'STANDARD',
    price: { monthly: 29, yearly: 290 },
    color: '#8A8F98',
    features: [
      '1 signal per day',
      'Email delivery',
      'Basic risk guide',
      'Entry & Take-Profit Levels',
      '48-Hour Email Support',
    ],
    ctaText: 'Get Started',
    ctaStyle: 'secondary',
    subtext: 'Email delivery daily',
    subtextColor: '#5A5E66',
  },
  {
    name: 'PRO',
    price: { monthly: 79, yearly: 790 },
    color: '#00E5FF',
    featured: true,
    badge: { text: 'MOST POPULAR', bg: '#050505', color: '#00E5FF', border: '#00E5FF' },
    features: [
      '3 signals per day',
      'Instant alerts',
      'Risk calculator',
      'Entry / Stop / Target',
      'Confidence Score (0-100%)',
      'Signal Countdown Timer',
      'Trading Journal Access',
      'Priority Support (24h)',
    ],
    ctaText: 'Start Pro Trial',
    ctaStyle: 'primary',
    subtext: '7-day money-back guarantee',
    subtextColor: '#00F0A0',
  },
  {
    name: 'VIP',
    price: { monthly: 149, yearly: 1490 },
    color: '#FFD700',
    badge: { text: 'PREMIUM', bg: 'rgba(255,215,0,0.1)', color: '#FFD700' },
    features: [
      '5 signals per day',
      'Instant alerts',
      'AI Voice Calling',
      'Risk calculator',
      'Early Access to New Features',
      '24/7 Direct Support Line',
      'Priority Support',
      'Position Sizing Calculator',
    ],
    ctaText: 'Go VIP',
    ctaStyle: 'gold',
    subtext: 'AI Voice Calling included',
    subtextColor: '#FFD700',
  },
]

/* Comparison table data */
interface CompRow {
  category?: string
  feature: string
  starter: string
  pro: string
  vip: string
}

const comparisonRows: CompRow[] = [
  { category: 'SIGNALS', feature: '', starter: '', pro: '', vip: '' },
  { feature: 'Signals Per Day', starter: '1', pro: '3', vip: '5' },
  { feature: 'Forex Pairs', starter: 'yes', pro: 'yes', vip: 'yes' },
  { feature: 'Crypto', starter: 'yes', pro: 'yes', vip: 'yes' },
  { feature: 'Commodities (Gold)', starter: 'yes', pro: 'yes', vip: 'yes' },
  { feature: 'Indices', starter: 'no', pro: 'yes', vip: 'yes' },

  { category: 'DELIVERY', feature: '', starter: '', pro: '', vip: '' },
  { feature: 'Email Delivery', starter: 'yes', pro: 'yes', vip: 'yes' },
  { feature: 'Instant Push Alerts', starter: 'no', pro: 'yes', vip: 'yes' },
  { feature: 'AI Voice Calling', starter: 'no', pro: 'no', vip: 'yes' },
  { feature: 'Signal Countdown Timer', starter: 'no', pro: 'yes', vip: 'yes' },

  { category: 'SIGNAL DETAILS', feature: '', starter: '', pro: '', vip: '' },
  { feature: 'Entry Price', starter: 'yes', pro: 'yes', vip: 'yes' },
  { feature: 'Stop-Loss Level', starter: 'no', pro: 'yes', vip: 'yes' },
  { feature: 'Take-Profit Level', starter: 'yes', pro: 'yes', vip: 'yes' },
  { feature: 'Confidence Score', starter: 'no', pro: 'yes', vip: 'yes' },
  { feature: 'Risk Rating (Low/Med/High)', starter: 'Basic', pro: 'Detailed', vip: 'Detailed' },
  { feature: 'Risk Calculator', starter: 'no', pro: 'yes', vip: 'yes' },

  { category: 'TOOLS', feature: '', starter: '', pro: '', vip: '' },
  { feature: 'Trading Journal', starter: 'no', pro: 'yes', vip: 'yes' },
  { feature: 'Performance Dashboard', starter: 'no', pro: 'yes', vip: 'yes' },
  { feature: 'Position Sizing Calculator', starter: 'no', pro: 'no', vip: 'yes' },

  { category: 'SUPPORT', feature: '', starter: '', pro: '', vip: '' },
  { feature: 'Email Support', starter: '48h', pro: '24h', vip: 'Instant' },
  { feature: 'Live Chat', starter: 'no', pro: 'yes', vip: 'yes' },
  { feature: 'Priority Support', starter: 'no', pro: 'no', vip: 'yes' },
  { feature: 'Private Community', starter: 'no', pro: 'no', vip: 'yes' },
]

/* FAQ data */
const faqData = [
  {
    q: 'How much capital do I need to start?',
    a: 'You can start with any amount that fits your personal financial situation. Our signals work with any position size. Never trade with capital you cannot afford to lose.',
  },
  {
    q: 'How are signals delivered?',
    a: 'Standard plan: signals are delivered via email daily. Pro and VIP plans receive instant push notifications. VIP members also get AI Voice Calling for critical alerts. Each signal includes the asset pair, direction (BUY/SELL), entry price, stop-loss, take-profit target, confidence score, and risk rating.',
  },
  {
    q: 'What markets do the signals cover?',
    a: 'Our signals cover major forex pairs (EUR/USD, GBP/JPY, USD/CAD, etc.), cryptocurrencies (BTC/USD, ETH/USD), gold (XAU/USD), and major indices. The distribution shifts based on which markets show the strongest technical setups each day.',
  },
  {
    q: 'What if I miss a signal?',
    a: 'Each signal is valid for a specific time window (typically 2-4 hours). If you miss the entry window, we recommend waiting for the next signal rather than chasing the trade. You receive 1, 3, or 5 signals daily depending on your plan, so there are always more opportunities.',
  },
  {
    q: 'Is there a money-back guarantee?',
    a: 'Yes. All plans come with a 7-day money-back guarantee. If you\'re not satisfied for any reason, contact our support team within 7 days of your purchase for a full refund. No questions asked.',
  },
  {
    q: 'How are signals generated?',
    a: 'Signals are generated by our proprietary AI algorithm that analyzes 50+ technical indicators across multiple markets. We provide the signal information for your review — all trading decisions are your own responsibility.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes. You can cancel your subscription at any time from your account dashboard. Your access continues until the end of your current billing period. There are no cancellation fees or penalties.',
  },
  {
    q: 'What\'s the difference between Pro and VIP?',
    a: 'VIP includes everything in Pro plus 5 signals per day (vs 3), AI Voice Calling for critical alerts, 24/7 direct support line, priority support, access to our private VIP community, and a position sizing calculator. VIP is designed for active traders who want maximum signal coverage.',
  },
]

/* ═════════════════════  MAIN PAGE  ═════════════════════════= */

export default function Pricing() {
  const [billing, setBilling] = useState<Billing>('monthly')

  return (
    <>
      <PricingHero billing={billing} setBilling={setBilling} />
      <PricingCards billing={billing} />
      <FeatureComparison />
      <FAQSection />
      <GuaranteeCTA billing={billing} />
    </>
  )
}

/* ─────────────── Section 1: Pricing Hero ─────────────────── */

function PricingHero({ billing, setBilling }: { billing: Billing; setBilling: (b: Billing) => void }) {
  return (
    <section className="w-full bg-[#0A0A0A] px-6 pb-[48px] pt-[96px] lg:px-12">
      <div className="mx-auto max-w-[1280px] text-center">
        {/* Eyebrow */}
        <motion.p
          className="mb-4 text-[12px] font-medium uppercase tracking-[0.1em] text-[#00E5FF]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
        >
          SIMPLE, TRANSPARENT PRICING
        </motion.p>

        {/* Headline */}
        <motion.h1
          className="mb-6 text-[clamp(40px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.03em] text-[#F0F0F0]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: easeOutExpo }}
        >
          Choose Your Trading Edge
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mx-auto mb-10 max-w-[560px] text-[18px] leading-[1.6] text-[#8A8F98]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: easeOutExpo }}
        >
          No hidden fees. No setup costs. Cancel anytime. Choose the plan that fits your trading needs.
        </motion.p>

        {/* Billing Toggle */}
        <motion.div
          className="inline-flex items-center gap-2 rounded-full border border-[#222222] bg-[#111111] p-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <button
            onClick={() => setBilling('monthly')}
            className={`rounded-full px-6 py-2.5 text-[14px] font-medium transition-all duration-200 ${
              billing === 'monthly'
                ? 'bg-[#00E5FF] font-semibold text-[#050505]'
                : 'bg-transparent text-[#5A5E66] hover:text-[#F0F0F0]'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`rounded-full px-6 py-2.5 text-[14px] font-medium transition-all duration-200 ${
              billing === 'yearly'
                ? 'bg-[#00E5FF] font-semibold text-[#050505]'
                : 'bg-transparent text-[#5A5E66] hover:text-[#F0F0F0]'
            }`}
          >
            Yearly
          </button>
          {billing === 'yearly' && (
            <motion.span
              className="mr-2 ml-1 text-[12px] font-medium text-[#00F0A0]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              Save 17%
            </motion.span>
          )}
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────── Section 2: Pricing Cards ────────────────── */

function PricingCards({ billing }: { billing: Billing }) {
  return (
    <section className="w-full bg-[#050505] px-6 pb-[64px] pt-[32px] lg:px-12">
      <div className="mx-auto grid max-w-[1000px] items-stretch gap-6 md:grid-cols-3">
        {plans.map((plan, i) => (
          <PricingCard key={plan.name} plan={plan} billing={billing} index={i} />
        ))}
      </div>
    </section>
  )
}

function PricingCard({ plan, billing, index }: { plan: Plan; billing: Billing; index: number }) {
  const price = plan.price[billing]
  const isYearly = billing === 'yearly'

  return (
    <motion.div
      className={`relative flex flex-col rounded-[24px] bg-[#111111] p-6 md:p-8 ${
        plan.featured
          ? 'border-2 border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.2)] md:-translate-y-3'
          : 'border border-[#222222]'
      }`}
      initial={{ opacity: 0, y: plan.featured ? 60 : 50 }}
      animate={{ opacity: 1, y: plan.featured ? -12 : 0 }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: easeOutExpo }}
      whileHover={{
        y: plan.featured ? -16 : -4,
        transition: { duration: 0.3, ease: easeInOut },
      }}
    >
      {/* Badge */}
      {plan.badge && (
        <div className={`absolute left-1/2 -translate-x-1/2 ${plan.featured ? '-top-[22px]' : 'top-4 right-4 left-auto translate-x-0'}`}>
          <span
            className="inline-block rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-wide"
            style={{
              backgroundColor: plan.badge.bg,
              color: plan.badge.color,
              border: plan.badge.border ? `1px solid ${plan.badge.border}` : 'none',
            }}
          >
            {plan.badge.text}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3
          className="mb-4 text-[clamp(18px,1.5vw,22px)] font-semibold uppercase tracking-[0.05em]"
          style={{ color: plan.color }}
        >
          {plan.name}
        </h3>
        <div className="flex items-baseline gap-1">
          <AnimatePresence mode="wait">
            <motion.span
              key={billing}
              className="font-mono text-[clamp(28px,3vw,40px)] font-medium leading-[1] tracking-[-0.02em] text-[#F0F0F0]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              £{price.toLocaleString()}
            </motion.span>
          </AnimatePresence>
          <span className="text-[14px] text-[#5A5E66]">
            {isYearly ? '/year' : '/month'}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-6 h-px bg-[#222222]" />

      {/* Features */}
      <ul className="mb-8 flex flex-1 flex-col gap-3">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#00F0A0]" strokeWidth={2.5} />
            <span className="text-[14px] leading-[1.5] text-[#8A8F98]">{f}</span>
          </li>
        ))}
      </ul>

      {/* Divider */}
      <div className="mb-6 h-px bg-[#222222]" />

      {/* CTA */}
      <div className="text-center">
        <Link
          to="/start"
          className={`block w-full rounded-[6px] py-3.5 text-center text-[15px] font-semibold transition-all duration-200 active:scale-[0.97] ${
            plan.ctaStyle === 'primary'
              ? 'bg-gradient-to-r from-[#00E5FF] to-[#00F0A0] text-[#050505] shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:brightness-110'
              : plan.ctaStyle === 'gold'
              ? 'border border-[#FFD700] bg-transparent text-[#F0F0F0] hover:bg-[#FFD700]/10'
              : 'border border-[#333333] bg-transparent text-[#F0F0F0] hover:border-[#00E5FF] hover:bg-[#1A1A1A]'
          }`}
        >
          {plan.ctaText}
        </Link>
        <p className={`mt-2 text-[12px] font-medium tracking-[0.02em]`} style={{ color: plan.subtextColor }}>
          {plan.subtext}
        </p>
      </div>
    </motion.div>
  )
}

/* ─────────── Section 3: Feature Comparison ───────────────── */

function FeatureComparison() {
  return (
    <section className="w-full bg-[#0A0A0A] px-6 py-[64px] lg:px-12">
      <div className="mx-auto max-w-[900px]">
        <Reveal>
          <p className="mb-3 text-center text-[12px] font-medium uppercase tracking-[0.1em] text-[#00E5FF]">
            DETAILED COMPARISON
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mb-10 text-center text-[clamp(32px,3.5vw,48px)] font-bold leading-[1.1] tracking-[-0.02em] text-[#F0F0F0]">
            Compare Plans Side by Side
          </h2>
        </Reveal>

        <Reveal delay={0.15} y={30}>
          <div className="overflow-x-auto rounded-[16px] border border-[#222222]">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="bg-[#1A1A1A]">
                  <th className="w-[40%] px-4 py-3 text-left text-[12px] font-medium uppercase tracking-[0.02em] text-[#5A5E66]">
                    Feature
                  </th>
                  <th className="w-[20%] px-4 py-3 text-center text-[12px] font-medium uppercase tracking-[0.02em] text-[#5A5E66]">
                    Starter
                  </th>
                  <th className="w-[20%] px-4 py-3 text-center text-[12px] font-medium uppercase tracking-[0.02em] text-[#00E5FF]"
                    style={{ backgroundColor: 'rgba(0,229,255,0.05)' }}
                  >
                    Pro
                  </th>
                  <th className="w-[20%] px-4 py-3 text-center text-[12px] font-medium uppercase tracking-[0.02em] text-[#FFD700]">
                    VIP
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  row.category ? (
                    <tr key={`cat-${i}`} className="bg-[#1A1A1A]">
                      <td colSpan={4} className="px-4 py-2 text-[12px] font-medium uppercase tracking-[0.02em] text-[#5A5E66]">
                        {row.category}
                      </td>
                    </tr>
                  ) : (
                    <motion.tr
                      key={`row-${i}`}
                      className="border-b border-[#222222] transition-colors duration-150 hover:bg-[#1A1A1A]"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                    >
                      <td className="px-4 py-3 text-[14px] text-[#F0F0F0]">{row.feature}</td>
                      <td className="px-4 py-3 text-center">
                        <Cell value={row.starter} />
                      </td>
                      <td className="px-4 py-3 text-center" style={{ backgroundColor: 'rgba(0,229,255,0.02)' }}>
                        <Cell value={row.pro} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Cell value={row.vip} />
                      </td>
                    </motion.tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Cell({ value }: { value: string }) {
  if (value === 'yes') return <Check className="mx-auto h-[18px] w-[18px] text-[#00F0A0]" strokeWidth={2.5} />
  if (value === 'no') return <span className="text-[14px] text-[#5A5E66]">—</span>
  return <span className="text-[13px] text-[#8A8F98]">{value}</span>
}

/* ─────────────── Section 4: FAQ ──────────────────────────── */

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="w-full bg-[#050505] px-6 py-[64px] lg:px-12">
      <div className="mx-auto max-w-[700px]">
        <Reveal>
          <p className="mb-3 text-center text-[12px] font-medium uppercase tracking-[0.1em] text-[#00E5FF]">
            FREQUENTLY ASKED
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mb-10 text-center text-[clamp(32px,3.5vw,48px)] font-bold leading-[1.1] tracking-[-0.02em] text-[#F0F0F0]">
            Questions? Answered.
          </h2>
        </Reveal>

        <div className="flex flex-col gap-2">
          {faqData.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: easeOutExpo }}
            >
              <AccordionItem
                question={faq.q}
                answer={faq.a}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AccordionItem({ question, answer, isOpen, onToggle }: {
  question: string; answer: string; isOpen: boolean; onToggle: () => void
}) {
  return (
    <div className="rounded-[12px] border border-[#222222] bg-[#111111] overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors duration-150 hover:bg-[#1A1A1A] md:px-6"
      >
        <span className="pr-4 text-[16px] font-medium leading-[1.4] text-[#F0F0F0]">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: easeInOut }}
        >
          <ChevronDown className="h-5 w-5 shrink-0 text-[#8A8F98]" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: easeInOut }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#222222] px-4 pb-5 pt-3 md:px-6">
              <p className="text-[14px] leading-[1.6] text-[#8A8F98]">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ───────────── Section 5: Guarantee CTA ──────────────────── */

function GuaranteeCTA({ billing }: { billing: Billing }) {
  const proPrice = plans[1].price[billing]

  return (
    <section className="w-full bg-[#0A0A0A] px-6 py-[128px] lg:px-12">
      <div className="mx-auto max-w-[700px] text-center">
        {/* Guarantee Badge */}
        <motion.div
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[rgba(0,240,160,0.2)] bg-[rgba(0,240,160,0.08)] px-5 py-2.5"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
        >
          <Shield className="h-5 w-5 text-[#00F0A0]" strokeWidth={2} />
          <span className="text-[12px] font-semibold uppercase tracking-[0.02em] text-[#00F0A0]">
            7-DAY MONEY-BACK GUARANTEE
          </span>
        </motion.div>

        {/* Headline */}
        <Reveal delay={0.1}>
          <h2 className="mb-6 text-[clamp(40px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.03em] text-[#F0F0F0]">
            Start Today. Risk Nothing.
          </h2>
        </Reveal>

        {/* Subtext */}
        <Reveal delay={0.25}>
          <p className="mx-auto mb-8 max-w-[560px] text-[18px] leading-[1.6] text-[#8A8F98]">
            Try SignalVault Pro for 7 full days. Review the signals. See if they fit your trading style.
            If you're not satisfied, we'll refund every penny. No forms. No hassle.
          </p>
        </Reveal>

        {/* CTA */}
        <Reveal delay={0.4}>
          <div className="mb-10">
            <Link
              to="/start"
              className="inline-block rounded-[6px] bg-gradient-to-r from-[#00E5FF] to-[#00F0A0] px-8 py-4 text-[16px] font-semibold text-[#050505] shadow-[0_0_20px_rgba(0,229,255,0.2)] transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
            >
              Start My 7-Day Trial — £{proPrice}
            </Link>
            <p className="mt-3 text-[12px] font-medium uppercase tracking-[0.02em] text-[#5A5E66]">
              Cancel anytime. Full refund within 7 days.
            </p>
          </div>
        </Reveal>

        {/* Trust micro-items */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
          {[
            { icon: <Lock className="h-4 w-4" />, text: 'Secure Payment' },
            { icon: <CreditCard className="h-4 w-4" />, text: 'All Cards Accepted' },
            { icon: <RefreshCw className="h-4 w-4" />, text: 'Instant Cancellation' },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.02em] text-[#5A5E66]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
            >
              {item.icon}
              {item.text}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
