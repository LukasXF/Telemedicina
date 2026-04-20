import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ysgmgyexuqnyzxcvjpub.supabase.co'
const supabaseAnonKey = 'sb_publishable_gDDExxIH8riLbpei2SNvVg_KwAka1Re'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)