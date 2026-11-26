import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateProfile } from "@/lib/profiles";
import { appendLeadRow, updateEmailStatus } from "@/lib/google-sheets";
import { sendAdminNotification, sendCustomerResult } from "@/lib/email";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo.").max(120),
  whatsapp: z.string().trim().min(10).max(25),
  email: z.string().trim().email("Informe um e-mail válido.").max(150),
  consent: z.literal(true, { errorMap: () => ({ message: "É necessário aceitar o aviso de privacidade." }) }),
  marketing: z.boolean(),
  answers: z.array(z.number().int().min(0).max(5)).length(6, "Responda às seis perguntas."),
  website: z.string().max(0).optional().default(""),
});

function safeCell(value: string) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos." }, { status: 400 });
    }

    const data = parsed.data;
    if (data.website) return NextResponse.json({ error: "Envio inválido." }, { status: 400 });

    const digits = data.whatsapp.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) {
      return NextResponse.json({ error: "Informe um WhatsApp válido com DDD." }, { status: 400 });
    }

    const result = calculateProfile(data.answers);
    const now = new Date();
    const answersText = JSON.stringify(data.answers);
    const scoreText = JSON.stringify(result.score);

    // Mantém a ordem e os 14 campos do CRM original (A:N).
    const row = [
      now.toISOString(),
      safeCell(data.name),
      safeCell(data.whatsapp),
      safeCell(data.email.toLowerCase()),
      "SIM",
      data.marketing ? "SIM" : "NÃO",
      "2.0",
      now.toISOString(),
      result.profile,
      result.strategy,
      answersText,
      scoreText,
      "Novo lead",
      "Pendente",
    ];

    const { rowNumber } = await appendLeadRow(row);

    let customerEmailSent = false;
    let adminEmailSent = false;

    try {
      await sendCustomerResult(data.name, data.email.toLowerCase(), result);
      customerEmailSent = true;
    } catch (error) {
      console.error("Falha no e-mail do participante:", error);
    }

    try {
      await sendAdminNotification({
        name: data.name, whatsapp: data.whatsapp, email: data.email.toLowerCase(),
        result, marketing: data.marketing,
      });
      adminEmailSent = true;
    } catch (error) {
      console.error("Falha na notificação administrativa:", error);
    }

    if (rowNumber) {
      try {
        await updateEmailStatus(rowNumber, customerEmailSent ? "Enviado" : "Falha no envio");
      } catch (error) {
        console.error("Falha ao atualizar status do e-mail na planilha:", error);
      }
    }

    return NextResponse.json({
      result,
      customerEmailSent,
      adminEmailSent,
    });
  } catch (error) {
    console.error("Erro ao processar lead:", error);
    return NextResponse.json({
      error: "Não foi possível concluir o envio. Verifique a configuração do sistema e tente novamente.",
    }, { status: 500 });
  }
}
