import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Check, ChevronDown, ChevronUp, Clock, Plus, Trash2, Users } from 'lucide-react'
import { useEvent } from '../context/EventContext'
import { attendeeStatus, dateRange, finalAttendeeIds, formatMealDate, MEAL_TYPES } from '../utils/mealPlanner'
import { getRecipeCatalogue } from '../utils/recipeCatalogue'

const planTypes=[['none','Not planned'],['recipes','Recipes'],['restaurant','Restaurant'],['simple','Simple plan']]

function MealSlotCard({slot,profiles,event,recipes,updateMealSlot,addRecipeToMeal,removeRecipeFromMeal,toggleMealAttendee}){
  const [showAttendance,setShowAttendance]=useState(false)
  const [recipeChoice,setRecipeChoice]=useState('')
  const attendeeIds=finalAttendeeIds(event,slot)
  const recipeMap=Object.fromEntries(recipes.map(recipe=>[recipe.id,recipe]))
  const availableRecipes=recipes.filter(recipe=>!slot.recipeIds.includes(recipe.id))
  const updateRestaurant=(field,value)=>updateMealSlot(slot.id,{restaurant:{...(slot.restaurant||{}),[field]:value}})
  return <section className="card">
    <div className="flex flex-wrap justify-between gap-3 items-start">
      <div><h2 className="text-xl font-extrabold text-navy">{slot.label}</h2><p className="text-sm text-stone">{attendeeIds.length} attending</p></div>
      <label className="flex items-center gap-2 bg-cream rounded-xl px-3 py-2"><Clock size={16}/><input type="time" value={slot.time} onChange={e=>updateMealSlot(slot.id,{time:e.target.value})} className="bg-transparent font-semibold outline-none"/></label>
    </div>

    <div className="flex gap-2 overflow-x-auto mt-4">{planTypes.map(([id,label])=><button key={id} onClick={()=>updateMealSlot(slot.id,{planType:id})} className={`px-3 py-2 rounded-full whitespace-nowrap text-sm font-semibold ${slot.planType===id?'bg-forest text-white':'bg-cream text-navy'}`}>{label}</button>)}</div>

    {slot.planType==='recipes'&&<div className="mt-4 space-y-3">
      <div className="flex gap-2"><select value={recipeChoice} onChange={e=>setRecipeChoice(e.target.value)} className="flex-1 border rounded-xl p-3 bg-white"><option value="">Choose a recipe</option>{availableRecipes.map(recipe=><option key={recipe.id} value={recipe.id}>{recipe.title}</option>)}</select><button onClick={()=>{if(recipeChoice){addRecipeToMeal(slot.id,recipeChoice);setRecipeChoice('')}}} disabled={!recipeChoice} className="btn-primary flex items-center gap-1 disabled:opacity-40"><Plus size={17}/>Add</button></div>
      {slot.recipeIds.length===0?<p className="text-sm text-stone">No recipes assigned. Catalogue recipes do not affect a meal until added here.</p>:slot.recipeIds.map(id=><div key={id} className="flex justify-between gap-3 bg-cream rounded-2xl p-3"><div><b>{recipeMap[id]?.title||'Missing recipe'}</b><p className="text-xs text-stone">Recipe yield: {recipeMap[id]?.servings||'not set'}</p></div><button onClick={()=>removeRecipeFromMeal(slot.id,id)} className="text-red-700 p-2"><Trash2 size={17}/></button></div>)}
    </div>}

    {slot.planType==='restaurant'&&<div className="grid sm:grid-cols-2 gap-3 mt-4"><label><span className="section-title">Restaurant</span><input value={slot.restaurant?.name||''} onChange={e=>updateRestaurant('name',e.target.value)} className="w-full mt-1 p-3 border rounded-xl" placeholder="Restaurant name"/></label><label><span className="section-title">Reservation</span><input type="time" value={slot.restaurant?.reservationTime||''} onChange={e=>updateRestaurant('reservationTime',e.target.value)} className="w-full mt-1 p-3 border rounded-xl"/></label><label className="sm:col-span-2"><span className="section-title">Address / confirmation / notes</span><textarea value={slot.restaurant?.notes||''} onChange={e=>updateRestaurant('notes',e.target.value)} className="w-full mt-1 p-3 border rounded-xl min-h-20"/></label></div>}

    {slot.planType==='simple'&&<label className="block mt-4"><span className="section-title">Food plan</span><textarea value={slot.simpleDescription||''} onChange={e=>updateMealSlot(slot.id,{simpleDescription:e.target.value})} className="w-full mt-1 p-3 border rounded-xl min-h-20" placeholder="Cereal, bagels and fruit..."/></label>}
    {slot.planType==='none'&&<p className="text-sm text-stone mt-4">Nothing planned for this meal slot.</p>}

    <button onClick={()=>setShowAttendance(!showAttendance)} className="w-full flex justify-between items-center mt-4 pt-4 border-t font-semibold text-forest"><span className="flex items-center gap-2"><Users size={17}/>Attendance ({attendeeIds.length})</span>{showAttendance?<ChevronUp size={18}/>:<ChevronDown size={18}/>}</button>
    {showAttendance&&<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">{event.attendance.map(row=>{
      const profile=profiles.find(item=>item.id===row.profileId)
      if(!profile)return null
      const status=attendeeStatus(event,slot,row.profileId)
      return <button key={row.profileId} onClick={()=>toggleMealAttendee(slot.id,row.profileId)} className={`rounded-xl border p-3 text-left ${status.attending?'bg-forest/10 border-forest/30':'bg-white'}`}><div className="flex justify-between gap-2"><b>{profile.name}</b>{status.attending&&<Check size={17} className="text-forest"/>}</div><p className="text-xs text-stone mt-1">{status.excluded?'Manually excluded':status.included?'Manually added':status.automatic?'Automatic from stay':'Not assigned'}</p></button>
    })}</div>}
  </section>
}

