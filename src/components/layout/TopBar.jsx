import { useLocation, useNavigate } from 'react-router-dom'
import { TreePine, ChevronLeft } from 'lucide-react'
const titles={'/':'Main River Cottage','/planner':'Weekly Planner','/daily':'Daily Planner','/recipes':'Recipes','/recipe-engine':'Recipe Engine','/groceries':'Groceries','/guests':'Guests','/smoker':'Smoker HQ','/hosting':'Hosting','/events':'Events','/photos':'Photos','/settings':'Settings'}
export default function TopBar(){
 const l=useLocation(), n=useNavigate()
 const detail=l.pathname.split('/').length>2
 const title=titles[l.pathname] || (l.pathname.startsWith('/recipes/')?'Recipe':l.pathname.startsWith('/daily/')?'Daily Planner':'Main River Cottage')
 return <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur border-b border-stone/15">
  <div className="max-w-4xl mx-auto h-16 px-4 flex items-center gap-3">
    {detail?<button onClick={()=>n(-1)} className="p-2 rounded-xl bg-white"><ChevronLeft/></button>:<div className="p-2 rounded-xl bg-forest text-white"><TreePine size={22}/></div>}
    <div><h1 className="font-extrabold text-navy">{title}</h1>{l.pathname==='/'&&<p className="text-xs text-stone">Main River, New Brunswick</p>}</div>
  </div>
 </header>
}
