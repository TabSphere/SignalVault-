import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Zap, Gift, Share2, Copy, Check, Mail, MessageCircle, Users, TrendingUp, ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number]

const SHARE_BUTTONS = [
  { label: 'Copy', icon: Copy, action: 'copy' },
  { label: 'Email', icon: Mail, action: 'email' },
  { label: 'WhatsApp', icon: MessageCircle, action: 'whatsapp' },
  { label: 'Telegram', icon: Share2, action: 'telegram' },
]

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Share Your Link',
    description: 'Copy your unique referral link and share it with friends who trade.',
    icon: Share2,
  },
  {
    step: '2',
    title: 'They Sign Up',
    description: 'Your friend signs up using your link and gets 10 bonus credits.',
    icon: Users,
  },
  {
    step: '3',
    title: 'They Buy Credits',
    description: 'When they buy their first credit package, you earn 10% of the purchase.',
    icon: Zap,
  },
  {
    step: '4',
    title: 'You Earn Free Credits',
    description: 'Credits are added to your balance instantly. No limits on referrals!',
    icon: TrendingUp,
  },
]

export default function Referrals() {
  const [referralCode, setReferralCode] = useState('abc123')
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState({
    clicks: 47,
    signups: 12,
    purchases: 5,
    creditsEarned: 78,
  })

  const sectionRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<(HTMLDivElement | null)[]>([])

  const referralUrl = `https://signalvault.app/r/${referralCode}`

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(heroRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'expo.out',
      })

      stepsRef.current.forEach((step, i) => {
        if (!step) return
        gsap.from(step, {
          y: 40,
          opacity: 0,
          duration: 0.6,
          delay: i * 0.15,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: step,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (action: string) => {
    const text = `Join me on SignalVault — AI trading signals from £4.99! Get 10 bonus credits with my link: ${referralUrl}`

    switch (action) {
      case 'email':
        window.open(`mailto:?subject=Join SignalVault&body=${encodeURIComponent(text)}`)
        break
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
        break
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(text)}`)
        break
    }
  }

  return (
    <div ref={sectionRef} className="w-full bg-[#050505]">
      {/* Hero */}
      <section ref={heroRef} className="px-6 pb-12 pt-[96px] lg:px-12">
        <div className="mx-auto max-w-[1280px] text-center">
          <motion.div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00E5FF]/10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
          >
            <Gift size={32} className="text-[#00E5FF]" />
          </motion.div>

          <motion.h1
            className="mb-4 text-[clamp(40px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.03em] text-[#F0F0F0]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeOutExpo }}
          >
            Earn Free Credits
          </motion.h1>

          <motion.p
            className="mx-auto mb-8 max-w-[560px] text-[18px] leading-[1.6] text-[#8A8F98]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: easeOutExpo }}
          >
            Share SignalVault with traders you know. Get 10% of their first purchase as credits.
            They get 10 bonus credits too!
          </motion.p>

          {/* Referral Link */}
          <motion.div
            className="mx-auto max-w-[500px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: easeOutExpo }}
          >
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-[#222222] bg-[#111111] p-2">
              <input
                type="text"
                value={referralUrl}
                readOnly
                className="flex-1 bg-transparent px-4 py-3 text-[14px] text-[#F0F0F0] outline-none"
              />
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-[14px] font-semibold transition-all ${
                  copied
                    ? 'bg-[#00F0A0] text-[#050505]'
                    : 'bg-[#00E5FF] text-[#050505] hover:brightness-110'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* Share Buttons */}
            <div className="flex justify-center gap-3">
              {SHARE_BUTTONS.map((btn) => (
                <button
                  key={btn.action}
                  onClick={() =>
                    btn.action === 'copy' ? handleCopy() : handleShare(btn.action)
                  }
                  className="flex items-center gap-2 rounded-xl border border-[#222222] bg-[#111111] px-4 py-2.5 text-[13px] text-[#8A8F98] transition-all hover:border-[#00E5FF]/30 hover:text-[#00E5FF]"
                >
                  <btn.icon size={16} />
                  {btn.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 pb-12 lg:px-12">
        <div className="mx-auto grid max-w-[800px] grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Link Clicks', value: stats.clicks, icon: Zap },
            { label: 'Signups', value: stats.signups, icon: Users },
            { label: 'Purchases', value: stats.purchases, icon: TrendingUp },
            { label: 'Credits Earned', value: stats.creditsEarned, icon: Gift },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="rounded-2xl border border-[#222222] bg-[#111111] p-5 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <stat.icon size={20} className="mx-auto mb-2 text-[#00E5FF]" />
              <p className="text-[24px] font-bold text-[#F0F0F0]">{stat.value}</p>
              <p className="text-[12px] text-[#5A5E66]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 pb-16 lg:px-12">
        <div className="mx-auto max-w-[1000px]">
          <motion.h2
            className="mb-8 text-center text-[clamp(28px,3vw,40px)] font-bold text-[#F0F0F0]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            How It Works
          </motion.h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.step}
                ref={(el) => { stepsRef.current[i] = el }}
                className="relative rounded-2xl border border-[#222222] bg-[#111111] p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#00E5FF]/10">
                  <step.icon size={24} className="text-[#00E5FF]" />
                </div>
                <div className="absolute right-4 top-4 text-[48px] font-bold leading-none text-[#1A1A1A]">
                  {step.step}
                </div>
                <h3 className="mb-2 text-[18px] font-semibold text-[#F0F0F0]">{step.title}</h3>
                <p className="text-[13px] leading-relaxed text-[#8A8F98]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 lg:px-12">
        <motion.div
          className="mx-auto max-w-[600px] rounded-[24px] border border-[rgba(0,229,255,0.2)] bg-[#111111] p-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="mb-2 text-[24px] font-bold text-[#F0F0F0]">Start Earning Today</h3>
          <p className="mb-6 text-[14px] text-[#8A8F98]">
            No limits. The more friends you invite, the more free credits you earn.
          </p>
          <Link
            to="/credits"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00F0A0] px-6 py-3 text-[15px] font-semibold text-[#050505] transition-all hover:brightness-110"
          >
            Buy Credits
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
