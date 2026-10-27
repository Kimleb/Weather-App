import { useState } from 'react';
import {
  Sun, CloudSun, Cloud, CloudRain, CloudLightning, Snowflake,
  CloudFog, Wind, MoonStar, Droplets, Gauge, Eye, Sunrise,
  Sunset, MapPin, Search, LoaderCircle, CloudDrizzle, Thermometer,
  Compass, CalendarDays
} from 'lucide-react';

const weatherIcon = (description = '') => {
  const d = description.toLowerCase();
  if (d.includes('thunder')) return CloudLightning;
  if (d.includes('snow') || d.includes('sleet')) return Snowflake;
  if (d.includes('drizzle')) return CloudDrizzle;
  if (d.includes('rain')) return CloudRain;
  if (d.includes('fog') || d.includes('mist') || d.includes('haze') || d.includes('smoke')) return CloudFog;
  if (d.includes('cloud') && (d.includes('few') || d.includes('scattered') || d.includes('broken'))) return CloudSun;
  if (d.includes('cloud')) return Cloud;
  if (d.includes('clear')) return Sun;
  return CloudSun;
};

const iconForTime = (value, Icon) => <Icon size={21} strokeWidth={1.8} aria-hidden="true" />;

function formatTime(dateValue, timezoneOffset = 0) {
  if (!dateValue) return '—';
  // OpenWeather gives Unix timestamps in seconds. Apply the city's UTC offset.
  const date = new Date((dateValue + timezoneOffset) * 1000);
  return date.toLocaleTimeString('en-GB', {
    timeZone: 'UTC', hour: '2-digit', minute: '2-digit'
  });
}

function Detail({ icon: Icon, label, value, unit = '' }) {
  return (
    <div className="detail">
      <div className="detail-icon"><Icon size={19} strokeWidth={1.8} /></div>
      <div className="detail-copy">
        <span className="detail-label">{label}</span>
        <strong>{value ?? '—'}{value !== undefined && value !== null ? unit : ''}</strong>
      </div>
    </div>
  );
}

