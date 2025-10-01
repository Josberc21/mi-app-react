import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mgdjaxmivlgdcvgchdfe.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZGpheG1pdmxnZGN2Z2NoZGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTIzNzksImV4cCI6MjA3NDg2ODM3OX0.5VQ4m5DrmOnShltkwU1XH_TPh0_hBi7pbfLPlUc-U5U'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)