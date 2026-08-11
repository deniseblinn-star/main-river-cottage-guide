export const MAIN_RIVER_WEATHER_POINT={
  label:'Main River area',
  latitude:46.7,
  longitude:-64.85,
  timezone:'America/Moncton'
}

const WEATHER_CACHE_KEY='main-river-weather-cache-v1'
const WEATHER_CACHE_MAX_AGE=6*60*60*1000
const WEATHER_TIMEOUT_MS=5000

export function weatherCodeMeta(code){
  const value=Number(code)
  if(value===0)return {icon:'☀️',label:'Clear'}
  if([1,2].includes(value))return {icon:'🌤️',label:'Partly cloudy'}
  if(value===3)return {icon:'☁️',label:'Cloudy'}
  if([45,48].includes(value))return {icon:'🌫️',label:'Fog'}
  if([51,53,55,56,57].includes(value))return {icon:'🌦️',label:'Drizzle'}
  if([61,63,65,66,67,80,81,82].includes(value))return {icon:'🌧️',label:'Rain'}
  if([71,73,75,77,85,86].includes(value))return {icon:'🌨️',label:'Snow'}
  if([95,96,99].includes(value))return {icon:'⛈️',label:'Thunderstorms'}
  return {icon:'🌤️',label:'Forecast'}
}

export function getCachedMainRiverForecast({allowStale=true}={}){
  try{
    const cached=JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY)||'null')
    if(!cached||!Array.isArray(cached.days))return []
    if(!allowStale&&Date.now()-Number(cached.savedAt||0)>WEATHER_CACHE_MAX_AGE)return []
    return cached.days
  }catch{return []}
}

function cacheForecast(days){
  try{localStorage.setItem(WEATHER_CACHE_KEY,JSON.stringify({savedAt:Date.now(),days}))}catch{}
}

export async function getMainRiverForecast(){
  const {latitude,longitude,timezone}=MAIN_RIVER_WEATHER_POINT
  const params=new URLSearchParams({
    latitude:String(latitude),
    longitude:String(longitude),
    timezone,
    forecast_days:'7',
    daily:'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max'
  })
  const controller=new AbortController()
  const timer=setTimeout(()=>controller.abort(),WEATHER_TIMEOUT_MS)
  try{
    const response=await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`,{signal:controller.signal})
    if(!response.ok)throw new Error(`Weather request failed (${response.status})`)
    const data=await response.json()
    const daily=data.daily||{}
    const days=(daily.time||[]).map((date,index)=>({
      date,
      code:daily.weather_code?.[index],
      high:daily.temperature_2m_max?.[index],
      low:daily.temperature_2m_min?.[index],
      rainChance:daily.precipitation_probability_max?.[index],
      wind:daily.wind_speed_10m_max?.[index],
      ...weatherCodeMeta(daily.weather_code?.[index])
    }))
    cacheForecast(days)
    return days
  }catch(error){
    const cached=getCachedMainRiverForecast({allowStale:true})
    if(cached.length)return cached
    throw error
  }finally{
    clearTimeout(timer)
  }
}
