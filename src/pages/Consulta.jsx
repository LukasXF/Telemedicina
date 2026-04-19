import { useState } from 'react'

export default function Consulta() {
  // Esse é o "Estado". Começa como 'false' (não iniciado)
  const [chamadaAtiva, setChamadaAtiva] = useState(false)

  return (
    <div className="min-h-screen bg-[#0d1f1a] flex flex-col items-center justify-center px-6 py-10 font-sans">
      
      {!chamadaAtiva ? (
        /* --- ESTADO 1: AGUARDANDO MÉDICO --- */
        <div className="w-full max-w-md text-center animate-fadeUp">
          <div className="mb-8 relative inline-block">
            {/* Círculos pulsantes de animação */}
            <div className="absolute inset-0 rounded-full bg-[#4ab882] opacity-20 animate-ping"></div>
            <div className="relative w-20 h-20 rounded-full border-2 border-[#2a6b52] bg-[#1a3d30] flex items-center justify-center">
              <svg className="w-10 h-10 text-[#4ab882]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <h1 className="text-[#e8f0ec] text-2xl font-semibold mb-2" style={{fontFamily:'Georgia, serif'}}>
            Sala de Espera Virtual
          </h1>
          <p className="text-[#5a8a72] text-sm mb-8 leading-relaxed">
            Sua triagem foi enviada com sucesso. <br />
            Por favor, permaneça nesta tela. O médico especialista será notificado e iniciará a chamada em instantes.
          </p>

          <div className="bg-[#111f1a] border border-[#1e3b2e] rounded-2xl p-6 mb-6">
            <p className="text-[#4ab882] text-xs uppercase tracking-widest font-bold mb-4">Dicas para conexão baixa</p>
            <ul className="text-left text-[#5a8a72] text-xs space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-[#4ab882]">●</span> Se o vídeo travar, o sistema alternará automaticamente para áudio.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#4ab882]">●</span> Procure um local com sinal estável para garantir a sincronia.
              </li>
            </ul>
          </div>

          {/* BOTÃO PARA SIMULAÇÃO (Remover no futuro) */}
          <button 
            onClick={() => setChamadaAtiva(true)}
            className="text-[#4ab882] text-xs border border-[#4ab882]/30 px-4 py-2 rounded-lg hover:bg-[#4ab882]/10 transition-all"
          >
            Simular: Médico aceitou a chamada
          </button>
        </div>

      ) : (
        /* --- ESTADO 2: CHAMADA EM VÍDEO ATIVA --- */
        <div className="w-full max-w-4xl h-[80vh] flex flex-col animate-fadeUp">
          <div className="flex-1 bg-black rounded-3xl border border-[#1e3b2e] relative overflow-hidden flex items-center justify-center">
            {/* Placeholder do Vídeo do Médico */}
            <p className="text-[#4a7a60] text-sm">Conectando ao servidor de vídeo Jitsi...</p>
            
            {/* Miniatura do Paciente (Sua câmera) */}
            <div className="absolute bottom-6 right-6 w-32 h-44 bg-[#1a3d30] rounded-xl border border-[#2a6b52] shadow-2xl flex items-center justify-center">
              <span className="text-[10px] text-[#4ab882]">Você</span>
            </div>

            {/* Controles da Chamada */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
              <button className="w-12 h-12 rounded-full bg-[#1a3d30] border border-[#2a6b52] flex items-center justify-center text-[#e8f0ec] hover:bg-[#2a6b52] transition-all">
                 🎤
              </button>
              <button 
                onClick={() => setChamadaAtiva(false)}
                className="w-12 h-12 rounded-full bg-red-900/80 border border-red-500 flex items-center justify-center text-white hover:bg-red-800 transition-all"
              >
                 📞
              </button>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center px-2">
            <div>
              <h3 className="text-[#e8f0ec] font-medium">Dr. Especialista</h3>
              <p className="text-[#5a8a72] text-xs">Conexão Estável</p>
            </div>
            <div className="flex gap-2">
               <span className="px-3 py-1 bg-[#1a3d30] border border-[#2a6b52] text-[#4ab882] text-[10px] rounded-full">HD</span>
               <span className="px-3 py-1 bg-[#1a3d30] border border-[#2a6b52] text-[#4ab882] text-[10px] rounded-full">Criptografado</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}