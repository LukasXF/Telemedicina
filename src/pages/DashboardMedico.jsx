import { useNavigate } from 'react-router-dom'

export default function DashboardMedico() {
  const navigate = useNavigate()

  // Dados de mentirinha para o protótipo
  const pacientes = [
    { id: 1, nome: "Maria Silva", hora: "02:15", sintomas: "Falta de Ar, Febre", prioridade: "ALTA", cor: "bg-red-500" },
    { id: 2, nome: "José Santos", hora: "02:30", sintomas: "Dor no Corpo", prioridade: "MÉDIA", cor: "bg-yellow-500" },
    { id: 3, nome: "Ana Oliveira", hora: "02:45", sintomas: "Enjoo Leve", prioridade: "BAIXA", cor: "bg-green-500" },
  ]

  return (
    <div className="min-h-screen bg-[#0d1f1a] p-6 font-sans">
      <div className="max-w-5xl mx-auto animate-fadeUp">
        
        {/* Header do Médico */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-[#e8f0ec] text-2xl font-semibold" style={{fontFamily:'Georgia, serif'}}>Painel Médico</h1>
            <p className="text-[#5a8a72] text-sm">Dr. Especialista | Hospital Base</p>
          </div>
          <div className="bg-[#1a3d30] border border-[#2a6b52] px-4 py-2 rounded-xl text-[#4ab882] text-xs font-bold">
            SINAL ESTÁVEL
          </div>
        </div>

        {/* Lista de Espera */}
        <div className="bg-[#111f1a] border border-[#1e3b2e] rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-[#1e3b2e] bg-[#152b24]">
            <h2 className="text-[#d4ebe0] font-medium">Fila de Triagem</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[#4a7a60] text-xs uppercase tracking-wider border-b border-[#1e3b2e]">
                  <th className="px-6 py-4">Prioridade</th>
                  <th className="px-6 py-4">Paciente</th>
                  <th className="px-6 py-4">Sintomas</th>
                  <th className="px-6 py-4">Hora</th>
                  <th className="px-6 py-4">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a3330]">
                {pacientes.map((p) => (
                  <tr key={p.id} className="hover:bg-[#152b24] transition-colors group">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold text-white ${p.cor}`}>
                        {p.prioridade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#c8e0d4] text-sm font-medium">{p.nome}</td>
                    <td className="px-6 py-4 text-[#5a8a72] text-xs italic">{p.sintomas}</td>
                    <td className="px-6 py-4 text-[#5a8a72] text-xs">{p.hora}</td>
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
    </div>
  )
}