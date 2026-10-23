# Weatherly React Frontend

A minimal, responsive React + Vite frontend for your existing Express weather endpoint.

## Requirements

- Node.js 20 or newer
- Your existing Express backend running on port `3000` (or change the proxy in `vite.config.js`)

## Add it to your existing project

Open a terminal:

```bash
cd ~/Documents/node_fundamentals
```

Create the frontend folder and extract/copy the contents of this project into it. The final structure should look like:

```text
node_fundamentals/
├── server.js
├── .env
└── frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        └── styles.css
```

If you downloaded the ZIP into `~/Downloads`, run:

```bash
cd ~/Documents/node_fundamentals
mkdir -p frontend
unzip ~/Downloads/weatherly-react.zip -d /tmp/weatherly-react
cp -r /tmp/weatherly-react/. frontend/
```

If the ZIP is already in your current directory, change the `unzip` path accordingly.

Install dependencies:

```bash
cd ~/Documents/node_fundamentals/frontend
npm install
```

## Check your backend

Your existing `.env` in `node_fundamentals` should contain:

```env
OPENWEATHER_API_KEY=your_actual_openweather_api_key
PORT=3000
```

Do not put your API key in React code or any frontend `.env` file. Keep it only on the server.

Start the backend in terminal 1:

```bash
cd ~/Documents/node_fundamentals
node server.js
```

Start React in terminal 2:

```bash
cd ~/Documents/node_fundamentals/frontend
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

The Vite development proxy forwards requests from `/weather?city=...` to `http://localhost:3000/weather?city=...`, so you do not need to add CORS just for local development.

## Important backend correction

The catch block in your backend currently returns a plain string with HTTP 200. The frontend detects that and displays it as an error, but the backend should ideally return a proper status and JSON object instead:

```js
} catch (error) {
  console.error('Weather API error:', error.message);
  return res.status(502).json({
    error: 'Unable to retrieve weather. Check the city name and weather API key.'
  });
}
```

Also make sure the API URL is a normal template literal, not a Markdown link:

```js
const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric`;
```

Use `encodeURIComponent` so city names with spaces or special characters are handled safely.

## Current limitations

- This version uses your current-weather endpoint only.
- A real seven-day forecast requires a forecast endpoint and corresponding UI.
- Sunrise/sunset display uses the Unix timestamp and city UTC offset returned by OpenWeather.
- If the API key is new or inactive, OpenWeather may reject requests until the key becomes active.
