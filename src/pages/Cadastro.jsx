import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Cadastro() {
  const navigate = useNavigate()
  
  // Estados para o formulário
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)

  const lidarComCadastro = async (e) => {
    e.preventDefault()
    setCarregando(true)

    // PASSO 1: Criar o usuário no Supabase Auth (O Porteiro)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: senha,
    })

    if (authError) {
      alert("Erro no Auth: " + authError.message)
      setCarregando(false)
      return
    }

    const usuarioUid = authData.user?.id

    if (usuarioUid) {
      // PASSO 2: Salvar Nome e CPF na tabela 'perfis' usando o UID (Os Dados)
      const { error: perfilError } = await supabase
        .from('perfis')
        .insert([
          { id: usuarioUid, nome: nome, cpf: cpf, tipo: 'paciente' }
        ])

      if (perfilError) {
        alert("Erro ao salvar perfil: " + perfilError.message)
      } else {
        alert("Conta criada com sucesso! Agora faça seu login.")
        navigate('/') // Volta para o login
      }
    }

    setCarregando(false)
  }

  return (
    <div className="min-h-screen bg-[#0d1f1a] flex items-center justify-center px-6 py-10 font-sans">
      <div className="w-full max-w-md animate-fadeUp">
        <div className="text-center mb-8">
          <h1 className="text-[#e8f0ec] text-2xl font-semibold tracking-tight" style={{fontFamily:'Georgia, serif'}}>
            Novo Paciente
          </h1>
          <p className="text-[#5a8a72] text-sm mt-1 font-light">Crie sua conta para acessar a TeleSaúde</p>
        </div>

        <form onSubmit={lidarComCadastro} className="bg-[#111f1a] border border-[#1e3b2e] rounded-2xl p-8">
          
          <div className="mb-4">
            <label className="block text-[#5a8a72] text-xs uppercase tracking-wider mb-2 font-medium">Nome Completo</label>
            <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Maria das Graças" className="w-full bg-[#0d1f1a] border border-[#1e3b2e] rounded-xl px-4 py-3 text-[#c8e0d4] text-sm outline-none focus:border-[#2a9162]" />
          </div>

          <div className="mb-4">
            <label className="block text-[#5a8a72] text-xs uppercase tracking-wider mb-2 font-medium">E-mail</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full bg-[#0d1f1a] border border-[#1e3b2e] rounded-xl px-4 py-3 text-[#c8e0d4] text-sm outline-none focus:border-[#2a9162]" />
          </div>

          <div className="mb-4">
            <label className="block text-[#5a8a72] text-xs uppercase tracking-wider mb-2 font-medium">CPF</label>
            <input type="text" required value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" className="w-full bg-[#0d1f1a] border border-[#1e3b2e] rounded-xl px-4 py-3 text-[#c8e0d4] text-sm outline-none focus:border-[#2a9162]" />
          </div>

          <div className="mb-8">
            <label className="block text-[#5a8a72] text-xs uppercase tracking-wider mb-2 font-medium">Sua Senha</label>
            <input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" className="w-full bg-[#0d1f1a] border border-[#1e3b2e] rounded-xl px-4 py-3 text-[#c8e0d4] text-sm outline-none focus:border-[#2a9162]" />
          </div>

          <button type="submit" disabled={carregando} className="w-full bg-[#1e7a52] hover:bg-[#22905f] disabled:bg-[#1a3330] text-[#e8f5ee] py-3 rounded-xl text-sm font-medium transition-all">
            {carregando ? 'Criando conta...' : 'Cadastrar e Continuar'}
          </button>

          <p className="text-center text-[#4a7a60] text-sm mt-5">
            Já tem uma conta? <a href="/" className="text-[#4ab882] font-medium hover:underline">Faça Login</a>
          </p>
        </form>
      </div>
    </div>
  )
}