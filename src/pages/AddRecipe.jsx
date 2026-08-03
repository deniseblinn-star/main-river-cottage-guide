import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Globe2, Plus, Save, Trash2, X } from 'lucide-react'
import { saveCustomRecipe } from '../utils/customRecipes'
import { getCatalogueRecipe } from '../utils/recipeCatalogue'
import { parseLegacyIngredient } from '../utils/eventGroceryEngine'
import { getGroceryLibrary, matchGroceryItem, normalizeUnit } from '../utils/groceryLibrary'

const equipmentOptions=['Smoker','Grill','BBQ','Oven','Sous Vide','Slow Cooker','Stove Top','No Cook']
const blankIngredient={name:'',quantity:1,unit:'each',shopping:true,groceryItemId:''}
const blankForm={title:'',description:'',sourceName:'',sourceUrl:'',servings:'',category:'Main',prepTime:'',cookTime:'',tradition:'',equipment:[],ingredients:[{...blankIngredient}],instructions:['']}

const imports={
 caesar:{
  title:'Classic Caesar Salad',description:'Restaurant-style Caesar salad with a from-scratch dressing.',sourceName:'Allrecipes',sourceUrl:'https://www.allrecipes.com/recipe/229063/classic-restaurant-caesar-salad/',servings:2,category:'Main',prepTime:'20 min',cookTime:'0 min',tradition:'',equipment:['No Cook'],
  ingredients:[
   {name:'Anchovy fillets',quantity:3,unit:'each',shopping:true},{name:'Garlic',quantity:2,unit:'cloves',shopping:true},{name:'Lemon',quantity:0.5,unit:'each',shopping:true},{name:'Red wine vinegar',quantity:2,unit:'tbsp',shopping:true},{name:'Egg yolk',quantity:1,unit:'each',shopping:true},{name:'Dijon mustard',quantity:1,unit:'tbsp',shopping:true},{name:'Worcestershire sauce',quantity:1,unit:'dash',shopping:true},{name:'Olive oil',quantity:0.25,unit:'cup',shopping:true},{name:'Salt and black pepper',quantity:1,unit:'to taste',shopping:false},{name:'Romaine lettuce',quantity:0.5,unit:'head',shopping:true},{name:'Parmesan cheese',quantity:0.25,unit:'cup',shopping:true},{name:'Croutons',quantity:2,unit:'tbsp',shopping:true}
  ],
  instructions:['Gather all ingredients.','Mash anchovy fillets and garlic in a large salad bowl. Add lemon juice, red wine vinegar, Dijon mustard, egg yolk and Worcestershire sauce; whisk until smooth.','Gradually stream in olive oil while whisking. Season with salt and black pepper.','Mix romaine and Parmesan into the dressing.','Top with croutons and serve.']
 },
 tenderloin:{
  title:'Grilled Whole Beef Tenderloin',description:'Whole beef tenderloin grilled over direct and indirect heat.',sourceName:'HowToBBQRight',sourceUrl:'https://howtobbqright.com/2013/12/13/grilling-a-whole-beef-tenderloin/',servings:'',category:'Main',prepTime:'2 hr 20 min',cookTime:'30 min',tradition:'',equipment:['Grill'],
  ingredients:[{name:'Whole beef tenderloin',quantity:1,unit:'each',shopping:true},{name:"Moore's Original Hickory Marinade",quantity:1,unit:'bottle',shopping:true},{name:'Steak and brisket seasoning',quantity:1,unit:'package',shopping:true}],
  instructions:['Trim silver skin, connective tissue and excess fat from the tenderloin.','Marinate the tenderloin for about 2 hours in the refrigerator.','Remove from marinade, let excess drip off and season the outside.','Prepare a two-zone grill.','Sear for 2 minutes per side on four sides, about 8 minutes total.','Move to indirect heat and cook until the centre reaches the desired temperature; the source recommends about 130°F for medium-rare.','Rest for 10–15 minutes before slicing.']
 }
}

