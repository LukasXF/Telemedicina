import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function DashboardMedico() {
  const navigate = useNavigate()
  const [casos, setCasos] = useState([])
  const [carregando, setCarregando] = useState(true)

  const obterPesoPrioridade = (prioridade) => {
    if (prioridade === 'ALTA') return 3
    if (prioridade === 'MÉDIA') return 2
    return 1
  }

  const ordenarCasos = (lista) => {
    return [...lista].sort((a, b) => {
      const prioridadeB = obterPesoPrioridade(b.prioridade)
      const prioridadeA = obterPesoPrioridade(a.prioridade)

      if (prioridadeB !== prioridadeA) {
        return prioridadeB - prioridadeA
      }

      return new Date(a.created_at || 0) - new Date(b.created_at || 0)
    })
  }

  const buscarCasos = async () => {
    setCarregando(true)

    const { data, error } = await supabase
      .from('triagens')
      .select('*')
      .eq('status', 'pendente')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Erro ao buscar casos:', error)
      alert('Erro ao buscar a fila de acolhimento: ' + error.message)
      setCarregando(false)
      return
    }

    const casosReais = ordenarCasos(data || [])

    const casoDemo = {
      id: 'demo-maria',
      paciente_nome: 'Maria Oliveira (Demonstração)',
      sintomas: ['Falta de alimento', 'A família está sem renda'],
      prioridade: 'ALTA',
      detalhes: 'Caso demonstrativo de vulnerabilidade social para apresentação do MVP.',
      created_at: new Date().toISOString(),
      isDemo: true,
    }

    setCasos([casoDemo, ...casosReais])
    setCarregando(false)
  }

  useEffect(() => {
    buscarCasos()

    const canal = supabase
      .channel('fila_acolhimento_social')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'triagens',
        },
        () => {
          buscarCasos()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [])

  const iniciarAtendimento = async (idTriagem) => {
    if (idTriagem === 'demo-maria') {
      navigate('/consulta-medica')
      return
    }

    const { error } = await supabase
      .from('triagens')
      .update({ status: 'em_atendimento' })
      .eq('id', idTriagem)

    if (error) {
      alert('Erro ao iniciar atendimento: ' + error.message)
      return
    }

    navigate('/consulta-medica', {
      state: { idTriagem },
    })
  }

  const obterCorPrioridade = (prioridade) => {
    if (prioridade === 'ALTA') return 'bg-red-500'
    if (prioridade === 'MÉDIA') return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const formatarSituacoes = (situacoes) => {
    if (Array.isArray(situacoes)) {
      return situacoes.join(', ')
    }

    if (situacoes) {
      return situacoes
    }

    return 'Não informado'
  }

  return (
    <div className="min-h-screen bg-[#0d1f1a] p-6 font-sans">
      <div className="max-w-6xl mx-auto animate-fadeUp">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
          <div>
            <p className="text-[#4ab882] text-xs uppercase tracking-wider font-medium mb-2">
              EloSocial
            </p>
            <h1 className="text-[#e8f0ec] text-2xl font-semibold" style={{fontFamily:'Georgia, serif'}}>
              Painel do Assistente Social
            </h1>
            <p className="text-[#5a8a72] text-sm mt-1">
              Fila de acolhimento organizada por prioridade de risco social
            </p>
          </div>

          <button
            onClick={buscarCasos}
            className="bg-[#1a3d30] border border-[#2a6b52] px-4 py-2 rounded-xl text-[#4ab882] text-xs hover:bg-[#224d3d] transition-all"
          >
            {carregando ? 'Atualizando...' : '🔄 Atualizar fila'}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#111f1a] border border-[#1e3b2e] rounded-2xl p-5">
            <p className="text-[#5a8a72] text-xs uppercase tracking-wider mb-2">Casos na fila</p>
            <p className="text-[#e8f0ec] text-2xl font-semibold">{casos.length}</p>
          </div>

          <div className="bg-[#111f1a] border border-[#1e3b2e] rounded-2xl p-5">
            <p className="text-[#5a8a72] text-xs uppercase tracking-wider mb-2">Prioridade alta</p>
            <p className="text-[#e8f0ec] text-2xl font-semibold">
              {casos.filter((caso) => caso.prioridade === 'ALTA').length}
            </p>
          </div>

          <div className="bg-[#111f1a] border border-[#1e3b2e] rounded-2xl p-5">
            <p className="text-[#5a8a72] text-xs uppercase tracking-wider mb-2">Atualização</p>
            <p className="text-[#e8f0ec] text-sm font-medium">
              Tempo real via Supabase
            </p>
          </div>
        </div>

        <div className="bg-[#111f1a] border border-[#1e3b2e] rounded-3xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[#4a7a60] text-xs uppercase tracking-wider border-b border-[#1e3b2e] bg-[#152b24]">
                <th className="px-6 py-4">Prioridade</th>
                <th className="px-6 py-4">Cidadão</th>
                <th className="px-6 py-4">Demanda / Situações</th>
                <th className="px-6 py-4">Ação</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#1a3330]">
              {casos.length === 0 && !carregando && (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-[#5a8a72] text-sm">
                    Nenhuma solicitação pendente no momento.
                  </td>
                </tr>
              )}

              {carregando && (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-[#5a8a72] text-sm">
                    Carregando fila de acolhimento...
                  </td>
                </tr>
              )}

              {!carregando && casos.map((caso) => (
                <tr key={caso.id} className="hover:bg-[#152b24] transition-colors group">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold text-white ${obterCorPrioridade(caso.prioridade)}`}>
                      {caso.prioridade || 'BAIXA'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-[#c8e0d4] text-sm font-medium">
                    {caso.paciente_nome || 'Cidadão não identificado'}
                    {caso.isDemo && <span className="ml-2 text-[10px] text-[#4ab882]">(Demo)</span>}
                  </td>

                  <td className="px-6 py-4 text-[#5a8a72] text-xs italic max-w-md">
                    {formatarSituacoes(caso.sintomas)}
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => iniciarAtendimento(caso.id)}
                      className="bg-[#1e7a52] text-white text-xs px-4 py-2 rounded-lg opacity-80 group-hover:opacity-100 transition-all"
                    >
                      Iniciar acolhimento
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[#4a7a60] text-xs mt-5 leading-relaxed">
          A prioridade é calculada a partir das informações do acolhimento social, como risco de violência, insegurança alimentar,
          moradia e presença de crianças, idosos ou pessoas com deficiência em situação de vulnerabilidade.
        </p>
      </div>
    </div>
  )
}