const express = require('express');
const twilio = require('twilio');
require('dotenv').config();
const app = express();

app.use(express.json());
app.use(express.static('public')); // Serve arquivos estáticos da pasta 'public'

// Rota para envio de SMS
app.post('/send-sms', async (req, res) => {
  const { fromNumber, toNumber, message } = req.body;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken || !fromNumber || !toNumber || !message) {
    return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
  }

  const e164Regex = /^\+[1-9]\d{1,14}$/;
  if (!e164Regex.test(fromNumber) || !e164Regex.test(toNumber)) {
    return res.status(400).json({ success: false, message: 'Números de telefone devem estar no formato E.164 (ex.: +5511999999999).' });
  }

  try {
    const client = twilio(accountSid, authToken);
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber
    });
    res.json({ success: true, message: `SMS enviado para ${toNumber} com SID: ${result.sid}` });
  } catch (error) {
    res.status(500).json({ success: false, message: `Erro ao enviar SMS: ${error.message} (Código: ${error.code})` });
  }
});

// Iniciar o servidor localmente
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;