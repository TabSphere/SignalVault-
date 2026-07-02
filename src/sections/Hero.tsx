import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import gsap from 'gsap'

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const line1Ref = useRef<HTMLDivElement>(null)
  const line2Ref = useRef<HTMLDivElement>(null)
  const line3Ref = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const trustRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } })

      tl.to(bgRef.current, { opacity: 0.3, duration: 1.5 })
        .from(badgeRef.current, { y: 20, opacity: 0, duration: 0.6 }, 0.3)
        .from(line1Ref.current, { y: 40, opacity: 0, duration: 0.7 }, 0.45)
        .from(line2Ref.current, { y: 40, opacity: 0, duration: 0.7 }, 0.55)
        .from(line3Ref.current, { y: 40, opacity: 0, duration: 0.7 }, 0.65)
        .from(subRef.current, { y: 30, opacity: 0, duration: 0.6 }, 0.85)
        .from(ctaRef.current, { y: 20, opacity: 0, duration: 0.5 }, 1.0)
        .to(trustRef.current, { opacity: 1, duration: 0.5 }, 1.2)
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (bgRef.current) {
        const scrollY = window.scrollY
        bgRef.current.style.transform = `translateY(${scrollY * 0.05}px)`
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 z-0 opacity-0"
      >
        <img
          src="/hero-chart-bg.jpg"
          alt=""
          className="h-full w-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505] opacity-60" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 pb-16 pt-24 lg:px-12">
        {/* Label Badge */}
        <div
          ref={badgeRef}
          className="mb-6 inline-flex items-center rounded-full border border-[rgba(0,229,255,0.3)] px-4 py-1.5"
        >
          <span className="text-[12px] font-medium uppercase tracking-[0.1em] text-[#00E5FF]">
            AI-Powered Trading Signals
          </span>
        </div>

        {/* Headline */}
        <h1 className="mb-6 max-w-[800px]">
          <div ref={line1Ref} className="text-[clamp(48px,6vw,80px)] font-extrabold leading-[1] tracking-[-0.04em] text-[#F0F0F0]">
            AI-Powered
          </div>
          <div ref={line2Ref} className="text-[clamp(48px,6vw,80px)] font-extrabold leading-[1] tracking-[-0.04em] text-[#F0F0F0]">
            Trading
          </div>
          <div ref={line3Ref} className="text-[clamp(48px,6vw,80px)] font-extrabold leading-[1] tracking-[-0.04em] text-[#00E5FF]"
            style={{ textShadow: '0 0 40px rgba(0,229,255,0.3)' }}
          >
            Signals
          </div>
        </h1>

        {/* Subheadline */}
        <p
          ref={subRef}
          className="mb-8 max-w-[560px] text-[18px] font-normal leading-[1.6] text-[#8A8F98]"
        >
          Get precision trading signals delivered daily. You decide when and how to trade.
        </p>

        {/* CTA Group */}
        <div ref={ctaRef} className="mb-12 flex flex-wrap gap-4">
          <Link
            to="/start"
            className="inline-flex items-center gap-2 rounded-[6px] bg-gradient-to-r from-[#00E5FF] to-[#00F0A0] px-7 py-3.5 text-[15px] font-semibold text-[#050505] shadow-[0_0_20px_rgba(0,229,255,0.2)] transition-all duration-200 hover:shadow-[0_0_30px_rgba(0,229,255,0.35)] active:scale-[0.97]"
          >
            Get Your First Signal
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/performance"
            className="inline-flex items-center rounded-[6px] border border-[#333333] bg-transparent px-7 py-3.5 text-[15px] font-medium text-[#F0F0F0] transition-all duration-200 hover:border-[#00E5FF] hover:bg-[#1A1A1A] active:scale-[0.97]"
          >
            View Performance
          </Link>
        </div>

        {/* Trust Micro-Bar */}
        <div ref={trustRef} className="flex flex-wrap items-center gap-6 opacity-0 md:gap-0">
          <div className="flex items-center gap-6 md:pr-10">
            <div>
              <div className="font-mono text-[13px] text-[#F0F0F0]">Join 12,400+ traders</div>
              <div className="text-[12px] font-medium tracking-wide text-[#5A5E66]">Trust our signals</div>
            </div>
          </div>
          <div className="hidden h-8 w-px bg-[#222222] md:block" />
          <div className="flex items-center gap-6 md:px-10">
            <div>
              <div className="font-mono text-[13px] text-[#F0F0F0]">Daily AI-analyzed signals</div>
              <div className="text-[12px] font-medium tracking-wide text-[#5A5E66]">Clear entry, stop & target prices</div>
            </div>
          </div>
          <div className="hidden h-8 w-px bg-[#222222] md:block" />
          <div className="flex items-center gap-6 md:pl-10">
            <div>
              <div className="font-mono text-[13px] text-[#F0F0F0]">Trade on your own platform</div>
              <div className="text-[12px] font-medium tracking-wide text-[#5A5E66]">We provide the signals</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
