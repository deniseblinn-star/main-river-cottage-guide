import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Clock, Plus } from 'lucide-react'
import data from '../data/recipes.json'
import { getCustomRecipes } from '../utils/customRecipes'
const filters=['all','smoker','grill','gluten-free','side','salad','dessert','seafood','custom']
const emoji={smoker:'🔥',grill:'🍖','no-cook':'🥗',oven:'🍽️','sous-vide':'🥩',steam:'🦞',stovetop:'🍳',custom:'📝'}
export default function Recipes(){
 const [q,setQ]=useState(''),[tag,setTag]=useState('all'),[custom,setCustom]=useState([])
 useEffect(()=>setCustom(getCustomRecipes()),[])
 const list=[...data.recipes,...custom].filter(r=>(tag==='all'||r.tags?.includes(tag))&&((r.title||'')+' '+(r.description||'')).toLowerCase().includes(q.toLowerCase()))
 return <div className="space-y-4">
  <div className="flex flex-wrap justify-between gap-3 items-start"><div><h1 className="page-title">Recipes</h1><p className="text-stone">Create manually or import a recipe from a website.</p></div><Link to="/recipes/new" className="btn-primary flex items-center gap-2"><Plus size={18}/>Add Recipe</Link></div>
  <div className="card flex gap-2"><Search className="text-stone"/><input className="w-full outline-none" placeholder="Search recipes" value={q} onChange={e=>setQ(e.target.value)}/></div>
  <div className="flex gap-2 overflow-x-auto">{filters.map(f=><button key={f} onClick={()=>setTag(f)} className={`px-3 py-2 rounded-full whitespace-nowrap text-sm font-semibold ${tag===f?'bg-forest text-white':'bg-white'}`}>{f}</button>)}</div>
  <div className="grid sm:grid-cols-2 gap-3">{list.map(r=><Link key={r.id} to={`/recipes/${r.id}`} className="card card-hover"><div className="text-3xl">{emoji[r.method]||'🍽️'}</div><h2 className="font-extrabold text-navy mt-2">{r.title}</h2><p className="text-sm text-stone mt-1">{r.description}</p><div className="flex flex-wrap gap-2 mt-3">{r.glutenFree&&<span className="badge-gf">GF</span>}<span className="badge-navy"><Clock size={12}/>{r.cookTime||'Not set'}</span><span className="badge-forest">Serves {r.servings}</span>{r.id.startsWith('custom-')&&<span className="badge bg-wood-100 text-wood-600">Added by you</span>}</div></Link>)}</div>
 </div>
}
