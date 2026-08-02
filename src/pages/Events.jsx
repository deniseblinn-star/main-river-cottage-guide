import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, CheckSquare, Copy, ExternalLink, Music2, Plus, Save, Trash2, Users, Utensils, Wrench, X } from 'lucide-react'
import { useEvent } from '../context/EventContext'
import { ACTIVITY_CATEGORIES, activityDateLabel, activityTimeLabel } from '../utils/activities'
import { getRecipeCatalogue } from '../utils/recipeCatalogue'

const emptyForm={name:'',category:'Other',description:'',typicalDurationMinutes:120,equipmentText:'',checklistText:'',musicText:'',notes:''}
const lines=value=>value.split('\n').map(item=>item.trim()).filter(Boolean)

export default function Events(){
  const {
    activeEvent,profiles,activityTemplates,
    createActivityTemplate,updateActivityTemplate,copyActivityTemplate,deleteActivityTemplate,
    scheduleActivity,updateActivityInstance,deleteActivityInstance,
    toggleActivityAttendee,toggleActivityMealSlot,toggleActivityChecklist
  }=useEvent()

  const [tab,setTab]=useState('schedule')
  const [selectedId,setSelectedId]=useState(activeEvent?.activityInstances?.[0]?.id||'')
  const [showSchedule,setShowSchedule]=useState(false)
  const [scheduleTemplateId,setScheduleTemplateId]=useState('')
  const [scheduleDate,setScheduleDate]=useState(activeEvent?.startDate||'')
  const [showForm,setShowForm]=useState(false)
  const [editingId,setEditingId]=useState('')
  const [form,setForm]=useState(emptyForm)
  const [message,setMessage]=useState('')

  const recipes=getRecipeCatalogue()
  const recipeMap=Object.fromEntries(recipes.map(recipe=>[recipe.id,recipe]))
  const profileMap=Object.fromEntries(profiles.map(profile=>[profile.id,profile]))
  const templateMap=Object.fromEntries(activityTemplates.map(item=>[item.id,item]))
  const instances=useMemo(()=>[...(activeEvent?.activityInstances||[])].sort((a,b)=>`${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`)),[activeEvent])
  const selected=instances.find(item=>item.id===selectedId)||instances[0]
  const template=selected?templateMap[selected.templateId]:null
  const eventProfiles=(activeEvent?.attendance||[]).map(row=>profileMap[row.profileId]).filter(Boolean)
  const linkedSlots=selected?(activeEvent?.mealSlots||[]).filter(slot=>slot.date===selected.date):[]

  const editTemplate=item=>{
    setEditingId(item.id)
    setForm({
      name:item.name||'',category:item.category||'Other',description:item.description||'',
      typicalDurationMinutes:item.typicalDurationMinutes||120,
      equipmentText:(item.equipment||[]).join('\n'),
      checklistText:(item.checklist||[]).join('\n'),
      musicText:(item.music||[]).map(link=>`${link.label}${link.url?` | ${link.url}`:''}`).join('\n'),
      notes:item.notes||''
    })
    setShowForm(true)
  }

  const saveTemplate=()=>{
    if(!form.name.trim())return
    const payload={
      name:form.name.trim(),category:form.category,description:form.description.trim(),
      typicalDurationMinutes:Number(form.typicalDurationMinutes)||120,
      equipment:lines(form.equipmentText),
      checklist:lines(form.checklistText),
      music:lines(form.musicText).map(row=>{const [label,url='']=row.split('|').map(v=>v.trim());return {label,url}}),
      notes:form.notes.trim()
    }
    if(editingId)updateActivityTemplate(editingId,payload)
    else createActivityTemplate(payload)
    setShowForm(false)
  }

  const addScheduled=()=>{
    if(!scheduleTemplateId||!scheduleDate)return
    const id=scheduleActivity(scheduleTemplateId,{date:scheduleDate})
    setSelectedId(id)
    setShowSchedule(false)
    setTab('schedule')
  }

  if(!activeEvent)return <div className="card">Create an Overall Event first.</div>

  return <div className="space-y-5">
    <div className="flex flex-wrap justify-between gap-3 items-start">
      <div><h1 className="page-title">Activities</h1><p className="text-stone">Reusable activities scheduled inside {activeEvent.name}.</p></div>
      <button onClick={()=>tab==='schedule'?setShowSchedule(true):(setEditingId(''),setForm(emptyForm),setShowForm(true))} className="btn-primary flex items-center gap-2"><Plus size={18}/>{tab==='schedule'?'Schedule Activity':'New Activity'}</button>
    </div>

    <div className="grid grid-cols-2 gap-2 bg-white rounded-2xl p-1 shadow-sm">
      <button onClick={()=>setTab('schedule')} className={`rounded-xl px-4 py-3 font-semibold ${tab==='schedule'?'bg-forest text-white':'text-stone'}`}>Event Schedule</button>
      <button onClick={()=>setTab('catalog')} className={`rounded-xl px-4 py-3 font-semibold ${tab==='catalog'?'bg-forest text-white':'text-stone'}`}>Activity Catalog</button>
    </div>

    {tab==='schedule'?<div className="grid lg:grid-cols-[300px_minmax(0,1fr)] gap-4 items-start">
      <div className="space-y-2">
        {instances.map(instance=>{
          const item=templateMap[instance.templateId]
          return <button key={instance.id} onClick={()=>setSelectedId(instance.id)} className={`w-full text-left card card-hover ${selected?.id===instance.id?'ring-2 ring-forest':''}`}>
            <div className="flex justify-between gap-2"><b className="text-navy">{item?.name||'Missing activity'}</b><span className="badge-forest">{item?.category||'Activity'}</span></div>
            <p className="text-sm text-stone mt-2">{activityDateLabel(instance.date)} · {activityTimeLabel(instance.startTime)}</p>
            <p className="text-xs text-stone mt-1">{(instance.attendeeIds||[]).length} participants · {(instance.linkedMealSlotIds||[]).length} linked meals</p>
          </button>
        })}
        {!instances.length&&<div className="card text-center text-stone">No activities scheduled yet.</div>}
      </div>

      {selected&&template?<div className="space-y-4">
        <section className="card">
          <div className="flex justify-between gap-3 items-start">
            <div><span className="badge-forest">{template.category}</span><h2 className="text-2xl font-extrabold text-navy mt-2">{template.name}</h2><p className="text-stone mt-1">{template.description}</p></div>
            <button onClick={()=>{deleteActivityInstance(selected.id);setSelectedId('')}} className="text-red-700 p-2"><Trash2/></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mt-5">
            <label><span className="section-title">Date</span><input type="date" min={activeEvent.startDate} max={activeEvent.endDate} value={selected.date} onChange={e=>updateActivityInstance(selected.id,{date:e.target.value,linkedMealSlotIds:[]})} className="w-full mt-1 p-3 border rounded-xl bg-white"/></label>
            <label><span className="section-title">Location</span><input value={selected.location||''} onChange={e=>updateActivityInstance(selected.id,{location:e.target.value})} className="w-full mt-1 p-3 border rounded-xl" placeholder="Dock, cottage, golf course..."/></label>
            <label><span className="section-title">Start time</span><input type="time" value={selected.startTime||''} onChange={e=>updateActivityInstance(selected.id,{startTime:e.target.value})} className="w-full mt-1 p-3 border rounded-xl"/></label>
            <label><span className="section-title">End time</span><input type="time" value={selected.endTime||''} onChange={e=>updateActivityInstance(selected.id,{endTime:e.target.value})} className="w-full mt-1 p-3 border rounded-xl"/></label>
            <label className="sm:col-span-2"><span className="section-title">Host</span><select value={selected.hostProfileId||''} onChange={e=>updateActivityInstance(selected.id,{hostProfileId:e.target.value})} className="w-full mt-1 p-3 border rounded-xl bg-white"><option value="">No host selected</option>{eventProfiles.map(profile=><option key={profile.id} value={profile.id}>{profile.name}</option>)}</select></label>
            <label className="sm:col-span-2"><span className="section-title">Notes</span><textarea value={selected.notes||''} onChange={e=>updateActivityInstance(selected.id,{notes:e.target.value})} className="w-full mt-1 p-3 border rounded-xl min-h-20"/></label>
          </div>
        </section>

        <section className="card">
          <div className="flex items-center gap-2"><Utensils className="text-forest"/><div><h3 className="text-lg font-extrabold text-navy">Linked Meal Slots</h3><p className="text-sm text-stone">Activities link to meals; meals own recipes and drive groceries.</p></div></div>
          <div className="grid sm:grid-cols-2 gap-2 mt-4">{linkedSlots.map(slot=>{
            const checked=(selected.linkedMealSlotIds||[]).includes(slot.id)
            const names=(slot.recipeIds||[]).map(id=>recipeMap[id]?.title).filter(Boolean)
            const summary=names.length?names.join(' • '):slot.planType==='restaurant'?(slot.restaurant?.name||'Restaurant'):slot.planType==='simple'?(slot.simpleDescription||'Simple food plan'):'No recipes planned'
            return <button key={slot.id} onClick={()=>toggleActivityMealSlot(selected.id,slot.id)} className={`rounded-2xl border p-4 text-left ${checked?'bg-forest/10 border-forest/30':'bg-white'}`}>
              <div className="flex justify-between gap-2"><b>{slot.label} · {activityTimeLabel(slot.time)}</b>{checked&&<Check className="text-forest" size={18}/>}</div>
              <p className="text-xs text-stone mt-2">{summary}</p>
            </button>
          })}</div>
          <Link to={`/daily/${selected.date}`} className="mt-4 inline-flex items-center gap-2 text-forest font-semibold">Open this day’s meals <ExternalLink size={16}/></Link>
        </section>

        <section className="card">
          <div className="flex items-center gap-2"><Users className="text-forest"/><div><h3 className="text-lg font-extrabold text-navy">Participants</h3><p className="text-sm text-stone">{(selected.attendeeIds||[]).length} selected.</p></div></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-4">{eventProfiles.map(profile=>{
            const checked=(selected.attendeeIds||[]).includes(profile.id)
            return <button key={profile.id} onClick={()=>toggleActivityAttendee(selected.id,profile.id)} className={`rounded-xl border p-3 text-left ${checked?'bg-forest/10 border-forest/30':'bg-white'}`}><div className="flex justify-between gap-2"><b>{profile.name}</b>{checked&&<Check size={17} className="text-forest"/>}</div></button>
          })}</div>
          <label className="block mt-4"><span className="section-title">External guests</span><input value={(selected.externalGuests||[]).join(', ')} onChange={e=>updateActivityInstance(selected.id,{externalGuests:e.target.value.split(',').map(v=>v.trim()).filter(Boolean)})} className="w-full mt-1 p-3 border rounded-xl" placeholder="Neighbour guests, names TBD..."/></label>
        </section>

        <div className="grid lg:grid-cols-2 gap-4">
          <section className="card"><div className="flex items-center gap-2"><CheckSquare className="text-forest"/><h3 className="text-lg font-extrabold text-navy">Checklist</h3></div><div className="space-y-2 mt-4">{(template.checklist||[]).map((item,index)=>{
            const done=Boolean(selected.checklistCompleted?.[index])
            return <button key={`${item}-${index}`} onClick={()=>toggleActivityChecklist(selected.id,index)} className={`w-full flex gap-3 items-center rounded-xl p-3 text-left ${done?'bg-forest/10':'bg-cream'}`}><span className={`w-6 h-6 rounded-md border grid place-items-center ${done?'bg-forest text-white border-forest':''}`}>{done&&<Check size={16}/>}</span><span className={done?'line-through text-stone':''}>{item}</span></button>
          })}{!template.checklist?.length&&<p className="text-sm text-stone">No checklist items.</p>}</div></section>
          <section className="card"><div className="flex items-center gap-2"><Wrench className="text-forest"/><h3 className="text-lg font-extrabold text-navy">Equipment</h3></div><div className="flex flex-wrap gap-2 mt-4">{(template.equipment||[]).map(item=><span key={item} className="badge-navy">{item}</span>)}{!template.equipment?.length&&<p className="text-sm text-stone">No equipment listed.</p>}</div>
          <div className="flex items-center gap-2 mt-6"><Music2 className="text-forest"/><h3 className="text-lg font-extrabold text-navy">Music</h3></div><div className="space-y-2 mt-3">{(template.music||[]).map((item,index)=>item.url?<a key={index} href={item.url} target="_blank" rel="noreferrer" className="block text-forest font-semibold">{item.label}</a>:<p key={index}>{item.label}</p>)}{!template.music?.length&&<p className="text-sm text-stone">No music links.</p>}</div></section>
        </div>
      </div>:<div className="card text-center text-stone">Schedule or select an activity.</div>}
    </div>:<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {activityTemplates.map(item=>{
        const uses=instances.filter(instance=>instance.templateId===item.id).length
        return <section key={item.id} className="card">
          <div className="flex justify-between gap-2"><span className="badge-forest">{item.category}</span><span className="badge-navy">{uses?`${uses} scheduled`:'Unscheduled'}</span></div>
          <h2 className="text-xl font-extrabold text-navy mt-3">{item.name}</h2><p className="text-sm text-stone mt-1">{item.description}</p>
          <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t">
            <button onClick={()=>editTemplate(item)} className="bg-cream rounded-xl p-2 font-semibold">Edit</button>
            <button onClick={()=>copyActivityTemplate(item.id)} className="bg-cream rounded-xl p-2 font-semibold flex items-center justify-center gap-1"><Copy size={15}/>Copy</button>
            <button onClick={()=>setMessage(deleteActivityTemplate(item.id)?'Activity deleted.':'Remove it from schedules before deleting.')} className="bg-cream rounded-xl p-2 font-semibold text-red-700">Delete</button>
          </div>
          <button onClick={()=>{setScheduleTemplateId(item.id);setScheduleDate(activeEvent.startDate);setShowSchedule(true)}} className="btn-primary w-full mt-3">Schedule in this Event</button>
        </section>
      })}
    </div>}

    {message&&<div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-navy text-white rounded-xl px-4 py-3 shadow-lg z-50">{message}<button onClick={()=>setMessage('')} className="ml-3">×</button></div>}

    {showSchedule&&<div className="fixed inset-0 z-[80] bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={()=>setShowSchedule(false)}><div className="bg-cream rounded-3xl w-full max-w-lg p-5" onClick={e=>e.stopPropagation()}>
      <div className="flex justify-between"><div><h2 className="text-xl font-extrabold text-navy">Schedule Activity</h2><p className="text-sm text-stone">Choose a template and event date.</p></div><button onClick={()=>setShowSchedule(false)}><X/></button></div>
      <label className="block mt-5"><span className="section-title">Activity</span><select value={scheduleTemplateId} onChange={e=>setScheduleTemplateId(e.target.value)} className="w-full mt-1 p-3 border rounded-xl bg-white"><option value="">Choose an activity</option>{activityTemplates.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label className="block mt-3"><span className="section-title">Date</span><input type="date" min={activeEvent.startDate} max={activeEvent.endDate} value={scheduleDate} onChange={e=>setScheduleDate(e.target.value)} className="w-full mt-1 p-3 border rounded-xl bg-white"/></label>
      <button onClick={addScheduled} disabled={!scheduleTemplateId||!scheduleDate} className="btn-primary w-full mt-5 disabled:opacity-40">Add to Event Schedule</button>
    </div></div>}

    {showForm&&<div className="fixed inset-0 z-[80] bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={()=>setShowForm(false)}><div className="bg-cream rounded-3xl w-full max-w-2xl p-5 max-h-[92vh] overflow-auto" onClick={e=>e.stopPropagation()}>
      <div className="flex justify-between"><div><h2 className="text-xl font-extrabold text-navy">{editingId?'Edit Activity':'New Activity'}</h2><p className="text-sm text-stone">Reusable template; schedule dates belong to the Overall Event.</p></div><button onClick={()=>setShowForm(false)}><X/></button></div>
      <div className="grid sm:grid-cols-2 gap-3 mt-5">
        <label className="sm:col-span-2"><span className="section-title">Name</span><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full mt-1 p-3 border rounded-xl bg-white"/></label>
        <label><span className="section-title">Category</span><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full mt-1 p-3 border rounded-xl bg-white">{ACTIVITY_CATEGORIES.map(value=><option key={value}>{value}</option>)}</select></label>
        <label><span className="section-title">Typical duration (minutes)</span><input type="number" min="0" value={form.typicalDurationMinutes} onChange={e=>setForm({...form,typicalDurationMinutes:e.target.value})} className="w-full mt-1 p-3 border rounded-xl bg-white"/></label>
        <label className="sm:col-span-2"><span className="section-title">Description</span><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full mt-1 p-3 border rounded-xl min-h-20 bg-white"/></label>
        <label><span className="section-title">Equipment — one per line</span><textarea value={form.equipmentText} onChange={e=>setForm({...form,equipmentText:e.target.value})} className="w-full mt-1 p-3 border rounded-xl min-h-32 bg-white"/></label>
        <label><span className="section-title">Checklist — one per line</span><textarea value={form.checklistText} onChange={e=>setForm({...form,checklistText:e.target.value})} className="w-full mt-1 p-3 border rounded-xl min-h-32 bg-white"/></label>
        <label className="sm:col-span-2"><span className="section-title">Music — Label | URL, one per line</span><textarea value={form.musicText} onChange={e=>setForm({...form,musicText:e.target.value})} className="w-full mt-1 p-3 border rounded-xl min-h-24 bg-white"/></label>
        <label className="sm:col-span-2"><span className="section-title">Notes</span><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} className="w-full mt-1 p-3 border rounded-xl min-h-20 bg-white"/></label>
      </div>
      <button onClick={saveTemplate} disabled={!form.name.trim()} className="btn-primary w-full mt-5 flex justify-center gap-2 disabled:opacity-40"><Save size={17}/>Save Activity</button>
    </div></div>}
  </div>
}
