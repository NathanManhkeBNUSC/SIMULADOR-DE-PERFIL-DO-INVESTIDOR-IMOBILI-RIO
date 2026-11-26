"use client";

import { FormEvent, useMemo, useState } from "react";
import { QUESTIONS, type SimulationResult } from "@/lib/profiles";

type ApiResponse = {
  error?: string;
  result?: SimulationResult;
  customerEmailSent?: boolean;
  adminEmailSent?: boolean;
};

const privacyUrl = process.env.NEXT_PUBLIC_PRIVACY_URL ||
  "https://docs.google.com/document/d/1DxDKX5UN56g3krOFmutqNtXKpl9Wc1KK-gTWfJGuObI/edit?tab=t.0#heading=h.snkkdmkfodmp";

export default function Home() {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(6).fill(null));
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);

  const answered = useMemo(() => answers.filter((answer) => answer !== null).length, [answers]);
  const progress = (answered / 6) * 100;

  function selectAnswer(questionIndex: number, optionIndex: number) {
    setAnswers((current) => current.map((value, index) => index === questionIndex ? optionIndex : value));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (answers.some((answer) => answer === null)) {
      setError("Responda às seis perguntas.");
      return;
    }
    if (!consent) {
      setError("É necessário aceitar o aviso de privacidade.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, whatsapp, email, consent, marketing,
          answers: answers as number[], website,
        }),
      });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok || !data.result) throw new Error(data.error || "Não foi possível enviar. Tente novamente.");

      setResult(data.result);
      setEmailSent(Boolean(data.customerEmailSent));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <main className="page-shell">
        <section className="container result-container" aria-live="polite">
          <header className="header">
            <div className="eyebrow">SIMULADOR IMOBILIÁRIO</div>
            <h1>Seu resultado está pronto!</h1>
            <p>Obrigado por participar do nosso simulador.</p>
          </header>
          <div className="result-content">
            <p className="small-label">SEU PERFIL DE INVESTIDOR</p>
            <h2 className="profile-name">{result.profile}</h2>
            <p className="result-description">{result.description}</p>
            <div className="result-section">
              <h3>Estratégia identificada</h3>
              <p>{result.strategy}</p>
            </div>
            <div className="result-section">
              <h3>Orientação imobiliária</h3>
              <p>{result.recommendation}</p>
            </div>
            <p className="disclaimer">Resultado indicativo baseado nas suas respostas. Não representa garantia de rentabilidade nem recomendação individual de investimento.</p>
            <div className={emailSent ? "notice success" : "notice"}>
              {emailSent
                ? "Seu resultado também foi enviado ao seu e-mail."
                : "Seu resultado foi calculado, mas o envio do e-mail não foi confirmado. Entre em contato com nossa equipe para receber uma cópia."}
            </div>
            <button className="secondary-button" onClick={() => window.location.reload()}>Refazer simulador</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="container">
        <header className="header">
          <div className="eyebrow">SIMULADOR IMOBILIÁRIO</div>
          <h1>Descubra seu Perfil de Investidor Imobiliário</h1>
          <p>Conheça a estratégia imobiliária que mais combina com seus objetivos. Responda às seis perguntas e receba seu resultado personalizado.</p>
        </header>

        <form onSubmit={handleSubmit}>
          <section className="form-section">
            <h2><span>1</span> Identificação</h2>
            <div className="field">
              <label htmlFor="name">Nome completo <b>*</b></label>
              <input id="name" autoComplete="name" maxLength={120} required value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">WhatsApp com DDD <b>*</b></label>
              <input id="whatsapp" type="tel" autoComplete="tel" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(44) 99999-9999" />
            </div>
            <div className="field">
              <label htmlFor="email">E-mail <b>*</b></label>
              <input id="email" type="email" autoComplete="email" maxLength={150} required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" />
            </div>
          </section>

          <section className="form-section">
            <h2><span>2</span> Privacidade e proteção de dados</h2>
            <div className="consent-card">
              <label className="check-row">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
                <span><strong>Autorizo o tratamento dos meus dados para participar do simulador.</strong><br />
                  Autorizo a coleta e o tratamento do meu nome, WhatsApp, e-mail e respostas para calcular meu perfil, registrar minhas respostas e enviar meu resultado. Estou ciente dos meus direitos previstos na Lei nº 13.709/2018 (LGPD), inclusive solicitar acesso, correção e revogação do consentimento, pelo canal de privacidade informado pelo responsável.</span>
              </label>
            </div>
            <div className="consent-card">
              <label className="check-row">
                <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
                <span><strong>Autorização opcional para contato comercial.</strong><br />
                  Aceito receber contatos, informações e oportunidades imobiliárias relacionadas aos meus interesses pelo WhatsApp e/ou e-mail. Posso retirar essa autorização a qualquer momento. Esta opção não é necessária para receber meu resultado.</span>
              </label>
            </div>
            <p className="privacy-note">Responsável pelo tratamento: Turma TTI CEEP Maringá 2026.<br />
              Canal de privacidade: <a href="mailto:tticeepmga@gmail.com">tticeepmga@gmail.com</a>.<br />
              <a href={privacyUrl} target="_blank" rel="noopener noreferrer">Consultar Aviso de Privacidade completo ↗</a>
            </p>
          </section>

          <section className="form-section">
            <div className="question-heading">
              <h2><span>3</span> Questionário de perfil</h2>
              <span className="progress-count">{answered} de 6</span>
            </div>
            <div className="progress-track" role="progressbar" aria-valuenow={answered} aria-valuemin={0} aria-valuemax={6} aria-label="Progresso do questionário">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="progress-caption">{answered} de 6 perguntas respondidas</p>

            {QUESTIONS.map((question, questionIndex) => (
              <fieldset className="question-card" key={question.title}>
                <legend>{questionIndex + 1}. {question.title}</legend>
                <div className="options">
                  {question.options.map((option, optionIndex) => (
                    <label className={`option ${answers[questionIndex] === optionIndex ? "selected" : ""}`} key={`${questionIndex}-${optionIndex}`}>
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        value={optionIndex}
                        checked={answers[questionIndex] === optionIndex}
                        onChange={() => selectAnswer(questionIndex, optionIndex)}
                        required
                      />
                      <span className="radio-custom" />
                      <span>{String.fromCharCode(65 + optionIndex)}) {option.text}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </section>

          <div className="honeypot" aria-hidden="true">
            <label htmlFor="website">Não preencher</label>
            <input id="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>

          {error && <div className="error-message" role="alert">{error}</div>}
          <button className="submit-button" type="submit" disabled={loading}>
            {loading ? "ANALISANDO SEU PERFIL..." : "DESCOBRIR MEU PERFIL"}
          </button>
          <p className="footer-note">Seus dados serão utilizados conforme o Aviso de Privacidade.</p>
        </form>
      </section>
    </main>
  );
}
