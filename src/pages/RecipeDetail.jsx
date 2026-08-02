import { useParams, Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, Calculator, Clock, ExternalLink, Pencil, ShoppingCart, Trash2, Users } from 'lucide-react'
import { getCatalogueRecipe, deleteRecipe } from '../utils/recipeCatalogue'
import { normalizeRecipeIngredients, recipeAssignmentCount } from '../utils/eventGroceryEngine'
import { finalAttendeeIds, formatMealDate } from '../utils/mealPlanner'
import { useEvent } from '../context/EventContext'

const formatQuantity=value=>Number.isInteger(value)?value:Number(value.toFixed(2))

export default function RecipeDetail(){
 const {id}=useParams(),navigate=useNavigate()
 const {activeEvent}=useEvent()
 const r=getCatalogueRecipe(id)
 if(!r)return <div className="card">Recipe not found.</div>
 let num=0
 const ingredients=normalizeRecipeIngredients(r)
 const assignments=(activeEvent?.mealSlots||[]).filter(slot=>slot.recipeIds?.includes(id)).map(slot=>{
  const attendance=finalAttendeeIds(activeEvent,slot).length
  const scale=Number(r.servings)>0?attendance/Number(r.servings):0
  return {slot,attendance,scale}
 })
 const assigned=assignments.length>0
 const remove=()=>{
  if(assigned){alert(`${r.title} is assigned to ${assignments.length} meal slot${assignments.length===1?'':'s'} and cannot be deleted yet.`);return}
  if(window.confirm(`Delete ${r.title} from the Recipe Catalogue?`)){deleteRecipe(id);navigate('/recipes')}
 }
 return <div className="space-y-4">
  <section className="rounded-3xl bg-navy text-white p-6">
   <div className="flex justify-between gap-3 items-start">
    <div><h1 className="text-3xl font-extrabold">{r.title}</h1><p className="opacity-80 mt-2">{r.description}</p></div>
    <div className="flex gap-2"><Link to={`/recipes/${id}/edit`} className="bg-white/10 rounded-xl p-2" title="Edit recipe"><Pencil/></Link><button onClick={remove} className="bg-white/10 rounded-xl p-2" title="Delete recipe"><Trash2/></button></div>
   </div>
   <div className="flex flex-wrap gap-2 mt-4"><span className="badge bg-white/15 text-white"><Clock size={12}/>{r.prepTime} prep</span><span className="badge bg-white/15 text-white">{r.cookTime} cook</span><span className="badge bg-white/15 text-white"><Users size={12}/>Serves {r.servings}</span><span className={`badge ${assigned?'bg-amber-300 text-amber-900':'bg-white/15 text-white'}`}>{assigned?`Assigned ${assignments.length>1?`(${assignments.length})`:''}`:'Unassigned'}</span>{r.glutenFree&&<span className="badge bg-amber-300 text-amber-900">GF</span>}</div>
  </section>

  <section className="card">
   <div className="grid sm:grid-cols-2 gap-3"><div className="bg-cream rounded-2xl p-4"><Calculator className="text-forest"/><p className="section-title mt-2">Recipe yield</p><b className="text-2xl">{r.servings}</b><p className="text-xs text-stone">The permanent catalogue yield</p></div><div className="bg-cream rounded-2xl p-4"><ShoppingCart className="text-forest"/><p className="section-title mt-2">Active-event assignments</p><b className="text-2xl">{assignments.length}</b><p className="text-xs text-stone">Only assigned meals generate groceries</p></div></div>
  </section>

  {assigned&&<section className="card"><h2 className="font-extrabold text-navy text-xl">This event's meal assignments</h2><div className="space-y-3 mt-3">{assignments.map(({slot,attendance,scale})=><div key={slot.id} className="bg-cream rounded-2xl p-4 flex flex-wrap justify-between gap-3"><div><b>{formatMealDate(slot.date)} — {slot.label}</b><p className="text-sm text-stone">{attendance} attending · recipe serves {r.servings}</p></div><span className="badge-forest">{scale.toFixed(2)}×</span></div>)}</div></section>}

  {r.tradition&&<div className="bg-amber-50 border border-amber-200 rounded-2xl p-4"><b>Tradition</b><p className="text-sm mt-1">{r.tradition}</p></div>}
  {r.gfOption&&<div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3"><AlertTriangle className="text-amber-600"/><div><b>Gluten-free option</b><p className="text-sm">{r.gfOption}</p></div></div>}
  {r.equipment?.length>0&&<section className="card"><p className="section-title">Equipment / method</p><div className="flex flex-wrap gap-2 mt-2">{r.equipment.map(item=><span key={item} className="badge-forest">{item}</span>)}</div></section>}
  {r.sourceUrl&&<section className="card"><p className="section-title">Source</p><a href={r.sourceUrl} target="_blank" rel="noreferrer" className="text-forest font-semibold flex items-center gap-2 mt-2">{r.sourceName||'Original recipe'}<ExternalLink size={16}/></a></section>}

  <section className="card"><h2 className="font-extrabold text-navy text-xl">Recipe ingredients</h2><ul className="mt-3 space-y-2">{ingredients.map((item,index)=><li key={`${item.name}-${index}`} className="border-b py-2"><b>{formatQuantity(item.quantity)} {item.unit}</b> {item.name}{item.legacy&&<span className="block text-xs text-amber-700">Legacy quantity needs review before final shopping.</span>}</li>)}</ul></section>
  <section className="card"><h2 className="font-extrabold text-navy text-xl">Instructions</h2><div className="mt-3 space-y-3">{(r.instructions||[]).map((step,index)=>step.startsWith?.('---')?<h3 key={`${step}-${index}`} className="section-title text-forest pt-2">{step.replace('---','')}</h3>:<div key={`${step}-${index}`} className="flex gap-3"><span className="w-7 h-7 rounded-full bg-forest text-white flex items-center justify-center text-sm shrink-0">{++num}</span><p>{step}</p></div>)}</div></section>
  <Link to="/recipes/new" className="btn-primary w-full text-center block">Add another recipe</Link>
 </div>
}
