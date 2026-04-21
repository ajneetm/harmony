import { createClient } from 'npm:@supabase/supabase-js'
import postgres from 'npm:postgres'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*' } })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const dbUrl       = Deno.env.get('SUPABASE_DB_URL')!

  // Delete ghost user directly via SQL
  const sql = postgres(dbUrl, { ssl: 'require' })
  await sql`DELETE FROM auth.users WHERE email = 'a.hajali@ajnee.com'`
  await sql.end()

  // Recreate via admin API
  const admin = createClient(supabaseUrl, serviceKey)
  const { data, error } = await admin.auth.admin.createUser({
    email: 'a.hajali@ajnee.com',
    password: 'ab123456789',
    email_confirm: true,
    user_metadata: { full_name: 'Admin' },
  })

  return new Response(
    JSON.stringify({ success: !error, user: data?.user?.email, error: error?.message }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
