export default function ConsultaMedico() {
  return (
    <div className="h-screen bg-[#0d1f1a] flex flex-col font-sans overflow-hidden">
      
      {/* Top Bar */}
      <div className="h-16 border-b border-[#1e3b2e] flex items-center justify-between px-6 bg-[#111f1a]">
        <div className="flex items-center gap-4">
           <div className="w-8 h-8 rounded-full bg-red-500 animate-pulse"></div>
           <h2 className="text-[#e8f0ec] font-medium">Em atendimento: Maria Silva</h2>
        </div>
        <button className="bg-red-900/40 text-red-400 border border-red-900 px-4 py-2 rounded-xl text-xs hover:bg-red-900/60 transition-all">
          Finalizar Chamada
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* LADO ESQUERDO: VÍDEO (Jitsi) */}
        <div className="flex-1 bg-black relative flex items-center justify-center border-r border-[#1e3b2e]">
          <p className="text-[#4a7a60] text-sm italic">Conectando vídeo de baixa banda...</p>
          {/* Controles flutuantes */}
          <div className="absolute bottom-8 flex gap-4">
             <button className="p-4 rounded-full bg-[#1a3d30] border border-[#2a6b52] text-white">🎤</button>
             <button className="p-4 rounded-full bg-[#1a3d30] border border-[#2a6b52] text-white">📷</button>
          </div>
        </div>

        {/* LADO DIREITO: TRIAGEM E RECEITA */}
        <div className="w-96 bg-[#111f1a] flex flex-col overflow-y-auto">
          
          {/* Resumo da Triagem */}
          <div className="p-6 border-b border-[#1e3b2e]">
            <h3 className="text-[#4ab882] text-xs font-bold uppercase tracking-widest mb-4">Resumo da Triagem</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[#4a7a60] text-[10px] uppercase">Sintomas Relatados</p>
                <p className="text-[#c8e0d4] text-sm">Febre alta há 3 dias, dificuldade respiratória leve.</p>
              </div>
              <div>
                <p className="text-[#4a7a60] text-[10px] uppercase">Anotações do Agente</p>
                <p className="text-[#c8e0d4] text-sm italic">"Paciente reside em área com difícil acesso a água potável."</p>
              </div>
            </div>
          </div>

          {/* Campo de Encaminhamento */}
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-[#4ab882] text-xs font-bold uppercase tracking-widest mb-4">Encaminhamento / Receita</h3>
            <textarea 
              className="flex-1 w-full bg-[#0d1f1a] border border-[#1e3b2e] rounded-2xl p-4 text-[#c8e0d4] text-sm outline-none focus:border-[#2a9162] resize-none"
              placeholder="Digite as instruções para o paciente ou agente local..."
            ></textarea>
            <button className="mt-4 w-full bg-[#1e7a52] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#22905f] transition-all">
              Emitir e Enviar via SMS
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}