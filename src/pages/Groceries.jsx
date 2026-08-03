import { useMemo, useState } from 'react'
import { Check, Database, Home, ListChecks, Plus, RotateCcw, Save, Trash2, X } from 'lucide-react'
import baseData from '../data/baseGroceries.json'
import { getEventGeneratedGroceries } from '../utils/eventGroceryEngine'
import { useEvent } from '../context/EventContext'
import { deleteGroceryItem, getGroceryLibrary, packageSuggestion, saveGroceryItem } from '../utils/groceryLibrary'

const stateKey='main-river-trip-grocery-state-v21'
const manualKey='main-river-manual-groceries-v21'
const baseEditsKey='cottage-base-groceries-edits'
const customBaseKey='cottage-custom-base-groceries'

const categories=['Meat','Seafood','Produce','Dairy','Deli','Bakery','Pantry','Frozen','Drinks','Snacks','Household','Other']
const emptyForm={name:'',quantity:1,unit:'each',category:'Produce',notes:'',gf:false,assignedTo:''}
const emptyLibraryForm={id:'',name:'',aliasesText:'',category:'Pantry',subcategory:'Other',defaultPurchaseUnit:'package',packageSize:1,packageUnit:'each',allowedUnitsText:'each'}

const normalizeCategory=value=>{
 const text=(value||'Other').toLowerCase()
 if(text.includes('meat')) return 'Meat'
 if(text.includes('seafood')) return 'Seafood'
 if(text.includes('produce')) return 'Produce'
 if(text.includes('dairy')) return 'Dairy'
 if(text.includes('deli')) return 'Deli'
 if(text.includes('bakery')||text.includes('breakfast')) return 'Bakery'
 if(text.includes('pantry')||text.includes('condiment')||text.includes('spice')) return 'Pantry'
 if(text.includes('frozen')) return 'Frozen'
 if(text.includes('drink')||text.includes('beverage')||text.includes('liquor')) return 'Drinks'
 if(text.includes('snack')) return 'Snacks'
 if(text.includes('house')||text.includes('clean')||text.includes('paper')) return 'Household'
 return 'Other'
}

