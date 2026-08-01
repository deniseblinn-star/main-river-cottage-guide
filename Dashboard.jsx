import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, ChefHat, ChevronDown, ChevronUp } from 'lucide-react'
import week from '../data/week.json'
import { dateLabel } from '../utils'
function Day({d}){const [open,setOpen]=useState(d.id==='saturday');return <div className="card">
<button className="w-full text-left" onClick={()=>setOpen(!open)}><div className="flex justify-between gap-3"><div><p className="section-title">{dateLabel(d.date)}</p><h2 className="text-xl font-extrabold text-navy">{d.label}</h2><p className="text-sm mt-1">{d.meals.dinner.items.slice(0,3).join(' • ')}</p></div><div className="text-right"><span className="badge-forest"><Users size={12}/>{d.guestCount}</span>{open?<ChevronUp className="ml-auto mt-3"/>:<ChevronDown className="ml-auto mt-3"/>}</div></div></button>
{open&&<div className="pt-4 mt-4 border-t space-y-3"><div className="flex gap-2 flex-wrap"><span className="badge-navy"><ChefHat size={12}/>{d.leadCook}</span>{d.support.map(x=><span key={x} className="badge-forest">{x}</span>)}</div>
{Object.entries(d.meals).map(([type,m])=>m.items.length>0&&<div key={type}><p className="section-title">{type}</p><div className="flex flex-wrap gap-2 mt-1">{m.items.map(i=><span key={i} className="px-3 py-1 bg-cream rounded-full text-sm">{i}</span>)}</div></div>)}
{d.prep&&<div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-sm"><b>Prep:</b> {d.prep}</div>}
<Link className="btn-primary inline-block" to={`/daily/${d.id}`}>View day</Link></div>}</div>}
export default function WeeklyPlanner(){return <div className="space-y-4"><div><h1 className="page-title">Week at a glance</h1><p className="text-stone">Tap a day to see every meal and side.</p></div>{week.days.map(d=><Day key={d.id} d={d}/>)}</div>}
