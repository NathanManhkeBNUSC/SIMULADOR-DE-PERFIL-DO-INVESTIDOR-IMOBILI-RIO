# Simulador de Perfil do Investidor Imobiliário — Next.js

Projeto convertido para Next.js mantendo o Google Sheets como CRM. O sistema **não cria outra planilha**: ele acrescenta novas linhas à aba `Leads` da planilha existente, preservando os registros anteriores.

## Funcionalidades

- Cadastro de nome, WhatsApp e e-mail.
- Seis perguntas com a mesma redação e lógica do simulador original.
- Cálculo dos seis perfis e identificação de empates (perfil misto).
- Consentimento LGPD obrigatório e autorização comercial opcional.
- Registro dos 14 campos na aba `Leads`.
- Envio do resultado ao participante.
- Notificação de novo lead ao administrador.
- Atualização do status do e-mail na coluna N.
- Layout responsivo para celular e computador.

## Requisitos

- Node.js 20.9 ou superior.
- Uma conta Google com acesso à planilha CRM existente.
- Um projeto Google Cloud com Google Sheets API ativada.
- Uma conta Resend e um domínio remetente verificado para envio de e-mails.

## 1. Instalar dependências

```bash
npm install
```

## 2. Configurar acesso à planilha existente

1. Acesse o Google Cloud Console e crie ou selecione um projeto.
2. Ative a **Google Sheets API**.
3. Crie uma conta de serviço (Service Account).
4. Gere uma chave JSON para essa conta.
5. Copie o e-mail da conta de serviço e o valor `private_key` do JSON.
6. Abra a planilha CRM que já existe e compartilhe-a com o e-mail da conta de serviço, dando permissão de **Editor**.
7. Copie o ID da planilha: é o trecho entre `/d/` e `/edit` no endereço da planilha.
8. Confirme que a aba se chama exatamente `Leads` e que as 14 colunas A:N estão na ordem abaixo.

**Importante:** não execute `setup()` e não crie uma nova planilha. A aplicação usa o ID da planilha existente e somente acrescenta linhas.

### Ordem das 14 colunas (A:N)

1. Data e hora
2. Nome
3. WhatsApp
4. E-mail
5. Consentimento necessário
6. Consentimento comercial
7. Versão do aviso
8. Data do consentimento
9. Perfil identificado
10. Estratégia
11. Respostas
12. Pontuação
13. Status comercial
14. Status do e-mail

Se a planilha atual tiver colunas em outra ordem, ajuste o array `row` em `app/api/submit/route.ts` antes de publicar.

## 3. Configurar e-mail

1. Crie uma conta em https://resend.com/.
2. Cadastre e verifique o domínio que será usado como remetente.
3. Crie uma API Key.
4. Configure `RESEND_API_KEY` e `EMAIL_FROM`.
5. Configure `EMAIL_ADMIN` com o endereço que receberá as notificações.

O Resend substitui o `MailApp` do Google Apps Script nesta versão Next.js. A chave fica somente no servidor, nunca no navegador.

## 4. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=...
GOOGLE_SHEETS_RANGE=Leads!A:N

RESEND_API_KEY=...
EMAIL_FROM=Simulador Imobiliário <nao-responda@seudominio.com.br>
EMAIL_ADMIN=tticeepmga@gmail.com
```

Não compartilhe o arquivo `.env.local`, a chave privada ou a API Key. Não coloque essas credenciais em variáveis `NEXT_PUBLIC_`.

## 5. Executar localmente

```bash
npm run dev
```

Abra http://localhost:3000.

Para validar a compilação:

```bash
npm run build
```

## 6. Publicar

A aplicação pode ser publicada em uma hospedagem que suporte Node.js e Next.js (por exemplo, VPS com Node.js ou plataforma compatível).

Na hospedagem:
1. Envie o projeto ou conecte o repositório Git.
2. Configure todas as variáveis de ambiente do `.env.example`.
3. Execute `npm install`.
4. Execute `npm run build`.
5. Inicie com `npm start` (ou o comando de inicialização recomendado pela hospedagem).
6. Configure domínio e HTTPS.

A publicação do Next.js é independente da publicação antiga do Apps Script. Depois de validar o novo endereço, você pode decidir se mantém ou desativa o aplicativo web antigo. Não apague a planilha.

## 7. Teste antes de divulgar

Faça um envio de teste e confira:

- A tela apresenta o perfil calculado.
- A nova linha aparece na aba `Leads`.
- As colunas A:N receberam os valores corretos.
- O e-mail do participante chega.
- O administrador recebe a notificação.
- A coluna N muda de `Pendente` para `Enviado` ou `Falha no envio`.

Teste também respostas que gerem empate para confirmar o perfil misto.

## Observações importantes

- O código mantém a regra de pontuação original. Na pergunta 2, a alternativa “Flexível, dependendo da oportunidade” não soma ponto.
- As respostas são gravadas como índices de 0 a 5 em JSON, mas o cálculo usa o código de perfil de cada alternativa. Isso corrige a incompatibilidade existente entre o HTML antigo (índices numéricos) e o Apps Script (que esperava letras).
- A aplicação não lê nem altera linhas antigas da planilha; apenas acrescenta novas linhas e atualiza a coluna N da linha recém-inserida.
- O envio de e-mail é feito pelo Resend. Configure e verifique o remetente antes de testar.
- Para produção, configure também proteção contra abuso/rate limiting na hospedagem ou em um serviço de borda. O campo honeypot é apenas uma proteção básica contra bots.
- Revise o aviso de privacidade e os prazos de retenção com o responsável pelo tratamento de dados antes de colocar o formulário em produção.
