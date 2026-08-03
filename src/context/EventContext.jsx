import { createContext, useContext, useMemo, useState } from 'react'
import guestData from '../data/guests.json'
import { attendeeStatus, ensureMealSlots, finalAttendeeIds } from '../utils/mealPlanner'
import { accommodationSeed } from '../utils/accommodations'
import { activityTemplateSeed, ensureActivityTemplates, ensureEventActivities } from '../utils/activities'

const STORAGE_KEY='main-river-v3-event-engine'

const DEFAULT_ROLES=[
  'Chief Planning Officer',
  'Event Coordinator',
  'Travel Coordinator',
  'Activities Coordinator',
  'Pitmaster',
  'Sous Chef',
  'Breakfast Captain',
  'Grill Master',
  'Seafood Captain',
  'Dessert Coordinator',
  'Costco Captain',
  'Grocery Runner',
  'Ice Runner',
  'Beverage Manager',
  'DJ',
  'Campfire Host',
  'Games Coordinator',
  'Photographer',
  'Dock Captain',
  'Boat Captain',
  'Safety Lead',
  'Cleanup Crew',
  'Recycling Captain',
  'Fun Aunt',
  'Kids Activities',
  'Swim Watch'
]

const PROFILE_DIETARY_SEED={
  adele:['Gluten Free'],
  alex:['Gluten Free'],
  kevin:['Lactose']
}

function normalizeProfile(profile){
  const legacyRoles=Array.isArray(profile.roles)
    ? profile.roles
    : profile.role
      ? [profile.role]
      : []
  const seededDietary=PROFILE_DIETARY_SEED[profile.id]||[]
  const dietary=[...new Set([...(Array.isArray(profile.dietary)?profile.dietary:[]),...seededDietary])]
  return {
    ...profile,
    roles:[...new Set(legacyRoles.filter(Boolean))],
    role:legacyRoles[0]||'',
    dietary,
    favouriteLunch:profile.favouriteLunch||'',
    favouriteDinner:profile.favouriteDinner||'',
    notes:profile.notes||''
  }
}
const dateTime=(date,time='12:00')=>`${date}T${time}`

const profilesSeed=guestData.guests.map(guest=>normalizeProfile({
  id:guest.id,
  name:guest.name,
  role:guest.role||'',
  roles:guest.role?[guest.role]:[],
  dietary:Array.isArray(guest.dietary)?guest.dietary:[],
  favouriteLunch:'',
  favouriteDinner:'',
  notes:guest.notes||''
}))

const mainRiverAttendance=guestData.guests.map(guest=>({
  profileId:guest.id,
  arrival:dateTime(guest.arrival||'2026-08-22',guest.arrivalTime||'12:00'),
  departure:dateTime(guest.departure||'2026-08-30',guest.departureTime||'10:00'),
  needsAccommodation:!['danielle','kevin'].includes(guest.id),notes:''
}))

const mainRiverEvent={id:'main-river-2026',name:'Main River Cottage Week 2026',location:'Main River, New Brunswick',startDate:'2026-08-22',endDate:'2026-08-30',notes:'Annual Main River cottage gathering.',attendance:mainRiverAttendance,activeAccommodationIds:['denise-cottage','danielle-cottage','catherine-cottage'],defaultBedAssignments:{denise:'denise-master-queen',steve:'denise-master-queen',danielle:'danielle-master-queen',kevin:'danielle-master-queen'},nightlyBedOverrides:{}}
mainRiverEvent.mealSlots=ensureMealSlots(mainRiverEvent)
mainRiverEvent.activityInstances=ensureEventActivities(mainRiverEvent)

const seed={activeEventId:'main-river-2026',profiles:profilesSeed,roleLibrary:DEFAULT_ROLES,accommodations:accommodationSeed,activityTemplates:activityTemplateSeed,events:[mainRiverEvent]}

