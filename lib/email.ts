import { Resend } from "resend";
import type { SimulationResult } from "./profiles";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY não configurada.");
  return new Resend(key);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[char] || char);
}

function baseEmail(content: string) {
  return `<div style="font-family:Arial,sans-serif;color:#253247;max-width:600px;margin:auto">
    <div style="background:#17365D;color:white;padding:25px;border-radius:10px">
      <h2 style="margin:0">Seu perfil de investidor imobiliário</h2>
      <p style="color:#e5edf7">Obrigado por participar do nosso simulador!</p>
    </div>
    <div style="padding:20px;border:1px solid #ddd;border-radius:10px;margin-top:15px">${content}</div>
    <p style="font-size:12px;color:#777">Resultado indicativo, sem garantia de rentabilidade ou recomendação individual de investimento.</p>
  </div>`;
}

export async function sendCustomerResult(name: string, email: string, result: SimulationResult) {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("EMAIL_FROM não configurado.");

  const resend = getResend();
  const safeName = escapeHtml(name);
  const html = baseEmail(`
    <p>Olá, ${safeName}!</p>
    <h2 style="color:#17365D">${escapeHtml(result.profile)}</h2>
    <p>${escapeHtml(result.description)}</p>
    <h3>Estratégia identificada</h3><p>${escapeHtml(result.strategy)}</p>
    <h3>Orientação imobiliária</h3><p>${escapeHtml(result.recommendation)}</p>
  `);

  const response = await resend.emails.send({
    from, to: email, subject: "Seu perfil de investidor imobiliário",
    html,
    text: `Olá, ${name}!\n\nSeu perfil: ${result.profile}\n\n${result.description}\n\nEstratégia: ${result.strategy}\n\nOrientação: ${result.recommendation}\n\nResultado indicativo, sem garantia de rentabilidade ou recomendação individual de investimento.`,
  });

  if (response.error) throw new Error(response.error.message);
}

export async function sendAdminNotification(data: {
  name: string; whatsapp: string; email: string; result: SimulationResult; marketing: boolean;
}) {
  const from = process.env.EMAIL_FROM;
  const admin = process.env.EMAIL_ADMIN;
  if (!from || !admin) throw new Error("Remetente ou e-mail administrativo não configurado.");

  const resend = getResend();
  const html = baseEmail(`
    <h2>Novo participante no simulador</h2>
    <p><b>Nome:</b> ${escapeHtml(data.name)}</p>
    <p><b>WhatsApp:</b> ${escapeHtml(data.whatsapp)}</p>
    <p><b>E-mail:</b> ${escapeHtml(data.email)}</p>
    <p><b>Perfil:</b> ${escapeHtml(data.result.profile)}</p>
    <p><b>Estratégia:</b> ${escapeHtml(data.result.strategy)}</p>
    <p><b>Autorização comercial:</b> ${data.marketing ? "SIM" : "NÃO"}</p>
  `);

  const response = await resend.emails.send({
    from, to: admin, subject: `Novo lead imobiliário - ${data.name}`,
    html,
    text: `Novo participante no simulador.\n\nNome: ${data.name}\nWhatsApp: ${data.whatsapp}\nE-mail: ${data.email}\nPerfil: ${data.result.profile}\nEstratégia: ${data.result.strategy}\nAutorização comercial: ${data.marketing ? "SIM" : "NÃO"}`,
  });

  if (response.error) throw new Error(response.error.message);
}
