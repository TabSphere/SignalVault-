import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const stats = [
  { value: '12,400+', label: 'Active Traders', color: 'text-[#F0F0F0]' },
  { value: '156,000+', label: 'Signals Delivered', color: 'text-[#00E5FF]' },
  { value: '50+', label: 'Markets Analyzed', color: 'text-[#00F0A0]' },
  { value: '24/7', label: 'AI Monitoring', color: 'text-[#FFD700]' },
  { value: '< 2s', label: 'Signal Delivery', color: 'text-[#00E5FF]' },
  { value: '3', label: 'Plan Tiers', color: 'text-[#F0F0F0]' },
]

export default function TrustBar() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current, {
        opacity: 0,
        duration: 0.4,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const statItems = [...stats, ...stats]

  return (
    <section
      ref={sectionRef}
      className="w-full overflow-hidden border-y border-[#222222] bg-[#111111] py-6"
    >
      <div className="group relative">
        <div className="animate-scroll-left flex w-max whitespace-nowrap hover:[animation-play-state:paused]">
          {statItems.map((stat, index) => (
            <div key={index} className="flex items-center">
              <div className="flex items-center gap-3 px-8">
                <span className={`font-mono text-[clamp(28px,3vw,40px)] font-medium leading-none tracking-[-0.02em] ${stat.color}`}>
                  {stat.value}
                </span>
                <span className="text-[12px] font-medium tracking-wide text-[#5A5E66]">
                  {stat.label}
                </span>
              </div>
              <div className="text-[8px] text-[#5A5E66] opacity-30">
                ◆
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
