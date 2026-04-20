// ... dentro do Consulta.jsx
<div className="flex flex-col gap-3">
  <button 
    onClick={() => setChamadaAtiva(true)}
    className="w-full bg-[#1e7a52] hover:bg-[#22905f] text-[#e8f5ee] py-3.5 rounded-xl text-sm font-medium"
  >
    Entrar na Chamada (Simular Aceite)
  </button>
  
  <button 
    onClick={() => navigate('/triagem')}
    className="w-full border border-[#2a6b52] text-[#4ab882] py-3.5 rounded-xl text-sm font-medium hover:bg-[#1a3d30]"
  >
    Editar Minha Triagem
  </button>
</div>