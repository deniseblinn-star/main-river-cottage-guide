import { NavLink } from 'react-router-dom'
import { Home, CalendarDays, Utensils, BookOpen, ShoppingCart, Users, Flame, Settings, TreePine, CalendarHeart, Images, CalendarRange, BedDouble, ClipboardList } from 'lucide-react'
import { useEvent } from '../../context/EventContext'

const LinkItem=({to,Icon,label})=><NavLink to={to} end={to==='/'} className={({isActive})=>`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold ${isActive?'bg-forest text-white':'text-stone hover:bg-forest/5'}`}><Icon size={19}/>{label}</NavLink>

export default function Sidebar(){
 const {activeEvent}=useEvent()
 return <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-stone/15 flex-col z-40">
  <div className="px-5 pt-6 pb-4"><div className="text-navy font-extrabold leading-tight tracking-tight">Family & Friends<br/>Event Planner</div></div>
  <nav className="px-3 overflow-y-auto pb-5">
    <LinkItem to="/overall-events" Icon={CalendarRange} label="Overall Events"/>
    <div className="my-4 border-t border-stone/15"/>
    {activeEvent&&<div className="px-3 mb-3 flex gap-3 items-start"><div className="bg-forest text-white p-2 rounded-xl"><TreePine size={19}/></div><div className="min-w-0"><b className="text-navy text-sm block leading-tight">{activeEvent.name}</b><p className="text-[11px] text-stone mt-1">{activeEvent.startDate}–{activeEvent.endDate}</p></div></div>}
    <div className="space-y-1">
      <LinkItem to="/" Icon={Home} label="Dashboard"/>
      <LinkItem to="/people" Icon={Users} label="People & Attendance"/>
      <LinkItem to="/accommodations" Icon={BedDouble} label="Accommodations"/>
      <LinkItem to="/events" Icon={CalendarHeart} label="Activities"/>
    </div>
    <p className="px-4 pt-5 pb-2 text-[10px] uppercase tracking-widest font-bold text-stone">Meals & Shopping</p>
    <div className="space-y-1">
      <LinkItem to="/planner" Icon={CalendarDays} label="Meal Planner"/>
      <LinkItem to="/recipes" Icon={BookOpen} label="Recipes"/>
      <LinkItem to="/groceries" Icon={ShoppingCart} label="Groceries"/>
      <LinkItem to="/smoker" Icon={Flame} label="Smoker HQ"/>
    </div>
    <div className="my-4 border-t border-stone/15"/>
    <p className="px-4 pb-2 text-[10px] uppercase tracking-widest font-bold text-stone">Extras</p>
    <div className="space-y-1">
      <LinkItem to="/photos" Icon={Images} label="Photos"/>
      <LinkItem to="/report" Icon={ClipboardList} label="Operations Report"/>
      <LinkItem to="/settings" Icon={Settings} label="Admin"/>
      <LinkItem to="/daily" Icon={Utensils} label="Daily Meals"/>
    </div>
  </nav>
 </aside>
}
