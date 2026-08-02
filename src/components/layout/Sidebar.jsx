import { NavLink } from 'react-router-dom'
import { Home, CalendarDays, Utensils, BookOpen, ShoppingCart, Users, Flame, ClipboardCheck, Settings, TreePine, CalendarHeart, Images, CalendarRange } from 'lucide-react'
import { useEvent } from '../../context/EventContext'
const nav=[['/',Home,'Dashboard'],['/overall-events',CalendarRange,'Overall Events'],['/people',Users,'People & Attendance'],['/planner',CalendarDays,'Meal Planner'],['/daily',Utensils,'Daily Meals'],['/recipes',BookOpen,'Recipes'],['/groceries',ShoppingCart,'Groceries'],['/events',CalendarHeart,'Activities'],['/photos',Images,'Photos'],['/smoker',Flame,'Smoker HQ'],['/hosting',ClipboardCheck,'Hosting'],['/settings',Settings,'Settings']]
export default function Sidebar(){
 const {activeEvent}=useEvent()
 return <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-stone/15 flex-col z-40">
  <div className="p-6 flex gap-3 items-center"><div className="bg-forest text-white p-3 rounded-2xl"><TreePine/></div><div className="min-w-0"><b className="text-navy block truncate">{activeEvent?.name||'Main River'}</b><p className="text-xs text-stone truncate">{activeEvent?.location||'Cottage Planner'}</p></div></div>
  <nav className="px-3 space-y-1 overflow-y-auto">{nav.map(([to,I,label])=><NavLink key={to} to={to} end={to==='/' } className={({isActive})=>`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold ${isActive?'bg-forest text-white':'text-stone hover:bg-forest/5'}`}><I size={20}/>{label}</NavLink>)}</nav>
  <div className="mt-auto p-5 text-xs text-stone">{activeEvent?.startDate}–{activeEvent?.endDate}</div>
 </aside>
}
