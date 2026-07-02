import { useState } from 'react'
import { Link } from 'react-router'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Signals', path: '/signals' },
  { label: 'Performance', path: '/performance' },
  { label: 'Pricing', path: '/pricing' },
]

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
