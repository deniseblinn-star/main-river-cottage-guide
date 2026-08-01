import { useState } from 'react'
import data from '../data/checklists.json'
import { Check, RotateCcw } from 'lucide-react'
export default function Hosting(){const [active,setActive]=useState(data.checklists[0].id),[done,setDone]=useState(()=>JSON.parse(localStorage.getItem('cottage-checklists-done')||'{}'));const c=data.checklists.find(x=>x.id===active)
const key=(cid,i)=>`${cid}-${i}`, toggle=(cid,i)=>{const k=key(cid,i),n={...done,[k]:!done[k]};setDone(n);localStorage.setItem('cottage-checklists-done',JSON.stringify(n))}
const count=c.items.filter((_,i)=>done[key(c.id,i)]).length
return <div className="space-y-4"><div className="flex justify-between"><div><h1 className="page-title">Hosting</h1><p className="text-stone">Tap items as they are completed.</p></div><button onClick={()=>{setDone({});localStorage.removeItem('cottage-checklists-done')}} className="p-2 bg-white rounded-xl"><RotateCcw/></button></div>
<div className="flex gap-2 overflow-x-auto">{data.checklists.map(x=><button key={x.id} onClick={()=>setActive(x.id)} className={`px-4 py-2 rounded-full whitespace-nowrap font-semibold ${x.id===active?'bg-forest text-white':'bg-white'}`}>{x.title}</button>)}</div>
<section className="card"><div className="flex justify-between"><h2 className="font-extrabold text-navy">{c.title}</h2><span className="badge-forest">{count}/{c.items.length}</span></div><div className="h-2 bg-cream rounded-full mt-3"><div className="h-full bg-forest rounded-full" style={{width:`${count/c.items.length*100}%`}}/></div>
<div className="mt-3">{c.items.map((item,i)=><button key={i} onClick={()=>toggle(c.id,i)} className="w-full flex gap-3 py-3 border-b last:border-0 text-left"><span className={`w-6 h-6 rounded-lg border flex items-center justify-center ${done[key(c.id,i)]?'bg-forest text-white':'border-stone/30'}`}>{done[key(c.id,i)]&&<Check size={16}/>}</span><span className={done[key(c.id,i)]?'line-through text-stone':''}>{item}</span></button>)}</div></section></div>}
