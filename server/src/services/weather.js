async function fetchWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=Asia/Kolkata&forecast_days=7`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = await response.json();

  const weatherCodeMap = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Depositing rime fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
    80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
  };

  return {
    current: {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      precipitation: data.current.precipitation,
      wind_speed: data.current.wind_speed_10m,
      weather_code: data.current.weather_code,
      weather_description: weatherCodeMap[data.current.weather_code] || 'Unknown'
    },
    daily: data.daily.time.map((date, i) => ({
      date,
      weather_code: data.daily.weather_code[i],
      weather_description: weatherCodeMap[data.daily.weather_code[i]] || 'Unknown',
      temp_max: data.daily.temperature_2m_max[i],
      temp_min: data.daily.temperature_2m_min[i],
      precipitation: data.daily.precipitation_sum[i],
      precipitation_probability: data.daily.precipitation_probability_max[i],
      wind_speed_max: data.daily.wind_speed_10m_max[i]
    }))
  };
}

function generateWeatherAlerts(weather) {
  const alerts = [];

  // Check daily forecasts for alerts
  for (const day of weather.daily) {
    if (day.precipitation_probability > 70) {
      alerts.push({
        title: `Rain Alert - ${day.date}`,
        message: `High probability of rain (${day.precipitation_probability}%) on ${day.date}. Expected precipitation: ${day.precipitation}mm. Plan indoor activities or protect crops.`,
        priority: day.precipitation_probability > 90 ? 'high' : 'normal'
      });
    }

    if (day.wind_speed_max > 20) {
      alerts.push({
        title: `Wind Warning - ${day.date}`,
        message: `Strong winds expected (${day.wind_speed_max} km/h) on ${day.date}. Avoid spraying pesticides or fertilizers. Secure crop supports.`,
        priority: day.wind_speed_max > 40 ? 'urgent' : 'high'
      });
    }

    if (day.temp_max > 40) {
      alerts.push({
        title: `Heat Alert - ${day.date}`,
        message: `Extreme heat expected (${day.temp_max}°C) on ${day.date}. Increase irrigation frequency. Provide shade for sensitive crops. Avoid working in peak hours.`,
        priority: day.temp_max > 45 ? 'urgent' : 'high'
      });
    }

    if (day.temp_min < 5) {
      alerts.push({
        title: `Frost Warning - ${day.date}`,
        message: `Low temperature expected (${day.temp_min}°C) on ${day.date}. Protect frost-sensitive crops. Consider mulching.`,
        priority: day.temp_min < 0 ? 'urgent' : 'high'
      });
    }

    // Heavy rain + farming activity warning
    if (day.precipitation > 20) {
      alerts.push({
        title: `Heavy Rain Advisory - ${day.date}`,
        message: `Heavy rainfall expected (${day.precipitation}mm) on ${day.date}. Delay fertilizer application. Ensure proper drainage in fields. Do not irrigate.`,
        priority: 'high'
      });
    }
  }

  return alerts;
}

module.exports = { fetchWeather, generateWeatherAlerts };
