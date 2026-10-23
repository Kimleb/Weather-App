import 'dotenv/config';
import express from 'express';


const app = express();
const PORT = process.env.PORT || 3000;


app.get('/weather', async (req, res) => {
  const cityName = req.query.city;
  if (!cityName) {
    return res.status(400).json({ error: 'Please Provide a city Name. Example: /weather?city=Nakuru' });
  }
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;
    const response = await fetch(apiUrl);
    const data = await response.json();


    if (!response.ok) {
      throw new Error(data.message || 'API Request Failed');
    }

    const CleanResponse = {
      timestamp: new Date().toString(),
      city: data.name,
      country: data.sys.country,
      temperature_celsius: data.main.temp,
      feels_like_celsius: data.main.feels_like,
      condition: data.weather[0].description,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
      latitude: data.coord.lat,
      longitude: data.coord.lon,
      visibility: data.visibility,
      pressure: data.main.pressure,
      cloudiness: data.clouds.all,
      timezone_offset: data.timezone,

    };
    res.json(CleanResponse);
  } catch (error) {
    console.error('Server error or inactive key, using simulated data instead:', error.message);

    // Return the simulated object cleanly to the browser
    return res.json('City not found, kindly use a valid city name. Example:Nakuru,Nairobi,Kisumu,Mombasa'

    );
  }
});

// Landing route for the root "/" path
app.get('/', (_req, res) => {
  res.send('Welcome to the Weather API Wrapper! Use /weather?city=Nakuru to get live metrics.');
});

app.listen(PORT, () => {
  console.log(`Server is running , Go query to find weather information via http://localhost:${PORT}`);
});
