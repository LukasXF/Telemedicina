import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Triagem() {
  const navigate = useNavigate()

  // Estados do formulário
  const [sintomasMarcados, setSintomasMarcados] = useState([])
  const [duracao, setDuracao] = useState('hoje')
  const [detalhes, setDetalhes] = useState('')
  const [enviando, setEnviando] = useState(false)
  
  // Estados para guardar quem está logado
  const [pacienteNome, setPacienteNome] = useState('Carregando nome...')

  // Busca o nome do paciente assim que a tela abre
  useEffect(() => {
    const buscarUsuarioLogado = async () => {
      // 1. Quem está logado?
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // 2. Pega o nome desse usuário na tabela de perfis
        const { data: perfil } = await supabase
          .from('perfis')
          .select('nome')
          .eq('id', user.id)
          .single() // Pega um só

        if (perfil) {
          setPacienteNome(perfil.nome)
        }
      }
    }
    
    buscarUsuarioLogado()
  }, [])

  const lidarComSintoma = (sintoma) => {
    if (sintomasMarcados.includes(sintoma)) {
      setSintomasMarcados(sintomasMarcados.filter(s => s !== sintoma))
    } else {
      setSintomasMarcados([...sintomasMarcados, sintoma])
    }
  }

  const calcularPrioridade = () => {
    if (sintomasMarcados.includes('Dor no Peito') || sintomasMarcados.includes('Falta de Ar')) {
      return 'ALTA'
    }
    if (sintomasMarcados.includes('Febre Alta') || sintomasMarcados.includes('Enjoo/Vômito')) {
      return 'MÉDIA'
    }
    return 'BAIXA'
  }

  const lidarComEnvio = async (e) => {
    e.preventDefault()
    setEnviando(true)

    // Pega o usuário logado para carimbar o ID na triagem
    const { data: { user } } = await supabase.auth.getUser()
    const prioridadeCalculada = calcularPrioridade()

    // ENVIANDO PARA O BANCO COM O NOME REAL, USER ID e STATUS
    const { error } = await supabase
      .from('triagens')
      .insert([
        {
          user_id: user.id, // VITAL: Agora o banco sabe de quem é a triagem!
          paciente_nome: pacienteNome, 
          sintomas: sintomasMarcados,
          duracao: duracao,
          detalhes: detalhes,
          prioridade: prioridadeCalculada,
          status: 'pendente' // VITAL: Define que está na fila de espera
        }
      ])

    setEnviando(false)

    if (error) {
      alert("Erro ao enviar: " + error.message)
    } else {
      navigate('/consulta') 
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1f1a] flex items-center justify-center px-6 py-10 font-sans">
      <div className="w-full max-w-md animate-fadeUp">
        
        <div className="text-center mb-8">
          <h1 className="text-[#e8f0ec] text-2xl font-semibold tracking-tight" style={{fontFamily:'Georgia, serif'}}>
            Nova Triagem
          </h1>
          {/* Mostrando o nome de quem está preenchendo */}
          <p className="text-[#4ab882] text-sm mt-1 font-medium">Paciente: {pacienteNome}</p>
        </div>

        <form onSubmit={lidarComEnvio} className="bg-[#111f1a] border border-[#1e3b2e] rounded-2xl p-8">
          
          <div className="mb-6">
            <label className="block text-[#5a8a72] text-xs uppercase tracking-wider mb-3 font-medium">
              Sintomas Principais
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['Febre Alta', 'Falta de Ar', 'Dor no Corpo', 'Tosse Contínua', 'Enjoo/Vômito', 'Dor no Peito'].map((sintoma) => (
                <label key={sintoma} className="flex items-center gap-2 text-[#c8e0d4] text-sm cursor-pointer p-2 rounded-lg border border-[#1a3330] hover:bg-[#152b24] transition-colors">
                  <input 
                    type="checkbox" 
                    className="accent-[#2a9162] w-4 h-4 cursor-pointer"
                    onChange={() => lidarComSintoma(sintoma)}
                  />
                  {sintoma}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-[#5a8a72] text-xs uppercase tracking-wider mb-2 font-medium">
              Há quantos dias começaram?
            </label>
            <select 
              value={duracao}
              onChange={(e) => setDuracao(e.target.value)}
              className="w-full bg-[#0d1f1a] border border-[#1e3b2e] rounded-xl px-4 py-3 text-[#c8e0d4] text-sm outline-none focus:border-[#2a9162] transition-colors appearance-none"
            >
              <option value="hoje">Começou hoje</option>
              <option value="1 a 3 dias">1 a 3 dias</option>
              <option value="4 a 7 dias">4 a 7 dias</option>
              <option value="mais de uma semana">Mais de uma semana</option>
            </select>
          </div>

          <div className="mb-8">
            <label className="block text-[#5a8a72] text-xs uppercase tracking-wider mb-2 font-medium">
              Detalhes Adicionais
            </label>
            <textarea 
              rows="3"
              value={detalhes}
              onChange={(e) => setDetalhes(e.target.value)}
              placeholder="Descreva como o paciente está se sentindo..."
              className="w-full bg-[#0d1f1a] border border-[#1e3b2e] rounded-xl px-4 py-3 text-[#c8e0d4] text-sm outline-none focus:border-[#2a9162] resize-none"
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={enviando || sintomasMarcados.length === 0}
            className="w-full bg-[#1e7a52] hover:bg-[#22905f] disabled:bg-[#1a3330] disabled:text-[#4a7a60] text-[#e8f5ee] py-3.5 rounded-xl text-sm font-medium transition-all shadow-lg"
          >
            {enviando ? 'Enviando pro Banco...' : 'Salvar e Enviar para o Médico'}
          </button>

        </form>
      </div>
    </div>
  )
}