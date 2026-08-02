import { createContext, useContext, useMemo, useState } from 'react'
import guestData from '../data/guests.json'
import { attendeeStatus, ensureMealSlots, finalAttendeeIds } from '../utils/mealPlanner'

const STORAGE_KEY='main-river-v3-event-engine'
const dateTime=(date,time='12:00')=>`${date}T${time}`

const profilesSeed=guestData.guests.map(guest=>({
  id:guest.id,name:guest.name,role:guest.role||'',dietary:Array.isArray(guest.dietary)?guest.dietary:[],favouriteLunch:'',favouriteDinner:'',notes:guest.notes||''
}))

const mainRiverAttendance=guestData.guests.map(guest=>({
  profileId:guest.id,
  arrival:dateTime(guest.arrival||'2026-08-22',guest.arrivalTime||'12:00'),
  departure:dateTime(guest.departure||'2026-08-30',guest.departureTime||'10:00'),
  needsAccommodation:!['danielle','kevin'].includes(guest.id),notes:''
}))

const mainRiverEvent={id:'main-river-2026',name:'Main River Cottage Week 2026',location:'Main River, New Brunswick',startDate:'2026-08-22',endDate:'2026-08-30',notes:'Annual Main River cottage gathering.',attendance:mainRiverAttendance}
mainRiverEvent.mealSlots=ensureMealSlots(mainRiverEvent)

const seed={activeEventId:'main-river-2026',profiles:profilesSeed,events:[mainRiverEvent]}

function normalizeState(candidate){
  const base=candidate&&Array.isArray(candidate.events)&&Array.isArray(candidate.profiles)?candidate:seed
  const events=base.events.map(event=>({...event,attendance:Array.isArray(event.attendance)?event.attendance:[],mealSlots:ensureMealSlots(event)}))
  const activeEventId=events.some(event=>event.id===base.activeEventId)?base.activeEventId:events[0]?.id
  return {...base,events,activeEventId}
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
      const event={id,name,location,startDate,endDate,notes:'',attendance}
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
    addProfile:profile=>{const id=`profile-${Date.now()}`;persist({...state,profiles:[...state.profiles,{id,dietary:[],favouriteLunch:'',favouriteDinner:'',notes:'',role:'',...profile}]});return id},
    updateProfile:(id,patch)=>persist({...state,profiles:state.profiles.map(profile=>profile.id===id?{...profile,...patch}:profile)}),
    addAttendee:profileId=>{
      if(!activeEvent||activeEvent.attendance.some(row=>row.profileId===profileId))return
      replaceActiveEvent({...activeEvent,attendance:[...activeEvent.attendance,{profileId,arrival:`${activeEvent.startDate}T12:00`,departure:`${activeEvent.endDate}T10:00`,needsAccommodation:true,notes:''}]})
    },
    removeAttendee:profileId=>replaceActiveEvent({...activeEvent,attendance:activeEvent.attendance.filter(row=>row.profileId!==profileId),mealSlots:activeEvent.mealSlots.map(slot=>({...slot,manualIncludes:(slot.manualIncludes||[]).filter(id=>id!==profileId),manualExcludes:(slot.manualExcludes||[]).filter(id=>id!==profileId)}))}),
    updateAttendance:(profileId,patch)=>replaceActiveEvent({...activeEvent,attendance:activeEvent.attendance.map(row=>row.profileId===profileId?{...row,...patch}:row)}),
    updateMealSlot:(slotId,patch)=>replaceActiveEvent({...activeEvent,mealSlots:activeEvent.mealSlots.map(slot=>slot.id===slotId?{...slot,...patch}:slot)}),
    addRecipeToMeal:(slotId,recipeId)=>replaceActiveEvent({...activeEvent,mealSlots:activeEvent.mealSlots.map(slot=>slot.id===slotId&&!slot.recipeIds.includes(recipeId)?{...slot,planType:'recipes',recipeIds:[...slot.recipeIds,recipeId]}:slot)}),
    removeRecipeFromMeal:(slotId,recipeId)=>replaceActiveEvent({...activeEvent,mealSlots:activeEvent.mealSlots.map(slot=>slot.id===slotId?{...slot,recipeIds:slot.recipeIds.filter(id=>id!==recipeId)}:slot)}),
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
    resetPhase2:()=>persist(seed)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }),[state,activeEvent])

  return <EventContext.Provider value={{...state,activeEvent,...actions}}>{children}</EventContext.Provider>
}

export function useEvent(){const value=useContext(EventContext);if(!value)throw new Error('useEvent must be used inside EventProvider');return value}
