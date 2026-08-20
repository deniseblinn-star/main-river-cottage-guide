import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, LayoutList, Users } from 'lucide-react'
import { useEvent } from '../context/EventContext'
import { activityTimeLabel } from '../utils/activities'
import { dateRange, formatMealDate, MEAL_TYPES, isPresentAt } from '../utils/mealPlanner'
import { getRecipeCatalogue } from '../utils/recipeCatalogue'
import { getDaysUntil } from '../utils'
import { getCachedMainRiverForecast, getMainRiverForecast, MAIN_RIVER_WEATHER_POINT } from '../utils/weather'
import PhotoRail from '../components/PhotoRail'

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

function minutesFromTime(value='00:00'){
  const [hour,minute]=String(value).split(':').map(Number)
  return (Number.isFinite(hour)?hour:0)*60+(Number.isFinite(minute)?minute:0)
}

function timeLabel(value){
  if(!value)return ''
  const [hour,minute]=value.split(':').map(Number)
  return new Date(2026,0,1,hour,minute).toLocaleTimeString('en-CA',{hour:'numeric',minute:'2-digit'})
}

function daypartForActivity(activity){
  const minutes=minutesFromTime(activity.startTime||'12:00')
  if(minutes<12*60)return 'morning'
  if(minutes<17*60)return 'afternoon'
  return 'evening'
}

function CalendarView({dayRows,recipeMap,templateMap,currentDate}){
  const dayparts=[
    {id:'morning',label:'Morning',mealTypes:['breakfast','brunch']},
    {id:'afternoon',label:'Afternoon',mealTypes:['lunch','early-snack']},
    {id:'evening',label:'Evening',mealTypes:['dinner','late-snack']}
  ]

  return <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
    <div className="overflow-x-auto">
      <div className="min-w-[1040px]">
        <div className="grid border-b border-stone-200 bg-cream" style={{gridTemplateColumns:`100px repeat(${dayRows.length}, minmax(104px,1fr))`}}>
          <div className="p-3 text-xs font-bold uppercase tracking-wide text-stone">Day</div>
          {dayRows.map(row=><Link key={row.date} to={`/daily/${row.date}`} className={`p-2.5 border-l border-stone-200 hover:bg-white/70 ${row.date===currentDate?'bg-forest/10':''}`}>
            <div className="font-extrabold text-sm text-navy">{formatShortDate(row.date)}</div>
            <div className="mt-1 text-[11px] text-stone flex items-center gap-1"><Users size={11}/>{row.siteCount} on site</div>
            <div className="mt-1 text-[11px]">
              {row.weather?<span className="font-semibold text-navy">{row.weather.icon} {Math.round(row.weather.high)}°/{Math.round(row.weather.low)}°</span>:<span className="text-stone">Forecast soon</span>}
            </div>
          </Link>)}
        </div>

        {dayparts.map(part=><div key={part.id} className="grid border-b border-stone-100 last:border-b-0" style={{gridTemplateColumns:`100px repeat(${dayRows.length}, minmax(104px,1fr))`}}>
          <div className="p-3 bg-stone-50"><div className="text-sm font-extrabold text-navy">{part.label}</div></div>
          {dayRows.map(row=>{
            const meals=row.mealSlots.filter(slot=>part.mealTypes.includes(slot.type))
            const activities=row.activities.filter(activity=>daypartForActivity(activity)===part.id)
            return <div key={`${row.date}-${part.id}`} className={`min-h-[150px] p-2 border-l border-stone-100 space-y-1.5 ${row.date===currentDate?'bg-forest/[0.025]':''}`}>
              {activities.map(activity=><Link to="/activities" key={activity.id} className="block rounded-lg bg-navy text-white px-2 py-1.5 text-[11px] hover:opacity-90">
                <div className="font-bold leading-tight">{templateMap[activity.templateId]?.name||'Activity'}</div>
                {activity.startTime&&<div className="mt-0.5 opacity-75">{activityTimeLabel(activity.startTime)}{activity.endTime?`–${activityTimeLabel(activity.endTime)}`:''}</div>}
              </Link>)}
              {meals.map(slot=>{
                const summary=mealSummary(slot,recipeMap)
                const planned=slot.planType!=='none'
                return <Link to={`/daily/${row.date}`} key={slot.id} className={`block rounded-lg px-2 py-1.5 text-[11px] ${planned?'bg-cream text-navy':'bg-stone-50 text-stone'}`}>
                  <div className="font-bold leading-tight">{slot.label}{slot.time?<span className="font-normal text-stone"> · {timeLabel(slot.time)}</span>:''}</div>
                  {planned&&<div className="mt-0.5 leading-tight line-clamp-3">{summary}</div>}
                </Link>
              })}
              {!activities.length&&!meals.length&&<span className="text-[11px] text-stone/60">—</span>}
            </div>
          })}
        </div>)}
      </div>
    </div>
    <div className="sm:hidden px-3 py-2 text-xs text-stone border-t border-stone-100">Swipe sideways to see the full week.</div>
  </div>
}

