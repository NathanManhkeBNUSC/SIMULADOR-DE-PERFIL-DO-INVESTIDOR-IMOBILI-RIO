export type ProfileCode = "A" | "B" | "C" | "D" | "E" | "F";

export type Question = {
  title: string;
  options: { text: string; code: ProfileCode | "0" }[];
};

export const PROFILES: Record<ProfileCode, {
  name: string;
  description: string;
  strategy: string;
  recommendation: string;
}> = {
  A: {
    name: "Investidor Patrimonial",
    description: "Seu interesse está na construção de patrimônio e na geração de renda recorrente.",
    strategy: "Locação residencial e aquisição de imóveis para renda.",
    recommendation: "Avalie localização, demanda de aluguel, vacância, manutenção e rentabilidade líquida.",
  },
  B: {
    name: "Investidor Rentabilizador",
    description: "Você demonstra interesse em rentabilizar imóveis por meio de locações de curta duração.",
    strategy: "Locação por temporada e plataformas digitais.",
    recommendation: "Analise ocupação, sazonalidade, despesas operacionais, mobiliário e regras locais.",
  },
  C: {
    name: "Investidor Estratégico",
    description: "Você busca ampliar seu patrimônio por meio de planejamento financeiro e crédito imobiliário.",
    strategy: "Aquisição financiada e alavancagem patrimonial.",
    recommendation: "Compare entrada, taxas, CET, prazo de financiamento e capacidade de pagamento.",
  },
  D: {
    name: "Investidor Visionário",
    description: "Você identifica oportunidades de valorização em empreendimentos imobiliários em construção.",
    strategy: "Compra de imóveis na planta e possível revenda.",
    recommendation: "Avalie incorporadora, registro da incorporação, contrato, prazo de entrega e riscos de mercado.",
  },
  E: {
    name: "Investidor Oportunista",
    description: "Você busca oportunidades de compra abaixo do valor de mercado para agregar valor ao imóvel.",
    strategy: "Compra, reforma e revenda.",
    recommendation: "Analise documentação, custos de reforma, prazo, margem de revenda e riscos.",
  },
  F: {
    name: "Comprador Planejador",
    description: "Sua prioridade é adquirir um imóvel para moradia, com planejamento e segurança patrimonial.",
    strategy: "Compra residencial para uso próprio.",
    recommendation: "Compare compra e aluguel, localização, documentação e custos de aquisição.",
  },
};

export const QUESTIONS: Question[] = [
  {
    title: "Qual é seu principal objetivo ao investir em imóveis?",
    options: [
      { text: "Receber renda mensal por meio de aluguel.", code: "A" },
      { text: "Gerar renda com locações por temporada.", code: "B" },
      { text: "Comprar imóveis financiados para ampliar meu patrimônio.", code: "C" },
      { text: "Comprar na planta e revender após a valorização.", code: "D" },
      { text: "Comprar abaixo do valor de mercado, reformar e vender.", code: "E" },
      { text: "Adquirir um imóvel para morar futuramente.", code: "F" },
    ],
  },
  {
    title: "Qual prazo você considera ideal para alcançar seu objetivo?",
    options: [
      { text: "Curto prazo, buscando oportunidades de revenda.", code: "E" },
      { text: "Médio prazo, aguardando valorização imobiliária.", code: "D" },
      { text: "Longo prazo, construindo patrimônio.", code: "A" },
      { text: "Imediato, buscando renda recorrente.", code: "A" },
      { text: "Flexível, dependendo da oportunidade.", code: "0" },
      { text: "Médio ou longo prazo, pensando em moradia.", code: "F" },
    ],
  },
  {
    title: "Qual seria sua disponibilidade financeira inicial?",
    options: [
      { text: "Tenho capital para adquirir um imóvel à vista.", code: "A" },
      { text: "Tenho recursos para dar uma entrada e financiar.", code: "C" },
      { text: "Tenho capital reservado para comprar e reformar.", code: "E" },
      { text: "Tenho recursos para investir em imóveis na planta.", code: "D" },
      { text: "Tenho capital para mobiliar e explorar locações por temporada.", code: "B" },
      { text: "Ainda estou formando minha reserva financeira.", code: "F" },
    ],
  },
  {
    title: "Qual nível de envolvimento você deseja ter com seu investimento?",
    options: [
      { text: "Quero receber aluguel e ter pouca participação na operação.", code: "A" },
      { text: "Aceito administrar reservas e locações por temporada.", code: "B" },
      { text: "Prefiro acompanhar o financiamento e a valorização patrimonial.", code: "C" },
      { text: "Quero acompanhar a obra e negociar a revenda.", code: "D" },
      { text: "Aceito administrar reformas e melhorias.", code: "E" },
      { text: "Quero encontrar um imóvel adequado para minha moradia.", code: "F" },
    ],
  },
  {
    title: "Como você se comporta diante dos riscos financeiros?",
    options: [
      { text: "Prefiro segurança e previsibilidade de renda.", code: "A" },
      { text: "Aceito oscilações para buscar maior rentabilidade.", code: "B" },
      { text: "Aceito compromissos financeiros de longo prazo.", code: "C" },
      { text: "Aceito aguardar a valorização do imóvel.", code: "D" },
      { text: "Aceito riscos de reforma em troca de maior margem de lucro.", code: "E" },
      { text: "Prefiro preservar meu capital e evitar riscos elevados.", code: "F" },
    ],
  },
  {
    title: "Qual oportunidade imobiliária mais despertaria seu interesse hoje?",
    options: [
      { text: "Apartamento para locação residencial.", code: "A" },
      { text: "Imóvel para Airbnb ou locação por temporada.", code: "B" },
      { text: "Imóvel financiado com potencial de valorização.", code: "C" },
      { text: "Apartamento na planta com potencial de revenda.", code: "D" },
      { text: "Imóvel abaixo do preço de mercado para reforma e revenda.", code: "E" },
      { text: "Imóvel residencial para compra e moradia.", code: "F" },
    ],
  },
];

export type SimulationResult = {
  profile: string;
  description: string;
  strategy: string;
  recommendation: string;
  score: Record<ProfileCode, number>;
  tie: boolean;
};

export function calculateProfile(answerIndexes: number[]): SimulationResult {
  if (!Array.isArray(answerIndexes) || answerIndexes.length !== 6 ||
      answerIndexes.some((n) => !Number.isInteger(n) || n < 0 || n > 5)) {
    throw new Error("Responda às seis perguntas.");
  }

  const score: Record<ProfileCode, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };

  answerIndexes.forEach((answerIndex, questionIndex) => {
    const code = QUESTIONS[questionIndex].options[answerIndex].code;
    if (code !== "0") score[code] += 1;
  });

  const highest = Math.max(...Object.values(score));
  if (highest === 0) throw new Error("Não foi possível calcular o perfil.");

  const winners = (Object.keys(score) as ProfileCode[]).filter((key) => score[key] === highest);
  const tie = winners.length > 1;
  const selected = winners.map((key) => PROFILES[key]);

  return {
    profile: tie ? `Perfil Misto: ${selected.map((p) => p.name).join(" + ")}` : selected[0].name,
    description: tie
      ? "Suas respostas demonstram características de diferentes estratégias imobiliárias. Uma avaliação consultiva poderá identificar a alternativa mais adequada aos seus objetivos."
      : selected[0].description,
    strategy: selected.map((p) => p.strategy).join(" | "),
    recommendation: tie
      ? "Compare as estratégias identificadas considerando seu capital disponível, prazo, capacidade financeira e tolerância a riscos."
      : selected[0].recommendation,
    score,
    tie,
  };
}
