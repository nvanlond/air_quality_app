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
    res.sendFile('public/air_quality_app.html', { root: __dirname });
})

app.get('/air_quality_data', async (req, res) => {
  console.log("attempting to get air_quality_data");
  const { data, error } = await supabase.from('air_quality_data').select();
  if (error) {
    console.log('Error');
    res.send(error);
  } else {
    res.send(data);
  }
});

app.post('/air_quality_data', async (req, res) => {
  console.log('Adding data');

  console.log(req.body);
  const city = req.body.city;
  const date = req.body.date;
  const parameter = req.body.parameter;
  const value = req.body.value;
  const unit = req.body.unit;

  const { data, error } = await supabase
    .from('air_quality_data')
    .insert({
      city: city, 
      date: date,
      parameter: parameter,
      value: value, 
      unit: unit 
    })
    .select();

  if (error) {
    console.log('Error:', error);
    res.statusCode = 500;
    res.send(error);
  }

  res.send(data);
});

app.listen(port, () => {
  console.log('APP IS ALIVEEE', port);
});