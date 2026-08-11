import { useLocation, useNavigate } from 'react-router-dom'
import { TreePine, ChevronLeft } from 'lucide-react'
import { useEvent } from '../../context/EventContext'
const titles={'/':'Dashboard','/overall-events':'Overall Events','/people':'People & Attendance','/planner':'Weekly Planner','/daily':'Daily Planner','/recipes':'Recipes','/recipe-engine':'Recipe Engine','/groceries':'Groceries','/guests':'Guests','/smoker':'Smoker HQ','/hosting':'Hosting','/events':'Activities','/photos':'Photos','/settings':'Admin'}
export default function TopBar(){
 const l=useLocation(),n=useNavigate(),{events,activeEventId,setActiveEvent}=useEvent()
 const detail=l.pathname.split('/').length>2
 const title=titles[l.pathname]||(l.pathname.startsWith('/recipes/')?'Recipe':l.pathname.startsWith('/daily/')?'Daily Planner':'Main River Cottage')
 return <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur border-b border-stone/15"><div className="max-w-7xl mx-auto h-16 px-4 flex items-center gap-3">
  {detail?<button onClick={()=>n(-1)} className="p-2 rounded-xl bg-white"><ChevronLeft/></button>:<div className="p-2 rounded-xl bg-forest text-white"><TreePine size={22}/></div>}
  <div className="flex-1"><h1 className="font-extrabold text-navy">{title}</h1></div>
  {events.length>1&&<select value={activeEventId} onChange={e=>setActiveEvent(e.target.value)} className="max-w-60 bg-white border rounded-xl px-3 py-2 text-sm font-semibold text-navy">{events.map(event=><option key={event.id} value={event.id}>{event.name}</option>)}</select>}
 </div></header>
}
