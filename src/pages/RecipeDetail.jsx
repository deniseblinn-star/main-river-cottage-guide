import { useParams } from 'react-router-dom'
import data from '../data/recipes.json'
import { AlertTriangle, Calculator, Clock, ShoppingCart, Users } from 'lucide-react'
import { getRecipeContextByDetailId } from '../utils/recipeEngine'

const formatQuantity=value=>Number.isInteger(value)?value:Number(value.toFixed(2))

export default function RecipeDetail(){
 const {id}=useParams()
 const r=data.recipes.find(x=>x.id===id)
 const context=getRecipeContextByDetailId(id)
 if(!r)return <div className="card">Recipe not found.</div>
 let num=0
 const displayedIngredients=context
  ? context.ingredients.map(row=>`${formatQuantity(row.scaledQuantity)} ${row.unit} ${row.ingredient.name}${row.ingredient.purchaseNote?` — ${row.ingredient.purchaseNote}`:''}`)
  : r.ingredients
 const headlineCount=context?context.assignment.attendance:r.servings
 return <div className="space-y-4">
  <section className="rounded-3xl bg-navy text-white p-6">
   <h1 className="text-3xl font-extrabold">{r.title}</h1><p className="opacity-80 mt-2">{r.description}</p>
   <div className="flex flex-wrap gap-2 mt-4"><span className="badge bg-white/15 text-white"><Clock size={12}/>{r.prepTime} prep</span><span className="badge bg-white/15 text-white">{r.cookTime} cook</span><span className="badge bg-white/15 text-white"><Users size={12}/>{headlineCount} eating</span>{r.glutenFree&&<span className="badge bg-amber-300 text-amber-900">GF</span>}</div>
  </section>
  {context&&<section className="card">
    <div className="grid sm:grid-cols-3 gap-3">
      <div className="bg-cream rounded-2xl p-4"><Users className="text-forest"/><p className="section-title mt-2">Meal attendance</p><b className="text-2xl">{context.assignment.attendance}</b><p className="text-xs text-stone mt-1">{context.assignment.attendanceSource}</p></div>
      <div className="bg-cream rounded-2xl p-4"><Calculator className="text-forest"/><p className="section-title mt-2">Recipe yield</p><b className="text-2xl">{context.recipe.yield.quantity}</b><p className="text-xs text-stone mt-1">{context.recipe.yield.unit}</p></div>
      <div className="bg-cream rounded-2xl p-4"><ShoppingCart className="text-forest"/><p className="section-title mt-2">Scale factor</p><b className="text-2xl">{context.scale.toFixed(2)}×</b><p className="text-xs text-stone mt-1">Attendance ÷ yield</p></div>
    </div>
    <p className="text-sm text-stone mt-3">These scaled ingredients are the quantities sent to the grocery list.</p>
  </section>}
  {context?.recipe.tradition&&<div className="bg-amber-50 border border-amber-200 rounded-2xl p-4"><b>Tradition</b><p className="text-sm mt-1">{context.recipe.tradition}</p></div>}
  {r.gfOption&&<div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3"><AlertTriangle className="text-amber-600"/><div><b>Gluten-free option</b><p className="text-sm">{r.gfOption}</p></div></div>}
  <section className="card"><h2 className="font-extrabold text-navy text-xl">{context?'Scaled ingredients':'Ingredients'}</h2><ul className="mt-3 space-y-2">{displayedIngredients.map(i=><li key={i} className={/flour|panko|bread|pasta|crouton|worcestershire/i.test(i)&&!r.glutenFree?'bg-amber-50 border border-amber-200 rounded-xl p-2':'border-b py-2'}>{i}</li>)}</ul></section>
  {r.tempMilestones?.length>0&&<section className="card"><h2 className="font-extrabold text-navy text-xl">Temperature milestones</h2><div className="mt-3 space-y-2">{r.tempMilestones.map(x=><div key={x.temp} className="flex justify-between"><span className="font-bold text-red-600">{x.temp}</span><span>{x.action}</span></div>)}</div></section>}
  <section className="card"><h2 className="font-extrabold text-navy text-xl">Instructions</h2><div className="mt-3 space-y-3">{r.instructions.map(s=>s.startsWith('---')?<h3 key={s} className="section-title text-forest pt-2">{s.replace('---','')}</h3>:<div key={s} className="flex gap-3"><span className="w-7 h-7 rounded-full bg-forest text-white flex items-center justify-center text-sm shrink-0">{++num}</span><p>{s}</p></div>)}</div></section>
 </div>
}
