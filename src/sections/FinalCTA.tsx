import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function FinalCTA() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLParagraphElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const disclaimerRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(eyebrowRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "expo.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })

      gsap.from(headlineRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: 0.1,
        ease: "expo.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })

      gsap.from(subRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        delay: 0.25,
        ease: "expo.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })

      gsap.from(ctaRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        delay: 0.4,
        ease: "expo.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })

      gsap.from(disclaimerRef.current, {
        opacity: 0,
        duration: 0.5,
        delay: 0.6,
        ease: "expo.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="w-full bg-[#0A0A0A] py-24 lg:py-32"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#050505] opacity-50" />

      <div className="relative mx-auto max-w-[800px] px-6 text-center lg:px-12">
        {/* Eyebrow */}
        <p
          ref={eyebrowRef}
          className="mb-4 text-[12px] font-medium uppercase tracking-[0.1em] text-[#00E5FF]"
        >
          Start Receiving Signals Today
        </p>

        {/* Headline */}
        <h2
          ref={headlineRef}
          className="mb-4 text-[clamp(40px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.03em] text-[#F0F0F0]"
        >
          AI Signals Delivered Daily
        </h2>

        {/* Subheadline */}
        <p
          ref={subRef}
          className="mx-auto mb-8 max-w-[560px] text-[18px] leading-[1.6] text-[#8A8F98]"
        >
          Join 12,400+ traders who use SignalVault's AI-powered signals to inform their trading decisions. Choose a plan that fits your needs.
        </p>

        {/* CTA */}
        <div ref={ctaRef} className="mb-4">
          <Link
            to="/start"
            className="inline-block rounded-[6px] bg-gradient-to-r from-[#00E5FF] to-[#00F0A0] px-10 py-4.5 text-[16px] font-semibold text-[#050505] shadow-[0_0_20px_rgba(0,229,255,0.2)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_30px_rgba(0,229,255,0.35)] active:scale-[0.97]"
          >
            Start Receiving Signals
          </Link>
          <p className="mt-3 text-[12px] font-medium tracking-wide text-[#5A5E66]">
            7-day money-back guarantee. Cancel anytime.
          </p>
        </div>

        {/* Risk Disclaimer */}
        <p
          ref={disclaimerRef}
          className="mx-auto mt-8 max-w-[480px] text-[12px] leading-[1.4] text-[#5A5E66] opacity-60"
        >
          Trading involves significant risk. Past performance does not guarantee future results. Only trade with capital you can afford to lose.
        </p>
      </div>
    </section>
  )
}