function normalizeState(candidate){
  const base=candidate&&Array.isArray(candidate.events)&&Array.isArray(candidate.profiles)?candidate:seed
  const accommodations=Array.isArray(base.accommodations)&&base.accommodations.length?base.accommodations:accommodationSeed
  const activityTemplates=ensureActivityTemplates(base.activityTemplates)
  const profiles=(base.profiles||[]).map(normalizeProfile)
  const profileRoles=profiles.flatMap(profile=>profile.roles||[])
  const roleLibrary=[...new Set([...(Array.isArray(base.roleLibrary)?base.roleLibrary:[]),...DEFAULT_ROLES,...profileRoles])].filter(Boolean)
  const events=base.events.map(event=>{
    const isMainRiver=event.id==='main-river-2026'
    return {...event,attendance:Array.isArray(event.attendance)?event.attendance:[],mealSlots:ensureMealSlots(event),activeAccommodationIds:Array.isArray(event.activeAccommodationIds)?event.activeAccommodationIds:(isMainRiver?['denise-cottage','danielle-cottage','catherine-cottage']:['denise-cottage','danielle-cottage']),defaultBedAssignments:event.defaultBedAssignments||(isMainRiver?{denise:'denise-master-queen',steve:'denise-master-queen',danielle:'danielle-master-queen',kevin:'danielle-master-queen'}:{}),nightlyBedOverrides:event.nightlyBedOverrides||{},activityInstances:ensureEventActivities(event)}
  })
  const activeEventId=events.some(event=>event.id===base.activeEventId)?base.activeEventId:events[0]?.id
  return {...base,profiles,roleLibrary,accommodations,activityTemplates,events,activeEventId}
}

function loadState(){
  try{return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY)||'null'))}
  catch{return seed}
}

const EventContext=createContext(null)

