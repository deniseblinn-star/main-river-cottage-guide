import { Cloud, Download, LogIn, LogOut, RefreshCw, ShieldCheck, Upload } from 'lucide-react'
import { useState } from 'react'
import { useSharedPlanner } from '../context/SharedPlannerContext'
import { capturePlannerStorage } from '../utils/sharedPlanner'
import { repairSavedRecipeIngredientLinks } from '../utils/customRecipes'

export default function Settings(){
 const {user,access,shared,busy,publish,login,logout}=useSharedPlanner()
 const [repairMessage,setRepairMessage]=useState('')
 const exportBackup=()=>{
  const data={app:'Main River Cottage Planner',exportedAt:new Date().toISOString(),sourceUrl:location.href,localStorage:capturePlannerStorage()}
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'})
  const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`main-river-backup-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000)
 }
 const repairLegacyLinks=()=>{
  const result=repairSavedRecipeIngredientLinks()
  setRepairMessage(result.changed?'Legacy recipe links repaired. Reloading grocery data…':'No stale exact-match recipe links were found.')
  if(result.changed)setTimeout(()=>location.reload(),700)
 }
 return <div className="space-y-4"><div><h1 className="page-title">Admin</h1><p className="text-sm text-stone mt-1">Owner controls, shared planner status, backups and data-health tools.</p></div>
  <section className="card"><div className="flex items-center justify-between gap-3"><div><h2 className="font-extrabold text-navy">Main River Cottage Planner</h2><p className="text-stone">Version 3.7.3 • Final QA</p></div><ShieldCheck className="text-forest"/></div></section>
  <section className="card">
   <div className="flex items-start justify-between gap-3"><div><h2 className="font-extrabold text-navy flex items-center gap-2"><Cloud size={19}/>Shared Planner</h2><p className="text-sm text-stone mt-1">Family members read the published planner. Owner changes stay on this device until published.</p></div><span className={`badge ${access.canEdit?'bg-amber-100 text-amber-900':'bg-forest/10 text-forest'}`}>{access.canEdit?'Owner':'View only'}</span></div>
   <dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><dt className="text-stone">Cloud status</dt><dd>{shared.available?'Published':'Not published yet'}</dd><dt className="text-stone">Revision</dt><dd>{shared.revision||'—'}</dd><dt className="text-stone">Last published</dt><dd>{shared.publishedAt?new Date(shared.publishedAt).toLocaleString():'—'}</dd><dt className="text-stone">Signed in</dt><dd>{user?.email||'No'}</dd></dl>
   <div className="grid sm:grid-cols-2 gap-2 mt-5">
    {!user?<button data-view-action="true" onClick={login} className="btn-primary flex justify-center items-center gap-2"><LogIn size={17}/>Owner Sign In</button>:<button data-view-action="true" onClick={logout} className="rounded-xl bg-cream px-4 py-3 font-semibold flex justify-center items-center gap-2"><LogOut size={17}/>Sign Out</button>}
    {access.canEdit&&<button onClick={publish} disabled={busy} className="btn-primary flex justify-center items-center gap-2 disabled:opacity-50"><Upload size={17}/>{shared.available?'Publish Current Draft':'Publish First Shared Planner'}</button>}
    <button data-view-action="true" onClick={exportBackup} className="rounded-xl bg-cream px-4 py-3 font-semibold flex justify-center items-center gap-2"><Download size={17}/>Download Safety Backup</button>
   </div>
  </section>
  <section className="card">
   <h2 className="font-extrabold text-navy flex items-center gap-2"><RefreshCw size={18}/>Data Health</h2>
   <p className="text-sm text-stone mt-1">Repairs stale Grocery Library links left inside older saved recipe overrides. It does not change ingredient quantities, units, package sizes or Grocery Library records.</p>
   {access.canEdit?<button onClick={repairLegacyLinks} className="rounded-xl bg-cream px-4 py-3 font-semibold mt-4 flex items-center gap-2"><RefreshCw size={16}/>Repair Legacy Recipe Links</button>:<p className="text-xs text-stone mt-3">Sign in as owner to run repair tools.</p>}
   {repairMessage&&<p className="text-sm text-forest font-semibold mt-3">{repairMessage}</p>}
  </section>
 </div>
}
