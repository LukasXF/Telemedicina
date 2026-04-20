import { useNavigate } from 'react-router-dom'
import VideoCall from '../components/VideoCall'

export default function ConsultaMedico() {
  const navigate = useNavigate()
  
  // SEU LINK AQUI TAMBÉM!
  const URL_SALA = 'https://telesaude.daily.co/Sala-atendimento'

  return (
    <div className="h-screen bg-[#0d1f1a] flex flex-col font-sans overflow-hidden">
      <div className="h-16 border-b border-[#1e3b2e] flex items-center justify-between px-6 bg-[#111f1a]">
        <div className="flex items-center gap-4">
           <div className="w-8 h-8 rounded-full bg-red-500 animate-pulse"></div>
           <h2 className="text-[#e8f0ec] font-medium">Em atendimento</h2>
        </div>
        <button onClick={() => navigate('/dashboard-medico')} className="bg-red-900/40 text-red-400 border border-red-900 px-4 py-2 rounded-xl text-xs hover:bg-red-900/60 transition-all">
          Sair do Atendimento
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* LADO ESQUERDO: VÍDEO REAL! */}
        <div className="flex-1 bg-black p-4">
          <VideoCall url={URL_SALA} />
        </div>

        {/* LADO DIREITO: TRIAGEM */}
        <div className="w-96 bg-[#111f1a] flex flex-col overflow-y-auto border-l border-[#1e3b2e]">
          <div className="p-6 border-b border-[#1e3b2e]">
            <h3 className="text-[#4ab882] text-xs font-bold uppercase tracking-widest mb-4">Resumo da Triagem</h3>
            <p className="text-[#c8e0d4] text-sm">Dados do paciente aparecerão aqui após integração final com o banco.</p>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-[#4ab882] text-xs font-bold uppercase tracking-widest mb-4">Encaminhamento</h3>
            <textarea 
              className="flex-1 w-full bg-[#0d1f1a] border border-[#1e3b2e] rounded-2xl p-4 text-[#c8e0d4] text-sm outline-none resize-none"
              placeholder="Digite a receita..."
            ></textarea>
            <button className="mt-4 w-full bg-[#1e7a52] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#22905f]">
              Emitir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}