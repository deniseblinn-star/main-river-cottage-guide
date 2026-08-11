import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CalendarHeart, CheckCircle2, Clock, MapPin, ShoppingCart, Users } from 'lucide-react'
import { useEvent } from '../context/EventContext'
import { activityTimeLabel } from '../utils/activities'
import { dateRange, finalAttendeeIds, formatMealDate, isPresentAt } from '../utils/mealPlanner'
import { getRecipeCatalogue } from '../utils/recipeCatalogue'
import { getEventGeneratedGroceries } from '../utils/eventGroceryEngine'
import { getDaysUntil } from '../utils'
import { getMainRiverForecast, MAIN_RIVER_WEATHER_POINT } from '../utils/weather'
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
  const [forecast,setForecast]=useState([])
  const [weatherStatus,setWeatherStatus]=useState('loading')
  const recipes=useMemo(()=>getRecipeCatalogue(),[])
  const recipeMap=useMemo(()=>Object.fromEntries(recipes.map(recipe=>[recipe.id,recipe])),[recipes])
  const templateMap=useMemo(()=>Object.fromEntries((activityTemplates||[]).map(item=>[item.id,item])),[activityTemplates])
  const dates=useMemo(()=>activeEvent?dateRange(activeEvent.startDate,activeEvent.endDate):[],[activeEvent])
  const weatherMap=useMemo(()=>Object.fromEntries(forecast.map(day=>[day.date,day])),[forecast])
  const countdown=getDaysUntil(activeEvent?.startDate||'2026-08-22',activeEvent?.endDate||'2026-08-30')

  useEffect(()=>{
    let cancelled=false
    setWeatherStatus('loading')
    getMainRiverForecast().then(data=>{
      if(cancelled)return
      setForecast(data)
      setWeatherStatus('ready')
    }).catch(()=>{
      if(cancelled)return
      setForecast([])
      setWeatherStatus('error')
    })
    return ()=>{cancelled=true}
  },[])

  if(!activeEvent)return <div className="card">Create an Overall Event first.</div>

  const dayRows=dates.map(date=>{
    const slots=activeEvent.mealSlots.filter(slot=>slot.date===date)
    const lunch=slots.find(slot=>slot.type==='lunch')
    const earlySnack=slots.find(slot=>slot.type==='early-snack')
    const dinner=slots.find(slot=>slot.type==='dinner')
    const activities=(activeEvent.activityInstances||[])
      .filter(item=>item.date===date)
      .sort((a,b)=>(a.startTime||'').localeCompare(b.startTime||''))
    const siteCount=(activeEvent.attendance||[]).filter(row=>isPresentAt(row,date,'18:30')).length
    return {date,lunch,earlySnack,dinner,activities,siteCount,weather:weatherMap[date]}
  })

  const generated=getEventGeneratedGroceries(activeEvent)
  const manual=readJson(manualKey,[])
  const groceryState=readJson(groceryStateKey,{})
  const groceryIds=[...generated.map(item=>item.id),...manual.map(item=>item.id)]
  const purchased=groceryIds.filter(id=>groceryState[id]?.purchased).length
  const remaining=Math.max(0,groceryIds.length-purchased)

  const attention=[]
  for(const row of dayRows){
    for(const slot of [row.lunch,row.dinner]){
      if(!slot)continue
      if(slot.planType==='none')attention.push(`${formatShortDate(row.date)} ${slot.label} is not planned`)
      if(slot.planType==='recipes'&&!slot.recipeIds?.length)attention.push(`${formatShortDate(row.date)} ${slot.label} has no recipes selected`)
    }
  }
  const legacyGroceries=generated.filter(item=>item.notes?.includes('structured')||!item.groceryItemId)
  if(legacyGroceries.length)attention.push(`${legacyGroceries.length} generated grocery item${legacyGroceries.length===1?'':'s'} need review`)

  const upcomingActivities=(activeEvent.activityInstances||[])
    .slice()
    .sort((a,b)=>`${a.date}T${a.startTime||''}`.localeCompare(`${b.date}T${b.startTime||''}`))
    .slice(0,5)

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
            {heroWeather?<><p className="text-2xl font-extrabold mt-1">{heroWeather.icon} {Math.round(heroWeather.high)}° / {Math.round(heroWeather.low)}°</p><p className="text-sm opacity-85">{heroWeather.label} · Rain {heroWeather.rainChance??'—'}%</p></>:weatherStatus==='error'?<p className="mt-2 text-sm">Weather temporarily unavailable.</p>:<p className="mt-2 text-sm">Forecast loading…</p>}
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
                {row.weather?<><p className="font-bold text-navy">{row.weather.icon} {Math.round(row.weather.high)}° / {Math.round(row.weather.low)}°</p><p className="text-xs text-stone">Rain {row.weather.rainChance??'—'}% · Wind {Math.round(row.weather.wind||0)} km/h</p></>:<p className="text-xs text-stone">Forecast available soon</p>}
              </div>
            </div>
            {row.activities.length>0&&<div className="mt-3 flex flex-wrap gap-2">{row.activities.slice(0,2).map(activity=><span key={activity.id} className="badge-navy">{templateMap[activity.templateId]?.name||'Activity'}{activity.startTime?` · ${activityTimeLabel(activity.startTime)}`:''}</span>)}</div>}
            <div className="grid md:grid-cols-3 gap-2 mt-4 text-sm">
              <div className="bg-cream rounded-xl p-3"><b className="text-navy">Lunch</b><p className="mt-1 text-stone">{mealSummary(row.lunch,recipeMap)}</p></div>
              <div className="bg-cream rounded-xl p-3"><b className="text-navy">Early Snack</b><p className="mt-1 text-stone">{mealSummary(row.earlySnack,recipeMap)}</p></div>
              <div className="bg-cream rounded-xl p-3"><b className="text-navy">Dinner</b><p className="mt-1 text-stone">{mealSummary(row.dinner,recipeMap)}</p></div>
            </div>
          </Link>)}
        </div>
      </section>

      {attention.length>0&&<section className="card border border-amber-200 bg-amber-50">
        <div className="flex gap-3 items-start"><AlertTriangle className="text-amber-600 shrink-0"/><div className="flex-1"><h2 className="font-extrabold text-navy">Needs Attention</h2><div className="mt-2 space-y-1 text-sm text-amber-900">{attention.slice(0,8).map(item=><p key={item}>• {item}</p>)}</div>{attention.length>8&&<p className="text-xs text-stone mt-2">+ {attention.length-8} more items</p>}</div></div>
      </section>}

      <div className="grid lg:grid-cols-2 gap-4">
        <Link to="/groceries" className="card card-hover">
          <div className="flex justify-between gap-3"><div><p className="section-title">Shopping</p><p className="text-3xl font-extrabold text-forest mt-1">{remaining} remaining</p><p className="text-sm text-stone mt-1">{purchased} purchased · {groceryIds.length} total</p></div><ShoppingCart className="text-forest"/></div>
          <div className="h-2 bg-cream rounded-full overflow-hidden mt-4"><div className="h-full bg-forest" style={{width:`${groceryIds.length?purchased/groceryIds.length*100:0}%`}}/></div>
        </Link>
        <section className="card">
          <div className="flex justify-between gap-3"><div><p className="section-title">Upcoming Activities</p><p className="text-sm text-stone mt-1">Next scheduled moments</p></div><CalendarHeart className="text-forest"/></div>
          <div className="mt-3 space-y-2">{upcomingActivities.map(activity=>{const template=templateMap[activity.templateId];return <Link to="/events" key={activity.id} className="block rounded-xl bg-cream p-3"><div className="flex justify-between gap-2"><b className="text-navy">{template?.name||'Activity'}</b><span className="text-xs text-stone">{formatShortDate(activity.date)}</span></div><div className="flex flex-wrap gap-3 text-xs text-stone mt-1">{activity.startTime&&<span className="flex gap-1 items-center"><Clock size={12}/>{activityTimeLabel(activity.startTime)}</span>}{activity.location&&<span className="flex gap-1 items-center"><MapPin size={12}/>{activity.location}</span>}</div></Link>})}{!upcomingActivities.length&&<p className="text-sm text-stone">No activities scheduled.</p>}</div>
        </section>
      </div>

      {attention.length===0&&<div className="bg-forest/5 border border-forest/15 rounded-2xl p-4 flex gap-3"><CheckCircle2 className="text-forest"/><div><b className="text-navy">Planner looks ready</b><p className="text-sm text-stone">No missing lunch or dinner plans and no generated grocery warnings detected.</p></div></div>}
    </div>
    <PhotoRail/>
  </div>
}
