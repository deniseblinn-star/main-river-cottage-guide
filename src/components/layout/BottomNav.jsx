import { NavLink } from 'react-router-dom'
import { Home, CalendarDays, ShoppingCart, Flame, MoreHorizontal } from 'lucide-react'
import MobileMoreMenu from './MobileMoreMenu'
import { useState } from 'react'
const items=[['/',Home,'Home'],['/planner',CalendarDays,'Planner'],['/groceries',ShoppingCart,'Groceries'],['/smoker',Flame,'Smoker']]
export default function BottomNav(){const [open,setOpen]=useState(false);return <><nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t z-40 pb-safe"><div className="grid grid-cols-5">
{items.map(([to,I,label])=><NavLink key={to} to={to} end={to==='/'} className={({isActive})=>`py-2 flex flex-col items-center ${isActive?'text-forest':'text-stone'}`}><I size={22}/><span className="nav-icon-label">{label}</span></NavLink>)}
<button onClick={()=>setOpen(true)} className="py-2 flex flex-col items-center text-stone"><MoreHorizontal size={22}/><span className="nav-icon-label">More</span></button></div></nav><MobileMoreMenu open={open} onClose={()=>setOpen(false)}/></>}
