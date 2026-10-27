import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit'; 
import cors from 'cors';// New security feature recommendation

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));

// --- 1. GLOBAL SECURITY & INFRASTRUCTURE CONFIG ---
app.set('trust proxy', 1); // Crucial for reverse proxies & rate limiters
app.use(helmet());
app.use(express.json());

// Real API Rate Limiter (Max 100 requests per 15 minutes per IP address)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/weather', apiLimiter); // Apply only to your weather data route

// --- 2. SESSION SYSTEM INITIALIZATION (MUST BE BEFORE ROUTES) ---
const isProduction = process.env.NODE_ENV === 'production';

console.log("--- DIAGNOSTIC CHECK ---");
console.log("SESSION_SECRET VALUE IS:", process.env.SESSION_SECRET ? "Loaded Successfully ✅" : "Using fallback ⚠️");
console.log("------------------------");

app.use(session({
  name: 'server_sid',
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET || 'temporary_development_fallback_secret', 
  cookie: { 
    httpOnly: true, // Prevents browser JavaScript XSS access
    secure: isProduction, // TRUE forces HTTPS in production, FALSE allows testing on HTTP localhost
    sameSite: 'strict', // Strong CSRF defense
    maxAge: 1000 * 60 * 15 // 15 minutes
  }
}));

// --- 3. APPLICATION ROUTES ---

// Landing route
app.get('/', (_req, res) => {
  res.send('Welcome to the Weather API Wrapper! Use /weather?city=Nakuru to get live metrics.');
});

// Session Testing Endpoint
app.get('/session', (req, res) => {
  if (!req.session.views) {
    req.session.views = 1;
  } else {
    req.session.views++;
  }
  res.send(`You have viewed this Page ${req.session.views} times`);
});

// Live Weather Aggregator
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
      sunrise_unix: data.sys.sunrise,
      sunset_unix: data.sys.sunset,
      latitude: data.coord.lat,
      longitude: data.coord.lon,
      visibility: data.visibility,
      pressure: data.main.pressure,
      cloudiness: data.clouds.all,
      timezone_offset: data.timezone,
    };
    
    res.json(CleanResponse);
  } catch (error) {
    console.error('Server error or inactive key:', error.message);
    return res.status(404).json({ error: 'City not found, kindly use a valid city name. Example: Nakuru, Nairobi, Kisumu, Mombasa' });
  }
});

export default app;

if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Weather API running on port ${PORT}`);
  });
}
