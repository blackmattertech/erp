import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createServerSupabaseClient = () => {
  try {
    return createServerComponentClient({ cookies })
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    throw new Error('Failed to initialize Supabase client. Please check your environment variables.')
  }
}

