import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import VideoCall from '../components/VideoCall'

export default function Consulta() {
  const [chamadaAtiva, setChamadaAtiva] = useState(false)
  const navigate = useNavigate()
  
  const URL_SALA = 'https://telesaude.daily.co/Sala-atendimento'

  return (
    <div className="min-h-screen bg-[#0d1f1a] flex flex-col items-center justify-center px-6 py-10 font-sans">
      {!chamadaAtiva ? (
        <div className="w-full max-w-md text-center animate-fadeUp">
          <div className="mb-8 relative inline-block">
            <div className="absolute inset-0 rounded-full bg-[#4ab882] opacity-20 animate-ping"></div>
            <div className="relative w-20 h-20 rounded-full border-2 border-[#2a6b52] bg-[#1a3d30] flex items-center justify-center">
              <svg className="w-10 h-10 text-[#4ab882]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-[#e8f0ec] text-2xl font-semibold mb-2" style={{fontFamily:'Georgia, serif'}}>Sala de Espera Virtual</h1>
          <p className="text-[#5a8a72] text-sm mb-8 leading-relaxed">
            Sua triagem foi enviada. O médico iniciará a chamada em instantes.
          </p>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setChamadaAtiva(true)}
              className="w-full bg-[#1e7a52] hover:bg-[#22905f] text-[#e8f5ee] py-3.5 rounded-xl text-sm font-medium transition-all shadow-lg"
            >
              Entrar na Chamada (Simular Aceite)
            </button>
            <button 
              onClick={() => navigate('/triagem')}
              className="w-full border border-[#2a6b52] text-[#4ab882] py-3.5 rounded-xl text-sm font-medium hover:bg-[#1a3d30] transition-all"
            >
              Editar Minha Triagem
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl h-[80vh] flex flex-col animate-fadeUp">
          <div className="flex-1 w-full h-full relative">
            <VideoCall url={URL_SALA} />
          </div>
          <button onClick={() => setChamadaAtiva(false)} className="mt-6 text-[#5a8a72] hover:text-white underline text-sm">
            Voltar para sala de espera
          </button>
        </div>
      )}
    </div>
  )
}