import Hero from '@/sections/Hero'
import TrustBar from '@/sections/TrustBar'
import HowItWorks from '@/sections/HowItWorks'
import LiveSignalsPreview from '@/sections/LiveSignalsPreview'
import PerformanceProof from '@/sections/PerformanceProof'
import WhySignalVault from '@/sections/WhySignalVault'
import Testimonials from '@/sections/Testimonials'
import PricingTeaser from '@/sections/PricingTeaser'
import FinalCTA from '@/sections/FinalCTA'

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <HowItWorks />
      <LiveSignalsPreview />
      <PerformanceProof />
      <WhySignalVault />
      <Testimonials />
      <PricingTeaser />
      <FinalCTA />
    </>
  )
}
