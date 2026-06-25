import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import VideoCall from '../components/VideoCall'
import {
  User,
  Phone,
  MapPin,
  CreditCard,
  DollarSign,
  Users,
  AlertTriangle,
  MessageSquare,
  Briefcase,
  Lock,
  Video,
  PhoneOff,
  CheckCircle,
  ChevronLeft,
  Activity,
  LogOut,
  ChevronRight,
} from 'lucide-react'

export default function ConsultaMedico() {
  const navigate = useNavigate()
  const location = useLocation()

  const idTriagem = location.state?.idTriagem || sessionStorage.getItem('elosocial_caso_atual') || null

  const [caso, setCaso] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [videoAtivo, setVideoAtivo] = useState(false)

  const URL_SALA = 'https://telesaude.daily.co/Sala-atendimento'

  useEffect(() => {
    const buscarCaso = async () => {
      setCarregando(true)

      if (!idTriagem) {
        navigate('/dashboard-medico')
        return
      }

      const { data, error } = await supabase
        .from('triagens')
        .select('*')
        .eq('id', idTriagem)
        .maybeSingle()

      if (error) {
        alert('Erro ao carregar dados do caso: ' + error.message)
        setCarregando(false)
        return
      }

      if (!data) {
        alert('Caso não encontrado.')
        navigate('/dashboard-medico')
        return
      }

      sessionStorage.setItem('elosocial_caso_atual', data.id)
      setCaso(data)
      setVideoAtivo(data.status === 'em_atendimento')
      setCarregando(false)
    }

    buscarCaso()
  }, [idTriagem, navigate])

  const sair = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const atualizarCasoLocal = (camposAtualizados) => {
    setCaso((casoAtual) => {
      if (!casoAtual) return casoAtual

      return {
        ...casoAtual,
        ...camposAtualizados,
      }
    })
  }

  const iniciarTeleconferencia = async () => {
    if (!caso || !idTriagem) return

    setSalvando(true)

    const { error } = await supabase
      .from('triagens')
      .update({
        status: 'em_atendimento',
        aguardando_video: false,
      })
      .eq('id', idTriagem)

    setSalvando(false)

    if (error) {
      alert('Erro ao iniciar teleconferência: ' + error.message)
      return
    }

    atualizarCasoLocal({
      status: 'em_atendimento',
      aguardando_video: false,
    })

    setVideoAtivo(true)
  }

  const finalizarChamada = async () => {
    if (!caso || !idTriagem) return

    const confirmar = window.confirm('Finalizar a chamada e manter o caso em acompanhamento?')

    if (!confirmar) return

    setSalvando(true)

    const { error } = await supabase
      .from('triagens')
      .update({
        status: 'em_acompanhamento',
        aguardando_video: false,
      })
      .eq('id', idTriagem)

    setSalvando(false)

    if (error) {
      alert('Erro ao finalizar chamada: ' + error.message)
      return
    }

    atualizarCasoLocal({
      status: 'em_acompanhamento',
      aguardando_video: false,
    })

    setVideoAtivo(false)
  }

  const concluirCaso = async () => {
    if (!caso || !idTriagem) return

    const confirmar = window.confirm('Concluir este caso social? Ele deixará de aparecer nos casos abertos.')

    if (!confirmar) return

    setSalvando(true)

    const { error } = await supabase
      .from('triagens')
      .update({
        status: 'concluido',
        aguardando_video: false,
      })
      .eq('id', idTriagem)

    setSalvando(false)

    if (error) {
      alert('Erro ao concluir caso: ' + error.message)
      return
    }

    navigate('/dashboard-medico')
  }

  const guardarCasoAtual = () => {
    if (caso?.id) {
      sessionStorage.setItem('elosocial_caso_atual', caso.id)
    }
  }

  const abrirMensagens = () => {
    guardarCasoAtual()
    navigate('/mensagens-assistente', { state: { idTriagem: caso.id } })
  }

  const abrirPlanoAcao = () => {
    guardarCasoAtual()
    navigate('/plano-acao-assistente', { state: { idTriagem: caso.id } })
  }

  const abrirCofreDigital = () => {
    guardarCasoAtual()
    navigate('/cofre-digital-assistente', { state: { idTriagem: caso.id } })
  }

  const formatarSituacoes = (situacoes) => {
    if (Array.isArray(situacoes)) return situacoes.join(', ')
    return situacoes || 'Não informado'
  }

  const extrairCampoDoResumo = (texto, nomeCampo) => {
    if (!texto) return ''

    const linha = texto
      .split('\n')
      .find((item) => item.toLowerCase().startsWith(nomeCampo.toLowerCase()))

    return linha ? linha.split(':').slice(1).join(':').trim() : ''
  }

  const extrairBlocoDoResumo = (texto, inicio, fim) => {
    if (!texto) return ''

    const indiceInicio = texto.indexOf(inicio)

    if (indiceInicio === -1) return ''

    const textoDepois = texto.slice(indiceInicio + inicio.length)
    const indiceFim = fim ? textoDepois.indexOf(fim) : -1

    return indiceFim === -1
      ? textoDepois.trim()
      : textoDepois.slice(0, indiceFim).trim()
  }

  const obterDadosAcolhimento = (detalhes) => {
    const situacoesTexto = extrairBlocoDoResumo(
      detalhes,
      'Situações marcadas:',
      'Descrição do cidadão:'
    )

    const situacoes = situacoesTexto
      .split('\n')
      .map((item) => item.replace(/^-\s*/, '').trim())
      .filter(Boolean)
      .filter((item) => item !== 'Nenhuma situação específica marcada')

    return {
      demandaPrincipal: extrairCampoDoResumo(detalhes, 'Demanda principal'),
      urgencia: extrairCampoDoResumo(detalhes, 'Nível de urgência informado'),
      pontuacao: extrairCampoDoResumo(detalhes, 'Pontuação de risco social'),
      telefone: extrairCampoDoResumo(detalhes, 'Telefone para contato'),
      endereco: extrairCampoDoResumo(detalhes, 'Endereço/bairro'),
      cartaoSus: extrairCampoDoResumo(detalhes, 'Cartão SUS/NIS'),
      composicaoFamiliar: extrairCampoDoResumo(detalhes, 'Composição familiar'),
      rendaFamiliar: extrairCampoDoResumo(detalhes, 'Renda familiar aproximada'),
      situacoes,
      relato: extrairBlocoDoResumo(detalhes, 'Descrição do cidadão:'),
    }
  }

  const CardAcolhimento = ({ titulo, valor, Icone }) => (
    <div className="bg-[#11211C] border border-[#1A332A] rounded-2xl p-4 transition-all hover:border-[#24473B]">
      <div className="flex items-center gap-2 mb-2">
        {Icone && <Icone size={14} className="text-[#4ade80] opacity-80" />}
        <p className="text-[#7A9C8D] text-[10px] font-semibold uppercase tracking-wider">
          {titulo}
        </p>
      </div>

      <p className="text-[#E2E8F0] text-sm leading-relaxed font-medium">
        {valor || 'Não informado'}
      </p>
    </div>
  )

  const BotaoFerramenta = ({ titulo, subtitulo, Icone, onClick, destaque, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full group flex items-center gap-3 border rounded-2xl p-4 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
        destaque
          ? 'border-[#4ade80]/40 bg-[#4ade80]/10 hover:bg-[#4ade80]/15'
          : 'border-[#1A332A] bg-[#0B1511] hover:border-[#4ade80]/50 hover:bg-[#142921]'
      }`}
    >
      <div
        className={`p-2 rounded-lg transition-colors ${
          destaque
            ? 'bg-[#4ade80]/20 text-[#4ade80]'
            : 'bg-[#1A332A] text-[#7A9C8D] group-hover:bg-[#4ade80]/20 group-hover:text-[#4ade80]'
        }`}
      >
        <Icone size={18} />
      </div>

      <div className="flex-1">
        <p className="text-sm font-semibold text-white">{titulo}</p>
        <p className="text-[10px] text-[#7A9C8D] mt-0.5">{subtitulo}</p>
      </div>

      <ChevronRight size={16} className="text-[#4A6B5C] group-hover:text-[#4ade80] transition-colors" />
    </button>
  )

  const obterCorPrioridade = (prioridade) => {
    if (prioridade === 'ALTA') return 'bg-red-500/10 text-red-400 border-red-500/20'
    if (prioridade === 'MÉDIA') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  }

  const obterStatusBadge = (status) => {
    const config = {
      pendente: {
        texto: 'Pendente',
        cor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      },
      em_atendimento: {
        texto: 'Em atendimento',
        cor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      },
      em_acompanhamento: {
        texto: 'Em acompanhamento',
        cor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      },
      concluido: {
        texto: 'Concluído',
        cor: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      },
    }

    const atual = config[status] || {
      texto: 'Não informado',
      cor: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border tracking-wide ${atual.cor}`}>
        {atual.texto}
      </span>
    )
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#0B1511] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#1A332A] border-t-[#4ade80] rounded-full animate-spin"></div>
          <p className="text-[#7A9C8D] text-sm font-medium tracking-wide">
            Carregando contexto social...
          </p>
        </div>
      </div>
    )
  }

  const dadosAcolhimento = obterDadosAcolhimento(caso?.detalhes || '')
  const casoConcluido = caso?.status === 'concluido'
  const chamadaDisponivel = caso?.status === 'em_atendimento' || caso?.aguardando_video

  return (
    <div className="min-h-screen bg-[#0B1511] text-slate-200 font-sans selection:bg-[#4ade80]/30">
      <header className="sticky top-0 z-10 bg-[#0B1511]/80 backdrop-blur-md border-b border-[#1A332A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard-medico')}
              className="p-2 -ml-2 rounded-xl text-[#7A9C8D] hover:text-white hover:bg-[#11211C] transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            <div>
              <p className="text-[#4ade80] text-[10px] uppercase tracking-widest font-bold mb-0.5">
                Plataforma EloSocial
              </p>

              <h1 className="text-xl font-bold tracking-tight text-white">
                Prontuário Social
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={sair}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-[#1A332A] text-[#7A9C8D] bg-[#11211C] hover:text-white hover:border-[#24473B] transition-all"
            >
              <LogOut size={16} />
              Sair
            </button>

            <button
              onClick={concluirCaso}
              disabled={salvando || casoConcluido}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10 disabled:opacity-40 transition-all"
            >
              <CheckCircle size={16} />
              Encerrar caso
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-[#11211C] border border-[#1A332A] rounded-3xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight mb-3">
                  {caso?.paciente_nome || 'Cidadão não identificado'}
                </h2>

                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border tracking-wide ${obterCorPrioridade(caso?.prioridade)}`}>
                    Prioridade {caso?.prioridade || 'BAIXA'}
                  </span>

                  {obterStatusBadge(caso?.status)}

                  {caso?.aguardando_video && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border border-blue-500/20 bg-blue-500/10 text-blue-400">
                      <Video size={10} />
                      Aguardando vídeo
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-[#7A9C8D] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <User size={14} className="text-[#4ade80]" />
                  Mapeamento de dados
                </h3>

                <div className="grid sm:grid-cols-2 gap-3">
                  <CardAcolhimento
                    titulo="Demanda principal"
                    valor={dadosAcolhimento.demandaPrincipal || formatarSituacoes(caso?.sintomas)}
                    Icone={AlertTriangle}
                  />

                  <CardAcolhimento
                    titulo="Urgência informada"
                    valor={dadosAcolhimento.urgencia}
                    Icone={Activity}
                  />

                  <CardAcolhimento
                    titulo="Telefone"
                    valor={dadosAcolhimento.telefone}
                    Icone={Phone}
                  />

                  <CardAcolhimento
                    titulo="Endereço / Bairro"
                    valor={dadosAcolhimento.endereco}
                    Icone={MapPin}
                  />

                  <CardAcolhimento
                    titulo="Cartão SUS / NIS"
                    valor={dadosAcolhimento.cartaoSus}
                    Icone={CreditCard}
                  />

                  <CardAcolhimento
                    titulo="Renda familiar"
                    valor={dadosAcolhimento.rendaFamiliar}
                    Icone={DollarSign}
                  />

                  <CardAcolhimento
                    titulo="Composição familiar"
                    valor={dadosAcolhimento.composicaoFamiliar}
                    Icone={Users}
                  />

                  <CardAcolhimento
                    titulo="Risco social"
                    valor={dadosAcolhimento.pontuacao}
                    Icone={AlertTriangle}
                  />
                </div>
              </div>

              {dadosAcolhimento.situacoes.length > 0 && (
                <div>
                  <h3 className="text-[#7A9C8D] text-xs font-bold uppercase tracking-widest mb-4">
                    Vulnerabilidades mapeadas
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {dadosAcolhimento.situacoes.map((situacao) => (
                      <span
                        key={situacao}
                        className="bg-[#1A332A] text-[#4ade80] px-3.5 py-1.5 rounded-lg text-xs font-medium border border-[#24473B]"
                      >
                        {situacao}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {dadosAcolhimento.relato && (
                <div>
                  <h3 className="text-[#7A9C8D] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <MessageSquare size={14} className="text-[#4ade80]" />
                    Relato direto
                  </h3>

                  <div className="bg-[#0B1511] border border-[#1A332A] rounded-2xl p-5">
                    <p className="text-[#A0BDB0] text-sm leading-relaxed whitespace-pre-wrap italic">
                      "{dadosAcolhimento.relato}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {videoAtivo && (
            <section className="bg-[#11211C] border border-[#1A332A] rounded-3xl p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Video className="text-[#4ade80]" />
                  Sala de atendimento
                </h3>

                <button
                  onClick={finalizarChamada}
                  disabled={salvando}
                  className="flex items-center justify-center gap-2 border border-red-500/30 text-red-400 bg-red-500/10 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-500/20 disabled:opacity-40 transition-all"
                >
                  <PhoneOff size={16} />
                  {salvando ? 'Encerrando...' : 'Finalizar chamada'}
                </button>
              </div>

              <div className="h-[500px] bg-[#050A08] border border-[#1A332A] rounded-2xl overflow-hidden ring-4 ring-[#4ade80]/10">
                <VideoCall url={URL_SALA} userName="Assistente Social" />
              </div>
            </section>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <section className="bg-[#11211C] border border-[#1A332A] rounded-3xl p-6">
            <h3 className="text-[#7A9C8D] text-xs font-bold uppercase tracking-widest mb-4">
              Ferramentas
            </h3>

            <div className="space-y-3">
              <BotaoFerramenta
                titulo={videoAtivo ? 'Chamada em andamento' : 'Teleconferência'}
                subtitulo={
                  videoAtivo
                    ? 'Sala aberta neste atendimento'
                    : chamadaDisponivel
                      ? 'Cidadão aguardando atendimento'
                      : 'Abrir sala de atendimento'
                }
                Icone={Video}
                destaque={videoAtivo || chamadaDisponivel}
                disabled={salvando || casoConcluido || videoAtivo}
                onClick={iniciarTeleconferencia}
              />

              <BotaoFerramenta
                titulo="Mensagens"
                subtitulo="Chat com o cidadão"
                Icone={MessageSquare}
                onClick={abrirMensagens}
              />

              <BotaoFerramenta
                titulo="Plano de ação"
                subtitulo="Metas e encaminhamentos"
                Icone={Briefcase}
                onClick={abrirPlanoAcao}
              />

              <BotaoFerramenta
                titulo="Cofre digital"
                subtitulo="Documentos sigilosos"
                Icone={Lock}
                onClick={abrirCofreDigital}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}