export default function AddRecipe(){
 const navigate=useNavigate(),{id}=useParams()
 const editing=Boolean(id)
 const [mode,setMode]=useState(editing?'form':'choose')
 const [url,setUrl]=useState('')
 const [importMessage,setImportMessage]=useState('')
 const [form,setForm]=useState(blankForm)
 const groceryLibrary=getGroceryLibrary()
 useEffect(()=>{if(editing){const found=getCatalogueRecipe(id);if(found){const ingredients=(found.ingredients||[]).map(row=>typeof row==='string'?parseLegacyIngredient(row):row);setForm({...blankForm,...found,category:found.category||found.tags?.find(tag=>['main','side','salad','appetizer','dessert','sauce','drink','bread'].includes(tag))||'Main',equipment:found.equipment||[],ingredients:ingredients.length?ingredients:[{...blankIngredient}],instructions:found.instructions?.length?found.instructions:['']})}}},[editing,id])
 const update=(field,value)=>setForm(current=>({...current,[field]:value}))
 const updateIngredient=(index,field,value)=>setForm(current=>({...current,ingredients:current.ingredients.map((row,i)=>{
  if(i!==index)return row
  const updated={...row,[field]:value}
  if(field==='name'){
    const match=matchGroceryItem(value,groceryLibrary)
    updated.groceryItemId=match?.id||''
    if(match?.allowedUnits?.length&&!match.allowedUnits.includes(normalizeUnit(updated.unit)))updated.unit=match.allowedUnits[0]
  }
  return updated
 })}))
 const addIngredient=()=>setForm(current=>({...current,ingredients:[...current.ingredients,{...blankIngredient}]}))
 const removeIngredient=index=>setForm(current=>({...current,ingredients:current.ingredients.filter((_,i)=>i!==index)}))
 const updateInstruction=(index,value)=>setForm(current=>({...current,instructions:current.instructions.map((row,i)=>i===index?value:row)}))
 const addInstruction=()=>setForm(current=>({...current,instructions:[...current.instructions,'']}))
 const removeInstruction=index=>setForm(current=>({...current,instructions:current.instructions.filter((_,i)=>i!==index)}))
 const toggleEquipment=name=>setForm(current=>({...current,equipment:current.equipment.includes(name)?current.equipment.filter(x=>x!==name):[...current.equipment,name]}))
 const importRecipe=()=>{
  const normalized=url.trim().toLowerCase()
  if(normalized.includes('allrecipes.com/recipe/229063/classic-restaurant-caesar-salad')){setForm({...imports.caesar});setImportMessage('Imported as an editable draft. Review every field before saving.');setMode('form')}
  else if(normalized.includes('howtobbqright.com/2013/12/13/grilling-a-whole-beef-tenderloin')){setForm({...imports.tenderloin});setImportMessage('Imported as an editable draft. The source does not state a clear yield, so Serves is required.');setMode('form')}
  else{setForm({...blankForm,sourceUrl:url.trim()});setImportMessage('This test build supports the Caesar and whole tenderloin URLs. Enter the remaining recipe details manually.');setMode('form')}
 }
 const canSave=useMemo(()=>form.title.trim()&&Number(form.servings)>0&&form.ingredients.some(row=>row.name.trim()),[form])
 const save=()=>{
  if(!canSave)return
  const recipeId=editing?id:`custom-${Date.now()}`
  saveCustomRecipe({...form,id:recipeId,title:form.title.trim(),description:form.description.trim(),sourceName:form.sourceName.trim(),sourceUrl:form.sourceUrl.trim(),servings:Number(form.servings),prepTime:form.prepTime.trim()||'Not set',cookTime:form.cookTime.trim()||'Not set',tradition:form.tradition.trim(),method:form.equipment.includes('Smoker')?'smoker':form.equipment.includes('Grill')?'grill':'custom',glutenFree:false,tags:['custom',form.category.toLowerCase(),...form.equipment.map(x=>x.toLowerCase())],ingredients:form.ingredients.filter(row=>row.name.trim()).map(row=>{
    const match=row.groceryItemId?groceryLibrary.find(item=>item.id===row.groceryItemId):matchGroceryItem(row.name,groceryLibrary)
    return {...row,name:row.name.trim(),quantity:Number(row.quantity)||0,unit:normalizeUnit(row.unit||'each'),groceryItemId:match?.id||row.groceryItemId||''}
  }),instructions:form.instructions.filter(step=>step.trim()).map(step=>step.trim()),updatedAt:new Date().toISOString(),createdAt:editing?(getCatalogueRecipe(id)?.createdAt||new Date().toISOString()):new Date().toISOString()})
  navigate(`/recipes/${recipeId}`)
 }
 if(mode==='choose')return <div className="space-y-5"><div><h1 className="page-title">Add Recipe</h1><p className="text-stone">Create one yourself or use a website for the initial prefill.</p></div><div className="grid sm:grid-cols-2 gap-4"><button onClick={()=>setMode('form')} className="card card-hover text-left"><Plus className="text-forest"/><h2 className="text-xl font-extrabold text-navy mt-3">Create manually</h2><p className="text-sm text-stone mt-1">No source URL required.</p></button><button onClick={()=>setMode('url')} className="card card-hover text-left"><Globe2 className="text-forest"/><h2 className="text-xl font-extrabold text-navy mt-3">Import from URL</h2><p className="text-sm text-stone mt-1">Prefill, review and edit before saving.</p></button></div></div>
 if(mode==='url')return <div className="space-y-5"><div className="flex items-center justify-between"><div><h1 className="page-title">Import Recipe</h1><p className="text-stone">The URL is kept only as a source reference after import.</p></div><button onClick={()=>setMode('choose')} className="p-2 bg-white rounded-xl"><X/></button></div><section className="card"><label className="section-title">Recipe URL</label><input value={url} onChange={e=>setUrl(e.target.value)} className="w-full mt-2 p-3 rounded-xl border bg-white" placeholder="https://..."/><button onClick={importRecipe} disabled={!url.trim()} className="btn-primary mt-4 disabled:opacity-40">Import and edit</button><div className="mt-4 text-sm text-stone"><b>Test URLs:</b><p className="break-all">Allrecipes Classic Caesar Salad</p><p className="break-all">HowToBBQRight Grilled Whole Beef Tenderloin</p></div></section></div>
 return <div className="space-y-5"><div className="flex items-center justify-between gap-3"><div><h1 className="page-title">{editing?'Edit Recipe':'Recipe Builder'}</h1><p className="text-stone">Everything below is editable. Serves drives future grocery scaling.</p></div><button onClick={()=>navigate(editing?`/recipes/${id}`:'/recipes')} className="p-2 bg-white rounded-xl"><X/></button></div>{importMessage&&<div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm">{importMessage}</div>}
 <section className="card space-y-4"><div className="grid sm:grid-cols-2 gap-3"><label className="sm:col-span-2"><span className="section-title">Recipe name</span><input value={form.title} onChange={e=>update('title',e.target.value)} className="w-full mt-2 p-3 rounded-xl border"/></label><label><span className="section-title">Serves</span><input type="number" min="1" value={form.servings} onChange={e=>update('servings',e.target.value)} className="w-full mt-2 p-3 rounded-xl border" placeholder="Required"/></label><label><span className="section-title">Category</span><select value={form.category} onChange={e=>update('category',e.target.value)} className="w-full mt-2 p-3 rounded-xl border"><option>Main</option><option>Side</option><option>Salad</option><option>Appetizer</option><option>Dessert</option><option>Sauce</option><option>Drink</option><option>Bread</option></select></label><label><span className="section-title">Prep time</span><input value={form.prepTime} onChange={e=>update('prepTime',e.target.value)} className="w-full mt-2 p-3 rounded-xl border"/></label><label><span className="section-title">Cook time</span><input value={form.cookTime} onChange={e=>update('cookTime',e.target.value)} className="w-full mt-2 p-3 rounded-xl border"/></label><label className="sm:col-span-2"><span className="section-title">Description</span><textarea value={form.description} onChange={e=>update('description',e.target.value)} className="w-full mt-2 p-3 rounded-xl border min-h-24"/></label></div>
 <div><p className="section-title">Equipment / method</p><div className="flex flex-wrap gap-2 mt-2">{equipmentOptions.map(name=><button type="button" key={name} onClick={()=>toggleEquipment(name)} className={`px-3 py-2 rounded-full text-sm font-semibold ${form.equipment.includes(name)?'bg-forest text-white':'bg-cream text-navy'}`}>{name}</button>)}</div><p className="text-xs text-stone mt-2">Recipes tagged Smoker will appear in Smoker HQ once scheduled.</p></div>
 {(form.sourceUrl||form.sourceName)&&<div className="grid sm:grid-cols-2 gap-3 border-t pt-4"><label><span className="section-title">Source name</span><input value={form.sourceName} onChange={e=>update('sourceName',e.target.value)} className="w-full mt-2 p-3 rounded-xl border"/></label><label><span className="section-title">Original URL</span><input value={form.sourceUrl} onChange={e=>update('sourceUrl',e.target.value)} className="w-full mt-2 p-3 rounded-xl border"/></label><p className="sm:col-span-2 text-xs text-stone">The source documents where the recipe came from. Your saved Main River version remains fully editable.</p></div>}</section>
 <datalist id="grocery-library-items">{groceryLibrary.map(item=><option key={item.id} value={item.name}/>)}</datalist>
 <section className="card"><div className="flex justify-between items-center"><div><h2 className="text-xl font-extrabold text-navy">Ingredients</h2><p className="text-sm text-stone">Edit names, quantities, units and grocery inclusion.</p></div><button onClick={addIngredient} className="btn-primary flex gap-2 items-center"><Plus size={17}/>Add</button></div><div className="space-y-3 mt-4">{form.ingredients.map((row,index)=><div key={index} className="grid sm:grid-cols-[minmax(0,1fr)_100px_120px_auto_auto] gap-2 items-center bg-cream rounded-2xl p-3"><div><input list="grocery-library-items" value={row.name} onChange={e=>updateIngredient(index,'name',e.target.value)} className="w-full p-2 rounded-xl border bg-white" placeholder="Ingredient"/>{row.groceryItemId&&<p className="text-[11px] text-forest mt-1">Linked to Grocery Library</p>}</div><input type="number" min="0" step="0.25" value={row.quantity} onChange={e=>updateIngredient(index,'quantity',e.target.value)} className="p-2 rounded-xl border bg-white"/><input value={row.unit} onChange={e=>updateIngredient(index,'unit',e.target.value)} className="p-2 rounded-xl border bg-white"/><label className="text-sm flex gap-2 items-center"><input type="checkbox" checked={row.shopping} onChange={e=>updateIngredient(index,'shopping',e.target.checked)}/> Grocery</label><button onClick={()=>removeIngredient(index)} disabled={form.ingredients.length===1} className="p-2 text-stone disabled:opacity-20"><Trash2 size={17}/></button></div>)}</div></section>
 <section className="card"><div className="flex justify-between items-center"><div><h2 className="text-xl font-extrabold text-navy">Instructions</h2><p className="text-sm text-stone">Imported steps are editable, removable and reorderable by rewriting them.</p></div><button onClick={addInstruction} className="text-forest font-semibold">+ Add step</button></div><div className="space-y-2 mt-4">{form.instructions.map((step,index)=><div key={index} className="flex gap-2 items-start"><span className="w-8 h-8 rounded-full bg-forest text-white grid place-items-center shrink-0">{index+1}</span><textarea value={step} onChange={e=>updateInstruction(index,e.target.value)} className="w-full p-3 rounded-xl border min-h-20"/><button onClick={()=>removeInstruction(index)} className="p-2 text-stone"><Trash2 size={17}/></button></div>)}</div></section>
 <section className="card"><label className="section-title">Tradition or family note</label><textarea value={form.tradition} onChange={e=>update('tradition',e.target.value)} className="w-full mt-2 p-3 rounded-xl border min-h-24" placeholder="Why this recipe matters at Main River..."/></section><button onClick={save} disabled={!canSave} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"><Save size={18}/>{editing?'Save Changes':'Save Recipe'}</button></div>
}
