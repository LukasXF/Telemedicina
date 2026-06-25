import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import DocumentosCaso from '../components/DocumentosCaso'

export default function CofreDigital() {
  const navigate = useNavigate()

  const [caso, setCaso] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const buscarCaso = async () => {
      setCarregando(true)

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        navigate('/')
        return
      }

      const { data, error } = await supabase
        .from('triagens')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pendente', 'em_atendimento', 'em_acompanhamento', 'concluido'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        alert('Erro ao carregar caso: ' + error.message)
        setCarregando(false)
        return
      }

      if (!data) {
        navigate('/triagem')
        return
      }

      setCaso(data)
      setCarregando(false)
    }

    buscarCaso()
  }, [navigate])

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#0d1f1a] flex items-center justify-center px-6 py-10 font-sans">
        <div className="text-center animate-fadeUp">
          <div className="w-12 h-12 border-2 border-[#2a6b52] border-t-[#4ab882] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5a8a72] text-sm">Carregando cofre digital...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d1f1a] px-6 py-10 font-sans">
      <div className="max-w-4xl mx-auto animate-fadeUp">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-[#4ab882] text-xs uppercase tracking-wider font-medium mb-2">
              EloSocial
            </p>

            <h1 className="text-[#e8f0ec] text-2xl font-semibold" style={{fontFamily:'Georgia, serif'}}>
              Cofre Digital
            </h1>

            <p className="text-[#5a8a72] text-sm mt-1">
              Envie e acompanhe documentos relacionados ao seu caso social.
            </p>
          </div>

          <button
            onClick={() => navigate('/acompanhamento')}
            className="border border-[#2a6b52] text-[#4ab882] px-4 py-2 rounded-xl text-xs hover:bg-[#1a3d30] transition-all"
          >
            Voltar ao acompanhamento
          </button>
        </div>

        <DocumentosCaso
          casoId={caso?.id}
          enviadoPorTipo="cidadao"
        />
      </div>
    </div>
  )
}