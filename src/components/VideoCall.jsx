import { useEffect, useRef } from 'react'
import DailyIframe from '@daily-co/daily-js'

export default function VideoCall({ url, userName = 'Usuário' }) {
  const containerRef = useRef(null)
  const callFrameRef = useRef(null)

  useEffect(() => {
    let cancelado = false

    const iniciarChamada = async () => {
      if (!containerRef.current || !url) return

      try {
        const instanciaExistente = DailyIframe.getCallInstance?.()

        if (instanciaExistente) {
          try {
            await instanciaExistente.destroy()
          } catch (erro) {
            console.warn('Não foi possível destruir instância anterior do Daily:', erro)
          }
        }

        if (cancelado || !containerRef.current) return

        const callFrame = DailyIframe.createFrame(containerRef.current, {
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: '0',
            borderRadius: '16px',
          },
          showLeaveButton: true,
          showFullscreenButton: true,
        })

        callFrameRef.current = callFrame

        await callFrame.join({
          url,
          userName,
        })
      } catch (erro) {
        console.error('Erro ao iniciar chamada Daily:', erro)
      }
    }

    iniciarChamada()

    return () => {
      cancelado = true

      const callFrame = callFrameRef.current

      if (callFrame) {
        callFrameRef.current = null

        try {
          callFrame.destroy()
        } catch (erro) {
          console.warn('Erro ao destruir chamada Daily:', erro)
        }
      }
    }
  }, [url, userName])

  return (
    <div className="w-full h-full bg-black rounded-2xl overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}