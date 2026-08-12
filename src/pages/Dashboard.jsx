import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import { useEvent } from '../context/EventContext'
import { activityTimeLabel } from '../utils/activities'
import { dateRange, finalAttendeeIds, formatMealDate, isPresentAt } from '../utils/mealPlanner'
import { getRecipeCatalogue } from '../utils/recipeCatalogue'
import { getDaysUntil } from '../utils'
import { getCachedMainRiverForecast, getMainRiverForecast, MAIN_RIVER_WEATHER_POINT } from '../utils/weather'
import PhotoRail from '../components/PhotoRail'

const manualKey='main-river-manual-groceries-v21'
const groceryStateKey='main-river-trip-grocery-state-v21'

function readJson(key,fallback){
  try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}
  catch{return fallback}
}

function formatShortDate(date){
  return new Intl.DateTimeFormat('en-CA',{weekday:'short',month:'short',day:'numeric'}).format(new Date(`${date}T12:00:00`))
}

function mealSummary(slot,recipeMap){
  if(!slot||slot.planType==='none')return 'Not planned'
  if(slot.planType==='simple')return slot.simpleDescription||'Simple meal'
  if(slot.planType==='restaurant')return slot.restaurant?.name?`Restaurant: ${slot.restaurant.name}`:'Restaurant planned'
  const names=(slot.recipeIds||[]).map(id=>recipeMap[id]?.title).filter(Boolean)
  return names.length?names.join(' • '):'Recipes not selected'
}

function todayISO(){
  const now=new Date()
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
}

