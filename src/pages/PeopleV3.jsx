import { useState } from 'react'
import { CalendarClock, Save } from 'lucide-react'
import { loadV3, saveV3 } from '../utils/v3Store'
export default function PeopleV3(){
 const [state,setState]=useState(loadV3)
 const update=(profileId,field,value)=>setState(current=>({...current,attendance:current.attendance.map(a=>a.profileId===profileId?{...a,[field]:value}:a)}))
 const persist=()=>saveV3(state)
 return <div className="space-y-4"><div className="flex justify-between gap-3"><div><h1 className="page-title">People & Stay</h1><p className="text-stone">A Profile joins this Gathering through arrival and departure.</p></div><button onClick={persist} className="btn-primary flex items-center gap-2"><Save size={17}/>Save stays</button></div>
 <div className="bg-forest/5 border border-forest/15 rounded-2xl p-4 text-sm"><b>Attendance rule</b><p className="text-stone mt-1">Lunch, Early Snack, Dinner and Late Snack include people automatically when the meal time falls between arrival and departure. Breakfast and Brunch start unassigned.</p></div>
 <div className="space-y-3">{state.profiles.map(p=>{const a=state.attendance.find(x=>x.profileId===p.id);return <section key={p.id} className="card"><div className="flex gap-3 items-center"><div className="w-11 h-11 rounded-full bg-navy/10 text-navy font-bold grid place-items-center">{p.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div className="flex-1"><b>{p.name}</b><p className="text-xs text-stone">{p.role||'Profile'}</p></div>{p.dietary?.includes('gluten-free')&&<span className="badge-gf">GF</span>}</div>
 <div className="grid md:grid-cols-3 gap-3 mt-4"><label className="text-xs text-stone">Arrival<input type="datetime-local" value={a.arrival} onChange={e=>update(p.id,'arrival',e.target.value)} className="block w-full mt-1 p-2 border rounded-xl bg-white"/></label><label className="text-xs text-stone">Departure<input type="datetime-local" value={a.departure} onChange={e=>update(p.id,'departure',e.target.value)} className="block w-full mt-1 p-2 border rounded-xl bg-white"/></label><label className="bg-cream rounded-xl p-3 flex items-center gap-3"><input type="checkbox" checked={a.needsAccommodation} onChange={e=>update(p.id,'needsAccommodation',e.target.checked)}/><span><b>Needs accommodation</b><p className="text-xs text-stone">Include in nightly bed planning</p></span></label></div></section>})}</div></div>
}
