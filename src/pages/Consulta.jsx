import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import VideoCall from '../components/VideoCall'

export default function Consulta() {
  const navigate = useNavigate()

  const [chamadaAtiva, setChamadaAtiva] = useState(false)
  const [nomeUsuario, setNomeUsuario] = useState('')
  const [carregando, setCarregando] = useState(true)

  // Mantemos a sala atual do Daily por enquanto para não quebrar a integração.
  // Depois podemos trocar para uma sala com nome do EloSocial.
  const URL_SALA = 'https://telesaude.daily.co/Sala-atendimento'

  useEffect(() => {
    let canal

    const configurarAtendimento = async () => {
      setCarregando(true)

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        navigate('/')
        return
      }

      const { data: perfil } = await supabase
        .from('perfis')
        .select('nome')
        .eq('id', user.id)
        .maybeSingle()

      if (perfil?.nome) {
        setNomeUsuario(perfil.nome)
      }

      // Correção importante:
      // antes a tela só esperava o realtime.
      // agora ela também verifica o status atual da solicitação quando a página abre.
      const { data: solicitacaoAtual, error: erroSolicitacao } = await supabase
        .from('triagens')
        .select('id, status')
        .eq('user_id', user.id)
        .in('status', ['pendente', 'em_atendimento'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (erroSolicitacao) {
        alert('Erro ao buscar sua solicitação: ' + erroSolicitacao.message)
        setCarregando(false)
        return
      }

      if (!solicitacaoAtual) {
        navigate('/triagem')
        return
      }

      if (solicitacaoAtual.status === 'em_atendimento') {
        setChamadaAtiva(true)
      }

      canal = supabase
        .channel(`mudanca_status_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'triagens',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.new.status === 'em_atendimento') {
              setChamadaAtiva(true)
            }

            if (payload.new.status === 'concluido') {
              setChamadaAtiva(false)
            }
          }
        )
        .subscribe()

      setCarregando(false)
    }

    configurarAtendimento()

    return () => {
      if (canal) {
        supabase.removeChannel(canal)
      }
    }
  }, [navigate])

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#0d1f1a] flex items-center justify-center px-6 py-10 font-sans">
        <div className="text-center animate-fadeUp">
          <div className="w-12 h-12 border-2 border-[#2a6b52] border-t-[#4ab882] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5a8a72] text-sm">Carregando sua solicitação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d1f1a] flex flex-col items-center justify-center px-6 py-10 font-sans">
      {!chamadaAtiva ? (
        <div className="w-full max-w-md text-center animate-fadeUp">
          <div className="mb-8 relative inline-block">
            <div className="absolute inset-0 rounded-full bg-[#4ab882] opacity-20 animate-ping"></div>
            <div className="relative w-20 h-20 rounded-full border-2 border-[#2a6b52] bg-[#1a3d30] flex items-center justify-center">
              <svg className="w-10 h-10 text-[#4ab882]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <h1 className="text-[#e8f0ec] text-2xl font-semibold mb-2" style={{fontFamily:'Georgia, serif'}}>
            Olá, {nomeUsuario || 'Cidadão'}
          </h1>

          <p className="text-[#5a8a72] text-sm mb-8 leading-relaxed">
            Sua solicitação de acolhimento social foi enviada. Aguarde nesta tela; um assistente social iniciará o atendimento em instantes.
          </p>

          <div className="bg-[#111f1a] border border-[#1e3b2e] rounded-2xl p-5 text-left mb-6">
            <p className="text-[#d4ebe0] text-sm font-medium mb-2">
              Enquanto aguarda
            </p>
            <p className="text-[#5a8a72] text-sm leading-relaxed">
              Mantenha esta página aberta. Quando o atendimento começar, a chamada será liberada automaticamente.
            </p>
          </div>

          <button
            onClick={() => navigate('/triagem')}
            className="w-full border border-[#2a6b52] text-[#4ab882] py-3.5 rounded-xl text-sm font-medium hover:bg-[#1a3d30] transition-all"
          >
            Voltar para o acolhimento
          </button>
        </div>
      ) : (
        <div className="w-full max-w-4xl h-[80vh] flex flex-col animate-fadeUp">
          <div className="mb-4 text-center">
            <h1 className="text-[#e8f0ec] text-xl font-semibold" style={{fontFamily:'Georgia, serif'}}>
              Atendimento Social em andamento
            </h1>
            <p className="text-[#5a8a72] text-sm mt-1">
              Você está conectado com a equipe de assistência social.
            </p>
          </div>

          <div className="flex-1 w-full h-full relative">
            <VideoCall url={URL_SALA} userName={nomeUsuario || 'Cidadão'} />
          </div>

          <button
            onClick={() => setChamadaAtiva(false)}
            className="mt-6 text-[#5a8a72] hover:text-white underline text-sm"
          >
            Voltar para sala de espera
          </button>
        </div>
      )}
    </div>
  )
}