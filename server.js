
const express = require('express');
const path = require('path');
const SuperSaaSClient = require('supersaas-nodejs-api-client');

const app = express();
const port = process.env.PORT || 3000;

const client = new SuperSaaSClient({
  accountName: process.env.SUPERSAAS_ACCOUNT_NAME,
  apiKey: process.env.SUPERSAAS_API_KEY
});

app.use(express.static(path.join(__dirname, 'static')));

app.get('/api/prenotazioni-attive', async (req, res) => {
  try {
    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

    const appointments = await client.appointments.list(
      process.env.SUPERSAAS_SCHEDULE_ID,
      {
        from: now.toISOString(),
        to: inOneHour.toISOString()
      }
    );

    const occupate = appointments
      .filter(a => new Date(a.start) <= now && new Date(a.finish) >= now)
      .map(a => a.resource);

    res.json(occupate);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Errore recupero prenotazioni' });
  }
});

app.listen(port, () => {
  console.log(`Server in ascolto su porta ${port}`);
});