export default function Groceries(){
 const {activeEvent,profiles}=useEvent()
 const [mode,setMode]=useState('trip')
 const [view,setView]=useState('all')
 const [personFilter,setPersonFilter]=useState('')
 const [categoryFilter,setCategoryFilter]=useState('All')
 const [showAdd,setShowAdd]=useState(false)
 const [addTarget,setAddTarget]=useState('trip')
 const [form,setForm]=useState(emptyForm)
 const [library,setLibrary]=useState(()=>getGroceryLibrary())
 const [libraryForm,setLibraryForm]=useState(emptyLibraryForm)
 const [showLibraryForm,setShowLibraryForm]=useState(false)
 const [librarySearch,setLibrarySearch]=useState('')
 const [baseEdits,setBaseEdits]=useState(()=>JSON.parse(localStorage.getItem(baseEditsKey)||'{}'))
 const [customBase,setCustomBase]=useState(()=>JSON.parse(localStorage.getItem(customBaseKey)||'[]'))
 const [manualItems,setManualItems]=useState(()=>JSON.parse(localStorage.getItem(manualKey)||'[]'))
 const [itemState,setItemState]=useState(()=>JSON.parse(localStorage.getItem(stateKey)||'{}'))

 const guests=(activeEvent?.attendance||[]).map(row=>profiles.find(profile=>profile.id===row.profileId)).filter(Boolean).map(profile=>({id:profile.id,name:profile.name}))
 const saveState=next=>{setItemState(next);localStorage.setItem(stateKey,JSON.stringify(next))}
 const patchState=(id,patch)=>saveState({...itemState,[id]:{...(itemState[id]||{}),...patch}})
 const saveManual=next=>{setManualItems(next);localStorage.setItem(manualKey,JSON.stringify(next))}
 const saveCustomBase=next=>{setCustomBase(next);localStorage.setItem(customBaseKey,JSON.stringify(next))}
 const updateBase=(id,field,value)=>{
  const next={...baseEdits,[id]:{...(baseEdits[id]||{}),[field]:value}}
  setBaseEdits(next);localStorage.setItem(baseEditsKey,JSON.stringify(next))
 }

 const generated=getEventGeneratedGroceries(activeEvent).map(item=>({...item,category:normalizeCategory(item.department),sourceType:'recipe',sourceLabel:'Recipe generated',purchaseSuggestion:packageSuggestion(item)}))
 const builtInBase=useMemo(()=>baseData.categories.flatMap(category=>category.items.map(item=>{
  const edit=baseEdits[item.id]||{}
  return {...item,id:`base-${item.id}`,originalId:item.id,quantity:edit.quantity??item.quantity,unit:edit.unit??item.unit,notes:edit.notes??item.notes,category:normalizeCategory(category.name),baseSection:category.name,sourceType:'base',sourceLabel:'Base Cottage List',custom:false}
 })),[baseEdits])
 const customBaseItems=customBase.map(item=>({...item,id:`base-custom-${item.id}`,originalId:item.id,baseSection:item.category,sourceType:'base',sourceLabel:'Base Cottage List',custom:true}))
 const allBaseItems=[...builtInBase,...customBaseItems]
 const activeBaseItems=allBaseItems.filter(item=>Number(item.quantity)>0)
 const manual=manualItems.map(item=>({...item,category:normalizeCategory(item.category),sourceType:'manual',sourceLabel:'Added grocery item'}))
 const allItems=[...generated,...activeBaseItems,...manual].map(item=>({...item,...(itemState[item.id]||{})}))
 const purchasedCount=allItems.filter(item=>item.purchased).length
 const remainingCount=allItems.length-purchasedCount

 const visible=allItems.filter(item=>{
  if(view==='outstanding'&&item.purchased) return false
  if(view==='purchased'&&!item.purchased) return false
  if(view==='unassigned'&&item.assignedTo) return false
  if(view==='person'&&item.assignedTo!==personFilter) return false
  if(categoryFilter!=='All'&&item.category!==categoryFilter) return false
  return true
 })
 const grouped=visible.reduce((acc,item)=>{(acc[item.category]??=[]).push(item);return acc},{})

 const openAdd=target=>{setAddTarget(target);setForm({...emptyForm,category:target==='base'?'Pantry':'Produce'});setShowAdd(true)}
 const addItem=()=>{
  if(!form.name.trim()) return
  if(addTarget==='base'){
    const item={id:`custom-${Date.now()}`,name:form.name.trim(),quantity:Number(form.quantity)||0,unit:form.unit.trim()||'each',category:form.category,notes:form.notes.trim(),gf:form.gf}
    saveCustomBase([...customBase,item])
  }else{
    const item={id:`manual-${Date.now()}`,name:form.name.trim(),quantity:Number(form.quantity)||1,unit:form.unit.trim()||'each',category:form.category,notes:form.notes.trim(),gf:form.gf,assignedTo:form.assignedTo}
    saveManual([...manualItems,item])
  }
  setForm(emptyForm);setShowAdd(false)
 }
 const resetPurchased=()=>{
  const next={}
  for(const [id,value] of Object.entries(itemState)) next[id]={...value,purchased:false}
  saveState(next)
 }
 const updateCustomBase=(id,field,value)=>saveCustomBase(customBase.map(item=>item.id===id?{...item,[field]:value}:item))

 const editLibraryItem=item=>{
  setLibraryForm({...item,aliasesText:(item.aliases||[]).join('\n'),allowedUnitsText:(item.allowedUnits||[]).join(', ')})
  setShowLibraryForm(true)
 }
 const saveLibraryRecord=()=>{
  if(!libraryForm.name.trim())return
  const saved=saveGroceryItem({
    ...libraryForm,
    name:libraryForm.name.trim(),
    aliases:libraryForm.aliasesText.split('\n').map(value=>value.trim()).filter(Boolean),
    packageSize:Number(libraryForm.packageSize)||0,
    allowedUnits:libraryForm.allowedUnitsText.split(',').map(value=>value.trim()).filter(Boolean)
  })
  setLibrary(getGroceryLibrary())
  setLibraryForm(emptyLibraryForm)
  setShowLibraryForm(false)
 }
 const removeLibraryRecord=id=>{
  if(!confirm('Delete this Grocery Library item? Existing recipes keep their typed ingredient names but lose the standard link.'))return
  setLibrary(deleteGroceryItem(id))
 }
 const filteredLibrary=library.filter(item=>{
  const q=librarySearch.trim().toLowerCase()
  return !q||[item.name,item.category,item.subcategory,...(item.aliases||[])].join(' ').toLowerCase().includes(q)
 })

 const baseSections=useMemo(()=>{
  const names=[...baseData.categories.map(category=>category.name)]
  for(const item of customBase) if(!names.includes(item.category)) names.push(item.category)
  return names
 },[customBase])

 return <div className="space-y-4">
  <div className="flex flex-wrap justify-between gap-3">
   <div><h1 className="page-title">{mode==='trip'?'Trip Grocery List':mode==='base'?'Base Cottage List':'Grocery Library'}</h1><p className="text-stone">{mode==='trip'?`${purchasedCount} purchased · ${remainingCount} remaining · ${allItems.length} total`:mode==='base'?'Edit quantities directly. Zero-quantity items stay in the template but do not appear on the Trip Grocery List.':'Standard items, aliases, categories, compatible units and common package sizes.'}</p></div>
   <div className="flex gap-2">
    {mode!=='library'&&<button onClick={()=>openAdd(mode==='trip'?'trip':'base')} className="btn-primary flex items-center gap-2"><Plus size={18}/>{mode==='trip'?'Add Grocery Item':'Add Base List Item'}</button>}
    {mode==='library'&&<button onClick={()=>{setLibraryForm(emptyLibraryForm);setShowLibraryForm(true)}} className="btn-primary flex items-center gap-2"><Plus size={18}/>New Grocery Item</button>}
    {mode==='trip'&&<button onClick={resetPurchased} className="p-2 bg-white rounded-xl" title="Clear purchased checks"><RotateCcw/></button>}
   </div>
  </div>

  <div className="grid grid-cols-3 gap-2 bg-white rounded-2xl p-1 shadow-sm">
   <button onClick={()=>setMode('trip')} className={`rounded-xl px-3 py-3 font-semibold flex justify-center items-center gap-2 ${mode==='trip'?'bg-forest text-white':'text-stone'}`}><ListChecks size={18}/><span className="hidden sm:inline">Trip Grocery List</span><span className="sm:hidden">Trip</span></button>
   <button onClick={()=>setMode('base')} className={`rounded-xl px-3 py-3 font-semibold flex justify-center items-center gap-2 ${mode==='base'?'bg-forest text-white':'text-stone'}`}><Home size={18}/><span className="hidden sm:inline">Edit Base List</span><span className="sm:hidden">Base</span></button>
   <button onClick={()=>setMode('library')} className={`rounded-xl px-3 py-3 font-semibold flex justify-center items-center gap-2 ${mode==='library'?'bg-forest text-white':'text-stone'}`}><Database size={18}/><span className="hidden sm:inline">Grocery Library</span><span className="sm:hidden">Library</span></button>
  </div>

  {mode==='trip'?<>
   <div className="h-3 bg-white rounded-full overflow-hidden"><div className="h-full bg-forest" style={{width:`${allItems.length?purchasedCount/allItems.length*100:0}%`}}/></div>
   <div className="bg-forest/5 border border-forest/15 rounded-2xl p-4 text-sm"><b>One shared running list</b><p className="text-stone mt-1">Only recipes assigned to date-specific Meal Slots generate groceries. Base List items appear only when their quantity is greater than zero.</p></div>

   <div className="flex gap-2 overflow-x-auto">{[['all','All'],['outstanding','Outstanding'],['purchased','Purchased'],['unassigned','Unassigned'],['person','By Person']].map(([id,label])=><button key={id} onClick={()=>setView(id)} className={`px-4 py-2 rounded-full whitespace-nowrap font-semibold ${view===id?'bg-forest text-white':'bg-white'}`}>{label}</button>)}</div>
   {view==='person'&&<select value={personFilter} onChange={e=>setPersonFilter(e.target.value)} className="w-full sm:w-72 bg-white border rounded-xl p-3"><option value="">Choose a guest</option>{guests.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select>}
   <div className="flex gap-2 overflow-x-auto">{['All',...categories].map(category=><button key={category} onClick={()=>setCategoryFilter(category)} className={`px-3 py-2 rounded-full whitespace-nowrap text-sm font-semibold ${categoryFilter===category?'bg-navy text-white':'bg-white text-stone'}`}>{category}</button>)}</div>

   {Object.entries(grouped).map(([category,items])=><section key={category} className="card">
    <h2 className="section-title mb-2">{category}</h2>
    {items.map(item=>{
     const guest=guests.find(g=>g.id===item.assignedTo)
     return <div key={item.id} className={`py-4 border-b last:border-0 ${item.purchased?'opacity-60':''}`}>
      <div className="flex gap-3 items-start">
       <button onClick={()=>patchState(item.id,{purchased:!item.purchased})} className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-1 ${item.purchased?'bg-forest border-forest text-white':'border-stone/30'}`}>{item.purchased&&<Check size={17}/>}</button>
       <div className="flex-1 min-w-0">
        <div className="flex flex-wrap gap-2 items-center"><b className={`text-lg ${item.purchased?'line-through':''}`}>{item.name}</b><span>{item.quantity} {item.unit}</span><span className={`badge ${item.sourceType==='recipe'?'bg-forest/10 text-forest':item.sourceType==='base'?'bg-navy/10 text-navy':'bg-wood-100 text-wood-600'}`}>{item.sourceLabel}</span>{item.gf&&<span className="badge-gf">GF</span>}</div>
        <p className="text-xs text-stone mt-1">{item.sourceType==='recipe'&&item.sources?.length?item.sources.map(source=>`${source.recipe} → ${source.meal} (${source.attendance} guests, ${source.scale}×)`).join(' • '):item.sourceType==='recipe'&&item.usedIn?item.usedIn.join(' • '):item.notes||'No notes'}</p>{item.purchaseSuggestion&&<p className="text-xs font-semibold text-forest mt-1">{item.purchaseSuggestion.label}</p>}{item.aliasesMerged?.length>0&&<p className="text-[11px] text-stone mt-1">Merged aliases: {item.aliasesMerged.join(' • ')}</p>}
        <div className="grid sm:grid-cols-[240px_1fr] gap-2 mt-3">
         <label className="text-xs text-stone">Who’s getting this?<select value={item.assignedTo||''} onChange={e=>patchState(item.id,{assignedTo:e.target.value})} className="block w-full mt-1 bg-white border rounded-xl p-2 text-sm text-forest"><option value="">Unassigned</option>{guests.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
         <label className="text-xs text-stone">Shopping note<input value={item.shoppingNote||''} onChange={e=>patchState(item.id,{shoppingNote:e.target.value})} placeholder="Brand, ripeness, size..." className="block w-full mt-1 bg-white border rounded-xl p-2 text-sm"/></label>
        </div>
        {guest&&<p className="text-xs font-semibold text-navy mt-2">Assigned to {guest.name}</p>}
       </div>
       {item.sourceType==='manual'&&<button onClick={()=>saveManual(manualItems.filter(x=>x.id!==item.id))} className="text-stone hover:text-red-600 p-1" title="Delete added item"><Trash2 size={18}/></button>}
      </div>
     </div>
    })}
   </section>)}
   {!visible.length&&<div className="card text-center py-10"><p className="font-semibold text-navy">{view==='person'&&!personFilter?'Choose a guest to view their list.':'No grocery items match this view.'}</p></div>}
  </>:mode==='base'?<>
   <div className="bg-forest/5 border border-forest/15 rounded-2xl p-4 text-sm"><b>Base Cottage List template</b><p className="text-stone mt-1">Edit every row directly. Set quantity to zero to keep an item for later without adding it to this trip.</p></div>
   {baseSections.map(section=><section key={section} className="card">
    <h2 className="section-title mb-2">{section}</h2>
    {allBaseItems.filter(item=>item.baseSection===section||item.category===section).map(item=>{
     const isCustom=item.custom
     const id=item.originalId
     return <div key={item.id} className="py-4 border-b last:border-0">
      <div className="flex flex-wrap gap-2 items-center"><b className="text-lg">{item.name}</b><span className="badge bg-navy/10 text-navy">Base list</span>{item.gf&&<span className="badge-gf">GF</span>}{Number(item.quantity)<=0&&<span className="badge bg-stone/10 text-stone">Not on trip list</span>}</div>
      <div className="grid sm:grid-cols-[110px_150px_1fr_auto] gap-2 mt-3 items-center">
       <input aria-label={`${item.name} quantity`} type="number" min="0" step="0.5" value={item.quantity} onChange={e=>isCustom?updateCustomBase(id,'quantity',e.target.value):updateBase(id,'quantity',e.target.value)} className="bg-white border rounded-xl p-2"/>
       <input aria-label={`${item.name} unit`} value={item.unit} onChange={e=>isCustom?updateCustomBase(id,'unit',e.target.value):updateBase(id,'unit',e.target.value)} className="bg-white border rounded-xl p-2"/>
       <input aria-label={`${item.name} notes`} value={item.notes||''} onChange={e=>isCustom?updateCustomBase(id,'notes',e.target.value):updateBase(id,'notes',e.target.value)} className="bg-white border rounded-xl p-2" placeholder="Notes"/>
       {isCustom&&<button onClick={()=>saveCustomBase(customBase.filter(x=>x.id!==id))} className="text-red-700 p-2" title="Delete base item"><Trash2 size={18}/></button>}
      </div>
     </div>
    })}
   </section>)}

  </>:<>
   <div className="card">
    <input value={librarySearch} onChange={e=>setLibrarySearch(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Search standard items or aliases..."/>
   </div>
   <div className="grid md:grid-cols-2 gap-3">
    {filteredLibrary.map(item=><section key={item.id} className="card">
      <div className="flex justify-between gap-3 items-start">
       <div><h2 className="text-lg font-extrabold text-navy">{item.name}</h2><p className="text-sm text-stone">{item.category} → {item.subcategory}</p></div>
       <div className="flex gap-1"><button onClick={()=>editLibraryItem(item)} className="p-2 bg-cream rounded-xl"><Save size={16}/></button><button onClick={()=>removeLibraryRecord(item.id)} className="p-2 text-red-700"><Trash2 size={16}/></button></div>
      </div>
      <div className="mt-3"><span className="section-title">Aliases</span><div className="flex flex-wrap gap-1 mt-1">{(item.aliases||[]).map(alias=><span key={alias} className="badge bg-navy/10 text-navy">{alias}</span>)}{!item.aliases?.length&&<span className="text-xs text-stone">No aliases</span>}</div></div>
      <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
       <div className="bg-cream rounded-xl p-3"><b>Package</b><p>{item.packageSize||'—'} {item.packageUnit||''} {item.defaultPurchaseUnit||''}</p></div>
       <div className="bg-cream rounded-xl p-3"><b>Recipe units</b><p>{(item.allowedUnits||[]).join(', ')||'Not set'}</p></div>
      </div>
    </section>)}
   </div>
   {!filteredLibrary.length&&<div className="card text-center text-stone">No Grocery Library items match your search.</div>}
  </>}


  {showAdd&&<div className="fixed inset-0 z-[80] bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={()=>setShowAdd(false)}><div className="bg-cream rounded-3xl w-full max-w-xl p-5 max-h-[90vh] overflow-auto" onClick={e=>e.stopPropagation()}>
   <div className="flex justify-between items-center"><div><h2 className="text-xl font-extrabold text-navy">{addTarget==='base'?'Add Base List Item':'Add Grocery Item'}</h2><p className="text-sm text-stone">{addTarget==='base'?'Add a reusable staple to the Base Cottage List.':'Add anything the current trip needs beyond recipes and the Base Cottage List.'}</p></div><button onClick={()=>setShowAdd(false)} className="p-2"><X/></button></div>
   <div className="grid sm:grid-cols-2 gap-3 mt-5">
    <label className="sm:col-span-2"><span className="section-title">Item name</span><input autoFocus value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full mt-2 p-3 rounded-xl bg-white border" placeholder="Milk"/></label>
    <label><span className="section-title">Quantity</span><input type="number" min="0" step="0.5" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} className="w-full mt-2 p-3 rounded-xl bg-white border"/></label>
    <label><span className="section-title">Unit</span><input value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} className="w-full mt-2 p-3 rounded-xl bg-white border"/></label>
    <label><span className="section-title">Category</span><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full mt-2 p-3 rounded-xl bg-white border">{categories.map(x=><option key={x}>{x}</option>)}</select></label>
    {addTarget==='trip'&&<label><span className="section-title">Assign to</span><select value={form.assignedTo} onChange={e=>setForm({...form,assignedTo:e.target.value})} className="w-full mt-2 p-3 rounded-xl bg-white border"><option value="">Unassigned</option>{guests.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label>}
    <label className={addTarget==='base'?'sm:col-span-2':''}><span className="section-title">Notes</span><input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} className="w-full mt-2 p-3 rounded-xl bg-white border" placeholder="Brand, type, preference..."/></label>
    <label className="bg-white rounded-2xl p-4 flex gap-3 items-center sm:col-span-2"><input type="checkbox" checked={form.gf} onChange={e=>setForm({...form,gf:e.target.checked})} className="w-5 h-5"/><span><b>Gluten-free</b><p className="text-xs text-stone">Show a GF marker.</p></span></label>
   </div>
   <button onClick={addItem} disabled={!form.name.trim()} className="btn-primary w-full mt-5 disabled:opacity-40">{addTarget==='base'?'Add to Base List':'Add to Trip Grocery List'}</button>
  </div></div>}
  {showLibraryForm&&<div className="fixed inset-0 z-[90] bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={()=>setShowLibraryForm(false)}><div className="bg-cream rounded-3xl w-full max-w-2xl p-5 max-h-[92vh] overflow-auto" onClick={e=>e.stopPropagation()}>
   <div className="flex justify-between"><div><h2 className="text-xl font-extrabold text-navy">{libraryForm.id?'Edit Grocery Item':'New Grocery Item'}</h2><p className="text-sm text-stone">One standard record can be reused by recipes, Base Lists and manual groceries.</p></div><button onClick={()=>setShowLibraryForm(false)}><X/></button></div>
   <div className="grid sm:grid-cols-2 gap-3 mt-5">
    <label className="sm:col-span-2"><span className="section-title">Standard name</span><input value={libraryForm.name} onChange={e=>setLibraryForm({...libraryForm,name:e.target.value})} className="w-full mt-1 p-3 border rounded-xl bg-white"/></label>
    <label><span className="section-title">Category</span><input value={libraryForm.category} onChange={e=>setLibraryForm({...libraryForm,category:e.target.value})} className="w-full mt-1 p-3 border rounded-xl bg-white"/></label>
    <label><span className="section-title">Subcategory</span><input value={libraryForm.subcategory} onChange={e=>setLibraryForm({...libraryForm,subcategory:e.target.value})} className="w-full mt-1 p-3 border rounded-xl bg-white"/></label>
    <label className="sm:col-span-2"><span className="section-title">Aliases — one per line</span><textarea value={libraryForm.aliasesText} onChange={e=>setLibraryForm({...libraryForm,aliasesText:e.target.value})} className="w-full mt-1 p-3 border rounded-xl bg-white min-h-28" placeholder={"ACV\napple cider vinegar + juice for spritz"}/></label>
    <label><span className="section-title">Purchase unit</span><input value={libraryForm.defaultPurchaseUnit} onChange={e=>setLibraryForm({...libraryForm,defaultPurchaseUnit:e.target.value})} className="w-full mt-1 p-3 border rounded-xl bg-white"/></label>
    <label><span className="section-title">Package size</span><div className="grid grid-cols-2 gap-2 mt-1"><input type="number" min="0" step="0.01" value={libraryForm.packageSize} onChange={e=>setLibraryForm({...libraryForm,packageSize:e.target.value})} className="p-3 border rounded-xl bg-white"/><input value={libraryForm.packageUnit} onChange={e=>setLibraryForm({...libraryForm,packageUnit:e.target.value})} className="p-3 border rounded-xl bg-white"/></div></label>
    <label className="sm:col-span-2"><span className="section-title">Allowed recipe units — comma separated</span><input value={libraryForm.allowedUnitsText} onChange={e=>setLibraryForm({...libraryForm,allowedUnitsText:e.target.value})} className="w-full mt-1 p-3 border rounded-xl bg-white" placeholder="tsp, tbsp, cup, ml, l, bottle"/></label>
   </div>
   <button onClick={saveLibraryRecord} disabled={!libraryForm.name.trim()} className="btn-primary w-full mt-5 disabled:opacity-40">Save Grocery Item</button>
  </div></div>}

 </div>
}
