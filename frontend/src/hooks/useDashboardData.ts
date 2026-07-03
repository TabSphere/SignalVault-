import { useEffect, useMemo, useState } from 'react'

import { supabase } from '@/lib/supabase'

// ── Database row shapes (public schema) ─────────────────────
type DbSignal = {
  id: string
  asset: string
  asset_name: string
  direction: 'buy' | 'sell'
  entry_price: number
  stop_loss: number
  take_profit: number
  confidence: number
  status: 'active' | 'completed' | 'expired'
  plan_required: 'standard' | 'pro' | 'vip'
  result: 'win' | 'loss' | 'pending' | null
  exit_price: number | null
  pips: number | null
  created_at: string
}

type DbTradeJournal = {
  id: string
  user_id: string
  asset: string
  direction: 'buy' | 'sell'
  entry_price: number
  exit_price: number | null
  stop_loss: number | null
  take_profit: number | null
  pnl: number | null
  status: 'open' | 'closed' | 'cancelled'
  opened_at: string
  closed_at: string | null
}

type DbProfile = {
  id: string
  plan: 'standard' | 'pro' | 'vip'
  email: string
  full_name: string | null
}

type DbAiCall = {
  id: string
  user_id: string
  signal_id: string
  call_status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
  recording_url: string | null
  transcript: string | null
  duration_seconds: number | null
  created_at: string
}

// ── UI shapes (shared with Dashboard.tsx) ─────────────────────
export type SignalStatus = 'CLOSED' | 'LIVE' | 'UPCOMING'
export type Direction = 'BUY' | 'SELL'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type SlotStatus = 'DELIVERED' | 'ACTIVE' | 'PENDING'

export interface Signal {
  id: string
  asset: string
  status: SignalStatus
  direction?: Direction
  entry?: number
  stop?: number
  target?: number
  confidence?: number
  risk?: RiskLevel
  countdown?: string
  result?: string
  resultType?: 'WIN' | 'LOSS'
  pips?: number
  pipsLabel?: string
  time: string
  createdAt: string
  currentPrice?: number
  currentPips?: number
}

export interface Position {
  id?: string
  asset: string
  direction: Direction
  entry: number
  current: number
  pnl: number
  stop: number
  target: number
  time: string
}

export interface JournalEntry {
  id?: string
  asset: string
  direction: Direction
  date: string
  entry: number
  exit: number
  result: 'WIN' | 'LOSS'
  pnl: number
}

export interface VoiceCall {
  id: string
  asset: string
  status: string
  mode: 'call' | 'tts'
  recording_url?: string
  transcript?: string
  created_at: string
}

export interface DashboardProfile {
  plan: 'standard' | 'pro' | 'vip'
}

export interface UseDashboardDataResult {
  signals: Signal[]
  positions: Position[]
  journalEntries: JournalEntry[]
  profile: DashboardProfile
  calls: VoiceCall[]
  timelineSlots: { time: string; asset: string; status: SlotStatus }[]
  loading: boolean
  error: string | null
}

// ── Mapping helpers ───────────────────────────────────────────
function toSignal(db: DbSignal): Signal {
  const status: SignalStatus = db.status === 'active' ? 'LIVE' : 'CLOSED'
  const direction: Direction = db.direction.toUpperCase() as Direction
  const resultType: 'WIN' | 'LOSS' | undefined =
    db.result === 'win' ? 'WIN' : db.result === 'loss' ? 'LOSS' : undefined

  return {
    id: db.id,
    asset: db.asset,
    status,
    direction,
    entry: db.entry_price,
    stop: db.stop_loss,
    target: db.take_profit,
    confidence: db.confidence,
    risk: 'MEDIUM',
    countdown: status === 'LIVE' ? 'LIVE NOW' : undefined,
    result: db.result || undefined,
    resultType,
    pips: db.pips ?? undefined,
    pipsLabel: db.pips !== null ? `${db.pips >= 0 ? '+' : ''}${db.pips} pips` : undefined,
    time: new Date(db.created_at).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    createdAt: db.created_at,
  }
}

