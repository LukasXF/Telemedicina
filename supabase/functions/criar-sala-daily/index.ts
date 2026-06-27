import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado.' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { casoId } = await req.json()

    if (!casoId) {
      return new Response(
        JSON.stringify({ error: 'casoId é obrigatório.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const dailyApiKey = Deno.env.get('DAILY_API_KEY')

    if (!supabaseUrl || !serviceRoleKey || !dailyApiKey) {
      return new Response(
        JSON.stringify({ error: 'Secrets do servidor não configurados.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
    })

    const token = authHeader.replace('Bearer ', '')

    const { data: usuario, error: erroUsuario } = await supabaseAdmin.auth.getUser(token)

    if (erroUsuario || !usuario?.user) {
      return new Response(
        JSON.stringify({ error: 'Sessão inválida.' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const user = usuario.user

    const { data: caso, error: erroCaso } = await supabaseAdmin
      .from('triagens')
      .select('id, user_id, daily_room_url, daily_room_name, daily_room_expires_at')
      .eq('id', casoId)
      .maybeSingle()

    if (erroCaso) {
      return new Response(
        JSON.stringify({ error: erroCaso.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!caso) {
      return new Response(
        JSON.stringify({ error: 'Caso não encontrado.' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { data: perfil } = await supabaseAdmin
      .from('perfis')
      .select('tipo')
      .eq('id', user.id)
      .maybeSingle()

    const usuarioEDonoDoCaso = caso.user_id === user.id
    const usuarioEEquipe =
      perfil?.tipo === 'medico' ||
      perfil?.tipo === 'assistente' ||
      perfil?.tipo === 'assistente_social' ||
      user.email === 'assistente@elosocial.com' ||
      user.email === 'medico@telesaude.com'

    if (!usuarioEDonoDoCaso && !usuarioEEquipe) {
      return new Response(
        JSON.stringify({ error: 'Você não tem permissão para acessar este caso.' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const salaAindaValida =
      caso.daily_room_url &&
      (!caso.daily_room_expires_at || new Date(caso.daily_room_expires_at) > new Date())

    if (salaAindaValida) {
      return new Response(
        JSON.stringify({
          daily_room_url: caso.daily_room_url,
          daily_room_name: caso.daily_room_name,
          daily_room_expires_at: caso.daily_room_expires_at,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const agora = new Date()
    const expiraEm = new Date(agora.getTime() + 1000 * 60 * 60 * 24 * 7)
    const expiraEmUnix = Math.floor(expiraEm.getTime() / 1000)

    const respostaDaily = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${dailyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        privacy: 'public',
        properties: {
          exp: expiraEmUnix,
          eject_at_room_exp: true,
          enable_chat: true,
        },
      }),
    })

    const salaDaily = await respostaDaily.json()

    if (!respostaDaily.ok) {
      return new Response(
        JSON.stringify({
          error: 'Erro ao criar sala Daily.',
          daily: salaDaily,
        }),
        {
          status: respostaDaily.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { error: erroAtualizacao } = await supabaseAdmin
      .from('triagens')
      .update({
        daily_room_url: salaDaily.url,
        daily_room_name: salaDaily.name,
        daily_room_created_at: agora.toISOString(),
        daily_room_expires_at: expiraEm.toISOString(),
      })
      .eq('id', caso.id)

    if (erroAtualizacao) {
      return new Response(
        JSON.stringify({ error: erroAtualizacao.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({
        daily_room_url: salaDaily.url,
        daily_room_name: salaDaily.name,
        daily_room_expires_at: expiraEm.toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error?.message || 'Erro inesperado ao criar sala Daily.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})