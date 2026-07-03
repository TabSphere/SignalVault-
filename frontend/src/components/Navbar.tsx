import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Menu, X, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProfile, type UserPlan } from '@/hooks/useProfile'
import { Skeleton } from '@/components/ui/skeleton'

const navLinks = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Signals', path: '/signals' },
  { label: 'Performance', path: '/performance' },
  { label: 'Credits', path: '/credits' },
  { label: 'Referrals', path: '/referrals' },
]

function PlanBadge() {
  const { profile, loading } = useProfile()

  if (loading) {
    return <Skeleton className="h-6 w-14 rounded-full" />
  }

  if (!profile) return null

  const planColors: Record<UserPlan, { bg: string; text: string; border: string }> = {
    standard: { bg: 'bg-[#5A5E66]/10', text: 'text-[#8A8F98]', border: 'border-[#5A5E66]/20' },
    pro: { bg: 'bg-[#00E5FF]/10', text: 'text-[#00E5FF]', border: 'border-[#00E5FF]/20' },
    vip: { bg: 'bg-[#FFD700]/10', text: 'text-[#FFD700]', border: 'border-[#FFD700]/20' },
  }

  const plan = profile.plan
  const colors = planColors[plan] || planColors.standard
  const label = plan.charAt(0).toUpperCase() + plan.slice(1)

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {label}
    </span>
  )
}

function CreditBalance() {
  const [credits] = useState(5)
  const [isLow, setIsLow] = useState(false)
  const [isCritical, setIsCritical] = useState(false)

  useEffect(() => {
    setIsLow(credits > 0 && credits <= 10)
    setIsCritical(credits <= 3)
  }, [credits])

  return (
    <Link to="/credits" className="flex items-center gap-1.5">
      <motion.div
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-all ${
          isCritical
            ? 'bg-red-500/10 text-red-400'
            : isLow
            ? 'bg-amber-500/10 text-amber-400'
            : 'bg-[#1A1A1A] text-[#00E5FF]'
        }`}
        animate={
          isCritical
            ? { x: [0, -3, 3, -3, 3, 0] }
            : isLow
            ? { opacity: [1, 0.6, 1] }
            : {}
        }
        transition={
          isCritical
            ? { duration: 0.5, repeat: Infinity, repeatDelay: 2 }
            : isLow
            ? { duration: 1.5, repeat: Infinity }
            : {}
        }
      >
        <Zap size={14} className={isCritical ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-[#00E5FF]'} />
        <span>{credits}</span>
        <span className="text-[10px] opacity-60">cr</span>
      </motion.div>
    </Link>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[72px] border-b border-[#222222] bg-[rgba(5,5,5,0.8)] backdrop-blur-[20px]">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2L4 10V20C4 29.6 10.8 38.4 20 40C29.2 38.4 36 29.6 36 20V10L20 2Z" stroke="#00E5FF" strokeWidth="2" fill="none"/>
            <path d="M12 22L17 17L21 21L28 14" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span className="text-[20px] font-bold tracking-tight text-[#F0F0F0]">
            SignalVault
          </span>
        </Link>

        {/* Center Nav Links - Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-[14px] font-medium text-[#8A8F98] transition-colors duration-200 hover:text-[#F0F0F0]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right CTA - Desktop */}
        <div className="hidden items-center gap-4 md:flex">
          <PlanBadge />
          <CreditBalance />
          <Link
            to="/start"
            className="rounded-[6px] bg-gradient-to-r from-[#00E5FF] to-[#00F0A0] px-7 py-3.5 text-[15px] font-semibold text-[#050505] shadow-[0_0_20px_rgba(0,229,255,0.2)] transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
          >
            Start Trading
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="text-[#F0F0F0] md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="absolute left-0 right-0 top-[72px] z-50 border-b border-[#222222] bg-[#0A0A0A] p-6 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-[16px] font-medium text-[#8A8F98] transition-colors hover:text-[#F0F0F0]"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/start"
              className="mt-2 rounded-[6px] bg-gradient-to-r from-[#00E5FF] to-[#00F0A0] px-7 py-3.5 text-center text-[15px] font-semibold text-[#050505]"
              onClick={() => setMobileOpen(false)}
            >
              Start Trading
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
