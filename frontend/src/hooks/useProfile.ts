import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type UserPlan = 'standard' | 'pro' | 'vip'

export interface UserProfile {
  id: string
  plan: UserPlan
  email?: string
  full_name?: string | null
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchProfile() {
      setLoading(true)
      setError(null)

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setProfile(null)
          setLoading(false)
          return
        }

        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('id, plan, email, full_name')
          .eq('id', user.id)
          .single()

        if (cancelled) return

        if (fetchError) {
          setError(fetchError.message)
          setProfile(null)
        } else {
          setProfile(data as UserProfile)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchProfile()

    return () => {
      cancelled = true
    }
  }, [])

  return { profile, loading, error }
}
