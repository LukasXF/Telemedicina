import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function PlanoAcaoCaso({ casoId, modo }) {
  const [itens, setItens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [responsavel, setResponsavel] = useState('cidadao')
  const [prazo, setPrazo] = useState('')

  const podeCriar = modo === 'assistente'

  useEffect(() => {
    if (!casoId || casoId === 'demo') {
      setItens([])
      setCarregando(false)
      return
    }

    let canal

    const buscarItens = async () => {
      setCarregando(true)

      const { data, error } = await supabase
        .from('plano_acao_itens')
        .select('*')
        .eq('caso_id', casoId)
        .order('created_at', { ascending: true })

      if (error) {
        alert('Erro ao carregar plano de ação: ' + error.message)
        setCarregando(false)
        return
      }

      setItens(data || [])
      setCarregando(false)
    }

    buscarItens()

    canal = supabase
      .channel(`plano_acao_${casoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'plano_acao_itens',
          filter: `caso_id=eq.${casoId}`,
        },
        () => {
          buscarItens()
        }
      )
      .subscribe()

    return () => {
      if (canal) {
        supabase.removeChannel(canal)
      }
    }
  }, [casoId])

  const criarItem = async (e) => {
    e.preventDefault()

    const tituloLimpo = titulo.trim()

    if (!tituloLimpo) {
      alert('Digite um título para a tarefa.')
      return
    }

    setSalvando(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('Você precisa estar logado.')
      setSalvando(false)
      return
    }

    const { error } = await supabase
      .from('plano_acao_itens')
      .insert([
        {
          caso_id: casoId,
          titulo: tituloLimpo,
          descricao: descricao.trim() || null,
          responsavel,
          prazo: prazo || null,
          criado_por_id: user.id,
          criado_por_tipo: 'assistente',
          status: 'pendente',
        }
      ])

    setSalvando(false)

    if (error) {
      alert('Erro ao criar tarefa: ' + error.message)
      return
    }

    setTitulo('')
    setDescricao('')
    setResponsavel('cidadao')
    setPrazo('')
  }

  const atualizarStatus = async (item, novoStatus) => {
    const { error } = await supabase
      .from('plano_acao_itens')
      .update({
        status: novoStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id)

    if (error) {
      alert('Erro ao atualizar tarefa: ' + error.message)
    }
  }

  const excluirItem = async (item) => {
    const confirmar = window.confirm('Deseja excluir esta tarefa do plano de ação?')

    if (!confirmar) return

    const { error } = await supabase
      .from('plano_acao_itens')
      .delete()
      .eq('id', item.id)

    if (error) {
      alert('Erro ao excluir tarefa: ' + error.message)
    }
  }

  const formatarPrazo = (data) => {
    if (!data) return 'Sem prazo definido'

    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
  }

  const obterTextoStatus = (status) => {
    if (status === 'pendente') return 'Pendente'
    if (status === 'em_andamento') return 'Em andamento'
    if (status === 'concluido') return 'Concluído'
    return 'Não informado'
  }

  const obterClasseStatus = (status) => {
    if (status === 'pendente') return 'bg-yellow-500/20 text-yellow-300 border-yellow-600/40'
    if (status === 'em_andamento') return 'bg-blue-500/20 text-blue-300 border-blue-600/40'
    if (status === 'concluido') return 'bg-[#4ab882]/20 text-[#4ab882] border-[#2a6b52]'
    return 'bg-gray-500/20 text-gray-300 border-gray-600/40'
  }

  const obterTextoResponsavel = (valor) => {
    if (valor === 'cidadao') return 'Cidadão'
    if (valor === 'assistente') return 'Assistente social'
    if (valor === 'ambos') return 'Ambos'
    return 'Não informado'
  }

  return (
    <div className="space-y-6">
      {podeCriar && (
        <form onSubmit={criarItem} className="bg-[#111f1a] border border-[#1e3b2e] rounded-3xl p-6">
          <h3 className="text-[#4ab882] text-xs font-bold uppercase tracking-widest mb-4">
            Nova tarefa
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-[#5a8a72] text-xs uppercase tracking-wider mb-2">
                Título
              </label>
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Separar RG e CPF"
                className="w-full bg-[#0d1f1a] border border-[#1e3b2e] rounded-xl px-4 py-3 text-[#c8e0d4] text-sm outline-none focus:border-[#2a9162]"
              />
            </div>

            <div>
              <label className="block text-[#5a8a72] text-xs uppercase tracking-wider mb-2">
                Descrição
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows="3"
                placeholder="Detalhe a orientação ou próximo passo."
                className="w-full bg-[#0d1f1a] border border-[#1e3b2e] rounded-xl px-4 py-3 text-[#c8e0d4] text-sm outline-none focus:border-[#2a9162] resize-none"
              ></textarea>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#5a8a72] text-xs uppercase tracking-wider mb-2">
                  Responsável
                </label>
                <select
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="w-full bg-[#0d1f1a] border border-[#1e3b2e] rounded-xl px-4 py-3 text-[#c8e0d4] text-sm outline-none focus:border-[#2a9162]"
                >
                  <option value="cidadao">Cidadão</option>
                  <option value="assistente">Assistente social</option>
                  <option value="ambos">Ambos</option>
                </select>
              </div>

              <div>
                <label className="block text-[#5a8a72] text-xs uppercase tracking-wider mb-2">
                  Prazo
                </label>
                <input
                  type="date"
                  value={prazo}
                  onChange={(e) => setPrazo(e.target.value)}
                  className="w-full bg-[#0d1f1a] border border-[#1e3b2e] rounded-xl px-4 py-3 text-[#c8e0d4] text-sm outline-none focus:border-[#2a9162]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={salvando || !titulo.trim()}
              className="w-full bg-[#1e7a52] hover:bg-[#22905f] disabled:bg-[#1a3330] disabled:text-[#4a7a60] text-[#e8f5ee] py-3 rounded-xl text-sm font-medium transition-all"
            >
              {salvando ? 'Criando tarefa...' : 'Adicionar ao plano de ação'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-[#111f1a] border border-[#1e3b2e] rounded-3xl p-6">
        <h3 className="text-[#4ab882] text-xs font-bold uppercase tracking-widest mb-4">
          Tarefas do plano
        </h3>

        {carregando && (
          <p className="text-[#5a8a72] text-sm text-center py-10">
            Carregando plano de ação...
          </p>
        )}

        {!carregando && itens.length === 0 && (
          <div className="text-center py-10">
            <p className="text-[#c8e0d4] text-sm font-medium mb-1">
              Nenhuma tarefa registrada ainda
            </p>
            <p className="text-[#5a8a72] text-xs">
              {podeCriar
                ? 'Crie a primeira tarefa para orientar o acompanhamento.'
                : 'Quando a equipe criar tarefas, elas aparecerão aqui.'}
            </p>
          </div>
        )}

        {!carregando && itens.length > 0 && (
          <div className="space-y-4">
            {itens.map((item) => (
              <div key={item.id} className="bg-[#0d1f1a] border border-[#1e3b2e] rounded-2xl p-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                  <div>
                    <h4 className="text-[#e8f0ec] text-sm font-semibold">
                      {item.titulo}
                    </h4>

                    {item.descricao && (
                      <p className="text-[#5a8a72] text-sm leading-relaxed mt-2">
                        {item.descricao}
                      </p>
                    )}
                  </div>

                  <span className={`inline-block border px-2 py-1 rounded-md text-[10px] font-bold w-fit ${obterClasseStatus(item.status)}`}>
                    {obterTextoStatus(item.status)}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-2 mb-4">
                  <p className="text-[#5a8a72] text-xs">
                    <span className="text-[#c8e0d4]">Responsável:</span> {obterTextoResponsavel(item.responsavel)}
                  </p>

                  <p className="text-[#5a8a72] text-xs">
                    <span className="text-[#c8e0d4]">Prazo:</span> {formatarPrazo(item.prazo)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => atualizarStatus(item, 'pendente')}
                    className="border border-[#1e3b2e] text-[#5a8a72] px-3 py-2 rounded-lg text-xs hover:border-yellow-600/40 hover:text-yellow-300 transition-all"
                  >
                    Pendente
                  </button>

                  <button
                    onClick={() => atualizarStatus(item, 'em_andamento')}
                    className="border border-[#1e3b2e] text-[#5a8a72] px-3 py-2 rounded-lg text-xs hover:border-blue-600/40 hover:text-blue-300 transition-all"
                  >
                    Em andamento
                  </button>

                  <button
                    onClick={() => atualizarStatus(item, 'concluido')}
                    className="border border-[#1e3b2e] text-[#5a8a72] px-3 py-2 rounded-lg text-xs hover:border-[#2a6b52] hover:text-[#4ab882] transition-all"
                  >
                    Concluído
                  </button>

                  {podeCriar && (
                    <button
                      onClick={() => excluirItem(item)}
                      className="border border-red-900/60 text-red-400 px-3 py-2 rounded-lg text-xs hover:bg-red-900/20 transition-all ml-auto"
                    >
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}