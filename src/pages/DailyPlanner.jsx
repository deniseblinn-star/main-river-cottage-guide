import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import week from '../data/week.json'
import guestData from '../data/guests.json'
import recipes from '../data/recipes.json'
import { guestsForDate, dateLabel } from '../utils'
export default function DailyPlanner(){
 const {dayId}=useParams(); const initial=dayId||week.days[0].id; const [selectedId,setSelectedId]=useState(initial)
 const d=week.days.find(x=>x.id===selectedId)||week.days[0], people=guestsForDate(guestData.guests,d.date)
 const gf=people.filter(g=>g.dietary.includes('gluten-free'))
 const recipeMap=Object.fromEntries(recipes.recipes.map(r=>[r.id,r]))
 return <div className="space-y-5">
 <div className="flex gap-2 overflow-x-auto pb-1">{week.days.map(x=><button key={x.id} onClick={()=>setSelectedId(x.id)} className={`px-4 py-2 rounded-full whitespace-nowrap font-semibold ${x.id===d.id?'bg-forest text-white':'bg-white text-stone'}`}>{x.label.slice(0,3)}</button>)}</div>
 <section className="rounded-3xl bg-navy text-white p-6"><p className="opacity-75">{dateLabel(d.date)}</p><h1 className="text-3xl font-extrabold">{d.label}</h1><p className="mt-2">{d.guestCount} guests • Lead: {d.leadCook}</p><p className="mt-1 opacity-80">{d.evening}</p></section>
 {gf.length>0&&<div className="bg-amber-50 border border-amber-200 rounded-2xl p-4"><b>GF guests today:</b> {gf.map(g=>g.name).join(', ')}. Prepare their food first with separate utensils.</div>}
 {Object.entries(d.meals).map(([type,m])=>m.items.length>0&&<section key={type} className="card"><h2 className="capitalize text-xl font-extrabold text-navy">{type}</h2><div className="mt-3 space-y-2">{m.items.map((item,i)=>{const rid=m.recipeIds[i]||m.recipeIds.find(id=>recipeMap[id]?.title===item);return <div key={item} className="flex justify-between gap-3 border-b last:border-0 py-2"><span>{item}</span>{rid&&<Link to={`/recipes/${rid}`} className="text-forest font-semibold text-sm">Recipe</Link>}</div>})}</div></section>)}
 {d.prep&&<div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl"><b>Tonight's prep:</b> {d.prep}</div>}
 <section className="card"><h2 className="font-extrabold text-navy">Who is here</h2><div className="flex flex-wrap gap-2 mt-3">{people.map(g=><span key={g.id} className={g.dietary.includes('gluten-free')?'badge-gf':'badge-forest'}>{g.name}</span>)}</div></section>
 </div>}
