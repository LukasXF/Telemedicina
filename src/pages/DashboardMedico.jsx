// ... no início do componente DashboardMedico
const pacientesReais = data || []
const silvioSantosFixo = {
  id: 'demo-silvio',
  paciente_nome: "Silvio Santos (Demonstração)",
  sintomas: ["Dor no Corpo", "Cansaço"],
  prioridade: "BAIXA",
  isDemo: true
}
setPacientes([silvioSantosFixo, ...pacientesReais])