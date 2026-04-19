import { useNavigate } from 'react-router-dom'

export default function Triagem() {
  const navigate = useNavigate()

  // Função que simula o salvamento e avança de tela
  const lidarComEnvio = (e) => {
    e.preventDefault() // Evita que a página recarregue
    // Aqui no futuro o código vai enviar os dados pro backend
    // Por enquanto, só vamos pular pra próxima tela (que faremos depois)
    alert("Dados salvos no celular! Sincronizando...")
    // navigate('/aguardando') <- Descomentaremos isso quando a tela 3 existir
  }

  return (
    <div className="min-h-screen bg-[#0d1f1a] flex items-center justify-center px-6 py-10 font-sans">
      <div className="w-full max-w-md animate-fadeUp">
        
        <div className="text-center mb-8">
          <h1 className="text-[#e8f0ec] text-2xl font-semibold tracking-tight" style={{fontFamily:'Georgia, serif'}}>
            Nova Triagem
          </h1>
          <p className="text-[#5a8a72] text-sm mt-1 font-light">Informe os sintomas do paciente</p>
        </div>

        <form onSubmit={lidarComEnvio} className="bg-[#111f1a] border border-[#1e3b2e] rounded-2xl p-8">
          
          {/* Sintomas Rápidos (Checkboxes) */}
          <div className="mb-6">
            <label className="block text-[#5a8a72] text-xs uppercase tracking-wider mb-3 font-medium">
              Sintomas Principais (Marque os que houver)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['Febre Alta', 'Falta de Ar', 'Dor no Corpo', 'Tosse Contínua', 'Enjoo/Vômito', 'Dor no Peito'].map((sintoma) => (
                <label key={sintoma} className="flex items-center gap-2 text-[#c8e0d4] text-sm cursor-pointer p-2 rounded-lg border border-[#1a3330] hover:bg-[#152b24] transition-colors">
                  <input type="checkbox" className="accent-[#2a9162] w-4 h-4 cursor-pointer" />
                  {sintoma}
                </label>
              ))}
            </div>
          </div>

          {/* Duração */}
          <div className="mb-6">
            <label className="block text-[#5a8a72] text-xs uppercase tracking-wider mb-2 font-medium">
              Há quantos dias começaram?
            </label>
            <select className="w-full bg-[#0d1f1a] border border-[#1e3b2e] rounded-xl px-4 py-3 text-[#c8e0d4] text-sm outline-none focus:border-[#2a9162] transition-colors appearance-none">
              <option value="hoje">Começou hoje</option>
              <option value="1-3">1 a 3 dias</option>
              <option value="4-7">4 a 7 dias</option>
              <option value="mais-7">Mais de uma semana</option>
            </select>
          </div>

          {/* Detalhes de Texto */}
          <div className="mb-8">
            <label className="block text-[#5a8a72] text-xs uppercase tracking-wider mb-2 font-medium">
              Detalhes Adicionais
            </label>
            <textarea 
              rows="3"
              placeholder="Descreva como o paciente está se sentindo ou se tem alguma doença prévia..."
              className="w-full bg-[#0d1f1a] border border-[#1e3b2e] rounded-xl px-4 py-3 text-[#c8e0d4] text-sm placeholder-[#2a4a3a] outline-none focus:border-[#2a9162] transition-colors resize-none"
            ></textarea>
          </div>

          {/* Botão de Envio */}
          <button type="submit" className="w-full bg-[#1e7a52] hover:bg-[#22905f] text-[#e8f5ee] py-3.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-[#1e7a52]/20">
            Salvar e Enviar para o Médico
          </button>
          
          {/* Alerta de Offline */}
          <p className="text-center text-[#4a7a60] text-[11px] mt-4 flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#4ab882] animate-pulse"></span>
            Modo offline ativado. Salva no celular se não houver rede.
          </p>

        </form>
      </div>
    </div>
  )
}