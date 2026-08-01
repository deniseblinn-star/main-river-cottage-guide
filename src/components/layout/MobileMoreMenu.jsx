import { Link } from 'react-router-dom'
import { Utensils, BookOpen, Users, ClipboardCheck, Settings, X } from 'lucide-react'
const items=[['/daily',Utensils,'Daily Planner','Today by meal'],['/recipes',BookOpen,'Recipes','Ingredients and steps'],['/guests',Users,'Guests','Who is here'],['/hosting',ClipboardCheck,'Hosting','Checklists'],['/settings',Settings,'Settings','App and data']]
export default function MobileMoreMenu({open,onClose}){if(!open)return null;return <div className="fixed inset-0 z-50 bg-black/35 flex items-end" onClick={onClose}><div className="bg-cream rounded-t-3xl w-full p-5 pb-10" onClick={e=>e.stopPropagation()}>
<div className="flex justify-between mb-3"><b className="text-navy">More</b><button onClick={onClose}><X/></button></div>
<div className="space-y-2">{items.map(([to,I,t,d])=><Link key={to} to={to} onClick={onClose} className="card flex gap-3 items-center"><I className="text-forest"/><div><b>{t}</b><p className="text-xs text-stone">{d}</p></div></Link>)}</div></div></div>}
