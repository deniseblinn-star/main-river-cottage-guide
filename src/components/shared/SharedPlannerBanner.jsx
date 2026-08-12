import { Cloud, CloudOff, Lock, LogIn, LogOut, RefreshCw, UploadCloud } from 'lucide-react'
import { useSharedPlanner } from '../../context/SharedPlannerContext'

export default function SharedPlannerBanner(){
  const {user,access,shared,message,busy,publish,updateLatest,login,logout}=useSharedPlanner()
  const published=shared?.publishedAt?new Date(shared.publishedAt).toLocaleString():''
  return <>
    <div className={`px-4 py-2 text-sm ${access.canEdit?'bg-amber-100 text-amber-950':'bg-forest text-white'}`}>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {shared?.online===false?<CloudOff size={16}/>:<Cloud size={16}/>} 
          {access.canEdit?<><b>Owner draft</b><span>• Publish when ready</span></>:<><Lock size={15}/><b>Published family planner</b><span>• View only</span></>}
          {shared?.available&&<span>• Revision {shared.revision}{published?` • ${published}`:''}</span>}
          {!shared?.available&&<span>• No shared planner published yet</span>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {access.canEdit?<button data-view-action="true" disabled={busy} onClick={publish} className="font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950 text-white disabled:opacity-50"><UploadCloud size={15}/>Publish Latest Plan</button>:shared?.available&&<button data-view-action="true" disabled={busy} onClick={updateLatest} className="font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-forest disabled:opacity-50"><RefreshCw size={15}/>Update to Latest</button>}
          <button data-view-action="true" onClick={user?logout:login} className="font-semibold flex items-center gap-1 underline underline-offset-2">{user?<><LogOut size={15}/>Sign out</>:<><LogIn size={15}/>Owner sign in</>}</button>
        </div>
      </div>
    </div>
    {message&&<div className="fixed z-[200] bottom-24 left-1/2 -translate-x-1/2 bg-navy text-white rounded-2xl px-4 py-3 shadow-xl max-w-[90vw] text-sm font-semibold">{message}</div>}
  </>
}
