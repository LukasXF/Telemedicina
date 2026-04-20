import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function DashboardMedico() {
  const navigate = useNavigate()
  const [pacientes, setPacientes] = useState([])
  const [carregando, setCarregando] = useState(true)

  const buscarTriagens = async () => {
    setCarregando(true)
    const { data, error } = await supabase
      .from('triagens')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Erro ao buscar:", error)
    } else {
      const pacientesReais = data || []
      
      // O paciente fixo para a demonstração
      const silvioSantosFixo = {
        id: 'demo-silvio',
        paciente_nome: "Silvio Santos (Demonstração)",
        sintomas: ["Dor no Corpo", "Cansaço"],
        prioridade: "BAIXA",
        isDemo: true
      }
      
      setPacientes([silvioSantosFixo, ...pacientesReais])
    }
    setCarregando(false)
  }

  useEffect(() => {
    buscarTriagens()
  }, [])

  const obterCorPrioridade = (p) => {
    if (p === 'ALTA') return 'bg-red-500'
    if (p === 'MÉDIA') return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="min-h-screen bg-[#0d1f1a] p-6 font-sans">
      <div className="max-w-5xl mx-auto animate-fadeUp">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-[#e8f0ec] text-2xl font-semibold" style={{fontFamily:'Georgia, serif'}}>Painel Médico</h1>
            <p className="text-[#5a8a72] text-sm">Fila de Atendimento em Tempo Real</p>
          </div>
          <button 
            onClick={buscarTriagens}
            className="bg-[#1a3d30] border border-[#2a6b52] px-4 py-2 rounded-xl text-[#4ab882] text-xs hover:bg-[#224d3d] transition-all"
          >
            {carregando ? 'Atualizando...' : '🔄 Atualizar Lista'}
          </button>
        </div>

        <div className="bg-[#111f1a] border border-[#1e3b2e] rounded-3xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[#4a7a60] text-xs uppercase tracking-wider border-b border-[#1e3b2e] bg-[#152b24]">
                <th className="px-6 py-4">Prioridade</th>
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">Sintomas</th>
                <th className="px-6 py-4">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a3330]">
              {pacientes.map((p) => (
                <tr key={p.id} className="hover:bg-[#152b24] transition-colors group">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold text-white ${obterCorPrioridade(p.prioridade)}`}>
                      {p.prioridade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#c8e0d4] text-sm font-medium">
                    {p.paciente_nome}
                    {p.isDemo && <span className="ml-2 text-[10px] text-[#4ab882]">(Demo)</span>}
                  </td>
                  <td className="px-6 py-4 text-[#5a8a72] text-xs italic">
                    {Array.isArray(p.sintomas) ? p.sintomas.join(', ') : p.sintomas}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => navigate('/consulta-medica')}
                      className="bg-[#1e7a52] text-white text-xs px-4 py-2 rounded-lg opacity-80 group-hover:opacity-100 transition-all"
                    >
                      Atender
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}