import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Este es el cliente solicitado por el usuario. 
// Usamos strings vacíos como default para evitar que falle el BUILD al importar, 
// pero fallará en RUNTIME si no están las variables, lo cual es el comportamiento deseado.
export const supabase = createSupabaseClient(supabaseUrl, supabaseKey)
