import { useState } from 'react'
import { CalendarDays, CheckCircle2, MapPin, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useEvent } from '../context/EventContext'

const blank={name:'',location:'',startDate:'2026-12-24',endDate:'2026-12-26',copyAttendance:true}

export default function OverallEvents(){
  const {events,activeEventId,setActiveEvent,createEvent,updateEvent,deleteEvent}=useEvent()
  const [showNew,setShowNew]=useState(false)
  const [form,setForm]=useState(blank)
  const [editing,setEditing]=useState(null)
  const [editForm,setEditForm]=useState(null)

  const submit=()=>{
    if(!form.name.trim()||!form.startDate||!form.endDate)return
    createEvent({...form,name:form.name.trim(),location:form.location.trim()})
    setForm(blank);setShowNew(false)
  }

  const beginEdit=event=>{setEditing(event.id);setEditForm({...event})}
  const saveEdit=()=>{updateEvent(editing,{name:editForm.name,location:editForm.location,startDate:editForm.startDate,endDate:editForm.endDate,notes:editForm.notes});setEditing(null)}

  return <div className="space-y-5">
    <div className="flex flex-wrap gap-3 justify-between items-start">
      <div><h1 className="page-title">Overall Events</h1><p className="text-stone">Choose the active gathering. Attendance, planner, beds and groceries belong to that event.</p></div>
      <button onClick={()=>setShowNew(true)} className="btn-primary flex items-center gap-2"><Plus size={18}/>Create Overall Event</button>
    </div>

    <div className="grid lg:grid-cols-2 gap-4">
      {events.map(event=>{
        const active=event.id===activeEventId
        const isEditing=editing===event.id
        return <section key={event.id} className={`card border-2 ${active?'border-forest':'border-transparent'}`}>
          {isEditing?<div className="space-y-3">
            <label className="block"><span className="section-title">Name</span><input value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})} className="w-full mt-1 p-3 border rounded-xl"/></label>
            <label className="block"><span className="section-title">Location</span><input value={editForm.location} onChange={e=>setEditForm({...editForm,location:e.target.value})} className="w-full mt-1 p-3 border rounded-xl"/></label>
            <div className="grid grid-cols-2 gap-2"><label><span className="section-title">Start</span><input type="date" value={editForm.startDate} onChange={e=>setEditForm({...editForm,startDate:e.target.value})} className="w-full mt-1 p-3 border rounded-xl"/></label><label><span className="section-title">End</span><input type="date" value={editForm.endDate} onChange={e=>setEditForm({...editForm,endDate:e.target.value})} className="w-full mt-1 p-3 border rounded-xl"/></label></div>
            <label className="block"><span className="section-title">Notes</span><textarea value={editForm.notes||''} onChange={e=>setEditForm({...editForm,notes:e.target.value})} className="w-full mt-1 p-3 border rounded-xl min-h-20"/></label>
            <div className="flex gap-2"><button onClick={saveEdit} className="btn-primary">Save</button><button onClick={()=>setEditing(null)} className="px-4 py-2 bg-white border rounded-xl">Cancel</button></div>
          </div>:<>
            <div className="flex justify-between gap-3 items-start">
              <div><div className="flex gap-2 items-center flex-wrap"><h2 className="text-xl font-extrabold text-navy">{event.name}</h2>{active&&<span className="badge-forest"><CheckCircle2 size={13}/>Active</span>}</div><p className="text-sm text-stone flex items-center gap-1 mt-2"><MapPin size={14}/>{event.location||'Location not set'}</p><p className="text-sm text-stone flex items-center gap-1 mt-1"><CalendarDays size={14}/>{event.startDate} to {event.endDate}</p><p className="text-sm mt-3">{event.attendance.length} attendees</p></div>
              <div className="flex gap-1"><button onClick={()=>beginEdit(event)} className="p-2 rounded-xl bg-cream" title="Edit"><Pencil size={17}/></button><button onClick={()=>deleteEvent(event.id)} disabled={events.length===1} className="p-2 rounded-xl bg-cream text-red-700 disabled:opacity-30" title="Delete"><Trash2 size={17}/></button></div>
            </div>
            {!active&&<button onClick={()=>setActiveEvent(event.id)} className="btn-primary mt-4 w-full">Make Active</button>}
          </>}
        </section>
      })}
    </div>

    {showNew&&<div className="fixed inset-0 z-[90] bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={()=>setShowNew(false)}><div className="bg-cream rounded-3xl w-full max-w-xl p-5" onClick={e=>e.stopPropagation()}>
      <div className="flex justify-between"><div><h2 className="text-xl font-extrabold text-navy">Create Overall Event</h2><p className="text-sm text-stone">Start a separate gathering with its own attendance and dates.</p></div><button onClick={()=>setShowNew(false)}><X/></button></div>
      <div className="space-y-3 mt-5">
        <label className="block"><span className="section-title">Event name</span><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full mt-1 p-3 border rounded-xl" placeholder="Christmas at Danielle's 2026"/></label>
        <label className="block"><span className="section-title">Location</span><input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} className="w-full mt-1 p-3 border rounded-xl"/></label>
        <div className="grid grid-cols-2 gap-2"><label><span className="section-title">Start</span><input type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})} className="w-full mt-1 p-3 border rounded-xl"/></label><label><span className="section-title">End</span><input type="date" value={form.endDate} onChange={e=>setForm({...form,endDate:e.target.value})} className="w-full mt-1 p-3 border rounded-xl"/></label></div>
        <label className="bg-white rounded-2xl p-4 flex gap-3"><input type="checkbox" checked={form.copyAttendance} onChange={e=>setForm({...form,copyAttendance:e.target.checked})}/><span><b>Copy current attendee list</b><p className="text-xs text-stone">Arrival and departure dates will reset to the new event dates.</p></span></label>
      </div>
      <button onClick={submit} disabled={!form.name.trim()} className="btn-primary w-full mt-5 disabled:opacity-40">Create and Make Active</button>
    </div></div>}
  </div>
}
