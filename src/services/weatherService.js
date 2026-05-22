const GEO_BASE = 'https://geocoding-api.open-meteo.com/v1'
const WEATHER_BASE = 'https://api.open-meteo.com/v1'

const WMO_CODES = {
  0: { label: 'Ensoleillé', icon: '☀️' },
  1: { label: 'Peu nuageux', icon: '🌤️' },
  2: { label: 'Partiellement nuageux', icon: '⛅' },
  3: { label: 'Couvert', icon: '☁️' },
  45: { label: 'Brouillard', icon: '🌫️' },
  48: { label: 'Brouillard givrant', icon: '🌫️' },
  51: { label: 'Bruine légère', icon: '🌦️' },
  53: { label: 'Bruine modérée', icon: '🌦️' },
  55: { label: 'Bruine dense', icon: '🌧️' },
  61: { label: 'Pluie légère', icon: '🌧️' },
  63: { label: 'Pluie modérée', icon: '🌧️' },
  65: { label: 'Pluie forte', icon: '🌧️' },
  71: { label: 'Neige légère', icon: '🌨️' },
  73: { label: 'Neige modérée', icon: '❄️' },
  75: { label: 'Neige forte', icon: '❄️' },
  80: { label: 'Averses légères', icon: '🌦️' },
  81: { label: 'Averses modérées', icon: '🌧️' },
  82: { label: 'Averses violentes', icon: '⛈️' },
  95: { label: 'Orage', icon: '⛈️' },
  99: { label: 'Orage avec grêle', icon: '⛈️' },
}

export const weatherService = {
  geocode: async (city) => {
    const res = await fetch(`${GEO_BASE}/search?name=${encodeURIComponent(city)}&count=1&language=fr&format=json`)
    const data = await res.json()
    if (!data.results?.length) throw new Error(`Ville "${city}" introuvable`)
    const { latitude, longitude, name, country } = data.results[0]
    return { latitude, longitude, name, country }
  },

  getCurrent: async (latitude, longitude) => {
    const url = `${WEATHER_BASE}/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weathercode` +
      `&hourly=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max` +
      `&timezone=Europe%2FParis&forecast_days=7`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Erreur API météo')
    const data = await res.json()
    return parseWeatherData(data)
  }
}

function parseWeatherData(data) {
  const c = data.current
  const wmo = WMO_CODES[c.weathercode] || { label: 'Inconnu', icon: '🌡️' }

  const hourly = data.hourly.time.slice(0, 24).map((t, i) => ({
    time: new Date(t).getHours() + 'h',
    temp: Math.round(data.hourly.temperature_2m[i]),
    code: data.hourly.weathercode[i]
  }))

  const daily = data.daily.time.map((t, i) => ({
    date: t,
    day: new Date(t).toLocaleDateString('fr-FR', { weekday: 'short' }),
    max: Math.round(data.daily.temperature_2m_max[i]),
    min: Math.round(data.daily.temperature_2m_min[i]),
    wmo: WMO_CODES[data.daily.weathercode[i]] || { label: '?', icon: '🌡️' },
    rain: data.daily.precipitation_probability_max[i]
  }))

  return {
    temperature: Math.round(c.temperature_2m),
    feelsLike: Math.round(c.apparent_temperature),
    humidity: c.relative_humidity_2m,
    windSpeed: Math.round(c.wind_speed_10m),
    wmo,
    hourly,
    daily
  }
}