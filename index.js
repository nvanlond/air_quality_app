const express = require('express');
const supabaseClient = require('@supabase/supabase-js');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
const supabaseURL = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseURL, supabaseKey);

app.get('/', (req, res) => {
  res.sendFile('public/index.html', { root: __dirname });
});

app.get('/comments', async (req, res) => {
  const { city } = req.query;

  if (!city) return res.status(400).json({ error: 'city is required' });

  const { data, error } = await supabase.from('comments').select().eq('city', city).order('created_at', { ascending: false });

  if (error) return res.status(500).send(error);
  res.send(data);
});

app.post('/comments', async (req, res) => {
  const { username, comment, city } = req.body;
  const { data, error } = await supabase
    .from('comments')
    .insert({ username, comment, city })
    .select();
  if (error) return res.status(500).send(error);
  res.send(data);
});

app.get('/openaq/pm25', async (req, res) => {
  const bbox = req.query.bbox;
  const dateFrom = req.query.start;
  const dateTo = req.query.end;
  const apiKey = process.env.OPENAQ_KEY;

  if (!bbox || !dateFrom || !dateTo) return res.status(400).json({ error: 'bbox is required' });

  try {
    const locResponse = await fetch(`https://api.openaq.org/v3/locations?bbox=${bbox}&limit=1000`, {
      headers: { 'X-API-Key': apiKey }
    });

    const locJson = await locResponse.json();
    const locations = locJson.results || [];

    const sensorIds = [];
    for (const loc of locations) {
      if (loc.sensors) {
        for (const sensor of loc.sensors) {
          if (sensor.parameter?.name === 'pm25') {
            sensorIds.push(sensor.id);
          }
        }
      }
    }

    const allMeasurements = [];

    for (const id of sensorIds.slice(0, 10)) {
      console.log(`Trying sensor ${id}`);
      const mRes = await fetch(
        `https://api.openaq.org/v3/sensors/${id}/days/monthly?date_from=${dateFrom}T00:00:00Z&date_to=${dateTo}T00:00:00Z`,
        { headers: { 'X-API-Key': apiKey } }
      );
      const mJson = await mRes.json();
      
      mJson.results.forEach(m => {
        if (m?.period?.datetimeFrom?.utc && typeof m.value === 'number') {
          allMeasurements.push({
            timestamp: m.period.datetimeFrom.utc,
            value: m.value,
            unit: m.parameter?.units || 'µg/m³'
          });
        }
      });
    }

    allMeasurements.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const groupedByMonth = {};

    allMeasurements.forEach(entry => {
      const month = entry.timestamp.slice(0, 7); // "YYYY-MM"
      if (!groupedByMonth[month]) {
        groupedByMonth[month] = [];
      }
      groupedByMonth[month].push(entry.value);
    });

    const averagedPerMonth = Object.entries(groupedByMonth).map(([month, values]) => {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return {
        timestamp: month + "-01T00:00:00Z", // First day of the month
        value: avg
      };
    });

    res.json(averagedPerMonth);
  } catch (err) {
    console.error('OpenAQ fetch failed:', err);
    res.status(500).json({ error: 'Failed to fetch OpenAQ data' });
  }
});

app.listen(port, () => {
  console.log('APP IS ALIVEEE', port);
});
