import { CalendarDays, Users, BedDouble, Utensils, Activity } from 'lucide-react'
import { useState } from 'react'
import { loadV3 } from '../utils/v3Store'
export default function Gathering(){
 const [state]=useState(loadV3)
 const active=state.accommodations.filter(a=>a.active)
 const capacity=active.flatMap(a=>a.rooms.flatMap(r=>r.spaces)).reduce((n,s)=>n+s.capacity,0)
 return <div className="space-y-5"><div><p className="section-title">Current gathering</p><h1 className="page-title">{state.event.name}</h1><p className="text-stone">{state.event.start} to {state.event.end} · {state.event.location}</p></div>
 <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
  <div className="card"><Users className="text-forest"/><p className="section-title mt-2">Profiles attending</p><b className="text-3xl text-navy">{state.attendance.length}</b></div>
  <div className="card"><CalendarDays className="text-forest"/><p className="section-title mt-2">Event days</p><b className="text-3xl text-navy">{state.days.length}</b></div>
  <div className="card"><BedDouble className="text-forest"/><p className="section-title mt-2">Active bed spaces</p><b className="text-3xl text-navy">{capacity}</b></div>
  <div className="card"><Utensils className="text-forest"/><p className="section-title mt-2">Meal slots</p><b className="text-3xl text-navy">{state.days.length*6}</b></div>
 </div>
 <section className="card"><h2 className="text-xl font-extrabold text-navy">Version 3 relationship</h2><div className="mt-4 grid gap-2 text-sm"><div className="bg-cream rounded-xl p-3"><b>Profiles</b> join this Gathering through arrival and departure records.</div><div className="bg-cream rounded-xl p-3"><b>Date-specific Meal Slots</b> calculate attendance and receive recipe assignments.</div><div className="bg-cream rounded-xl p-3"><b>Recipes</b> generate groceries only while assigned to a Meal Slot.</div><div className="bg-cream rounded-xl p-3"><b>Sleeping spaces</b> receive people night by night.</div></div></section>
 <section className="card"><div className="flex gap-3"><Activity className="text-forest"/><div><b>Activities remain inside the Gathering</b><p className="text-sm text-stone">Yacht Rock Party, Main River Feast, Golf Day and River Float are Activities. An Activity can optionally link to a Meal Slot.</p></div></div></section></div>
}
