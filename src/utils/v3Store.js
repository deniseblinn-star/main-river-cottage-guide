import seed from '../data/v3Foundation.json'
import guestData from '../data/guests.json'

const KEY='main-river-v3-foundation'
const pad=n=>String(n).padStart(2,'0')
const dateOnly=value=>value?.slice(0,10)

function buildDays(){
 const start=new Date(`${seed.overallEvent.start}T00:00:00`)
 const end=new Date(`${seed.overallEvent.end}T00:00:00`)
 const days=[]
 for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){
  const date=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
  days.push({id:date,date,mealSlots:seed.mealTypes.map(type=>{const isTest=date==='2026-08-24'&&type.id==='dinner';return {id:`${date}-${type.id}`,typeId:type.id,time:type.defaultTime,manualAdd:[],manualRemove:[],planType:isTest?'recipes':'simple',simplePlan:'Nothing planned — figure it out',recipeAssignments:isTest?[{recipeId:'greek-beef-skewers',leadProfileId:'kevin',notes:'Version 3 end-to-end test'}]:[],restaurant:null}})})
 }
 return days
}
function buildAttendance(){
 return guestData.guests.map(g=>({profileId:g.id,arrival:`${g.arrival||seed.overallEvent.start}T12:00`,departure:`${g.departure||seed.overallEvent.end}T10:00`,needsAccommodation:!['danielle','kevin'].includes(g.id),notes:g.notes||''}))
}
function buildBedAssignments(){
 const assignments={}
 const nights=buildDays().slice(0,-1).map(d=>d.date)
 for(const night of nights){
  assignments[night]={
   'denise-master-queen':['denise','steve'],
   'danielle-master-queen':['danielle','kevin']
  }
 }
 return assignments
}
export function defaultV3State(){
 return {event:seed.overallEvent,profiles:guestData.guests,attendance:buildAttendance(),days:buildDays(),accommodations:seed.accommodations,bedAssignments:buildBedAssignments(),structuredRecipes:seed.structuredRecipes}
}
export function loadV3(){
 try{return {...defaultV3State(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return defaultV3State()}
}
export function saveV3(state){localStorage.setItem(KEY,JSON.stringify(state));window.dispatchEvent(new Event('main-river-v3-change'))}
export function resetV3(){localStorage.removeItem(KEY);return defaultV3State()}
export function getMealType(typeId){return seed.mealTypes.find(x=>x.id===typeId)}
export function mealDateTime(slot,date){return new Date(`${date}T${slot.time}:00`)}
export function finalMealAttendees(state,day,slot){
 const type=getMealType(slot.typeId)
 const automatic=type?.automatic?state.attendance.filter(a=>{const at=mealDateTime(slot,day.date);return at>=new Date(a.arrival)&&at<=new Date(a.departure)}).map(a=>a.profileId):[]
 return [...new Set([...automatic,...slot.manualAdd])].filter(id=>!slot.manualRemove.includes(id))
}
export function profilePresentOnNight(attendance,night){
 const check=new Date(`${night}T23:00:00`)
 return check>=new Date(attendance.arrival)&&check<=new Date(attendance.departure)
}
export function allSleepingSpaces(state){
 return state.accommodations.flatMap(a=>a.rooms.flatMap(r=>r.spaces.map(s=>({...s,roomName:r.name,accommodationId:a.id,accommodationName:a.name,active:a.active}))))
}
export function v3GeneratedGroceries(){
 const state=loadV3(),recipes=Object.fromEntries(state.structuredRecipes.map(r=>[r.id,r])),merged={}
 for(const day of state.days) for(const slot of day.mealSlots){
  const attendance=finalMealAttendees(state,day,slot).length
  for(const assignment of slot.recipeAssignments||[]){
   const recipe=recipes[assignment.recipeId]; if(!recipe||!attendance) continue
   const scale=attendance/recipe.yield
   for(const ingredient of recipe.ingredients.filter(i=>i.shopping)){
    const key=`v3-${ingredient.id}-${ingredient.unit}`
    const quantity=Math.round(ingredient.quantity*scale*100)/100
    const source={recipe:recipe.name,meal:`${day.date} ${getMealType(slot.typeId)?.label}`,attendance,yield:recipe.yield,quantity}
    if(!merged[key]) merged[key]={id:key,ingredientId:ingredient.id,name:ingredient.name,quantity,unit:ingredient.unit,department:ingredient.category,source:'recipe',notes:'V3 meal assignment',sources:[source]}
    else{merged[key].quantity=Math.round((merged[key].quantity+quantity)*100)/100;merged[key].sources.push(source)}
   }
  }
 }
 return Object.values(merged)
}
