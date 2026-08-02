import { useMemo, useState } from 'react'
import { BedDouble, Check, ChevronLeft, ChevronRight, Home, Plus, RotateCcw, Users, X } from 'lucide-react'
import { useEvent } from '../context/EventContext'
import { accommodationCapacity, assignedSpaceFor, eventNights, flattenSpaces, presentForNight } from '../utils/accommodations'

const prettyDate=date=>new Date(`${date}T12:00:00`).toLocaleDateString('en-CA',{weekday:'long',month:'short',day:'numeric'})

export default function Accommodations(){
 const {activeEvent,profiles,accommodations,toggleAccommodation,updateNightBed,updateDefaultBed,addAccommodation}=useEvent()
 const nights=eventNights(activeEvent)
 const [nightIndex,setNightIndex]=useState(0)
 const [mode,setMode]=useState('planner')
 const [showAdd,setShowAdd]=useState(false)
 const [form,setForm]=useState({name:'',type:'Cottage'})
 const date=nights[Math.min(nightIndex,Math.max(0,nights.length-1))]
 const activeIds=activeEvent?.activeAccommodationIds||[]
 const activeAccommodations=accommodations.filter(item=>activeIds.includes(item.id))
 const spaces=flattenSpaces(activeAccommodations)
 const attendanceRows=(activeEvent?.attendance||[]).filter(row=>row.needsAccommodation&&presentForNight(row,date))
 const presentIds=attendanceRows.map(row=>row.profileId)
 const profileById=Object.fromEntries(profiles.map(profile=>[profile.id,profile]))
 const assignments=Object.fromEntries(presentIds.map(id=>[id,assignedSpaceFor(activeEvent,date,id)]))
 const assignedCount=presentIds.filter(id=>assignments[id]).length
 const unassigned=presentIds.filter(id=>!assignments[id])
 const occupantsBySpace=useMemo(()=>{
  const result={}
  presentIds.forEach(id=>{const spaceId=assignments[id];if(spaceId)(result[spaceId]??=[]).push(id)})
  return result
 },[date,activeEvent,profiles])

 const addNew=()=>{
  if(!form.name.trim())return
  addAccommodation({name:form.name.trim(),type:form.type})
  setForm({name:'',type:'Cottage'});setShowAdd(false)
 }

 if(!activeEvent)return <div className="card">Create or select an Overall Event first.</div>

 return <div className="space-y-4">
  <div className="flex flex-wrap justify-between gap-3 items-start">
   <div><h1 className="page-title">Accommodations</h1><p className="text-stone">Assign each person who needs accommodation to a sleeping space for each night.</p></div>
   <button onClick={()=>setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus size={18}/>Add Accommodation</button>
  </div>

  <div className="grid grid-cols-2 gap-2 bg-white rounded-2xl p-1 shadow-sm">
   <button onClick={()=>setMode('planner')} className={`rounded-xl px-4 py-3 font-semibold ${mode==='planner'?'bg-forest text-white':'text-stone'}`}>Nightly Bed Planner</button>
   <button onClick={()=>setMode('library')} className={`rounded-xl px-4 py-3 font-semibold ${mode==='library'?'bg-forest text-white':'text-stone'}`}>Accommodation Library</button>
  </div>

  {mode==='planner'?<>
   <div className="card">
    <div className="flex items-center justify-between gap-3">
     <button className="p-2 rounded-xl bg-cream disabled:opacity-30" disabled={nightIndex===0} onClick={()=>setNightIndex(Math.max(0,nightIndex-1))}><ChevronLeft/></button>
     <div className="text-center"><p className="section-title">Night</p><h2 className="text-2xl font-extrabold text-navy">{prettyDate(date)}</h2></div>
     <button className="p-2 rounded-xl bg-cream disabled:opacity-30" disabled={nightIndex>=nights.length-1} onClick={()=>setNightIndex(Math.min(nights.length-1,nightIndex+1))}><ChevronRight/></button>
    </div>
    <div className="grid sm:grid-cols-3 gap-3 mt-5">
     <div className="bg-cream rounded-2xl p-4"><p className="text-xs text-stone">NEED A BED</p><b className="text-2xl text-navy">{presentIds.length}</b></div>
     <div className="bg-cream rounded-2xl p-4"><p className="text-xs text-stone">ASSIGNED</p><b className="text-2xl text-forest">{assignedCount}</b></div>
     <div className={`rounded-2xl p-4 ${unassigned.length?'bg-amber-50 border border-amber-200':'bg-forest/10'}`}><p className="text-xs text-stone">UNASSIGNED</p><b className="text-2xl">{unassigned.length}</b></div>
    </div>
   </div>

   {unassigned.length>0&&<div className="card border border-amber-200 bg-amber-50"><h2 className="section-title">Guests still needing a bed</h2><div className="flex flex-wrap gap-2 mt-3">{unassigned.map(id=><span key={id} className="badge bg-white text-navy">{profileById[id]?.name||id}</span>)}</div></div>}

   {activeAccommodations.map(accommodation=>{
    const accommodationSpaces=flattenSpaces([accommodation])
    const occupied=accommodationSpaces.reduce((sum,space)=>sum+(occupantsBySpace[space.id]?.length||0),0)
    const capacity=accommodationCapacity(accommodation)
    return <section key={accommodation.id} className="card">
     <div className="flex justify-between gap-3 items-start"><div><div className="flex items-center gap-2"><Home className="text-forest" size={20}/><h2 className="text-xl font-extrabold text-navy">{accommodation.name}</h2></div><p className="text-sm text-stone">{accommodation.type} · {occupied}/{capacity} sleeping spaces used</p></div><span className={`badge ${occupied>capacity?'bg-red-100 text-red-700':'bg-forest/10 text-forest'}`}>{occupied>capacity?'Over capacity':`${capacity-occupied} open`}</span></div>
     <div className="space-y-4 mt-5">
      {accommodation.rooms.map(room=><div key={room.id} className="bg-cream rounded-2xl p-4"><h3 className="font-extrabold text-navy">{room.name}</h3><div className="grid md:grid-cols-2 gap-3 mt-3">{room.spaces.map(space=>{
       const occupantIds=occupantsBySpace[space.id]||[]
       const over=occupantIds.length>space.capacity
       return <div key={space.id} className={`bg-white rounded-2xl p-4 border ${over?'border-red-300':'border-transparent'}`}>
        <div className="flex justify-between gap-2"><div className="flex gap-2 items-center"><BedDouble size={18} className="text-forest"/><b>{space.name}</b></div><span className={`text-xs font-semibold ${over?'text-red-600':'text-stone'}`}>{occupantIds.length}/{space.capacity}</span></div>
        <div className="mt-3 space-y-2">{occupantIds.length?occupantIds.map(id=><div key={id} className="flex justify-between items-center gap-2 bg-cream rounded-xl px-3 py-2"><span>{profileById[id]?.name||id}</span><button onClick={()=>updateNightBed(date,id,'')} className="text-stone hover:text-red-600"><X size={16}/></button></div>):<p className="text-sm text-stone">Empty</p>}</div>
        <select className="w-full mt-3 p-2 rounded-xl border bg-white" value="" onChange={e=>{if(e.target.value)updateNightBed(date,e.target.value,space.id)}}><option value="">Assign guest...</option>{unassigned.map(id=><option key={id} value={id}>{profileById[id]?.name||id}</option>)}</select>
       </div>
      })}</div></div>)}
     </div>
    </section>
   })}

   {!activeAccommodations.length&&<div className="card text-center py-10"><p className="font-semibold text-navy">No accommodations are active for this event.</p><button onClick={()=>setMode('library')} className="btn-primary mt-3">Choose accommodations</button></div>}
  </>:<>
   <div className="bg-forest/5 border border-forest/15 rounded-2xl p-4"><b>Permanent accommodation library</b><p className="text-sm text-stone mt-1">Activate the cottages and trailers being used for {activeEvent.name}. Default bed assignments apply on every night unless you override a specific night.</p></div>
   {accommodations.map(accommodation=>{
    const active=activeIds.includes(accommodation.id)
    const allSpaces=flattenSpaces([accommodation])
    return <section key={accommodation.id} className="card">
     <div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-extrabold text-navy">{accommodation.name}</h2><p className="text-sm text-stone">{accommodation.type} · capacity {accommodationCapacity(accommodation)}</p></div><button onClick={()=>toggleAccommodation(accommodation.id)} className={`px-4 py-2 rounded-full font-semibold ${active?'bg-forest text-white':'bg-cream text-stone'}`}>{active?<><Check size={16} className="inline mr-1"/>Active</>:'Inactive'}</button></div>
     <div className="grid md:grid-cols-2 gap-3 mt-4">{accommodation.rooms.map(room=><div key={room.id} className="bg-cream rounded-2xl p-4"><b>{room.name}</b><p className="text-sm text-stone mt-1">{room.spaces.map(space=>`${space.name} (${space.capacity})`).join(' · ')}</p></div>)}</div>
     <div className="mt-4"><p className="section-title">Default assignments</p><div className="grid sm:grid-cols-2 gap-2 mt-2">{profiles.filter(profile=>activeEvent.attendance.some(row=>row.profileId===profile.id&&row.needsAccommodation)).map(profile=>{
      const current=activeEvent.defaultBedAssignments?.[profile.id]||''
      return <label key={profile.id} className="text-sm">{profile.name}<select value={current} onChange={e=>updateDefaultBed(profile.id,e.target.value)} className="block w-full mt-1 p-2 rounded-xl border bg-white"><option value="">No default</option>{flattenSpaces(accommodations.filter(a=>activeIds.includes(a.id))).map(space=><option key={space.id} value={space.id}>{space.accommodationName} — {space.roomName} — {space.name}</option>)}</select></label>
     })}</div></div>
    </section>
   })}
  </>}

  {showAdd&&<div className="fixed inset-0 z-[80] bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={()=>setShowAdd(false)}><div className="bg-cream rounded-3xl w-full max-w-lg p-5" onClick={e=>e.stopPropagation()}><div className="flex justify-between"><div><h2 className="text-xl font-extrabold text-navy">Add Accommodation</h2><p className="text-sm text-stone">Creates a basic accommodation with one room and one sleeping space. More detailed room editing can be added later.</p></div><button onClick={()=>setShowAdd(false)}><X/></button></div><div className="grid gap-3 mt-5"><label><span className="section-title">Name</span><input autoFocus value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full p-3 mt-2 rounded-xl border bg-white" placeholder="Trailer 3"/></label><label><span className="section-title">Type</span><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full p-3 mt-2 rounded-xl border bg-white"><option>Cottage</option><option>Rental Cottage</option><option>Trailer</option><option>Hotel</option><option>Tent</option><option>Other</option></select></label></div><button onClick={addNew} disabled={!form.name.trim()} className="btn-primary w-full mt-5 disabled:opacity-40">Add Accommodation</button></div></div>}
 </div>
}
