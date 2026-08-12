import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CalendarDays, CloudOff, FileText, Printer, ShieldCheck, Thermometer, Users } from 'lucide-react'
import { useEvent } from '../context/EventContext'
import { activityTimeLabel } from '../utils/activities'
import { dateRange, formatMealDate, isPresentAt } from '../utils/mealPlanner'
import { getRecipeCatalogue } from '../utils/recipeCatalogue'
import { getCachedMainRiverForecast, getMainRiverForecast, MAIN_RIVER_WEATHER_POINT } from '../utils/weather'

const mealOrder=['breakfast','brunch','lunch','early-snack','dinner','late-snack']

function recipeSummary(slot,recipeMap){
  if(!slot||slot.planType==='none')return ''
  if(slot.planType==='simple')return slot.simpleDescription||'Simple meal'
  if(slot.planType==='restaurant')return slot.restaurant?.name?`Restaurant — ${slot.restaurant.name}`:'Restaurant'
  return (slot.recipeIds||[]).map(id=>recipeMap[id]?.title).filter(Boolean).join(' • ')
}

function dayPart(timestamp){return String(timestamp||'').slice(0,10)}
function timePart(timestamp){
  const value=String(timestamp||'').slice(11,16)
  if(!value)return ''
  const [h,m]=value.split(':').map(Number)
  return new Intl.DateTimeFormat('en-CA',{hour:'numeric',minute:'2-digit'}).format(new Date(2000,0,1,h,m))
}

function PersonMovement({title,rows,profileMap,field}){
  if(!rows.length)return null
  return <div><b className="text-navy">{title}:</b> {rows.map(row=>`${profileMap[row.profileId]?.name||row.profileId}${timePart(row[field])?` (${timePart(row[field])})`:''}`).join(', ')}</div>
}

function Checklist({items}){
  return <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mt-3">{items.map(item=><div key={item} className="flex gap-2 text-sm"><span className="font-bold">☐</span><span>{item}</span></div>)}</div>
}

