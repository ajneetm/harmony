import { createClient } from 'npm:@supabase/supabase-js'
import postgres from 'npm:postgres'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*' } })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const dbUrl       = Deno.env.get('SUPABASE_DB_URL')!
  const admin       = createClient(supabaseUrl, serviceKey)

  const email    = 'a.hajali@ajnee.com'
  const password = 'ab123456789'

  // Check current state via SQL
  const sql = postgres(dbUrl, { ssl: 'require' })
  const rows = await sql`
    SELECT id, email, email_confirmed_at IS NOT NULL as confirmed
    FROM auth.users WHERE email = ${email}
  `
  await sql.end()

  if (rows.length > 0) {
    const u = rows[0]
    // Update password and confirm
    const { error } = await admin.auth.admin.updateUserById(u.id, {
      password,
      email_confirm: true,
    })
    return new Response(
      JSON.stringify({ action: 'updated', id: u.id, was_confirmed: u.confirmed, error: error?.message }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { data, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { full_name: 'Admin' },
  })
  return new Response(
    JSON.stringify({ action: 'created', user: data?.user?.email, error: error?.message }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