export default function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [searchedCity, setSearchedCity] = useState('Nairobi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function searchWeather(event) {
    event?.preventDefault();
    const query = city.trim() || searchedCity;
    if (!query) {
      setError('Enter a city name to get its current weather.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/weather?city=${encodeURIComponent(query)}`);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || data?.message || 'Unable to retrieve weather. Please try again.');
      }
      // The backend currently returns a string when the API fails. Do not treat it as weather data.
      if (!data || typeof data !== 'object' || Array.isArray(data) || !('temperature_celsius' in data)) {
        throw new Error(typeof data === 'string' ? data : 'The server returned an unexpected response. Check your API key and backend logs.');
      }
      setWeather(data);
      setSearchedCity(data.city || query);
      setCity('');
    } catch (err) {
      setWeather(null);
      setError(err.message || 'Could not connect to the weather server. Make sure your Node.js backend is running.');
    } finally {
      setLoading(false);
    }
  }

  const ConditionIcon = weatherIcon(weather?.condition);
  const now = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Weatherly home">
          <span className="brand-mark"><CloudSun size={26} strokeWidth={1.8} /></span>
          <span>weatherly<span className="brand-period">.</span></span>
        </a>
        <div className="topbar-right">
          <span className="live-dot" />
          <span>Live Weather Updates</span>
        </div>
      </header>

      <section className="intro">
        <p className="eyebrow"><span className="eyebrow-line" /> YOUR DAY, IN CONTEXT</p>
        <h1>Kimleb Companies Weather <em>Station</em></h1>
        <p className="intro-subtitle">A little more clarity for wherever life takes you.</p>

        <form className="search-form" onSubmit={searchWeather}>
          <Search size={20} className="search-icon" />
          <input
            aria-label="City name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search a city — e.g. Nairobi, London"
          />
          <button type="submit" disabled={loading}>
            {loading ? <LoaderCircle size={18} className="spin" /> : 'Search'}
          </button>
        </form>
        <div className="quick-cities">
          <span>TRY</span>
          {['Nairobi', 'London', 'Tokyo', 'New York'].map((name) => (
            <button key={name} type="button" onClick={() => { setCity(name); }} className="city-chip">
              {name}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <div className="error-banner" role="alert">
          <span className="error-mark">!</span>
          <div><strong>We couldn't get that weather.</strong><p>{error}</p></div>
        </div>
      )}

      {weather ? (
        <section className="weather-layout" aria-live="polite">
          <article className="current-card">
            <div className="current-card-top">
              <div className="location">
                <span className="location-pin"><MapPin size={16} /></span>
                <div>
                  <h2>{weather.city}</h2>
                  <p>{weather.country || 'Current location'} <span className="location-separator">/</span> {now}</p>
                </div>
              </div>
              <span className="current-label"><span className="live-dot" /> LIVE WEATHER</span>
            </div>

            <div className="hero-weather">
              <div className="hero-temp">
                <div className="condition-icon"><ConditionIcon size={72} strokeWidth={1.35} /></div>
                <div>
                  <div className="temperature">{Math.round(weather.temperature_celsius)}<span>°</span></div>
                  <p className="condition-text">{weather.condition || 'Current conditions'}</p>
                  <p className="feels-like">Feels like {Math.round(weather.feels_like_celsius)}°C</p>
                </div>
              </div>
              <div className="hero-divider" />
              <div className="hero-summary">
                <div><span>Humidity</span><strong>{weather.humidity}%</strong></div>
                <div><span>Wind speed</span><strong>{weather.wind_speed} m/s</strong></div>
                <div><span>Pressure</span><strong>{weather.pressure} hPa</strong></div>
              </div>
            </div>

            <div className="sun-times">
              <div className="sun-time-icon sunrise"><Sunrise size={24} /></div>
              <div><span>Sunrise</span><strong>{formatTime(weather.sunrise, weather.timezone_offset)}</strong></div>
              <div className="sun-time-icon sunset"><Sunset size={24} /></div>
              <div><span>Sunset</span><strong>{formatTime(weather.sunset, weather.timezone_offset)}</strong></div>
            </div>
          </article>

          <aside className="details-card">
            <div className="section-heading">
              <div><p className="eyebrow small">THE DETAILS</p><h3>At a glance</h3></div>
              <span className="heading-symbol"><Compass size={20} /></span>
            </div>
            <div className="details-grid">
              <Detail icon={Droplets} label="Humidity" value={weather.humidity} unit="%" />
              <Detail icon={Wind} label="Wind speed" value={weather.wind_speed} unit=" m/s" />
              <Detail icon={Gauge} label="Pressure" value={weather.pressure} unit=" hPa" />
              <Detail icon={Eye} label="Visibility" value={weather.visibility != null ? (weather.visibility / 1000).toFixed(1) : undefined} unit=" km" />
              <Detail icon={Thermometer} label="Feels like" value={weather.feels_like_celsius != null ? Math.round(weather.feels_like_celsius) : undefined} unit="°C" />
              <Detail icon={Cloud} label="Cloud cover" value={weather.cloudiness} unit="%" />
            </div>
            <div className="coordinates">
              <span>COORDINATES</span>
              <strong>{weather.latitude?.toFixed?.(2) ?? '—'}° , {weather.longitude?.toFixed?.(2) ?? '—'}°</strong>
            </div>
          </aside>
        </section>
      ) : (
        <section className="empty-state">
          <div className="empty-icon"><CloudSun size={44} strokeWidth={1.35} /></div>
          <p className="empty-kicker">{loading ? 'JUST A MOMENT' : 'A WORLD OF WEATHER'}</p>
          <h2>{loading ? 'Looking up the skies…' : 'Where shall we look?'}</h2>
          <p>{loading ? 'Getting the latest conditions for your city.' : 'Search for a city above to see its current conditions, temperature, and more.'}</p>
          {!loading && <button className="example-button" onClick={() => { setCity('Nairobi'); }}>Explore Nairobi <span>↗</span></button>}
        </section>
      )}

      <section className="weather-note">
        <div className="note-icon"><CalendarDays size={19} /></div>
        <div><strong>Just the weather you need.</strong><p>Current conditions, presented simply. Forecasts can be added when your backend supports forecast data.</p></div>
      </section>

      <footer>
        <a className="footer-brand" href="/">weatherly.</a>
        <span>Welcome to K I M L E B - W E A T H E R...</span>
        <span className="footer-right">WEATHER DATA · LIVE API</span>
      </footer>
    </main>
  );
}