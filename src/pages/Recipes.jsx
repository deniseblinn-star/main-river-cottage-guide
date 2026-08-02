import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Copy, Clock, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { copyRecipe, deleteRecipe, getRecipeCatalogue } from '../utils/recipeCatalogue'
import { getRecipeContextByDetailId } from '../utils/recipeEngine'

const filters=['all','smoker','grill','gluten-free','side','salad','dessert','seafood','custom']
const emoji={smoker:'🔥',grill:'🍖','no-cook':'🥗',oven:'🍽️','sous-vide':'🥩',steam:'🦞',stovetop:'🍳',custom:'📝'}

export default function Recipes(){
 const navigate=useNavigate()
 const [q,setQ]=useState('')
 const [tag,setTag]=useState('all')
 const [recipes,setRecipes]=useState([])
 const refresh=()=>setRecipes(getRecipeCatalogue())
 useEffect(refresh,[])
 const list=recipes.filter(r=>(tag==='all'||r.tags?.includes(tag))&&((r.title||'')+' '+(r.description||'')).toLowerCase().includes(q.toLowerCase()))
 const copy=id=>{const created=copyRecipe(id);if(created)navigate(`/recipes/${created.id}/edit`)}
 const remove=(recipe)=>{
  if(getRecipeContextByDetailId(recipe.id)){
   alert(`${recipe.title} is assigned to a meal and cannot be deleted until it is removed from that meal.`)
   return
  }
  if(window.confirm(`Delete ${recipe.title} from the Recipe Catalogue?`)){deleteRecipe(recipe.id);refresh()}
 }
 return <div className="space-y-4">
  <div className="flex flex-wrap justify-between gap-3 items-start"><div><h1 className="page-title">Recipe Catalogue</h1><p className="text-stone">Keep recipes here. They affect groceries only after being assigned to a meal.</p></div><Link to="/recipes/new" className="btn-primary flex items-center gap-2"><Plus size={18}/>Add Recipe</Link></div>
  <div className="card flex gap-2"><Search className="text-stone"/><input className="w-full outline-none" placeholder="Search recipes" value={q} onChange={e=>setQ(e.target.value)}/></div>
  <div className="flex gap-2 overflow-x-auto">{filters.map(f=><button key={f} onClick={()=>setTag(f)} className={`px-3 py-2 rounded-full whitespace-nowrap text-sm font-semibold ${tag===f?'bg-forest text-white':'bg-white'}`}>{f}</button>)}</div>
  <div className="grid sm:grid-cols-2 gap-3">{list.map(r=>{
   const assigned=getRecipeContextByDetailId(r.id)
   return <article key={r.id} className="card card-hover">
    <Link to={`/recipes/${r.id}`} className="block">
     <div className="flex justify-between gap-3"><div className="text-3xl">{emoji[r.method]||'🍽️'}</div>{assigned?<span className="badge bg-forest/10 text-forest h-fit">Assigned</span>:<span className="badge bg-stone/10 text-stone h-fit">Unassigned</span>}</div>
     <h2 className="font-extrabold text-navy mt-2">{r.title}</h2>
     <p className="text-sm text-stone mt-1">{r.description}</p>
     <div className="flex flex-wrap gap-2 mt-3">{r.glutenFree&&<span className="badge-gf">GF</span>}<span className="badge-navy"><Clock size={12}/>{r.cookTime||'Not set'}</span><span className="badge-forest">Serves {r.servings}</span>{!r.builtIn&&<span className="badge bg-wood-100 text-wood-600">Custom</span>}</div>
    </Link>
    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
     <Link to={`/recipes/${r.id}/edit`} className="rounded-xl bg-cream px-3 py-2 text-sm font-semibold text-center flex justify-center items-center gap-1"><Pencil size={15}/>Edit</Link>
     <button onClick={()=>copy(r.id)} className="rounded-xl bg-cream px-3 py-2 text-sm font-semibold flex justify-center items-center gap-1"><Copy size={15}/>Copy</button>
     <button onClick={()=>remove(r)} className="rounded-xl bg-cream px-3 py-2 text-sm font-semibold text-red-700 flex justify-center items-center gap-1"><Trash2 size={15}/>Delete</button>
    </div>
   </article>
  })}</div>
 </div>
}
