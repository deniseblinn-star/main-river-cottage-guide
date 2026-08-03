import weekData from '../data/week.json'

export const MEAL_TYPES=[
  {id:'breakfast',label:'Breakfast',defaultTime:'09:00',automatic:false},
  {id:'brunch',label:'Brunch',defaultTime:'11:00',automatic:false},
  {id:'lunch',label:'Lunch',defaultTime:'13:00',automatic:true},
  {id:'early-snack',label:'Early Snack',defaultTime:'15:00',automatic:true},
  {id:'dinner',label:'Dinner',defaultTime:'18:30',automatic:true},
  {id:'late-snack',label:'Late Snack',defaultTime:'20:00',automatic:true}
]

export function dateRange(startDate,endDate){
  const dates=[]
  if(!startDate||!endDate)return dates
  const current=new Date(`${startDate}T12:00:00`)
  const end=new Date(`${endDate}T12:00:00`)
  while(current<=end){
    dates.push(current.toISOString().slice(0,10))
    current.setDate(current.getDate()+1)
  }
  return dates
}

export function mealSlotId(eventId,date,type){return `${eventId}-${date}-${type}`}

function legacyMealFor(date,type){
  const day=weekData.days.find(row=>row.date===date)
  if(!day)return null
  if(type==='lunch')return day.meals?.lunch
  if(type==='early-snack')return day.meals?.snack
  if(type==='dinner')return day.meals?.dinner
  if(type==='late-snack')return day.meals?.dessert
  return null
}

function seedSlot(event,date,definition){
  const legacy=event.id==='main-river-2026'?legacyMealFor(date,definition.id):null
  const recipeIds=legacy?.recipeIds||[]
  const description=legacy?.items?.join(' • ')||''
  return {
    id:mealSlotId(event.id,date,definition.id),
    date,
    type:definition.id,
    label:definition.label,
    time:definition.defaultTime,
    planType:recipeIds.length?'recipes':description?'simple':'none',
    recipeIds,
    simpleDescription:description,
    restaurant:{name:'',reservationTime:'',address:'',confirmation:'',notes:''},
    notes:'',
    manualIncludes:[],
    manualExcludes:[]
  }
}

export function ensureMealSlots(event){
  const existing=Array.isArray(event.mealSlots)?event.mealSlots:[]
  const existingMap=new Map(existing.map(slot=>[slot.id,slot]))
  return dateRange(event.startDate,event.endDate).flatMap(date=>MEAL_TYPES.map(definition=>{
    const id=mealSlotId(event.id,date,definition.id)
    const slot=existingMap.get(id)||seedSlot(event,date,definition)
    const planType=['recipes','simple','restaurant'].includes(slot.planType)?slot.planType:'none'
    return {
      ...slot,
      date,
      type:definition.id,
      label:definition.label,
      time:slot.time||definition.defaultTime,
      planType,
      // Meal slots own assignments. A stale legacy recipe link is never active
      // after the meal has been changed to Unplanned/simple/restaurant.
      recipeIds:planType==='recipes'?[...new Set((slot.recipeIds||[]).filter(Boolean))]:[],
      manualIncludes:Array.isArray(slot.manualIncludes)?slot.manualIncludes:[],
      manualExcludes:Array.isArray(slot.manualExcludes)?slot.manualExcludes:[]
    }
  }))
}

export function isAutomaticMeal(type){return MEAL_TYPES.find(row=>row.id===type)?.automatic||false}

export function isPresentAt(attendance,date,time){
  if(!attendance?.arrival||!attendance?.departure)return false
  const moment=new Date(`${date}T${time}:00`).getTime()
  const arrival=new Date(attendance.arrival).getTime()
  const departure=new Date(attendance.departure).getTime()
  return Number.isFinite(moment)&&Number.isFinite(arrival)&&Number.isFinite(departure)&&moment>=arrival&&moment<=departure
}

export function automaticAttendeeIds(event,slot){
  if(!event||!slot||!isAutomaticMeal(slot.type))return []
  return event.attendance.filter(row=>isPresentAt(row,slot.date,slot.time)).map(row=>row.profileId)
}

export function finalAttendeeIds(event,slot){
  const ids=new Set(automaticAttendeeIds(event,slot))
  ;(slot.manualIncludes||[]).forEach(id=>ids.add(id))
  ;(slot.manualExcludes||[]).forEach(id=>ids.delete(id))
  return [...ids]
}

export function attendeeStatus(event,slot,profileId){
  const automatic=automaticAttendeeIds(event,slot).includes(profileId)
  const included=(slot.manualIncludes||[]).includes(profileId)
  const excluded=(slot.manualExcludes||[]).includes(profileId)
  return {automatic,included,excluded,attending:(automatic||included)&&!excluded}
}

export function formatMealDate(date){
  return new Intl.DateTimeFormat('en-CA',{weekday:'long',month:'short',day:'numeric'}).format(new Date(`${date}T12:00:00`))
}
