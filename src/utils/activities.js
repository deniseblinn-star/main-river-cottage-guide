import legacyData from '../data/events.json'
import { mealSlotId } from './mealPlanner'

export const ACTIVITY_CATEGORIES=[
  'Party','Meal Tradition','Water','Sports','Campfire','Trip','Holiday','Family','Games','Other'
]

const byId=Object.fromEntries(legacyData.events.map(item=>[item.id,item]))

function template(id,category,equipment=[],checklist=[]){
  const legacy=byId[id]||{}
  return {
    id,
    name:legacy.name||id,
    category,
    description:legacy.description||'',
    typicalDurationMinutes:legacy.startTime&&legacy.endTime?null:120,
    defaultHostProfileId:'',
    equipment,
    checklist,
    music:Array.isArray(legacy.music)?legacy.music:[],
    suggestedMealTypes:Array.isArray(legacy.linkedSlots)?legacy.linkedSlots.map(type=>type==='evening-snack'?'late-snack':type):[],
    notes:legacy.notes||''
  }
}

export const activityTemplateSeed=[
  template('yacht-rock-party','Party',
    ['Bluetooth speaker','Dock lights','Extension cord','Coolers','Dock chairs','Floating cooler'],
    ['Charge speaker','Hang dock lights','Fill coolers','Set up dock chairs','Start playlist']),
  template('main-river-feast','Meal Tradition',
    ['Serving platters','Seafood tools','Extra tables','Coolers'],
    ['Confirm meal attendance','Set tables','Chill seafood','Check recipe leads']),
  template('golf-day','Sports',
    ['Golf clubs','Golf shoes','Cooler'],
    ['Confirm tee time','Confirm drivers','Pack drinks']),
  template('big-birthday-bash','Party',
    ['Decorations','Speaker','Cake table'],
    ['Confirm guest list','Order cake','Set up music']),
  template('christmas-on-the-river','Holiday',
    ['Decorations','Lights','Speaker'],
    ['Decorate','Prepare music','Confirm meal plan']),
  template('lazy-river-float','Water',
    ['Life jackets','Paddle boards','Tubes','Coolers'],
    ['Check weather','Inflate floats','Pack drinks','Confirm safety gear'])
]

function instanceFromLegacy(eventId,legacy){
  if(!legacy?.date)return null
  const linkedTypes=(legacy.linkedSlots||[]).map(type=>type==='evening-snack'?'late-snack':type)
  return {
    id:`${eventId}-activity-${legacy.id}`,
    templateId:legacy.id,
    date:legacy.date,
    startTime:legacy.startTime||'12:00',
    endTime:legacy.endTime||'14:00',
    location:'',
    hostProfileId:'',
    attendeeIds:Array.isArray(legacy.attendeeIds)?legacy.attendeeIds:[],
    externalGuests:Array.isArray(legacy.externalGuests)?legacy.externalGuests:[],
    linkedMealSlotIds:linkedTypes.map(type=>mealSlotId(eventId,legacy.date,type)),
    checklistCompleted:{},
    notes:legacy.notes||''
  }
}

export function seedActivitiesForEvent(event){
  if(event.id!=='main-river-2026')return []
  return legacyData.events.map(item=>instanceFromLegacy(event.id,item)).filter(Boolean)
}

export function ensureActivityTemplates(value){
  if(!Array.isArray(value)||!value.length)return activityTemplateSeed
  const existing=new Map(value.map(item=>[item.id,item]))
  return activityTemplateSeed.map(seed=>existing.get(seed.id)||seed)
    .concat(value.filter(item=>!activityTemplateSeed.some(seed=>seed.id===item.id)))
}

export function ensureEventActivities(event){
  if(Array.isArray(event.activityInstances))return event.activityInstances
  return seedActivitiesForEvent(event)
}

export function activityDateLabel(date){
  if(!date)return 'Not scheduled'
  return new Intl.DateTimeFormat('en-CA',{weekday:'short',month:'short',day:'numeric'}).format(new Date(`${date}T12:00:00`))
}

export function activityTimeLabel(value){
  if(!value)return ''
  const [hour,minute]=value.split(':').map(Number)
  return new Date(2026,0,1,hour,minute).toLocaleTimeString('en-CA',{hour:'numeric',minute:'2-digit'})
}
