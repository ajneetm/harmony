import { createClient } from 'npm:@supabase/supabase-js'

const ADMIN_EMAIL = 'a.hajali@ajnee.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    // Verify the caller is the admin
    const authHeader = req.headers.get('Authorization') ?? ''
    const userToken = authHeader.replace('Bearer ', '')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Use user token to verify identity
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: userErr } = await userClient.auth.getUser()
    if (userErr || !user) throw new Error('Unauthorized')
    if (user.email !== ADMIN_EMAIL) throw new Error('Forbidden')

    // Use service role to list all users
    const adminClient = createClient(supabaseUrl, serviceKey)
    const { data, error } = await adminClient.auth.admin.listUsers({ perPage: 1000 })
    if (error) throw error

    const users = data.users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.full_name || null,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
    }))

    return new Response(JSON.stringify({ users }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: err.message === 'Forbidden' ? 403 : 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
