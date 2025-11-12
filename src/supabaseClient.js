import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,        // ✅ Guarda la sesión en localStorage
    autoRefreshToken: true,       // ✅ Refresca el token automáticamente
    detectSessionInUrl: true,     // ✅ Detecta tokens en la URL (para magic links, OAuth)
    flowType: 'pkce',             // ✅ Más seguro (PKCE flow)
    storage: window.localStorage, // ✅ Usa localStorage del navegador
    storageKey: 'supabase.auth.token' // Nombre de la clave en localStorage
  },
  global: {
    headers: {
      'x-application-name': 'tu-app-nombre' // Opcional: identifica tu app
    }
  }
})
