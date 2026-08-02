import { useState } from 'react'
import { Pencil, Plus, Trash2, UserPlus, X } from 'lucide-react'
import { useEvent } from '../context/EventContext'

const toInput=value=>value?.slice(0,16)||''

export default function PeopleAttendance(){
  const {profiles,activeEvent,addProfile,updateProfile,addAttendee,removeAttendee,updateAttendance}=useEvent()
  const [tab,setTab]=useState('attendance')
  const [showAdd,setShowAdd]=useState(false)
  const [profileForm,setProfileForm]=useState({name:'',role:'',favouriteLunch:'',favouriteDinner:'',notes:''})
  const [editing,setEditing]=useState(null)
  const attendees=new Map((activeEvent?.attendance||[]).map(row=>[row.profileId,row]))
  const available=profiles.filter(profile=>!attendees.has(profile.id))

  const createProfile=()=>{
    if(!profileForm.name.trim())return
    addProfile({...profileForm,name:profileForm.name.trim()})
    setProfileForm({name:'',role:'',favouriteLunch:'',favouriteDinner:'',notes:''});setShowAdd(false)
  }

  return <div className="space-y-5">
    <div><h1 className="page-title">People & Attendance</h1><p className="text-stone">Permanent profiles and event-specific arrival/departure for <b>{activeEvent?.name}</b>.</p></div>
    <div className="flex gap-2"><button onClick={()=>setTab('attendance')} className={`px-4 py-2 rounded-full font-semibold ${tab==='attendance'?'bg-forest text-white':'bg-white'}`}>Event Attendance</button><button onClick={()=>setTab('profiles')} className={`px-4 py-2 rounded-full font-semibold ${tab==='profiles'?'bg-forest text-white':'bg-white'}`}>Profile Library</button></div>

    {tab==='attendance'?<>
      {available.length>0&&<section className="card"><h2 className="font-extrabold text-navy">Add people to this event</h2><div className="flex flex-wrap gap-2 mt-3">{available.map(profile=><button key={profile.id} onClick={()=>addAttendee(profile.id)} className="px-3 py-2 rounded-full bg-cream font-semibold flex items-center gap-2"><UserPlus size={15}/>{profile.name}</button>)}</div></section>}
      <div className="space-y-3">{activeEvent?.attendance.map(row=>{
        const profile=profiles.find(item=>item.id===row.profileId)
        if(!profile)return null
        return <section key={row.profileId} className="card">
          <div className="flex justify-between gap-3"><div><h2 className="font-extrabold text-navy text-lg">{profile.name}</h2><p className="text-xs text-stone">{profile.role||'No role'}{profile.dietary?.length?` • ${profile.dietary.join(', ')}`:''}</p></div><button onClick={()=>removeAttendee(row.profileId)} className="p-2 text-red-700" title="Remove from this event"><Trash2 size={17}/></button></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <label><span className="section-title">Arrival</span><input type="datetime-local" value={toInput(row.arrival)} onChange={e=>updateAttendance(row.profileId,{arrival:e.target.value})} className="w-full mt-1 p-3 border rounded-xl bg-white"/></label>
            <label><span className="section-title">Departure</span><input type="datetime-local" value={toInput(row.departure)} onChange={e=>updateAttendance(row.profileId,{departure:e.target.value})} className="w-full mt-1 p-3 border rounded-xl bg-white"/></label>
            <label className="sm:col-span-2 bg-cream rounded-2xl p-4 flex gap-3 items-center"><input type="checkbox" checked={row.needsAccommodation} onChange={e=>updateAttendance(row.profileId,{needsAccommodation:e.target.checked})}/><span><b>Needs accommodation</b><p className="text-xs text-stone">Used by the nightly bed planner.</p></span></label>
          </div>
        </section>
      })}</div>
    </>:<>
      <div className="flex justify-end"><button onClick={()=>setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus size={18}/>Add Profile</button></div>
      <div className="grid md:grid-cols-2 gap-3">{profiles.map(profile=>{
        const isEditing=editing===profile.id
        return <section key={profile.id} className="card">
          {isEditing?<div className="space-y-2">
            <input value={profile.name} onChange={e=>updateProfile(profile.id,{name:e.target.value})} className="w-full p-3 border rounded-xl font-bold"/>
            <input value={profile.role||''} onChange={e=>updateProfile(profile.id,{role:e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Role"/>
            <div className="grid grid-cols-2 gap-2"><input value={profile.favouriteLunch||''} onChange={e=>updateProfile(profile.id,{favouriteLunch:e.target.value})} className="p-3 border rounded-xl" placeholder="Favourite lunch"/><input value={profile.favouriteDinner||''} onChange={e=>updateProfile(profile.id,{favouriteDinner:e.target.value})} className="p-3 border rounded-xl" placeholder="Favourite dinner"/></div>
            <textarea value={profile.notes||''} onChange={e=>updateProfile(profile.id,{notes:e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Notes"/>
            <button onClick={()=>setEditing(null)} className="btn-primary">Done</button>
          </div>:<div className="flex gap-3"><div className="w-12 h-12 rounded-full bg-navy/10 text-navy font-bold grid place-items-center">{profile.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div className="flex-1"><h2 className="font-extrabold text-navy">{profile.name}</h2><p className="text-xs text-stone">{profile.role||'No role'}</p>{profile.favouriteLunch&&<p className="text-sm mt-2"><b>Favourite lunch:</b> {profile.favouriteLunch}</p>}{profile.favouriteDinner&&<p className="text-sm"><b>Favourite dinner:</b> {profile.favouriteDinner}</p>}</div><button onClick={()=>setEditing(profile.id)} className="p-2"><Pencil size={17}/></button></div>}
        </section>
      })}</div>
    </>}

    {showAdd&&<div className="fixed inset-0 z-[90] bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={()=>setShowAdd(false)}><div className="bg-cream rounded-3xl p-5 w-full max-w-lg" onClick={e=>e.stopPropagation()}><div className="flex justify-between"><h2 className="text-xl font-extrabold text-navy">Add Profile</h2><button onClick={()=>setShowAdd(false)}><X/></button></div><div className="space-y-3 mt-4"><input value={profileForm.name} onChange={e=>setProfileForm({...profileForm,name:e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Name"/><input value={profileForm.role} onChange={e=>setProfileForm({...profileForm,role:e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Role"/><div className="grid grid-cols-2 gap-2"><input value={profileForm.favouriteLunch} onChange={e=>setProfileForm({...profileForm,favouriteLunch:e.target.value})} className="p-3 border rounded-xl" placeholder="Favourite lunch"/><input value={profileForm.favouriteDinner} onChange={e=>setProfileForm({...profileForm,favouriteDinner:e.target.value})} className="p-3 border rounded-xl" placeholder="Favourite dinner"/></div><textarea value={profileForm.notes} onChange={e=>setProfileForm({...profileForm,notes:e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Notes"/></div><button onClick={createProfile} className="btn-primary w-full mt-4">Create Profile</button></div></div>}
  </div>
}
