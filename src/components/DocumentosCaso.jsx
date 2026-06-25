import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function DocumentosCaso({ casoId, enviadoPorTipo }) {
  const [documentos, setDocumentos] = useState([])
  const [arquivo, setArquivo] = useState(null)
  const [descricao, setDescricao] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)

  const BUCKET = 'documentos-caso'

  useEffect(() => {
    if (!casoId || casoId === 'demo') {
      setDocumentos([])
      setCarregando(false)
      return
    }

    let canal

    const buscarDocumentos = async () => {
      setCarregando(true)

      const { data, error } = await supabase
        .from('documentos_caso')
        .select('*')
        .eq('caso_id', casoId)
        .order('created_at', { ascending: false })

      if (error) {
        alert('Erro ao carregar documentos: ' + error.message)
        setCarregando(false)
        return
      }

      setDocumentos(data || [])
      setCarregando(false)
    }

    buscarDocumentos()

    canal = supabase
      .channel(`documentos_caso_${casoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documentos_caso',
          filter: `caso_id=eq.${casoId}`,
        },
        () => {
          buscarDocumentos()
        }
      )
      .subscribe()

    return () => {
      if (canal) {
        supabase.removeChannel(canal)
      }
    }
  }, [casoId])

  const limparNomeArquivo = (nome) => {
    return nome
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
  }

  const enviarDocumento = async (e) => {
    e.preventDefault()

    if (!arquivo) {
      alert('Selecione um arquivo antes de enviar.')
      return
    }

    if (!casoId || casoId === 'demo') {
      alert('Cofre digital não está disponível para o caso demonstrativo.')
      return
    }

    setEnviando(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('Você precisa estar logado para enviar documentos.')
      setEnviando(false)
      return
    }

    const nomeSeguro = limparNomeArquivo(arquivo.name)
    const caminhoArquivo = `${casoId}/${Date.now()}-${nomeSeguro}`

    const { error: erroUpload } = await supabase.storage
      .from(BUCKET)
      .upload(caminhoArquivo, arquivo)

    if (erroUpload) {
      alert('Erro ao enviar arquivo: ' + erroUpload.message)
      setEnviando(false)
      return
    }

    const { error: erroBanco } = await supabase
      .from('documentos_caso')
      .insert([
        {
          caso_id: casoId,
          enviado_por_id: user.id,
          enviado_por_tipo: enviadoPorTipo,
          nome_arquivo: arquivo.name,
          caminho_arquivo: caminhoArquivo,
          tipo_arquivo: arquivo.type || null,
          tamanho_bytes: arquivo.size || null,
          descricao: descricao.trim() || null,
        }
      ])

    setEnviando(false)

    if (erroBanco) {
      alert('Arquivo enviado, mas houve erro ao registrar no banco: ' + erroBanco.message)
      return
    }

    setArquivo(null)
    setDescricao('')

    const inputArquivo = document.getElementById('arquivo-cofre-digital')
    if (inputArquivo) {
      inputArquivo.value = ''
    }
  }

  const abrirDocumento = async (documento) => {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(documento.caminho_arquivo, 60)

    if (error) {
      alert('Erro ao abrir documento: ' + error.message)
      return
    }

    window.open(data.signedUrl, '_blank')
  }

  const excluirDocumento = async (documento) => {
    const confirmar = window.confirm('Deseja excluir este documento do cofre digital?')

    if (!confirmar) return

    const { error: erroStorage } = await supabase.storage
      .from(BUCKET)
      .remove([documento.caminho_arquivo])

    if (erroStorage) {
      alert('Erro ao remover arquivo: ' + erroStorage.message)
      return
    }

    const { error: erroBanco } = await supabase
      .from('documentos_caso')
      .delete()
      .eq('id', documento.id)

    if (erroBanco) {
      alert('Erro ao remover registro do documento: ' + erroBanco.message)
    }
  }

  const formatarTamanho = (bytes) => {
    if (!bytes) return 'Tamanho não informado'

    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatarData = (data) => {
    if (!data) return ''

    return new Date(data).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }

  const obterTextoTipo = (tipo) => {
    if (tipo === 'cidadao') return 'Cidadão'
    if (tipo === 'assistente') return 'Assistente Social'
    return 'Usuário'
  }

  return (
    <div className="space-y-6">
      <form onSubmit={enviarDocumento} className="bg-[#111f1a] border border-[#1e3b2e] rounded-3xl p-6">
        <h3 className="text-[#4ab882] text-xs font-bold uppercase tracking-widest mb-4">
          Enviar documento
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-[#5a8a72] text-xs uppercase tracking-wider mb-2">
              Arquivo
            </label>

            <input
              id="arquivo-cofre-digital"
              type="file"
              onChange={(e) => setArquivo(e.target.files?.[0] || null)}
              className="w-full bg-[#0d1f1a] border border-[#1e3b2e] rounded-xl px-4 py-3 text-[#c8e0d4] text-sm outline-none focus:border-[#2a9162]"
            />

            <p className="text-[#4a7a60] text-xs mt-2">
              Você pode enviar PDF, imagem ou outro documento relevante para o caso.
            </p>
          </div>

          <div>
            <label className="block text-[#5a8a72] text-xs uppercase tracking-wider mb-2">
              Descrição
            </label>

            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows="3"
              placeholder="Ex: Comprovante de residência, RG, CPF, laudo, declaração..."
              className="w-full bg-[#0d1f1a] border border-[#1e3b2e] rounded-xl px-4 py-3 text-[#c8e0d4] text-sm outline-none focus:border-[#2a9162] resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={enviando || !arquivo}
            className="w-full bg-[#1e7a52] hover:bg-[#22905f] disabled:bg-[#1a3330] disabled:text-[#4a7a60] text-[#e8f5ee] py-3 rounded-xl text-sm font-medium transition-all"
          >
            {enviando ? 'Enviando documento...' : 'Enviar para o cofre digital'}
          </button>
        </div>
      </form>

      <div className="bg-[#111f1a] border border-[#1e3b2e] rounded-3xl p-6">
        <h3 className="text-[#4ab882] text-xs font-bold uppercase tracking-widest mb-4">
          Documentos do caso
        </h3>

        {carregando && (
          <p className="text-[#5a8a72] text-sm text-center py-10">
            Carregando documentos...
          </p>
        )}

        {!carregando && documentos.length === 0 && (
          <div className="text-center py-10">
            <p className="text-[#c8e0d4] text-sm font-medium mb-1">
              Nenhum documento enviado ainda
            </p>
            <p className="text-[#5a8a72] text-xs">
              Os documentos enviados aparecerão aqui.
            </p>
          </div>
        )}

        {!carregando && documentos.length > 0 && (
          <div className="space-y-4">
            {documentos.map((documento) => (
              <div key={documento.id} className="bg-[#0d1f1a] border border-[#1e3b2e] rounded-2xl p-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <p className="text-[#e8f0ec] text-sm font-semibold break-all">
                      {documento.nome_arquivo}
                    </p>

                    {documento.descricao && (
                      <p className="text-[#5a8a72] text-sm leading-relaxed mt-2">
                        {documento.descricao}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                      <p className="text-[#4a7a60] text-xs">
                        Enviado por: {obterTextoTipo(documento.enviado_por_tipo)}
                      </p>

                      <p className="text-[#4a7a60] text-xs">
                        {formatarTamanho(documento.tamanho_bytes)}
                      </p>

                      <p className="text-[#4a7a60] text-xs">
                        {formatarData(documento.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => abrirDocumento(documento)}
                      className="bg-[#1e7a52] hover:bg-[#22905f] text-white px-4 py-2 rounded-lg text-xs transition-all"
                    >
                      Abrir
                    </button>

                    <button
                      onClick={() => excluirDocumento(documento)}
                      className="border border-red-900/60 text-red-400 px-4 py-2 rounded-lg text-xs hover:bg-red-900/20 transition-all"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}