export default function DailyPlanner(){
  const {dayId}=useParams()
  const {activeEvent,profiles,updateMealSlot,addRecipeToMeal,removeRecipeFromMeal,toggleMealAttendee}=useEvent()
  const dates=useMemo(()=>activeEvent?dateRange(activeEvent.startDate,activeEvent.endDate):[],[activeEvent])
  const initial=dates.includes(dayId)?dayId:dates[0]
  const [selectedDate,setSelectedDate]=useState(initial)
  const recipes=getRecipeCatalogue()
  if(!activeEvent)return <div className="card">Create an Overall Event first.</div>
  const selected=dates.includes(selectedDate)?selectedDate:dates[0]
  const slots=activeEvent.mealSlots.filter(slot=>slot.date===selected).sort((a,b)=>MEAL_TYPES.findIndex(row=>row.id===a.type)-MEAL_TYPES.findIndex(row=>row.id===b.type))
  return <div className="space-y-5">
    <div className="flex gap-2 overflow-x-auto pb-1">{dates.map(date=><button key={date} onClick={()=>setSelectedDate(date)} className={`px-4 py-2 rounded-full whitespace-nowrap font-semibold ${date===selected?'bg-forest text-white':'bg-white text-stone'}`}>{new Intl.DateTimeFormat('en-CA',{weekday:'short',day:'numeric'}).format(new Date(`${date}T12:00:00`))}</button>)}</div>
    <section className="rounded-3xl bg-navy text-white p-6"><p className="opacity-75">{activeEvent.name}</p><h1 className="text-3xl font-extrabold">{formatMealDate(selected)}</h1><p className="mt-2 opacity-80">Configure each meal time, plan and attendance.</p></section>
    {slots.map(slot=><MealSlotCard key={slot.id} slot={slot} profiles={profiles} event={activeEvent} recipes={recipes} updateMealSlot={updateMealSlot} addRecipeToMeal={addRecipeToMeal} removeRecipeFromMeal={removeRecipeFromMeal} toggleMealAttendee={toggleMealAttendee}/>) }
  </div>
}
