import { Cloud, Download, LogIn, LogOut, Upload } from 'lucide-react'
import guestData from '../data/guests.json'
import { useSharedPlanner } from '../context/SharedPlannerContext'
import { capturePlannerStorage } from '../utils/sharedPlanner'

export default function Settings(){
 const {user,access,shared,busy,publish,login,logout}=useSharedPlanner()
 const exportBackup=()=>{
  const data={app:'Main River Cottage Planner',exportedAt:new Date().toISOString(),sourceUrl:location.href,localStorage:capturePlannerStorage()}
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'})
  const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`main-river-backup-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000)
 }
 return <div className="space-y-4"><h1 className="page-title">Settings</h1>
  <section className="card"><h2 className="font-extrabold text-navy">Main River Cottage Planner</h2><p className="text-stone">React + Vite + Tailwind • Version 3.8.0</p></section>
  <section className="card">
   <div className="flex items-start justify-between gap-3"><div><h2 className="font-extrabold text-navy flex items-center gap-2"><Cloud size={19}/>Shared Planner</h2><p className="text-sm text-stone mt-1">Everyone now reads the same published planner. Only the owner can publish.</p></div><span className={`badge ${access.canEdit?'bg-amber-100 text-amber-900':'bg-forest/10 text-forest'}`}>{access.canEdit?'Owner':'View only'}</span></div>
   <dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><dt className="text-stone">Status</dt><dd>{shared.available?'Published':'Not published yet'}</dd><dt className="text-stone">Revision</dt><dd>{shared.revision||'—'}</dd><dt className="text-stone">Last published</dt><dd>{shared.publishedAt?new Date(shared.publishedAt).toLocaleString():'—'}</dd><dt className="text-stone">Signed in</dt><dd>{user?.email||'No'}</dd></dl>
   <div className="grid sm:grid-cols-2 gap-2 mt-5">
    {!user?<button data-view-action="true" onClick={login} className="btn-primary flex justify-center items-center gap-2"><LogIn size={17}/>Owner Sign In</button>:<button data-view-action="true" onClick={logout} className="rounded-xl bg-cream px-4 py-3 font-semibold flex justify-center items-center gap-2"><LogOut size={17}/>Sign Out</button>}
    {access.canEdit&&<button onClick={publish} disabled={busy} className="btn-primary flex justify-center items-center gap-2 disabled:opacity-50"><Upload size={17}/>{shared.available?'Publish Current Draft':'Publish First Shared Planner'}</button>}
    <button data-view-action="true" onClick={exportBackup} className="rounded-xl bg-cream px-4 py-3 font-semibold flex justify-center items-center gap-2"><Download size={17}/>Download Safety Backup</button>
   </div>
   {access.canEdit&&<p className="text-xs text-stone mt-3">Your changes remain on this owner device until you press Publish. Publishing creates a cloud revision and preserves the previous revision in history.</p>}
  </section>
  <section className="card"><h2 className="font-extrabold text-navy">Cottage</h2><dl className="mt-3 grid grid-cols-2 gap-3"><dt className="text-stone">Location</dt><dd>{guestData.cottageDates.location}</dd><dt className="text-stone">Dates</dt><dd>Aug 22–30, 2026</dd><dt className="text-stone">Dietary</dt><dd>Steve & Adele GF</dd></dl></section>
 </div>
}
