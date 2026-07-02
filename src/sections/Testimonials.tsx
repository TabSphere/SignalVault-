import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const testimonials = [
  {
    avatar: '/testimonial-1.jpg',
    quote: "I started with a small account and found the signals helped me identify setups I would have missed. The clear entry and exit points make decision-making much easier.",
    name: 'Marcus T.',
    result: 'Individual results vary*',
  },
  {
    avatar: '/testimonial-2.jpg',
    quote: "The signals are incredibly clear. Entry, stop-loss, take-profit — everything is laid out. I've tried other signal services and nothing comes close to the quality here.",
    name: 'Sarah K.',
    result: 'Pro member for 8 months',
  },
  {
    avatar: '/testimonial-3.jpg',
    quote: "As someone who's traded for 15 years, I was skeptical. But the AI engine genuinely finds edges I miss. The risk scoring alone has helped me avoid several bad trades.",
    name: 'David R.',
    result: 'VIP member for 1 year',
  },
]

export default function Testimonials() {
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
          delay: i * 0.15,
          ease: "expo.out",
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        })

        const avatar = card.querySelector('.avatar-img')
        if (avatar) {
          gsap.from(avatar, {
            scale: 0.8,
            opacity: 0,
            duration: 0.4,
            delay: i * 0.15 + 0.2,
            ease: "expo.out",
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          })
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="w-full bg-[#0A0A0A] py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
        {/* Section Header */}
        <div ref={headerRef} className="mb-16 text-center">
          <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.1em] text-[#00E5FF]">
            Trader Stories
          </p>
          <h2 className="text-[clamp(32px,3.5vw,48px)] font-bold leading-[1.1] tracking-[-0.02em] text-[#F0F0F0]">
            Real Traders. Real Results.
          </h2>
        </div>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              ref={(el) => { cardsRef.current[i] = el }}
              className="group relative rounded-[24px] border border-[#222222] bg-[#111111] p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(0,229,255,0.15)] hover:shadow-card-hover"
            >
              {/* Quote Mark */}
              <div className="mb-4 text-[64px] font-serif leading-none text-[rgba(0,229,255,0.1)]">
                &ldquo;
              </div>

              {/* Quote */}
              <p className="mb-6 text-[16px] font-normal italic leading-[1.6] text-[#F0F0F0]">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Divider */}
              <div className="mb-4 h-px w-full bg-[#222222]" />

              {/* Bottom Row */}
              <div className="flex items-center gap-4">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="avatar-img h-12 w-12 rounded-full border-2 border-[#222222] object-cover"
                />
                <div>
                  <p className="text-[16px] font-semibold text-[#F0F0F0]">{t.name}</p>
                  <p className="text-[12px] font-medium tracking-wide text-[#00F0A0]">{t.result}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="mt-8 text-center text-[12px] text-[#5A5E66]">
          *Testimonials are individual experiences. Results vary. Trading involves significant risk of loss.
        </p>
      </div>
    </section>
  )
}
