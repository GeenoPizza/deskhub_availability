import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'static')));

app.get('/api/prenotazioni-attive', async (req, res) => {
  try {
    const accountName = process.env.SUPERSAAS_ACCOUNT_NAME;
    const apiKey = process.env.SUPERSAAS_API_KEY;
    const scheduleId = process.env.SUPERSAAS_SCHEDULE_ID;

    if (!accountName || !apiKey || !scheduleId) {
      return res.status(500).json({ error: 'Variabili ambiente mancanti' });
    }

    const now = new Date();
    const from = now.toISOString();
    const to = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

    const url = `https://www.supersaas.com/api/appointments?schedule_id=${scheduleId}&from=${from}&to=${to}`;

    // Base64 encode API key (user is empty, so apiKey:)
const auth = Buffer.from(`:${apiKey}`).toString('base64');

    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Errore API SuperSaaS:', text);
      return res.status(500).json({ error: 'Errore API SuperSaaS' });
    }

    const appointments = await response.json();

    // Filtra solo quelli attivi ora
    const occupate = appointments.filter(a => {
      const start = new Date(a.start);
      const end = new Date(a.finish);
      return start <= now && end >= now;
    }).map(a => a.resource);

    res.json(occupate);

  } catch (error) {
    console.error('Errore server:', error);
    res.status(500).json({ error: 'Errore interno server' });
  }
});

app.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
});
