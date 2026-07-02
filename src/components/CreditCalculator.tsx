import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, TrendingDown, TrendingUp } from 'lucide-react'

const SIGNAL_COSTS = {
  basic: { label: 'Basic (3 cr)', value: 3 },
  detailed: { label: 'Detailed (5 cr)', value: 5 },
  full: { label: 'Full Analysis (8 cr)', value: 8 },
}

const PACKAGES = [
  { name: 'Mini', credits: 35, price: 4.99 },
  { name: 'Starter', credits: 95, price: 9.99 },
  { name: 'Trader', credits: 175, price: 14.99 },
  { name: 'Pro', credits: 300, price: 19.99 },
]

export default function CreditCalculator() {
  const [signalsPerDay, setSignalsPerDay] = useState(3)
  const [signalType, setSignalType] = useState<'basic' | 'detailed' | 'full'>('detailed')
  const [chatMessages, setChatMessages] = useState(5)
  const [selectedPackage, setSelectedPackage] = useState(1) // Starter

  const signalCost = SIGNAL_COSTS[signalType].value
  const dailyBurn = signalsPerDay * signalCost + chatMessages
  const totalCredits = PACKAGES[selectedPackage].credits
  const daysLast = dailyBurn > 0 ? (totalCredits / dailyBurn).toFixed(1) : '∞'
  const weeklyBurn = dailyBurn * 7
  const weeklyPackages = weeklyBurn / totalCredits

  // Progress for circular indicator
  const progress = Math.min(100, (dailyBurn / 50) * 100)

  return (
    <div className="rounded-[24px] border border-[#222222] bg-[#111111] p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00E5FF]/10">
          <Calculator size={20} className="text-[#00E5FF]" />
        </div>
        <div>
          <h3 className="text-[20px] font-semibold text-[#F0F0F0]">Credit Calculator</h3>
          <p className="text-[13px] text-[#5A5E66]">How long will your credits last?</p>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-5">
        {/* Signals per day */}
        <div>
          <label className="mb-2 flex items-center justify-between text-[14px] text-[#8A8F98]">
            <span>Signals per day</span>
            <span className="text-[#F0F0F0]">{signalsPerDay}</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={signalsPerDay}
            onChange={(e) => setSignalsPerDay(Number(e.target.value))}
            className="w-full accent-[#00E5FF]"
          />
          <div className="mt-1 flex justify-between text-[11px] text-[#5A5E66]">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        {/* Signal type */}
        <div>
          <label className="mb-2 block text-[14px] text-[#8A8F98]">Signal detail level</label>
          <div className="flex gap-2">
            {Object.entries(SIGNAL_COSTS).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setSignalType(key as 'basic' | 'detailed' | 'full')}
                className={`flex-1 rounded-lg px-3 py-2 text-[12px] font-medium transition-all ${
                  signalType === key
                    ? 'bg-[#00E5FF]/10 text-[#00E5FF] ring-1 ring-[#00E5FF]/30'
                    : 'bg-[#1A1A1A] text-[#5A5E66] hover:text-[#8A8F98]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat messages */}
        <div>
          <label className="mb-2 flex items-center justify-between text-[14px] text-[#8A8F98]">
            <span>Chat messages per day</span>
            <span className="text-[#F0F0F0]">{chatMessages}</span>
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={chatMessages}
            onChange={(e) => setChatMessages(Number(e.target.value))}
            className="w-full accent-[#00E5FF]"
          />
        </div>

        {/* Package selection */}
        <div>
          <label className="mb-2 block text-[14px] text-[#8A8F98]">Select package</label>
          <div className="grid grid-cols-2 gap-2">
            {PACKAGES.map((pkg, i) => (
              <button
                key={pkg.name}
                onClick={() => setSelectedPackage(i)}
                className={`rounded-lg px-3 py-2 text-left text-[13px] transition-all ${
                  selectedPackage === i
                    ? 'bg-[#00E5FF]/10 text-[#00E5FF] ring-1 ring-[#00E5FF]/30'
                    : 'bg-[#1A1A1A] text-[#8A8F98] hover:text-[#F0F0F0]'
                }`}
              >
                <div className="font-semibold">{pkg.name}</div>
                <div className="text-[11px] opacity-70">£{pkg.price} • {pkg.credits}cr</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <motion.div
        className="mt-6 rounded-xl bg-[#1A1A1A] p-5"
        key={`${signalsPerDay}-${signalType}-${chatMessages}-${selectedPackage}`}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[12px] text-[#5A5E66]">Daily burn rate</p>
            <p className="text-[20px] font-bold text-[#F0F0F0]">{dailyBurn} credits/day</p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-[#5A5E66]">Package lasts</p>
            <p className="text-[20px] font-bold text-[#00F0A0]">{daysLast} days</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-2 overflow-hidden rounded-full bg-[#222222]">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: progress > 80
                  ? 'linear-gradient(90deg, #FF3366, #FFD700)'
                  : 'linear-gradient(90deg, #00E5FF, #00F0A0)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className="mt-1 text-[11px] text-[#5A5E66]">
            {progress > 80 ? 'High usage — consider Pro pack' : 'Sustainable usage'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-[13px]">
          {weeklyPackages > 1 ? (
            <>
              <TrendingUp size={14} className="text-[#FF3366]" />
              <span className="text-[#FF3366]">
                You'll need {Math.ceil(weeklyPackages)} packages per week
              </span>
            </>
          ) : (
            <>
              <TrendingDown size={14} className="text-[#00F0A0]" />
              <span className="text-[#00F0A0]">
                One package lasts {(Number(daysLast) / 7).toFixed(1)} weeks
              </span>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
