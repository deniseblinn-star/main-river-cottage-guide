import { createContext, useContext, useMemo, useState } from 'react'
import guestData from '../data/guests.json'

const STORAGE_KEY='main-river-v3-event-engine'

const dateTime=(date,time='12:00')=>`${date}T${time}`

const profilesSeed=guestData.guests.map(guest=>({
  id:guest.id,
  name:guest.name,
  role:guest.role||'',
  dietary:Array.isArray(guest.dietary)?guest.dietary:[],
  favouriteLunch:'',
  favouriteDinner:'',
  notes:guest.notes||''
}))

const mainRiverAttendance=guestData.guests.map(guest=>({
  profileId:guest.id,
  arrival:dateTime(guest.arrival||'2026-08-22', guest.arrivalTime||'12:00'),
  departure:dateTime(guest.departure||'2026-08-30', guest.departureTime||'10:00'),
  needsAccommodation:!['danielle','kevin'].includes(guest.id),
  notes:''
}))

const seed={
  activeEventId:'main-river-2026',
  profiles:profilesSeed,
  events:[{
    id:'main-river-2026',
    name:'Main River Cottage Week 2026',
    location:'Main River, New Brunswick',
    startDate:'2026-08-22',
    endDate:'2026-08-30',
    notes:'Annual Main River cottage gathering.',
    attendance:mainRiverAttendance
  }]
}

function loadState(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY)
    return raw?JSON.parse(raw):seed
  }catch{return seed}
}

const EventContext=createContext(null)

export function EventProvider({children}){
  const [state,setState]=useState(loadState)
  const persist=next=>{setState(next);localStorage.setItem(STORAGE_KEY,JSON.stringify(next))}
  const activeEvent=state.events.find(event=>event.id===state.activeEventId)||state.events[0]

  const actions=useMemo(()=>({
    setActiveEvent:id=>persist({...state,activeEventId:id}),
    createEvent:({name,location,startDate,endDate,copyAttendance})=>{
      const id=`event-${Date.now()}`
      const attendance=copyAttendance&&activeEvent
        ? activeEvent.attendance.map(row=>({...row,arrival:`${startDate}T12:00`,departure:`${endDate}T10:00`}))
        : []
      const event={id,name,location,startDate,endDate,notes:'',attendance}
      persist({...state,events:[...state.events,event],activeEventId:id})
      return id
    },
    updateEvent:(id,patch)=>persist({...state,events:state.events.map(event=>event.id===id?{...event,...patch}:event)}),
    deleteEvent:id=>{
      if(state.events.length===1)return false
      const events=state.events.filter(event=>event.id!==id)
      persist({...state,events,activeEventId:state.activeEventId===id?events[0].id:state.activeEventId})
      return true
    },
    addProfile:profile=>{
      const id=`profile-${Date.now()}`
      persist({...state,profiles:[...state.profiles,{id,dietary:[],favouriteLunch:'',favouriteDinner:'',notes:'',role:'',...profile}]})
      return id
    },
    updateProfile:(id,patch)=>persist({...state,profiles:state.profiles.map(profile=>profile.id===id?{...profile,...patch}:profile)}),
    addAttendee:profileId=>{
      if(!activeEvent||activeEvent.attendance.some(row=>row.profileId===profileId))return
      const row={profileId,arrival:`${activeEvent.startDate}T12:00`,departure:`${activeEvent.endDate}T10:00`,needsAccommodation:true,notes:''}
      persist({...state,events:state.events.map(event=>event.id===activeEvent.id?{...event,attendance:[...event.attendance,row]}:event)})
    },
    removeAttendee:profileId=>{
      persist({...state,events:state.events.map(event=>event.id===activeEvent.id?{...event,attendance:event.attendance.filter(row=>row.profileId!==profileId)}:event)})
    },
    updateAttendance:(profileId,patch)=>{
      persist({...state,events:state.events.map(event=>event.id===activeEvent.id?{...event,attendance:event.attendance.map(row=>row.profileId===profileId?{...row,...patch}:row)}:event)})
    },
    resetPhase2:()=>persist(seed)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }),[state,activeEvent])

  return <EventContext.Provider value={{...state,activeEvent,...actions}}>{children}</EventContext.Provider>
}

export function useEvent(){
  const value=useContext(EventContext)
  if(!value)throw new Error('useEvent must be used inside EventProvider')
  return value
}
