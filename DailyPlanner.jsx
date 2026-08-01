import { useState } from 'react'
import data from '../data/smoker.json'
const colors={forest:'bg-forest',navy:'bg-navy',wood:'bg-wood-500'}
export default function SmokerHQ(){const [id,setId]=useState(data.sessions[0].id),s=data.sessions.find(x=>x.id===id)
return <div className="space-y-4"><h1 className="page-title">Smoker HQ</h1><div className="grid grid-cols-3 gap-2">{data.sessions.map(x=><button key={x.id} onClick={()=>setId(x.id)} className={`p-3 rounded-2xl text-sm font-bold ${id===x.id?`${colors[x.color]} text-white`:'bg-white'}`}>{x.title}</button>)}</div>
<section className={`${colors[s.color]} text-white rounded-3xl p-6`}><p className="opacity-80">{s.day}</p><h2 className="text-2xl font-extrabold">{s.title}</h2><div className="grid grid-cols-2 gap-3 mt-4 text-sm"><div><span className="opacity-70">Start</span><br/><b>{s.start}</b></div><div><span className="opacity-70">Serve</span><br/><b>{s.serve}</b></div><div><span className="opacity-70">Pit</span><br/><b>{s.pitTemp}</b></div><div><span className="opacity-70">Wood</span><br/><b>{s.wood}</b></div></div></section>
<div className="space-y-3">{s.phases.map(([time,type,text])=><div key={time} className="card flex gap-4"><div className="w-24 shrink-0"><b className="text-navy">{time}</b><p className="text-xs uppercase text-stone">{type}</p></div><p>{text}</p></div>)}</div>
<section className="card"><h2 className="font-extrabold text-navy">Pro tips</h2><ul className="list-disc pl-5 mt-2 space-y-2">{s.tips.map(t=><li key={t}>{t}</li>)}</ul></section></div>}
