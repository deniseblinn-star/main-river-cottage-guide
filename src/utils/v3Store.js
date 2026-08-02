import seed from '../data/v3Foundation.json'
import guestData from '../data/guests.json'

const KEY='main-river-v3-foundation'
const pad=n=>String(n).padStart(2,'0')
const clone=value=>JSON.parse(JSON.stringify(value))

function buildDays(event=seed.overallEvent){
 const start=new Date(`${event.start}T00:00:00`)
 const end=new Date(`${event.end}T00:00:00`)
 const days=[]
 for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){
  const date=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
  days.push({id:date,date,mealSlots:seed.mealTypes.map(type=>{const isTest=event.id==='main-river-2026'&&date==='2026-08-24'&&type.id==='dinner';return {id:`${event.id}-${date}-${type.id}`,typeId:type.id,time:type.defaultTime,manualAdd:[],manualRemove:[],planType:isTest?'recipes':'simple',simplePlan:'Nothing planned — figure it out',recipeAssignments:isTest?[{recipeId:'greek-beef-skewers',leadProfileId:'kevin',notes:'Version 3 end-to-end test'}]:[],restaurant:null}})})
 }
 return days
}
function buildAttendance(event=seed.overallEvent){
 return guestData.guests.map(g=>({profileId:g.id,arrival:`${g.arrival||event.start}T12:00`,departure:`${g.departure||event.end}T10:00`,needsAccommodation:!['danielle','kevin'].includes(g.id),notes:g.notes||''}))
}
function buildBedAssignments(event=seed.overallEvent){
 const assignments={}
 const nights=buildDays(event).slice(0,-1).map(d=>d.date)
 for(const night of nights) assignments[night]={'denise-master-queen':['denise','steve'],'danielle-master-queen':['danielle','kevin']}
 return assignments
}
function eventRecord(event=seed.overallEvent){return {...clone(event),attendance:buildAttendance(event),days:buildDays(event),bedAssignments:buildBedAssignments(event),activeAccommodationIds:seed.accommodations.filter(a=>a.active).map(a=>a.id)}}
export function defaultV3State(){
 const event=eventRecord(seed.overallEvent)
 return {profiles:clone(guestData.guests),events:[event],currentEventId:event.id,accommodations:clone(seed.accommodations),structuredRecipes:clone(seed.structuredRecipes)}
}
function migrate(raw){
 if(raw?.events?.length) return raw
 if(raw?.event){
  const event={...raw.event,attendance:raw.attendance||buildAttendance(raw.event),days:raw.days||buildDays(raw.event),bedAssignments:raw.bedAssignments||buildBedAssignments(raw.event),activeAccommodationIds:(raw.accommodations||seed.accommodations).filter(a=>a.active).map(a=>a.id)}
  return {profiles:raw.profiles||clone(guestData.guests),events:[event],currentEventId:event.id,accommodations:raw.accommodations||clone(seed.accommodations),structuredRecipes:raw.structuredRecipes||clone(seed.structuredRecipes)}
 }
 return defaultV3State()
}
function flatten(base){
 const current=base.events.find(e=>e.id===base.currentEventId)||base.events[0]
 const accommodations=base.accommodations.map(a=>({...a,active:(current.activeAccommodationIds||[]).includes(a.id)}))
 return {...base,event:current,attendance:current.attendance||[],days:current.days||[],bedAssignments:current.bedAssignments||{},accommodations}
}
export function loadV3(){try{return flatten(migrate(JSON.parse(localStorage.getItem(KEY)||'null')))}catch{return flatten(defaultV3State())}}
export function saveV3(state){
 const current={...state.event,attendance:state.attendance,days:state.days,bedAssignments:state.bedAssignments,activeAccommodationIds:state.accommodations.filter(a=>a.active).map(a=>a.id)}
 const base={profiles:state.profiles,events:(state.events||[]).some(e=>e.id===current.id)?state.events.map(e=>e.id===current.id?current:e):[...(state.events||[]),current],currentEventId:current.id,accommodations:state.accommodations.map(({active,...a})=>a),structuredRecipes:state.structuredRecipes}
 localStorage.setItem(KEY,JSON.stringify(base));window.dispatchEvent(new Event('main-river-v3-change'))
}
export function switchEvent(id){const state=loadV3();const base={profiles:state.profiles,events:state.events,currentEventId:id,accommodations:state.accommodations.map(({active,...a})=>a),structuredRecipes:state.structuredRecipes};localStorage.setItem(KEY,JSON.stringify(base));window.dispatchEvent(new Event('main-river-v3-change'));return loadV3()}
export function createEvent({name,location,start,end,copyAttendance=false}){
 const state=loadV3();const id=`event-${Date.now()}`;const event={id,name,location,start,end,attendance:copyAttendance?state.attendance.map(a=>({...a,arrival:`${start}T12:00`,departure:`${end}T10:00`})):[],days:buildDays({id,name,location,start,end}),bedAssignments:buildBedAssignments({id,name,location,start,end}),activeAccommodationIds:state.accommodations.filter(a=>a.active).map(a=>a.id)}
 const base={profiles:state.profiles,events:[...state.events,event],currentEventId:id,accommodations:state.accommodations.map(({active,...a})=>a),structuredRecipes:state.structuredRecipes};localStorage.setItem(KEY,JSON.stringify(base));return loadV3()
}
export function deleteEvent(id){const state=loadV3();if(state.events.length<=1)return state;const events=state.events.filter(e=>e.id!==id);const currentEventId=state.currentEventId===id?events[0].id:state.currentEventId;localStorage.setItem(KEY,JSON.stringify({profiles:state.profiles,events,currentEventId,accommodations:state.accommodations.map(({active,...a})=>a),structuredRecipes:state.structuredRecipes}));return loadV3()}
export function resetV3(){localStorage.removeItem(KEY);return loadV3()}
export function getMealType(typeId){return seed.mealTypes.find(x=>x.id===typeId)}
export function mealDateTime(slot,date){return new Date(`${date}T${slot.time}:00`)}
export function finalMealAttendees(state,day,slot){const type=getMealType(slot.typeId);const automatic=type?.automatic?state.attendance.filter(a=>{const at=mealDateTime(slot,day.date);return at>=new Date(a.arrival)&&at<=new Date(a.departure)}).map(a=>a.profileId):[];return [...new Set([...automatic,...slot.manualAdd])].filter(id=>!slot.manualRemove.includes(id))}
export function profilePresentOnNight(attendance,night){const check=new Date(`${night}T23:00:00`);return check>=new Date(attendance.arrival)&&check<=new Date(attendance.departure)}
export function allSleepingSpaces(state){return state.accommodations.flatMap(a=>a.rooms.flatMap(r=>r.spaces.map(s=>({...s,roomName:r.name,accommodationId:a.id,accommodationName:a.name,active:a.active}))))}
export function v3GeneratedGroceries(){const state=loadV3(),recipes=Object.fromEntries(state.structuredRecipes.map(r=>[r.id,r])),merged={};for(const day of state.days)for(const slot of day.mealSlots){const attendance=finalMealAttendees(state,day,slot).length;for(const assignment of slot.recipeAssignments||[]){const recipe=recipes[assignment.recipeId];if(!recipe||!attendance)continue;const scale=attendance/recipe.yield;for(const ingredient of recipe.ingredients.filter(i=>i.shopping)){const key=`v3-${ingredient.id}-${ingredient.unit}`;const quantity=Math.round(ingredient.quantity*scale*100)/100;const source={recipe:recipe.name,meal:`${day.date} ${getMealType(slot.typeId)?.label}`,attendance,yield:recipe.yield,quantity};if(!merged[key])merged[key]={id:key,ingredientId:ingredient.id,name:ingredient.name,quantity,unit:ingredient.unit,department:ingredient.category,source:'recipe',notes:'V3 meal assignment',sources:[source]};else{merged[key].quantity=Math.round((merged[key].quantity+quantity)*100)/100;merged[key].sources.push(source)}}}}return Object.values(merged)}
