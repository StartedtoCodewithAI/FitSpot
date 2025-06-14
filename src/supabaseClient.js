import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xccgvgnpzqsfkgakymma.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjY2d2Z25wenFzZmtnYWt5bW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MjQ3MjgsImV4cCI6MjA2NTUwMDcyOH0.mIGcwNDxaJ1Uz2v20onwRruC9YHx9_SutrgVXa3hrMc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
