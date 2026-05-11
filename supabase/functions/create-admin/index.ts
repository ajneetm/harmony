import { createClient } from 'npm:@supabase/supabase-js'
import postgres from 'npm:postgres'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*' } })

  // Require a secret setup token — set SETUP_SECRET in Supabase secrets
  const setupSecret = Deno.env.get('SETUP_SECRET') ?? ''
  const authHeader  = req.headers.get('Authorization') ?? ''
  if (!setupSecret || authHeader !== `Bearer ${setupSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl   = Deno.env.get('SUPABASE_URL')!
  const serviceKey    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const dbUrl         = Deno.env.get('SUPABASE_DB_URL')!
  const adminEmail    = Deno.env.get('ADMIN_EMAIL')    ?? 'a.hajali@ajnee.com'
  const adminPassword = Deno.env.get('ADMIN_PASSWORD') ?? ''

  if (!adminPassword) {
    return new Response(JSON.stringify({ error: 'ADMIN_PASSWORD env var not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const admin = createClient(supabaseUrl, serviceKey)
  const sql   = postgres(dbUrl, { ssl: 'require' })
  const rows  = await sql`
    SELECT id, email, email_confirmed_at IS NOT NULL as confirmed
    FROM auth.users WHERE email = ${adminEmail}
  `
  await sql.end()

  if (rows.length > 0) {
    const u = rows[0]
    const { error } = await admin.auth.admin.updateUserById(u.id, {
      password: adminPassword,
      email_confirm: true,
    })
    return new Response(
      JSON.stringify({ action: 'updated', id: u.id, error: error?.message }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: adminEmail, password: adminPassword, email_confirm: true,
    user_metadata: { full_name: 'Admin' },
  })
  return new Response(
    JSON.stringify({ action: 'created', user: data?.user?.email, error: error?.message }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