export default function Dashboard(){
  const {activeEvent,activityTemplates}=useEvent()
  const [forecast,setForecast]=useState(()=>getCachedMainRiverForecast({allowStale:true}))
  const [weatherStatus,setWeatherStatus]=useState(()=>getCachedMainRiverForecast({allowStale:true}).length?'cached':'loading')
  const recipes=useMemo(()=>getRecipeCatalogue(),[])
  const recipeMap=useMemo(()=>Object.fromEntries(recipes.map(recipe=>[recipe.id,recipe])),[recipes])
  const templateMap=useMemo(()=>Object.fromEntries((activityTemplates||[]).map(item=>[item.id,item])),[activityTemplates])
  const dates=useMemo(()=>activeEvent?dateRange(activeEvent.startDate,activeEvent.endDate):[],[activeEvent])
  const weatherMap=useMemo(()=>Object.fromEntries(forecast.map(day=>[day.date,day])),[forecast])
  const countdown=getDaysUntil(activeEvent?.startDate||'2026-08-22',activeEvent?.endDate||'2026-08-30')

  useEffect(()=>{
    let cancelled=false
    if(!forecast.length)setWeatherStatus('loading')
    getMainRiverForecast().then(data=>{
      if(cancelled)return
      setForecast(data)
      setWeatherStatus('ready')
    }).catch(()=>{
      if(cancelled)return
      if(!forecast.length)setWeatherStatus('error')
    })
    return ()=>{cancelled=true}
  },[])

  if(!activeEvent)return <div className="card">Create an Overall Event first.</div>

  const dayRows=dates.map(date=>{
    const slots=activeEvent.mealSlots.filter(slot=>slot.date===date)
    const breakfast=slots.find(slot=>slot.type==='breakfast')
    const brunch=slots.find(slot=>slot.type==='brunch')
    const lunch=slots.find(slot=>slot.type==='lunch')
    const earlySnack=slots.find(slot=>slot.type==='early-snack')
    const dinner=slots.find(slot=>slot.type==='dinner')
    const lateSnack=slots.find(slot=>slot.type==='late-snack')
    const activities=(activeEvent.activityInstances||[])
      .filter(item=>item.date===date)
      .sort((a,b)=>(a.startTime||'').localeCompare(b.startTime||''))
    const siteCount=(activeEvent.attendance||[]).filter(row=>isPresentAt(row,date,'18:30')).length
    return {date,breakfast,brunch,lunch,earlySnack,dinner,lateSnack,activities,siteCount,weather:weatherMap[date]}
  })

  const currentDate=todayISO()
  const currentDay=dayRows.find(row=>row.date===currentDate)
  const nextDay=currentDay||dayRows.find(row=>row.date>=currentDate)||dayRows[0]
  const heroWeather=nextDay?.weather

  return <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_290px] xl:gap-6 xl:items-start">
    <div className="space-y-5 min-w-0">
      <section className="rounded-3xl bg-gradient-to-br from-forest to-forest-800 text-white p-6 shadow-card">
        <div className="flex flex-wrap justify-between gap-5 items-start">
          <div>
            <p className="text-sm opacity-80">{activeEvent.startDate}–{activeEvent.endDate}</p>
            <h1 className="text-3xl font-extrabold mt-1">{activeEvent.name}</h1>
            <p className="mt-2 opacity-90">{countdown.label}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 min-w-[190px]">
            <p className="text-xs uppercase tracking-wide opacity-70">{MAIN_RIVER_WEATHER_POINT.label}</p>
            {heroWeather?<><p className="text-2xl font-extrabold mt-1">{heroWeather.icon} {Math.round(heroWeather.high)}° / {Math.round(heroWeather.low)}°</p><p className="text-sm opacity-85">{heroWeather.label} · Rain {heroWeather.rainChance??'—'}%</p></>:weatherStatus==='loading'?<p className="mt-2 text-sm">Forecast loading…</p>:weatherStatus==='error'?<p className="mt-2 text-sm">Weather temporarily unavailable.</p>:<p className="mt-2 text-sm">7-day forecast available soon.</p>}
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-wrap justify-between gap-2 items-end mb-3">
          <div><h2 className="text-2xl font-extrabold text-navy">Week at a Glance</h2><p className="text-sm text-stone">Live meals, attendance, activities and weather — nothing is maintained separately here.</p></div>
          <Link to="/planner" className="text-sm font-semibold text-forest">Open Meal Planner</Link>
        </div>
        <div className="space-y-3">
          {dayRows.map(row=><Link to={`/daily/${row.date}`} key={row.date} className={`card card-hover block ${row.date===currentDate?'ring-2 ring-forest/30':''}`}>
            <div className="flex flex-wrap justify-between gap-3 items-start">
              <div>
                <div className="flex flex-wrap gap-2 items-center"><h3 className="text-lg font-extrabold text-navy">{formatMealDate(row.date)}</h3>{row.date===currentDate&&<span className="badge-forest">Today</span>}</div>
                <p className="text-sm text-stone mt-1 flex items-center gap-1"><Users size={14}/>{row.siteCount} people on site</p>
              </div>
              <div className="text-right min-w-[120px]">
                {row.weather?<><p className="font-bold text-navy">{row.weather.icon} {Math.round(row.weather.high)}° / {Math.round(row.weather.low)}°</p><p className="text-xs text-stone">Rain {row.weather.rainChance??'—'}% · Wind {Math.round(row.weather.wind||0)} km/h</p></>:<p className="text-xs text-stone">7-day forecast available soon</p>}
              </div>
            </div>
            {row.activities.length>0&&<div className="mt-3 flex flex-wrap gap-2">{row.activities.slice(0,2).map(activity=><span key={activity.id} className="badge-navy">{templateMap[activity.templateId]?.name||'Activity'}{activity.startTime?` · ${activityTimeLabel(activity.startTime)}`:''}</span>)}</div>}
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2 mt-4 text-sm">
              {[['Breakfast',row.breakfast],['Brunch',row.brunch],['Lunch',row.lunch],['Early Snack',row.earlySnack],['Dinner',row.dinner],['Late Snack',row.lateSnack]].map(([label,slot])=><div key={label} className="bg-cream rounded-xl p-3"><b className="text-navy">{label}</b><p className="mt-1 text-stone">{mealSummary(slot,recipeMap)}</p></div>)}
            </div>
          </Link>)}
        </div>
      </section>

    </div>
    <PhotoRail/>
  </div>
}