export default function OperationsReport(){
  const {activeEvent,profiles,activityTemplates}=useEvent()
  const [forecast,setForecast]=useState(()=>getCachedMainRiverForecast({allowStale:true}))
  const [weatherStatus,setWeatherStatus]=useState(()=>forecast.length?'cached':'loading')
  const recipes=useMemo(()=>getRecipeCatalogue(),[])
  const recipeMap=useMemo(()=>Object.fromEntries(recipes.map(recipe=>[recipe.id,recipe])),[recipes])
  const profileMap=useMemo(()=>Object.fromEntries((profiles||[]).map(profile=>[profile.id,profile])),[profiles])
  const activityMap=useMemo(()=>Object.fromEntries((activityTemplates||[]).map(item=>[item.id,item])),[activityTemplates])
  const weatherMap=useMemo(()=>Object.fromEntries(forecast.map(day=>[day.date,day])),[forecast])

  useEffect(()=>{
    let cancelled=false
    getMainRiverForecast().then(days=>{
      if(cancelled)return
      setForecast(days);setWeatherStatus('ready')
    }).catch(()=>{if(!cancelled)setWeatherStatus(forecast.length?'cached':'error')})
    return ()=>{cancelled=true}
  },[])

  if(!activeEvent)return <div className="card">Create an Overall Event first.</div>

  const dates=dateRange(activeEvent.startDate,activeEvent.endDate)
  const rows=dates.map(date=>{
    const slots=(activeEvent.mealSlots||[]).filter(slot=>slot.date===date).sort((a,b)=>mealOrder.indexOf(a.type)-mealOrder.indexOf(b.type))
    const meals=slots.map(slot=>({label:slot.label,time:slot.time,summary:recipeSummary(slot,recipeMap)})).filter(row=>row.summary)
    const activities=(activeEvent.activityInstances||[]).filter(item=>item.date===date).sort((a,b)=>(a.startTime||'').localeCompare(b.startTime||''))
    const arrivals=(activeEvent.attendance||[]).filter(row=>dayPart(row.arrival)===date)
    const departures=(activeEvent.attendance||[]).filter(row=>dayPart(row.departure)===date)
    const siteCount=(activeEvent.attendance||[]).filter(row=>isPresentAt(row,date,'18:30')).length
    return {date,meals,activities,arrivals,departures,siteCount,weather:weatherMap[date]}
  })

  const dietary=(profiles||[]).filter(profile=>(profile.dietary||[]).length)

  return <div className="report-print space-y-5">
    <div className="print-hide flex flex-wrap justify-between gap-3 items-center">
      <div><h1 className="page-title">Operations Report</h1><p className="text-stone">Live week plan + Quality & Safety Management System.</p></div>
      <button onClick={()=>window.print()} className="btn-primary flex items-center gap-2"><Printer size={18}/>Print / Save as PDF</button>
    </div>

    <section className="report-cover rounded-3xl bg-forest text-white p-7 shadow-card">
      <div className="flex flex-wrap justify-between gap-5">
        <div><p className="text-sm uppercase tracking-widest opacity-75">Family Operations Package</p><h2 className="text-3xl font-extrabold mt-2">{activeEvent.name}</h2><p className="mt-2 opacity-90">{activeEvent.startDate}–{activeEvent.endDate} · {activeEvent.location}</p></div>
        <div className="rounded-2xl bg-white/10 p-4 min-w-[220px]"><p className="text-xs uppercase tracking-wider opacity-70">Quality & Safety Officer</p><p className="text-2xl font-extrabold mt-1">Lonita</p><p className="text-sm opacity-80 mt-1">Family-use QSMS</p></div>
      </div>
      <div className="mt-6 grid sm:grid-cols-3 gap-3 text-sm"><div className="rounded-xl bg-white/10 p-3"><b>{new Set((activeEvent.attendance||[]).map(row=>row.profileId)).size}</b><br/>Attendees</div><div className="rounded-xl bg-white/10 p-3"><b>{dates.length}</b><br/>Cottage days</div><div className="rounded-xl bg-white/10 p-3"><b>{MAIN_RIVER_WEATHER_POINT.label}</b><br/>{weatherStatus==='error'?'Weather unavailable':'7-day forecast'}</div></div>
    </section>

    <section className="card">
      <div className="flex items-center gap-2"><CalendarDays className="text-forest"/><div><h2 className="text-xl font-extrabold text-navy">Week at a Glance</h2><p className="text-sm text-stone">Generated from the active planner. Changes to meals, attendance and activities flow into this report.</p></div></div>
      <div className="mt-4 space-y-4">
        {rows.map(row=><article key={row.date} className="report-day border border-stone/15 rounded-2xl p-4 break-inside-avoid">
          <div className="flex flex-wrap justify-between gap-3 border-b border-stone/10 pb-3">
            <div><h3 className="text-lg font-extrabold text-navy">{formatMealDate(row.date)}</h3><p className="text-sm text-stone flex items-center gap-1 mt-1"><Users size={14}/>{row.siteCount} people on site at dinner</p></div>
            <div className="text-right">{row.weather?<><b>{row.weather.icon} {Math.round(row.weather.high)}° / {Math.round(row.weather.low)}°</b><p className="text-xs text-stone">Rain {row.weather.rainChance??'—'}% · Wind {Math.round(row.weather.wind||0)} km/h</p></>:<span className="text-xs text-stone flex items-center gap-1"><CloudOff size={13}/>Forecast available soon</span>}</div>
          </div>
          {(row.arrivals.length>0||row.departures.length>0)&&<div className="mt-3 text-sm bg-cream rounded-xl p-3"><PersonMovement title="Arrivals" rows={row.arrivals} profileMap={profileMap} field="arrival"/><PersonMovement title="Departures" rows={row.departures} profileMap={profileMap} field="departure"/></div>}
          {row.activities.length>0&&<div className="mt-3"><b className="section-title">Activities</b><div className="mt-1 text-sm space-y-1">{row.activities.map(activity=><p key={activity.id}><b>{activityMap[activity.templateId]?.name||'Activity'}</b>{activity.startTime?` · ${activityTimeLabel(activity.startTime)}`:''}{activity.location?` · ${activity.location}`:''}</p>)}</div></div>}
          <div className="mt-3"><b className="section-title">Meals</b>{row.meals.length?<div className="mt-1 grid md:grid-cols-2 gap-2">{row.meals.map(meal=><div key={`${row.date}-${meal.label}`} className="bg-cream rounded-xl p-3 text-sm"><b className="text-navy">{meal.label}{meal.time?` · ${timePart(`${row.date}T${meal.time}`)}`:''}</b><p className="text-stone mt-1">{meal.summary}</p></div>)}</div>:<p className="text-sm text-stone mt-1">No meals planned.</p>}</div>
        </article>)}
      </div>
    </section>

    <section className="card report-page-break">
      <div className="flex gap-3 items-start"><ShieldCheck className="text-forest shrink-0"/><div><p className="section-title">Quality & Safety Management System</p><h2 className="text-2xl font-extrabold text-navy">Main River Cottage Week QSMS</h2><p className="text-sm text-stone mt-1">Officer: Lonita · Family operations checklist. This is a practical household guide, not a regulated or certified safety-management system.</p></div></div>
      <div className="grid md:grid-cols-2 gap-4 mt-5">
        <div className="rounded-2xl bg-forest/5 border border-forest/15 p-4"><b className="text-navy">Quality objectives</b><Checklist items={['Meals match the published planner and expected attendance','Gluten-free and other dietary needs are protected','Food is stored, prepared and served safely','Outdoor activities respond to weather and site conditions','Hazards and corrective actions are communicated promptly']}/></div>
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4"><b className="text-navy">Escalate immediately</b><Checklist items={['Suspected allergic/celiac cross-contact','Food held at unsafe temperatures or questionable spoilage','Unsafe boating/swimming conditions','Fire restriction or uncontrolled flame concern','Serious injury, missing person or other emergency']}/></div>
      </div>
    </section>

    <section className="grid lg:grid-cols-2 gap-4">
      <div className="card break-inside-avoid"><div className="flex gap-2 items-center"><Thermometer className="text-forest"/><h3 className="text-lg font-extrabold text-navy">Food Safety Controls</h3></div><Checklist items={['Refrigerators at 4°C or colder; freezer at -18°C or colder','Raw meat/seafood contained and stored below ready-to-eat foods','Separate clean utensils/boards for ready-to-eat and raw foods','Poultry pieces reach 74°C; ground beef/pork reaches 71°C','Shellfish/crustaceans reach 74°C; discard shellfish that do not open','Leftovers reheated to 74°C and refrigerated within 2 hours','Digital food thermometer clean and available']}/></div>
      <div className="card break-inside-avoid"><div className="flex gap-2 items-center"><ShieldCheck className="text-forest"/><h3 className="text-lg font-extrabold text-navy">Celiac / Dietary Controls</h3></div>{dietary.length>0&&<div className="text-sm bg-cream rounded-xl p-3 mt-3"><b>Current dietary flags:</b> {dietary.map(profile=>`${profile.name}: ${(profile.dietary||[]).join(', ')}`).join(' · ')}</div>}<Checklist items={['Prepare gluten-free food first when practical','Use clean bowls, utensils, boards and serving tools','Keep GF bread/croutons/buns separate from regular versions','Verify sauces, marinades and seasonings before use','Label or physically separate GF portions at buffet/service']}/></div>
      <div className="card break-inside-avoid"><h3 className="text-lg font-extrabold text-navy">Waterfront & Outdoor Safety</h3><Checklist items={['Weather and wind checked before boating/paddling/swimming','Appropriate PFDs available and worn for watercraft','Children/teens have an identified adult swim/water watch','Dock, stairs and paths kept clear of trip hazards','Boat operators remain unimpaired and follow local rules']}/></div>
      <div className="card break-inside-avoid"><h3 className="text-lg font-extrabold text-navy">Fire, Grill & Smoker Safety</h3><Checklist items={['Current New Brunswick fire restrictions checked before outdoor fires','Grill/smoker placed on stable surface with safe clearance','Fire/extinguishing water readily available','Hot equipment supervised and kept away from children','Ashes/coals fully cold before disposal']}/></div>
    </section>

    <section className="card report-page-break">
      <div className="flex gap-3 items-start"><AlertTriangle className="text-amber-600"/><div><h2 className="text-xl font-extrabold text-navy">Quality & Safety Officer — Daily Sign-off</h2><p className="text-sm text-stone">One row per day. Record concerns or corrective actions on the back / in Notes.</p></div></div>
      <div className="overflow-x-auto mt-4"><table className="w-full text-sm border-collapse"><thead><tr className="bg-cream"><th className="border p-2 text-left">Date</th><th className="border p-2">Fridge / food</th><th className="border p-2">GF controls</th><th className="border p-2">Weather / site</th><th className="border p-2">Fire / water</th><th className="border p-2">Officer initials</th></tr></thead><tbody>{dates.map(date=><tr key={date}><td className="border p-3 font-semibold">{formatMealDate(date)}</td><td className="border p-3 text-center">☐</td><td className="border p-3 text-center">☐</td><td className="border p-3 text-center">☐</td><td className="border p-3 text-center">☐</td><td className="border p-3 min-w-28"></td></tr>)}</tbody></table></div>
      <div className="mt-5 grid md:grid-cols-2 gap-4"><div className="border rounded-xl p-4 min-h-32"><b>Issues / observations</b></div><div className="border rounded-xl p-4 min-h-32"><b>Corrective actions</b></div></div>
    </section>

    <section className="text-xs text-stone px-2 pb-6"><FileText size={14} className="inline mr-1"/>Food-safety temperatures in this checklist follow Health Canada guidance. Outdoor fire restrictions should be checked against current Government of New Brunswick information on the day of use.</section>
  </div>
}
