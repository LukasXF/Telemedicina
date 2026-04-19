import { useNavigate } from 'react-router-dom';

export default function Cadastro() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0d1f1a] flex items-center justify-center px-6 py-10 font-sans">
      <div className="w-full max-w-md animate-fadeUp">

        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-[#e8f0ec] text-2xl font-semibold tracking-tight" style={{fontFamily:'Georgia, serif'}}>
            Novo Paciente
          </h1>
          <p className="text-[#5a8a72] text-sm mt-1 font-light">Crie sua conta para acessar a TeleSaúde</p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-[#111f1a] border border-[#1e3b2e] rounded-2xl p-8">
          
          {/* Nome Completo */}
          <div className="mb-4">
            <label className="block text-[#5a8a72] text-xs uppercase tracking-wider mb-2 font-medium">
              Nome Completo
            </label>
            <input
              type="text"
              placeholder="Ex: Maria das Graças"
              className="w-full bg-[#0d1f1a] border border-[#1e3b2e] rounded-xl px-4 py-3 text-[#c8e0d4] text-sm placeholder-[#2a4a3a] outline-none focus:border-[#2a9162] transition-colors"
            />
          </div>

          {/* CPF e Cartão SUS (Lado a Lado) */}
          <div className="flex gap-4 mb-4">
            <div className="w-1/2">
              <label className="block text-[#5a8a72] text-xs uppercase tracking-wider mb-2 font-medium">
                CPF
              </label>
              <input
                type="text"
                placeholder="000.000.000-00"
                className="w-full bg-[#0d1f1a] border border-[#1e3b2e] rounded-xl px-4 py-3 text-[#c8e0d4] text-sm placeholder-[#2a4a3a] outline-none focus:border-[#2a9162] transition-colors"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-[#5a8a72] text-xs uppercase tracking-wider mb-2 font-medium">
                Cartão SUS (Opcional)
              </label>
              <input
                type="text"
                placeholder="Nº do Cartão"
                className="w-full bg-[#0d1f1a] border border-[#1e3b2e] rounded-xl px-4 py-3 text-[#c8e0d4] text-sm placeholder-[#2a4a3a] outline-none focus:border-[#2a9162] transition-colors"
              />
            </div>
          </div>

          {/* Senha */}
          <div className="mb-8">
            <label className="block text-[#5a8a72] text-xs uppercase tracking-wider mb-2 font-medium">
              Crie uma Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-[#0d1f1a] border border-[#1e3b2e] rounded-xl px-4 py-3 text-[#c8e0d4] text-sm placeholder-[#2a4a3a] outline-none focus:border-[#2a9162] transition-colors"
            />
          </div>

          {/* Botão */}
          <button 
            onClick={() => navigate('/triagem')} 
            className="w-full bg-[#1e7a52] hover:bg-[#22905f] text-[#e8f5ee] py-3 rounded-xl text-sm font-medium transition-all"
          >
            Cadastrar e Continuar
          </button>

          {/* Voltar pro login */}
          <p className="text-center text-[#4a7a60] text-sm mt-5">
            Já tem uma conta?{' '}
            <a href="/" className="text-[#4ab882] font-medium hover:underline">
              Faça Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}