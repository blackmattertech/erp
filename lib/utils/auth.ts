import { supabase } from '@/lib/supabase/client'

/**
 * Verifies that a session is established and available
 * @param maxAttempts Maximum number of attempts to verify session
 * @param delayMs Delay between attempts in milliseconds
 * @returns Promise that resolves to true if session is verified, false otherwise
 */
export async function verifySession(
  maxAttempts: number = 3,
  delayMs: number = 100
): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (session && !error) {
        return true
      }
      
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    } catch (error) {
      console.error(`Error verifying session (attempt ${attempt + 1}):`, error)
    }
  }
  
  return false
}

/**
 * Waits for auth state change event
 * @param timeoutMs Maximum time to wait in milliseconds
 * @returns Promise that resolves when auth state changes or times out
 */
export function waitForAuthStateChange(timeoutMs: number = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(false)
    }, timeoutMs)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        clearTimeout(timeout)
        subscription.unsubscribe()
        resolve(true)
      }
    })
  })
}

/**
 * Gets user profile with retry logic
 * @param userId User ID to fetch profile for
 * @param maxAttempts Maximum number of attempts
 * @returns Promise that resolves to profile data or null
 */
export async function getUserProfile(
  userId: string,
  maxAttempts: number = 3
): Promise<any> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profile && !error) {
        return profile
      }

      if (error && attempt < maxAttempts - 1) {
        console.log(`Profile fetch failed, retrying... (attempt ${attempt + 1}/${maxAttempts})`)
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error(`Error fetching profile (attempt ${attempt + 1}):`, error)
    }
  }

  return null
}

/**
 * Determines redirect path based on user role
 * @param role User role
 * @returns Redirect path string
 */
export function getRedirectPathByRole(role: string | null | undefined): string {
  if (!role) {
    return '/client/dashboard'
  }

  switch (role) {
    case 'super_admin':
    case 'project_manager':
      return '/dashboard'
    case 'sales_referrer':
      return '/referrer/dashboard'
    case 'client':
      return '/client/dashboard'
    case 'freelancer':
      return '/freelancer/dashboard'
    default:
      return '/client/dashboard'
  }
}

