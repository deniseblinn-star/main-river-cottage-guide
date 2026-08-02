import { useMemo, useState } from 'react'
import { Check, ChevronDown, Pencil, Plus, Trash2, UserPlus, X } from 'lucide-react'
import { useEvent } from '../context/EventContext'

const toInput=value=>value?.slice(0,16)||''
const DIETARY_OPTIONS=[
  'Gluten Free',
  'Lactose',
  'Eggs',
  'White Bread',
  'Celiac',
  'Dairy Allergy',
  'Nut Allergy',
  'Shellfish Allergy',
  'Vegetarian',
  'Vegan',
  'No Pork',
  'No Alcohol'
]

const emptyProfile={
  name:'',
  roles:[],
  dietary:[],
  favouriteLunch:'',
  favouriteDinner:'',
  notes:''
}

function TagButton({selected,onClick,children}){
  return <button type="button" onClick={onClick} className={`rounded-full px-3 py-2 text-sm font-semibold border ${selected?'bg-forest text-white border-forest':'bg-white border-stone/20 text-stone'}`}>
    {children}
  </button>
}

export default function PeopleAttendance(){
  const {
    profiles,activeEvent,roleLibrary,
    addProfile,updateProfile,addRole,
    addAttendee,removeAttendee,updateAttendance
  }=useEvent()

  const [tab,setTab]=useState('attendance')
  const [showAddProfile,setShowAddProfile]=useState(false)
  const [showAddAttendee,setShowAddAttendee]=useState(false)
  const [showRoleCreator,setShowRoleCreator]=useState(false)
  const [newRole,setNewRole]=useState('')
  const [profileForm,setProfileForm]=useState(emptyProfile)
  const [editing,setEditing]=useState(null)

  const attendees=new Map((activeEvent?.attendance||[]).map(row=>[row.profileId,row]))
  const available=profiles.filter(profile=>!attendees.has(profile.id))
  const sortedAttendance=useMemo(
    ()=>[...(activeEvent?.attendance||[])].sort((a,b)=>{
      const aName=profiles.find(profile=>profile.id===a.profileId)?.name||''
      const bName=profiles.find(profile=>profile.id===b.profileId)?.name||''
      return aName.localeCompare(bName)
    }),
    [activeEvent,profiles]
  )

  const toggleProfileValue=(profileId,field,value)=>{
    const profile=profiles.find(item=>item.id===profileId)
    const current=Array.isArray(profile?.[field])?profile[field]:[]
    const next=current.includes(value)?current.filter(item=>item!==value):[...current,value]
    updateProfile(profileId,{[field]:next})
  }

  const toggleFormValue=(field,value)=>{
    const current=profileForm[field]||[]
    setProfileForm({...profileForm,[field]:current.includes(value)?current.filter(item=>item!==value):[...current,value]})
  }

  const createProfile=()=>{
    if(!profileForm.name.trim())return
    addProfile({...profileForm,name:profileForm.name.trim()})
    setProfileForm(emptyProfile)
    setShowAddProfile(false)
  }

  const createRole=()=>{
    const clean=newRole.trim()
    if(!clean)return
    addRole(clean)
    setNewRole('')
    setShowRoleCreator(false)
  }

  return <div className="space-y-5">
    <div className="flex flex-wrap justify-between gap-3 items-start">
      <div>
        <h1 className="page-title">People & Attendance</h1>
        <p className="text-stone">Permanent profiles and event-specific arrival/departure for <b>{activeEvent?.name}</b>.</p>
      </div>
      {tab==='attendance'
        ?<button onClick={()=>setShowAddAttendee(true)} className="btn-primary flex items-center gap-2"><UserPlus size={18}/>Add Attendee</button>
        :<button onClick={()=>setShowAddProfile(true)} className="btn-primary flex items-center gap-2"><Plus size={18}/>Add Profile</button>}
    </div>

    <div className="flex gap-2 overflow-x-auto">
      <button onClick={()=>setTab('attendance')} className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap ${tab==='attendance'?'bg-forest text-white':'bg-white'}`}>Event Attendance</button>
      <button onClick={()=>setTab('profiles')} className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap ${tab==='profiles'?'bg-forest text-white':'bg-white'}`}>Profile Library</button>
    </div>

    {tab==='attendance'?<div className="space-y-3">
      {sortedAttendance.map(row=>{
        const profile=profiles.find(item=>item.id===row.profileId)
        if(!profile)return null
        return <section key={row.profileId} className="card">
          <div className="flex justify-between gap-3 items-start">
            <div>
              <h2 className="font-extrabold text-navy text-lg">{profile.name}</h2>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(profile.roles||[]).map(role=><span key={role} className="badge-navy">{role}</span>)}
                {(profile.dietary||[]).map(item=><span key={item} className="badge-gf">{item}</span>)}
                {!profile.roles?.length&&!profile.dietary?.length&&<span className="text-xs text-stone">No roles or dietary notes yet.</span>}
              </div>
            </div>
            <button onClick={()=>removeAttendee(row.profileId)} className="p-2 text-red-700" title="Remove from this event"><Trash2 size={17}/></button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <label><span className="section-title">Arrival</span><input type="datetime-local" value={toInput(row.arrival)} onChange={e=>updateAttendance(row.profileId,{arrival:e.target.value})} className="w-full mt-1 p-3 border rounded-xl bg-white"/></label>
            <label><span className="section-title">Departure</span><input type="datetime-local" value={toInput(row.departure)} onChange={e=>updateAttendance(row.profileId,{departure:e.target.value})} className="w-full mt-1 p-3 border rounded-xl bg-white"/></label>
            <label className="sm:col-span-2 bg-cream rounded-2xl p-4 flex gap-3 items-center">
              <input type="checkbox" checked={row.needsAccommodation} onChange={e=>updateAttendance(row.profileId,{needsAccommodation:e.target.checked})}/>
              <span><b>Needs accommodation</b><p className="text-xs text-stone">Used by the nightly bed planner.</p></span>
            </label>
          </div>
        </section>
      })}
      {!sortedAttendance.length&&<div className="card text-center text-stone">No attendees yet. Use Add Attendee to select from the Profile Library.</div>}
    </div>:<div className="grid md:grid-cols-2 gap-3">
      {profiles.map(profile=>{
        const isEditing=editing===profile.id
        return <section key={profile.id} className="card">
          {isEditing?<div className="space-y-5">
            <input value={profile.name} onChange={e=>updateProfile(profile.id,{name:e.target.value})} className="w-full p-3 border rounded-xl font-bold"/>

            <div>
              <div className="flex flex-wrap justify-between gap-2 items-center">
                <span className="section-title">Roles</span>
                <button onClick={()=>setShowRoleCreator(true)} className="text-sm text-forest font-semibold flex items-center gap-1"><Plus size={15}/>Add New Role</button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(roleLibrary||[]).map(role=><TagButton key={role} selected={(profile.roles||[]).includes(role)} onClick={()=>toggleProfileValue(profile.id,'roles',role)}>{role}</TagButton>)}
              </div>
            </div>

            <div>
              <span className="section-title">Dietary, allergies & food notes</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {DIETARY_OPTIONS.map(item=><TagButton key={item} selected={(profile.dietary||[]).includes(item)} onClick={()=>toggleProfileValue(profile.id,'dietary',item)}>{item}</TagButton>)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input value={profile.favouriteLunch||''} onChange={e=>updateProfile(profile.id,{favouriteLunch:e.target.value})} className="p-3 border rounded-xl" placeholder="Favourite lunch"/>
              <input value={profile.favouriteDinner||''} onChange={e=>updateProfile(profile.id,{favouriteDinner:e.target.value})} className="p-3 border rounded-xl" placeholder="Favourite dinner"/>
            </div>
            <textarea value={profile.notes||''} onChange={e=>updateProfile(profile.id,{notes:e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Personal notes"/>
            <button onClick={()=>setEditing(null)} className="btn-primary">Done</button>
          </div>:<div className="flex gap-3 items-start">
            <div className="w-12 h-12 rounded-full bg-navy/10 text-navy font-bold grid place-items-center shrink-0">{profile.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div>
            <div className="flex-1 min-w-0">
              <h2 className="font-extrabold text-navy">{profile.name}</h2>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(profile.roles||[]).map(role=><span key={role} className="badge-navy">{role}</span>)}
                {(profile.dietary||[]).map(item=><span key={item} className="badge-gf">{item}</span>)}
              </div>
              {profile.favouriteLunch&&<p className="text-sm mt-3"><b>Favourite lunch:</b> {profile.favouriteLunch}</p>}
              {profile.favouriteDinner&&<p className="text-sm"><b>Favourite dinner:</b> {profile.favouriteDinner}</p>}
              {profile.notes&&<p className="text-sm text-stone mt-2">{profile.notes}</p>}
            </div>
            <button onClick={()=>setEditing(profile.id)} className="p-2"><Pencil size={17}/></button>
          </div>}
        </section>
      })}
    </div>}

    {showAddAttendee&&<div className="fixed inset-0 z-[90] bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={()=>setShowAddAttendee(false)}>
      <div className="bg-cream rounded-3xl p-5 w-full max-w-lg max-h-[85vh] overflow-auto" onClick={e=>e.stopPropagation()}>
        <div className="flex justify-between items-start"><div><h2 className="text-xl font-extrabold text-navy">Add Attendee</h2><p className="text-sm text-stone">Select a permanent Profile to add to {activeEvent?.name}.</p></div><button onClick={()=>setShowAddAttendee(false)}><X/></button></div>
        <div className="space-y-2 mt-5">
          {available.map(profile=><button key={profile.id} onClick={()=>{addAttendee(profile.id);setShowAddAttendee(false)}} className="w-full bg-white border rounded-2xl p-4 text-left flex justify-between gap-3 items-center">
            <div><b className="text-navy">{profile.name}</b><p className="text-xs text-stone mt-1">{(profile.roles||[]).join(' • ')||'No role selected'}</p></div><UserPlus className="text-forest"/>
          </button>)}
          {!available.length&&<div className="bg-white rounded-2xl p-5 text-center text-stone">Every Profile is already attending this event.</div>}
        </div>
      </div>
    </div>}

    {showAddProfile&&<div className="fixed inset-0 z-[90] bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={()=>setShowAddProfile(false)}>
      <div className="bg-cream rounded-3xl p-5 w-full max-w-2xl max-h-[92vh] overflow-auto" onClick={e=>e.stopPropagation()}>
        <div className="flex justify-between"><div><h2 className="text-xl font-extrabold text-navy">Add Profile</h2><p className="text-sm text-stone">Profiles are permanent and can be reused across Overall Events.</p></div><button onClick={()=>setShowAddProfile(false)}><X/></button></div>
        <div className="space-y-5 mt-5">
          <input value={profileForm.name} onChange={e=>setProfileForm({...profileForm,name:e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Name"/>
          <div>
            <div className="flex flex-wrap justify-between gap-2"><span className="section-title">Roles</span><button onClick={()=>setShowRoleCreator(true)} className="text-sm text-forest font-semibold flex items-center gap-1"><Plus size={15}/>Add New Role</button></div>
            <div className="flex flex-wrap gap-2 mt-2">{(roleLibrary||[]).map(role=><TagButton key={role} selected={profileForm.roles.includes(role)} onClick={()=>toggleFormValue('roles',role)}>{role}</TagButton>)}</div>
          </div>
          <div>
            <span className="section-title">Dietary, allergies & food notes</span>
            <div className="flex flex-wrap gap-2 mt-2">{DIETARY_OPTIONS.map(item=><TagButton key={item} selected={profileForm.dietary.includes(item)} onClick={()=>toggleFormValue('dietary',item)}>{item}</TagButton>)}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={profileForm.favouriteLunch} onChange={e=>setProfileForm({...profileForm,favouriteLunch:e.target.value})} className="p-3 border rounded-xl" placeholder="Favourite lunch"/>
            <input value={profileForm.favouriteDinner} onChange={e=>setProfileForm({...profileForm,favouriteDinner:e.target.value})} className="p-3 border rounded-xl" placeholder="Favourite dinner"/>
          </div>
          <textarea value={profileForm.notes} onChange={e=>setProfileForm({...profileForm,notes:e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Personal notes"/>
        </div>
        <button onClick={createProfile} disabled={!profileForm.name.trim()} className="btn-primary w-full mt-5 disabled:opacity-40">Create Profile</button>
      </div>
    </div>}

    {showRoleCreator&&<div className="fixed inset-0 z-[100] bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={()=>setShowRoleCreator(false)}>
      <div className="bg-cream rounded-3xl p-5 w-full max-w-md" onClick={e=>e.stopPropagation()}>
        <div className="flex justify-between"><div><h2 className="text-xl font-extrabold text-navy">Add New Role</h2><p className="text-sm text-stone">The role becomes available to every Profile.</p></div><button onClick={()=>setShowRoleCreator(false)}><X/></button></div>
        <input autoFocus value={newRole} onChange={e=>setNewRole(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')createRole()}} className="w-full mt-5 p-3 border rounded-xl" placeholder="Example: Fireworks Captain"/>
        <button onClick={createRole} disabled={!newRole.trim()} className="btn-primary w-full mt-4 disabled:opacity-40">Add Role</button>
      </div>
    </div>}
  </div>
}