function toPosition(db: DbTradeJournal): Position {
  return {
    id: db.id,
    asset: db.asset,
    direction: db.direction.toUpperCase() as Direction,
    entry: db.entry_price,
    current: db.exit_price ?? db.entry_price,
    pnl: db.pnl ?? 0,
    stop: db.stop_loss ?? 0,
    target: db.take_profit ?? 0,
    time: new Date(db.opened_at).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }
}

function toJournalEntry(db: DbTradeJournal): JournalEntry {
  const pnl = db.pnl ?? 0
  const date = new Date(db.closed_at || db.opened_at).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  return {
    id: db.id,
    asset: db.asset,
    direction: db.direction.toUpperCase() as Direction,
    date,
    entry: db.entry_price,
    exit: db.exit_price ?? db.entry_price,
    result: pnl >= 0 ? 'WIN' : 'LOSS',
    pnl,
  }
}

function toVoiceCall(db: DbAiCall, signalMap: Map<string, DbSignal>): VoiceCall {
  const signal = signalMap.get(db.signal_id)
  return {
    id: db.id,
    asset: signal?.asset || 'Unknown',
    status: db.call_status,
    mode: 'tts',
    recording_url: db.recording_url || undefined,
    transcript: db.transcript || undefined,
    created_at: db.created_at,
  }
}

function buildTimelineSlots(
  signals: Signal[]
): { time: string; asset: string; status: SlotStatus }[] {
  return signals.slice(0, 5).map((s, i) => ({
    time: s.time,
    asset: s.asset,
    status: i === 0 ? 'DELIVERED' : i === 1 ? 'ACTIVE' : 'PENDING',
  }))
}

// ── Hook ──────────────────────────────────────────────────────
export function useDashboardData(): UseDashboardDataResult {
  const [dbSignals, setDbSignals] = useState<DbSignal[]>([])
  const [dbJournal, setDbJournal] = useState<DbTradeJournal[]>([])
  const [dbProfile, setDbProfile] = useState<DbProfile | null>(null)
  const [dbCalls, setDbCalls] = useState<DbAiCall[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        const user = userData.user

        const { data: signalsData, error: signalsError } = await supabase
          .from('signals')
          .select('*')
          .order('created_at', { ascending: false })
          .returns<DbSignal[]>()
        if (signalsError) throw signalsError

        let fetchedJournal: DbTradeJournal[] = []
        let fetchedProfile: DbProfile | null = null
        let fetchedCalls: DbAiCall[] = []

        if (user) {
          const { data: journalData, error: journalError } = await supabase
            .from('trade_journal')
            .select('*')
            .eq('user_id', user.id)
            .returns<DbTradeJournal[]>()
          if (journalError) throw journalError
          fetchedJournal = journalData || []

          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          if (profileError) throw profileError
          fetchedProfile = profileData as DbProfile

          const { data: callsData, error: callsError } = await supabase
            .from('ai_calls')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .returns<DbAiCall[]>()
          if (callsError) throw callsError
          fetchedCalls = callsData || []
        }

        if (cancelled) return

        setDbSignals(signalsData || [])
        setDbJournal(fetchedJournal)
        setDbProfile(fetchedProfile)
        setDbCalls(fetchedCalls)
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Failed to load dashboard data')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  const signals = useMemo(() => dbSignals.map(toSignal), [dbSignals])

  const signalMap = useMemo(() => {
    const map = new Map<string, DbSignal>()
    dbSignals.forEach((s) => map.set(s.id, s))
    return map
  }, [dbSignals])

  const positions = useMemo(
    () => dbJournal.filter((j) => j.status === 'open').map(toPosition),
    [dbJournal]
  )

  const journalEntries = useMemo(
    () => dbJournal.filter((j) => j.status === 'closed').map(toJournalEntry),
    [dbJournal]
  )

  const profile = useMemo<DashboardProfile>(
    () => ({ plan: dbProfile?.plan || 'standard' }),
    [dbProfile]
  )

  const calls = useMemo(
    () => dbCalls.map((c) => toVoiceCall(c, signalMap)),
    [dbCalls, signalMap]
  )

  const timelineSlots = useMemo(() => buildTimelineSlots(signals), [signals])

  return { signals, positions, journalEntries, profile, calls, timelineSlots, loading, error }
}