export default function Dashboard(){
  const {activeEvent,activityTemplates}=useEvent()
  const [forecast,setForecast]=useState(()=>getCachedMainRiverForecast({allowStale:true}))
  const [weatherStatus,setWeatherStatus]=useState(()=>getCachedMainRiverForecast({allowStale:true}).length?'cached':'loading')
  const [view,setView]=useState(()=>localStorage.getItem('main-river-dashboard-view')||'glance')
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

  function changeView(next){
    setView(next)
    try{localStorage.setItem('main-river-dashboard-view',next)}catch{}
  }

  if(!activeEvent)return <div className="card">Create an Overall Event first.</div>

  const dayRows=dates.map(date=>{
    const mealSlots=activeEvent.mealSlots.filter(slot=>slot.date===date)
    const slotsByType=Object.fromEntries(mealSlots.map(slot=>[slot.type,slot]))
    const activities=(activeEvent.activityInstances||[])
      .filter(item=>item.date===date)
      .sort((a,b)=>(a.startTime||'').localeCompare(b.startTime||''))
    const siteCount=(activeEvent.attendance||[]).filter(row=>isPresentAt(row,date,'18:30')).length
    return {
      date,
      mealSlots,
      breakfast:slotsByType.breakfast,
      brunch:slotsByType.brunch,
      lunch:slotsByType.lunch,
      earlySnack:slotsByType['early-snack'],
      dinner:slotsByType.dinner,
      lateSnack:slotsByType['late-snack'],
      activities,
      siteCount,
      weather:weatherMap[date]
    }
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
        <div className="flex flex-wrap justify-between gap-3 items-end mb-3">
          <div>
            <h2 className="text-2xl font-extrabold text-navy">{view==='calendar'?'Week Calendar':'Week at a Glance'}</h2>
            <p className="text-sm text-stone">Live meals, attendance, activities and weather — nothing is maintained separately here.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="inline-flex rounded-xl border border-stone-200 bg-white p-1">
              <button type="button" onClick={()=>changeView('glance')} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${view==='glance'?'bg-forest text-white':'text-navy hover:bg-cream'}`}><LayoutList size={16}/>Glance</button>
              <button type="button" onClick={()=>changeView('calendar')} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${view==='calendar'?'bg-forest text-white':'text-navy hover:bg-cream'}`}><CalendarDays size={16}/>Calendar</button>
            </div>
            <Link to="/planner" className="text-sm font-semibold text-forest">Open Meal Planner</Link>
          </div>
        </div>

        {view==='calendar'?<CalendarView dayRows={dayRows} recipeMap={recipeMap} templateMap={templateMap} currentDate={currentDate}/>:<div className="space-y-3">
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
            {row.activities.length>0&&<div className="mt-3 flex flex-wrap gap-2">{row.activities.slice(0,3).map(activity=><span key={activity.id} className="badge-navy">{templateMap[activity.templateId]?.name||'Activity'}{activity.startTime?` · ${activityTimeLabel(activity.startTime)}`:''}</span>)}</div>}
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2 mt-4 text-sm">
              {[['Breakfast',row.breakfast],['Brunch',row.brunch],['Lunch',row.lunch],['Early Snack',row.earlySnack],['Dinner',row.dinner],['Late Snack',row.lateSnack]].map(([label,slot])=><div key={label} className="bg-cream rounded-xl p-3"><b className="text-navy">{label}</b><p className="mt-1 text-stone">{mealSummary(slot,recipeMap)}</p></div>)}
            </div>
          </Link>)}
        </div>}
      </section>
    </div>
    <PhotoRail/>
  </div>
}
