export default function App() {
  return (
    <div className="min-h-screen bg-[#0d1f1a] flex items-center justify-center px-6 py-10 font-sans">
      <div className="w-full max-w-sm animate-fadeUp">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl border border-[#2a6b52] bg-[#1a3d30] mb-4">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none"
              stroke="#4ab882" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/>
              <path d="M8 12h8M12 8v8"/>
            </svg>
          </div>
          <h1 className="text-[#e8f0ec] text-2xl font-semibold tracking-tight" style={{fontFamily:'Georgia, serif'}}>
            TeleSaúde
          </h1>
          <p className="text-[#5a8a72] text-sm mt-1 font-light">Acesso remoto à saúde</p>
        </div>

        {/* Card */}
        <div className="bg-[#111f1a] border border-[#1e3b2e] rounded-2xl p-8">
          <h2 className="text-[#d4ebe0] text-xl mb-1" style={{fontFamily:'Georgia, serif'}}>
            Bem-vindo
          </h2>
          <p className="text-[#4a7a60] text-sm mb-7 font-light">
            Entre com sua conta para continuar
          </p>

          {/* Campo e-mail */}
          <div className="mb-4">
            <label className="block text-[#5a8a72] text-xs uppercase tracking-wider mb-2 font-medium">
              E-mail
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="w-full bg-[#0d1f1a] border border-[#1e3b2e] rounded-xl px-4 py-3
                         text-[#c8e0d4] text-sm placeholder-[#2a4a3a]
                         outline-none focus:border-[#2a9162] transition-colors"
            />
          </div>

          {/* Campo senha */}
          <div className="mb-6">
            <label className="block text-[#5a8a72] text-xs uppercase tracking-wider mb-2 font-medium">
              Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-[#0d1f1a] border border-[#1e3b2e] rounded-xl px-4 py-3
                         text-[#c8e0d4] text-sm placeholder-[#2a4a3a]
                         outline-none focus:border-[#2a9162] transition-colors"
            />
          </div>

          {/* Botão */}
          <button className="w-full bg-[#1e7a52] hover:bg-[#22905f] text-[#e8f5ee]
                             py-3 rounded-xl text-sm font-medium transition-all
                             hover:-translate-y-0.5 active:translate-y-0">
            Entrar
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5 text-[#2a4a3a] text-xs">
            <span className="flex-1 h-px bg-[#1a3330]"/>
            ou
            <span className="flex-1 h-px bg-[#1a3330]"/>
          </div>

          {/* Link cadastro */}
          <p className="text-center text-[#4a7a60] text-sm">
            Não tem conta?{' '}
            <a href="#" className="text-[#4ab882] font-medium hover:underline">
              Cadastre-se
            </a>
          </p>
        </div>

        {/* Badges */}
        <div className="flex justify-center gap-2 mt-5">
          {['Funciona offline', 'Criptografado', 'Acessível'].map(b => (
            <span key={b}
              className="text-[11px] text-[#4a7a60] border border-[#1e3b2e] rounded-full px-3 py-1">
              {b}
            </span>
          ))}
        </div>

      </div>
    </div>
  )
}