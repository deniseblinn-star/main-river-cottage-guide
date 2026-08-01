import { useParams, Link, useNavigate } from 'react-router-dom'
import data from '../data/recipes.json'
import { AlertTriangle, Calculator, Clock, ExternalLink, Pencil, ShoppingCart, Trash2, Users } from 'lucide-react'
import { getRecipeContextByDetailId } from '../utils/recipeEngine'
import { deleteCustomRecipe, getCustomRecipe } from '../utils/customRecipes'
const formatQuantity=value=>Number.isInteger(value)?value:Number(value.toFixed(2))
export default function RecipeDetail(){
 const {id}=useParams(),navigate=useNavigate()
 const custom=id.startsWith('custom-')?getCustomRecipe(id):null
 const r=custom||data.recipes.find(x=>x.id===id)
 const context=custom?null:getRecipeContextByDetailId(id)
 if(!r)return <div className="card">Recipe not found.</div>
 let num=0
 const displayedIngredients=context?context.ingredients.map(row=>`${formatQuantity(row.scaledQuantity)} ${row.unit} ${row.ingredient.name}${row.ingredient.purchaseNote?` — ${row.ingredient.purchaseNote}`:''}`):custom?custom.ingredients.map(row=>`${formatQuantity(row.quantity)} ${row.unit} ${row.name}`):r.ingredients
 const headlineCount=context?context.assignment.attendance:r.servings
 return <div className="space-y-4">
  <section className="rounded-3xl bg-navy text-white p-6"><div className="flex justify-between gap-3 items-start"><div><h1 className="text-3xl font-extrabold">{r.title}</h1><p className="opacity-80 mt-2">{r.description}</p></div>{custom&&<div className="flex gap-2"><Link to={`/recipes/${id}/edit`} className="bg-white/10 rounded-xl p-2" title="Edit recipe"><Pencil/></Link><button onClick={()=>{deleteCustomRecipe(id);navigate('/recipes')}} className="bg-white/10 rounded-xl p-2" title="Delete recipe"><Trash2/></button></div>}</div><div className="flex flex-wrap gap-2 mt-4"><span className="badge bg-white/15 text-white"><Clock size={12}/>{r.prepTime} prep</span><span className="badge bg-white/15 text-white">{r.cookTime} cook</span><span className="badge bg-white/15 text-white"><Users size={12}/>{headlineCount} {context?'eating':'yield'}</span>{r.glutenFree&&<span className="badge bg-amber-300 text-amber-900">GF</span>}</div></section>
  {custom&&<section className="card"><div className="grid sm:grid-cols-2 gap-3"><div className="bg-cream rounded-2xl p-4"><Calculator className="text-forest"/><p className="section-title mt-2">Recipe yield</p><b className="text-2xl">{r.servings}</b></div><div className="bg-cream rounded-2xl p-4"><ShoppingCart className="text-forest"/><p className="section-title mt-2">Meal assignment</p><b>Not assigned yet</b><p className="text-xs text-stone">This is the next connection.</p></div></div></section>}
  {context&&<section className="card"><div className="grid sm:grid-cols-3 gap-3"><div className="bg-cream rounded-2xl p-4"><Users className="text-forest"/><p className="section-title mt-2">Meal attendance</p><b className="text-2xl">{context.assignment.attendance}</b></div><div className="bg-cream rounded-2xl p-4"><Calculator className="text-forest"/><p className="section-title mt-2">Recipe yield</p><b className="text-2xl">{context.recipe.yield.quantity}</b></div><div className="bg-cream rounded-2xl p-4"><ShoppingCart className="text-forest"/><p className="section-title mt-2">Scale factor</p><b className="text-2xl">{context.scale.toFixed(2)}×</b></div></div></section>}
  {(context?.recipe.tradition||custom?.tradition)&&<div className="bg-amber-50 border border-amber-200 rounded-2xl p-4"><b>Tradition</b><p className="text-sm mt-1">{context?.recipe.tradition||custom.tradition}</p></div>}
  {r.gfOption&&<div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3"><AlertTriangle className="text-amber-600"/><div><b>Gluten-free option</b><p className="text-sm">{r.gfOption}</p></div></div>}
  {custom?.equipment?.length>0&&<section className="card"><p className="section-title">Equipment / method</p><div className="flex flex-wrap gap-2 mt-2">{custom.equipment.map(item=><span key={item} className="badge-forest">{item}</span>)}</div></section>}
  {custom?.sourceUrl&&<section className="card"><p className="section-title">Source</p><a href={custom.sourceUrl} target="_blank" rel="noreferrer" className="text-forest font-semibold flex items-center gap-2 mt-2">{custom.sourceName||'Original recipe'}<ExternalLink size={16}/></a></section>}
  <section className="card"><h2 className="font-extrabold text-navy text-xl">{context?'Scaled ingredients':'Ingredients'}</h2><ul className="mt-3 space-y-2">{displayedIngredients.map((item,index)=><li key={`${item}-${index}`} className="border-b py-2">{item}</li>)}</ul></section>
  <section className="card"><h2 className="font-extrabold text-navy text-xl">Instructions</h2><div className="mt-3 space-y-3">{(r.instructions||[]).map((step,index)=>step.startsWith?.('---')?<h3 key={`${step}-${index}`} className="section-title text-forest pt-2">{step.replace('---','')}</h3>:<div key={`${step}-${index}`} className="flex gap-3"><span className="w-7 h-7 rounded-full bg-forest text-white flex items-center justify-center text-sm shrink-0">{++num}</span><p>{step}</p></div>)}</div></section>
  {custom&&<Link to="/recipes/new" className="btn-primary w-full text-center block">Add another recipe</Link>}
 </div>
}
