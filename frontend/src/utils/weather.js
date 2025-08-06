import axios from 'axios'

const GEO_API = 'https://ipapi.co/json/'
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast'

export async function fetchLocationWeather() {
  try {
    // 获取地理位置
    const locationRes = await axios.get(GEO_API)
    const { city, country_name, latitude, longitude } = locationRes.data

    // 获取天气
    const weatherRes = await axios.get(WEATHER_API, {
      params: {
        latitude,
        longitude,
        current_weather: true,
        daily: 'weathercode',
        timezone: 'auto'
      }
    })

    const { temperature, weathercode } = weatherRes.data.current_weather

    return {
      city,
      country: country_name,
      temperature,
      weathercode // 用于判断天气类型（晴、雨、雪等）
    }
  } catch (error) {
    console.error('获取天气失败:', error)
    return null
  }
}
