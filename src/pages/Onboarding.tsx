import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, AlertTriangle, Phone } from 'lucide-react'

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number]

const plans = [
  {
    name: 'Standard',
    price: 29,
    period: '/month',
    signals: '1 signal per day',
    delivery: 'Email delivery',
    features: ['1 signal per day', 'Email delivery', 'Basic risk guide', '48h email support'],
    cta: 'Choose Standard',
    featured: false,
  },
  {
    name: 'Pro',
    price: 79,
    period: '/month',
    signals: '3 signals per day',
    delivery: 'Instant alerts',
    features: ['3 signals per day', 'Instant alerts', 'Risk calculator', 'Entry / Stop / Target', 'Priority support (24h)'],
    cta: 'Choose Pro',
    featured: true,
  },
  {
    name: 'VIP',
    price: 149,
    period: '/month',
    signals: '5 signals per day',
    delivery: 'Instant alerts + AI Voice Calling',
    features: ['5 signals per day', 'Instant alerts', 'AI Voice Calling', 'Risk calculator', 'Priority support'],
    cta: 'Choose VIP',
    featured: false,
  },
]

export default function Onboarding() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [capital, setCapital] = useState('')

  return (
    <div className="min-h-[100dvh] bg-[#050505]">
      {/* Header */}
      <section className="w-full px-6 pb-8 pt-[96px] lg:px-12">
        <div className="mx-auto max-w-[800px] text-center">
          <motion.p
            className="mb-4 text-[12px] font-medium uppercase tracking-[0.1em] text-[#00E5FF]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
          >
            CHOOSE YOUR PLAN
          </motion.p>
          <motion.h1
            className="mb-4 text-[clamp(32px,4vw,48px)] font-bold leading-[1.1] tracking-[-0.02em] text-[#F0F0F0]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeOutExpo }}
          >
            Select Your Signal Plan
          </motion.h1>
          <motion.p
            className="mx-auto max-w-[560px] text-[16px] leading-[1.6] text-[#8A8F98]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: easeOutExpo }}
          >
            Choose the plan that fits your trading needs. All plans include a 7-day money-back guarantee.
          </motion.p>
        </div>
      </section>

      {/* Disclaimer Banner */}
      <section className="w-full px-6 pb-8 lg:px-12">
        <div className="mx-auto max-w-[800px]">
          <div className="rounded-[12px] border border-[#222222] bg-[#111111] p-4 flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[#FFD700]" />
            <p className="text-[13px] leading-[1.5] text-[#8A8F98]">
              <strong className="text-[#F0F0F0]">Important:</strong> SignalVault provides educational trading signals only.
              We are not a broker and do not execute trades. All trading decisions are your own responsibility.
              Trading involves significant risk of loss. Never trade with capital you cannot afford to lose.
            </p>
          </div>
        </div>
      </section>

      {/* Plan Selection */}
      <section className="w-full px-6 pb-8 lg:px-12">
        <div className="mx-auto max-w-[1000px]">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: easeOutExpo }}
                className={`relative rounded-[24px] border p-8 transition-all duration-300 cursor-pointer ${
                  selectedPlan === plan.name
                    ? 'border-[#00E5FF] bg-[#1A1A1A] shadow-[0_0_20px_rgba(0,229,255,0.2)]'
                    : plan.featured
                      ? 'border-2 border-[#00E5FF] bg-[#111111]'
                      : 'border-[#222222] bg-[#111111] hover:border-[rgba(0,229,255,0.3)]'
                }`}
                onClick={() => setSelectedPlan(plan.name)}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#00E5FF] px-4 py-1 text-[11px] font-semibold tracking-wide text-[#050505]">
                    MOST POPULAR
                  </div>
                )}
                {plan.name === 'VIP' && (
                  <div className="absolute -top-3 right-4 rounded-full bg-[#FFD700] px-3 py-1 text-[11px] font-semibold tracking-wide text-[#050505] flex items-center gap-1">
                    <Phone size={10} /> AI CALLING
                  </div>
                )}

                <h3 className="mb-2 text-[24px] font-semibold text-[#F0F0F0]">{plan.name}</h3>
                <div className="mb-4">
                  <span className="font-mono text-[32px] font-medium text-[#F0F0F0]">£{plan.price}</span>
                  <span className="text-[14px] text-[#5A5E66]">{plan.period}</span>
                </div>

                <div className="mb-4">
                  <p className="text-[14px] font-medium text-[#00E5FF]">{plan.signals}</p>
                  <p className="text-[13px] text-[#8A8F98]">{plan.delivery}</p>
                </div>

                <ul className="mb-8 flex flex-col gap-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-[13px] text-[#8A8F98]">
                      <Check size={14} className="shrink-0 text-[#00F0A0]" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={`block w-full rounded-[6px] py-3 text-center text-[14px] font-semibold transition-all duration-200 active:scale-[0.97] ${
                    selectedPlan === plan.name
                      ? 'bg-[#00E5FF] text-[#050505]'
                      : plan.featured
                        ? 'bg-gradient-to-r from-[#00E5FF] to-[#00F0A0] text-[#050505]'
                        : 'border border-[#333333] text-[#F0F0F0] hover:border-[#00E5FF] hover:bg-[#1A1A1A]'
                  }`}
                >
                  {selectedPlan === plan.name ? 'Selected' : plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capital Input */}
      <section className="w-full px-6 pb-8 lg:px-12">
        <div className="mx-auto max-w-[600px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: easeOutExpo }}
            className="rounded-[16px] border border-[#222222] bg-[#111111] p-6"
          >
            <h3 className="mb-2 text-[18px] font-semibold text-[#F0F0F0]">Your Trading Capital</h3>
            <p className="mb-4 text-[13px] text-[#8A8F98]">
              Enter the capital you plan to trade with. This helps us tailor risk guidance to your account size.
              This is for informational purposes only.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[20px] text-[#5A5E66]">£</span>
              <input
                type="number"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                placeholder="e.g. 500"
                className="w-full rounded-[6px] border border-[#333333] bg-[#0A0A0A] px-4 py-3 text-[16px] text-[#F0F0F0] outline-none transition-colors focus:border-[#00E5FF]"
              />
            </div>
            <p className="mt-2 text-[12px] text-[#5A5E66]">
              Only trade with capital you can afford to lose. This input is not stored or used for any calculations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Bottom Disclaimer */}
      <section className="w-full px-6 pb-16 lg:px-12">
        <div className="mx-auto max-w-[800px] text-center">
          <p className="text-[12px] leading-[1.5] text-[#5A5E66]">
            By continuing, you acknowledge that SignalVault is an educational signal provider, not a broker.
            We do not execute trades on your behalf. All trading decisions and their consequences are solely your responsibility.
            Trading involves significant risk of loss. Past performance is not indicative of future results.
          </p>
        </div>
      </section>
    </div>
  )
}
