import { Link } from 'react-router-dom'
import { CalendarDays, ChevronRight, Users } from 'lucide-react'
import { useEvent } from '../context/EventContext'
import { dateRange, finalAttendeeIds, formatMealDate, MEAL_TYPES } from '../utils/mealPlanner'
import { getRecipeCatalogue } from '../utils/recipeCatalogue'

function slotSummary(slot,recipeMap){
  if(slot.planType==='restaurant')return slot.restaurant?.name||'Restaurant not selected'
  if(slot.planType==='simple')return slot.simpleDescription||'Simple food plan'
  if(slot.planType==='recipes')return slot.recipeIds.map(id=>recipeMap[id]?.title).filter(Boolean).join(' • ')||'Add recipes'
  return 'Not planned'
}

export default function WeeklyPlanner(){
  const {activeEvent}=useEvent()
  const recipes=getRecipeCatalogue()
  const recipeMap=Object.fromEntries(recipes.map(recipe=>[recipe.id,recipe]))
  if(!activeEvent)return <div className="card">Create an Overall Event first.</div>
  const dates=dateRange(activeEvent.startDate,activeEvent.endDate)
  return <div className="space-y-4">
    <div><h1 className="page-title">Meal Planner</h1><p className="text-stone">Every meal is tied to a date, time and the active Overall Event.</p></div>
    <div className="bg-forest/5 border border-forest/15 rounded-2xl p-4 text-sm"><b>{activeEvent.name}</b><p className="text-stone mt-1">Lunch, Early Snack, Dinner and Late Snack automatically include people present at that time. Breakfast and Brunch start unassigned.</p></div>
    {dates.map(date=>{
      const slots=activeEvent.mealSlots.filter(slot=>slot.date===date)
      return <section key={date} className="card">
        <div className="flex justify-between gap-3 items-start"><div><p className="section-title">{formatMealDate(date)}</p><h2 className="text-xl font-extrabold text-navy">Daily Meals</h2></div><Link to={`/daily/${date}`} className="btn-primary flex items-center gap-1">Plan day<ChevronRight size={17}/></Link></div>
        <div className="grid md:grid-cols-2 gap-2 mt-4">{MEAL_TYPES.map(def=>{
          const slot=slots.find(row=>row.type===def.id)
          const count=slot?finalAttendeeIds(activeEvent,slot).length:0
          return <div key={def.id} className="bg-cream rounded-2xl p-3"><div className="flex justify-between gap-2"><div><p className="font-extrabold text-navy">{def.label}</p><p className="text-xs text-stone flex items-center gap-1"><CalendarDays size={12}/>{slot?.time||def.defaultTime}</p></div><span className="badge-forest"><Users size={12}/>{count}</span></div><p className="text-sm mt-2 line-clamp-2">{slot?slotSummary(slot,recipeMap):'Not planned'}</p></div>
        })}</div>
      </section>
    })}
  </div>
}