export function EventProvider({children}){
  const [state,setState]=useState(loadState)
  const persist=next=>{const normalized=normalizeState(next);setState(normalized);localStorage.setItem(STORAGE_KEY,JSON.stringify(normalized))}
  const activeEvent=state.events.find(event=>event.id===state.activeEventId)||state.events[0]

  const replaceActiveEvent=updated=>persist({...state,events:state.events.map(event=>event.id===updated.id?updated:event)})

  const actions=useMemo(()=>({
    setActiveEvent:id=>persist({...state,activeEventId:id}),
    createEvent:({name,location,startDate,endDate,copyAttendance})=>{
      const id=`event-${Date.now()}`
      const attendance=copyAttendance&&activeEvent?activeEvent.attendance.map(row=>({...row,arrival:`${startDate}T12:00`,departure:`${endDate}T10:00`})):[]
      const event={id,name,location,startDate,endDate,notes:'',attendance,activeAccommodationIds:['denise-cottage','danielle-cottage'],defaultBedAssignments:{},nightlyBedOverrides:{},activityInstances:[]}
      event.mealSlots=ensureMealSlots(event)
      persist({...state,events:[...state.events,event],activeEventId:id});return id
    },
    updateEvent:(id,patch)=>persist({...state,events:state.events.map(event=>{
      if(event.id!==id)return event
      const updated={...event,...patch}
      return {...updated,mealSlots:ensureMealSlots(updated)}
    })}),
    deleteEvent:id=>{
      if(state.events.length===1)return false
      const events=state.events.filter(event=>event.id!==id)
      persist({...state,events,activeEventId:state.activeEventId===id?events[0].id:state.activeEventId});return true
    },
    addProfile:profile=>{
      const id=`profile-${Date.now()}`
      const normalized=normalizeProfile({id,dietary:[],roles:[],favouriteLunch:'',favouriteDinner:'',notes:'',...profile})
      persist({...state,profiles:[...state.profiles,normalized]})
      return id
    },
    updateProfile:(id,patch)=>persist({...state,profiles:state.profiles.map(profile=>{
      if(profile.id!==id)return profile
      const updated={...profile,...patch}
      if(Array.isArray(patch.roles))updated.role=patch.roles[0]||''
      return normalizeProfile(updated)
    })}),
    addRole:role=>{
      const clean=role.trim()
      if(!clean)return
      persist({...state,roleLibrary:[...new Set([...(state.roleLibrary||[]),clean])]})
    },
    addAttendee:profileId=>{
      if(!activeEvent||activeEvent.attendance.some(row=>row.profileId===profileId))return
      replaceActiveEvent({...activeEvent,attendance:[...activeEvent.attendance,{profileId,arrival:`${activeEvent.startDate}T12:00`,departure:`${activeEvent.endDate}T10:00`,needsAccommodation:true,notes:''}]})
    },
    removeAttendee:profileId=>replaceActiveEvent({...activeEvent,attendance:activeEvent.attendance.filter(row=>row.profileId!==profileId),mealSlots:activeEvent.mealSlots.map(slot=>({...slot,manualIncludes:(slot.manualIncludes||[]).filter(id=>id!==profileId),manualExcludes:(slot.manualExcludes||[]).filter(id=>id!==profileId)})),activityInstances:(activeEvent.activityInstances||[]).map(item=>({...item,attendeeIds:(item.attendeeIds||[]).filter(id=>id!==profileId)}))}),
    updateAttendance:(profileId,patch)=>replaceActiveEvent({...activeEvent,attendance:activeEvent.attendance.map(row=>row.profileId===profileId?{...row,...patch}:row)}),
    updateMealSlot:(slotId,patch)=>replaceActiveEvent({...activeEvent,mealSlots:activeEvent.mealSlots.map(slot=>{
      if(slot.id!==slotId)return slot
      const updated={...slot,...patch}
      if(patch.planType&&patch.planType!=='recipes')updated.recipeIds=[]
      return updated
    })}),
    addRecipeToMeal:(slotId,recipeId)=>replaceActiveEvent({...activeEvent,mealSlots:activeEvent.mealSlots.map(slot=>slot.id===slotId&&!slot.recipeIds.includes(recipeId)?{...slot,planType:'recipes',recipeIds:[...slot.recipeIds,recipeId]}:slot)}),
    removeRecipeFromMeal:(slotId,recipeId)=>replaceActiveEvent({...activeEvent,mealSlots:activeEvent.mealSlots.map(slot=>slot.id===slotId?{...slot,recipeIds:(slot.recipeIds||[]).filter(id=>id!==recipeId)}:slot)}),
    toggleMealAttendee:(slotId,profileId)=>{
      const slot=activeEvent.mealSlots.find(row=>row.id===slotId)
      if(!slot)return
      const status=attendeeStatus(activeEvent,slot,profileId)
      let manualIncludes=[...(slot.manualIncludes||[])],manualExcludes=[...(slot.manualExcludes||[])]
      if(status.attending){
        manualIncludes=manualIncludes.filter(id=>id!==profileId)
        if(status.automatic&&!manualExcludes.includes(profileId))manualExcludes.push(profileId)
      }else{
        manualExcludes=manualExcludes.filter(id=>id!==profileId)
        if(!status.automatic&&!manualIncludes.includes(profileId))manualIncludes.push(profileId)
      }
      replaceActiveEvent({...activeEvent,mealSlots:activeEvent.mealSlots.map(row=>row.id===slotId?{...row,manualIncludes,manualExcludes}:row)})
    },
    mealAttendance:slot=>finalAttendeeIds(activeEvent,slot),
    toggleAccommodation:accommodationId=>{
      const active=[...(activeEvent.activeAccommodationIds||[])]
      const activeAccommodationIds=active.includes(accommodationId)?active.filter(id=>id!==accommodationId):[...active,accommodationId]
      replaceActiveEvent({...activeEvent,activeAccommodationIds})
    },
    updateDefaultBed:(profileId,spaceId)=>{
      const defaultBedAssignments={...(activeEvent.defaultBedAssignments||{})}
      if(spaceId)defaultBedAssignments[profileId]=spaceId
      else delete defaultBedAssignments[profileId]
      replaceActiveEvent({...activeEvent,defaultBedAssignments})
    },
    updateNightBed:(date,profileId,spaceId)=>{
      const nightlyBedOverrides={...(activeEvent.nightlyBedOverrides||{})}
      const night={...(nightlyBedOverrides[date]||{})}
      night[profileId]=spaceId
      nightlyBedOverrides[date]=night
      replaceActiveEvent({...activeEvent,nightlyBedOverrides})
    },
    addAccommodation:({name,type})=>{
      const id=`accommodation-${Date.now()}`
      const accommodation={id,name,type,rooms:[{id:`${id}-room`,name:'Main Room',spaces:[{id:`${id}-space`,name:'Sleeping Space',type:'Other',capacity:1}]}]}
      persist({...state,accommodations:[...(state.accommodations||[]),accommodation],events:state.events.map(event=>event.id===activeEvent.id?{...event,activeAccommodationIds:[...(event.activeAccommodationIds||[]),id]}:event)})
      return id
    },

createActivityTemplate:template=>{
  const id=`activity-template-${Date.now()}`
  persist({...state,activityTemplates:[...state.activityTemplates,{id,name:'New Activity',category:'Other',description:'',typicalDurationMinutes:120,defaultHostProfileId:'',equipment:[],checklist:[],music:[],suggestedMealTypes:[],notes:'',...template}]})
  return id
},
updateActivityTemplate:(id,patch)=>persist({...state,activityTemplates:state.activityTemplates.map(item=>item.id===id?{...item,...patch}:item)}),
copyActivityTemplate:id=>{
  const source=state.activityTemplates.find(item=>item.id===id)
  if(!source)return null
  const copy={...source,id:`activity-template-${Date.now()}`,name:`${source.name} Copy`}
  persist({...state,activityTemplates:[...state.activityTemplates,copy]})
  return copy.id
},
deleteActivityTemplate:id=>{
  const used=state.events.some(event=>(event.activityInstances||[]).some(item=>item.templateId===id))
  if(used)return false
  persist({...state,activityTemplates:state.activityTemplates.filter(item=>item.id!==id)})
  return true
},
scheduleActivity:(templateId,details={})=>{
  if(!activeEvent)return null
  const id=`${activeEvent.id}-activity-${Date.now()}`
  const instance={id,templateId,date:details.date||activeEvent.startDate,startTime:details.startTime||'15:00',endTime:details.endTime||'17:00',location:'',hostProfileId:'',attendeeIds:activeEvent.attendance.map(row=>row.profileId),externalGuests:[],linkedMealSlotIds:[],checklistCompleted:{},notes:''}
  replaceActiveEvent({...activeEvent,activityInstances:[...(activeEvent.activityInstances||[]),instance]})
  return id
},
updateActivityInstance:(id,patch)=>replaceActiveEvent({...activeEvent,activityInstances:(activeEvent.activityInstances||[]).map(item=>item.id===id?{...item,...patch}:item)}),
deleteActivityInstance:id=>replaceActiveEvent({...activeEvent,activityInstances:(activeEvent.activityInstances||[]).filter(item=>item.id!==id)}),
toggleActivityAttendee:(instanceId,profileId)=>{
  const instance=(activeEvent.activityInstances||[]).find(item=>item.id===instanceId)
  if(!instance)return
  const attendeeIds=(instance.attendeeIds||[]).includes(profileId)?instance.attendeeIds.filter(id=>id!==profileId):[...(instance.attendeeIds||[]),profileId]
  replaceActiveEvent({...activeEvent,activityInstances:activeEvent.activityInstances.map(item=>item.id===instanceId?{...item,attendeeIds}:item)})
},
toggleActivityMealSlot:(instanceId,slotId)=>{
  const instance=(activeEvent.activityInstances||[]).find(item=>item.id===instanceId)
  if(!instance)return
  const linkedMealSlotIds=(instance.linkedMealSlotIds||[]).includes(slotId)?instance.linkedMealSlotIds.filter(id=>id!==slotId):[...(instance.linkedMealSlotIds||[]),slotId]
  replaceActiveEvent({...activeEvent,activityInstances:activeEvent.activityInstances.map(item=>item.id===instanceId?{...item,linkedMealSlotIds}:item)})
},
toggleActivityChecklist:(instanceId,index)=>{
  const instance=(activeEvent.activityInstances||[]).find(item=>item.id===instanceId)
  if(!instance)return
  const checklistCompleted={...(instance.checklistCompleted||{}),[index]:!instance.checklistCompleted?.[index]}
  replaceActiveEvent({...activeEvent,activityInstances:activeEvent.activityInstances.map(item=>item.id===instanceId?{...item,checklistCompleted}:item)})
},
    resetPhase2:()=>persist(seed)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }),[state,activeEvent])

  return <EventContext.Provider value={{...state,activeEvent,...actions}}>{children}</EventContext.Provider>
}

export function useEvent(){const value=useContext(EventContext);if(!value)throw new Error('useEvent must be used inside EventProvider');return value}
