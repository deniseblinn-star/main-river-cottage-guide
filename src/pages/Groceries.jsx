import { useMemo, useState } from 'react'
import { Check, Home, ListChecks, Pencil, Plus, RotateCcw, Save, Trash2, X } from 'lucide-react'
import plannedData from '../data/groceries.json'
import baseData from '../data/baseGroceries.json'
import guestData from '../data/guests.json'
import { getGeneratedGroceries } from '../utils/recipeEngine'

const stateKey='main-river-trip-grocery-state-v21'
const manualKey='main-river-manual-groceries-v21'
const baseEditsKey='cottage-base-groceries-edits'

const categories=['Meat','Seafood','Produce','Dairy','Deli','Bakery','Pantry','Frozen','Drinks','Snacks','Household','Other']
const emptyForm={name:'',quantity:1,unit:'each',category:'Produce',notes:'',gf:false,assignedTo:''}

const normalizeCategory=value=>{
 const text=(value||'Other').toLowerCase()
 if(text.includes('meat')) return 'Meat'
 if(text.includes('seafood')) return 'Seafood'
 if(text.includes('produce')) return 'Produce'
 if(text.includes('dairy')) return 'Dairy'
 if(text.includes('deli')) return 'Deli'
 if(text.includes('bakery')) return 'Bakery'
 if(text.includes('pantry')||text.includes('condiment')||text.includes('spice')) return 'Pantry'
 if(text.includes('frozen')) return 'Frozen'
 if(text.includes('drink')||text.includes('beverage')||text.includes('liquor')) return 'Drinks'
 if(text.includes('snack')) return 'Snacks'
 if(text.includes('house')||text.includes('clean')||text.includes('paper')) return 'Household'
 return 'Other'
}

export default function Groceries(){
 const [mode,setMode]=useState('trip')
 const [view,setView]=useState('all')
 const [personFilter,setPersonFilter]=useState('')
 const [categoryFilter,setCategoryFilter]=useState('All')
 const [showAdd,setShowAdd]=useState(false)
 const [form,setForm]=useState(emptyForm)
 const [editing,setEditing]=useState(null)
 const [baseEdits,setBaseEdits]=useState(()=>JSON.parse(localStorage.getItem(baseEditsKey)||'{}'))
 const [manualItems,setManualItems]=useState(()=>JSON.parse(localStorage.getItem(manualKey)||'[]'))
 const [itemState,setItemState]=useState(()=>JSON.parse(localStorage.getItem(stateKey)||'{}'))

 const guests=guestData.guests.map(g=>({id:g.id,name:g.name}))
 const saveState=next=>{setItemState(next);localStorage.setItem(stateKey,JSON.stringify(next))}
 const patchState=(id,patch)=>saveState({...itemState,[id]:{...(itemState[id]||{}),...patch}})
 const saveManual=next=>{setManualItems(next);localStorage.setItem(manualKey,JSON.stringify(next))}
 const updateBase=(id,field,value)=>{
  const next={...baseEdits,[id]:{...(baseEdits[id]||{}),[field]:value}}
  setBaseEdits(next);localStorage.setItem(baseEditsKey,JSON.stringify(next))
 }

 const generated=getGeneratedGroceries().map(item=>({...item,category:normalizeCategory(item.department),sourceType:'recipe',sourceLabel:'Recipe generated'}))
 const planned=[]
 const baseItems=useMemo(()=>baseData.categories.flatMap(category=>category.items.map(item=>{
  const edit=baseEdits[item.id]||{}
  return {...item,id:`base-${item.id}`,originalId:item.id,quantity:edit.quantity??item.quantity,unit:edit.unit??item.unit,notes:edit.notes??item.notes,category:normalizeCategory(category.name),sourceType:'base',sourceLabel:'Base Cottage List'}
 })),[baseEdits])
 const manual=manualItems.map(item=>({...item,category:normalizeCategory(item.category),sourceType:'manual',sourceLabel:'Added grocery item'}))
 const allItems=[...generated,...planned,...baseItems,...manual].map(item=>({...item,...(itemState[item.id]||{})}))
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

 const addItem=()=>{
  if(!form.name.trim()) return
  const item={id:`manual-${Date.now()}`,name:form.name.trim(),quantity:Number(form.quantity)||1,unit:form.unit.trim()||'each',category:form.category,notes:form.notes.trim(),gf:form.gf,assignedTo:form.assignedTo}
  saveManual([...manualItems,item]);setForm(emptyForm);setShowAdd(false)
 }
 const resetPurchased=()=>{
  const next={}
  for(const [id,value] of Object.entries(itemState)) next[id]={...value,purchased:false}
  saveState(next)
 }

 return <div className="space-y-4">
  <div className="flex flex-wrap justify-between gap-3">
   <div><h1 className="page-title">{mode==='trip'?'Trip Grocery List':'Base Cottage List'}</h1><p className="text-stone">{mode==='trip'?`${purchasedCount} purchased · ${remainingCount} remaining · ${allItems.length} total`:'Edit the reusable list that appears in every trip.'}</p></div>
   <div className="flex gap-2">{mode==='trip'&&<button onClick={()=>setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus size={18}/>Add Grocery Item</button>}{mode==='trip'&&<button onClick={resetPurchased} className="p-2 bg-white rounded-xl" title="Clear purchased checks"><RotateCcw/></button>}</div>
  </div>

  <div className="grid grid-cols-2 gap-2 bg-white rounded-2xl p-1 shadow-sm">
   <button onClick={()=>setMode('trip')} className={`rounded-xl px-4 py-3 font-semibold flex justify-center items-center gap-2 ${mode==='trip'?'bg-forest text-white':'text-stone'}`}><ListChecks size={18}/>Trip Grocery List</button>
   <button onClick={()=>setMode('base')} className={`rounded-xl px-4 py-3 font-semibold flex justify-center items-center gap-2 ${mode==='base'?'bg-forest text-white':'text-stone'}`}><Home size={18}/>Edit Base List</button>
  </div>

  {mode==='trip'?<>
   <div className="h-3 bg-white rounded-full overflow-hidden"><div className="h-full bg-forest" style={{width:`${allItems.length?purchasedCount/allItems.length*100:0}%`}}/></div>
   <div className="bg-forest/5 border border-forest/15 rounded-2xl p-4 text-sm"><b>One shared running list</b><p className="text-stone mt-1">Recipes, the Base Cottage List and added items all appear here. Stores and shopping runs have been removed.</p></div>

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
        <p className="text-xs text-stone mt-1">{item.sourceType==='recipe'&&item.sources?.length?item.sources.map(source=>`${source.recipe} → ${source.meal} (${source.attendance} guests)`).join(' • '):item.sourceType==='recipe'&&item.usedIn?item.usedIn.join(' • '):item.notes||'No notes'}</p>
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
  </>:<>
   <div className="bg-forest/5 border border-forest/15 rounded-2xl p-4 text-sm"><b>Base Cottage List template</b><p className="text-stone mt-1">Edits made here update the Base Cottage items in the Trip Grocery List on this device.</p></div>
   {baseData.categories.map(category=><section key={category.id} className="card">
    <h2 className="section-title mb-2">{category.name}</h2>
    {category.items.map(item=>{
     const edit=baseEdits[item.id]||{},qty=edit.quantity??item.quantity,unit=edit.unit??item.unit,notes=edit.notes??item.notes,isEditing=editing===item.id
     return <div key={item.id} className="py-4 border-b last:border-0"><div className="flex justify-between gap-3"><div className="flex-1"><div className="flex flex-wrap gap-2 items-center"><b className="text-lg">{item.name}</b><span className="badge bg-navy/10 text-navy">Base list</span>{item.gf&&<span className="badge-gf">GF</span>}</div>{isEditing?<div className="grid sm:grid-cols-[100px_140px_1fr] gap-2 mt-3"><input type="number" min="0" step="0.5" value={qty} onChange={e=>updateBase(item.id,'quantity',e.target.value)} className="bg-white border rounded-xl p-2"/><input value={unit} onChange={e=>updateBase(item.id,'unit',e.target.value)} className="bg-white border rounded-xl p-2"/><input value={notes} onChange={e=>updateBase(item.id,'notes',e.target.value)} className="bg-white border rounded-xl p-2"/></div>:<><p className="mt-1"><b>Quantity:</b> {qty} {unit}</p>{notes&&<p className="text-sm text-stone mt-1"><b>Notes:</b> {notes}</p>}</>}</div><button onClick={()=>setEditing(isEditing?null:item.id)} className="text-stone hover:text-forest p-1">{isEditing?<Save size={18}/>:<Pencil size={18}/>}</button></div></div>
    })}
   </section>)}
  </>}

  {showAdd&&<div className="fixed inset-0 z-[80] bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={()=>setShowAdd(false)}><div className="bg-cream rounded-3xl w-full max-w-xl p-5 max-h-[90vh] overflow-auto" onClick={e=>e.stopPropagation()}>
   <div className="flex justify-between items-center"><div><h2 className="text-xl font-extrabold text-navy">Add Grocery Item</h2><p className="text-sm text-stone">Add anything the trip needs beyond recipes and the Base Cottage List.</p></div><button onClick={()=>setShowAdd(false)} className="p-2"><X/></button></div>
   <div className="grid sm:grid-cols-2 gap-3 mt-5">
    <label className="sm:col-span-2"><span className="section-title">Item name</span><input autoFocus value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full mt-2 p-3 rounded-xl bg-white border" placeholder="Milk"/></label>
    <label><span className="section-title">Quantity</span><input type="number" min="0" step="0.5" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} className="w-full mt-2 p-3 rounded-xl bg-white border"/></label>
    <label><span className="section-title">Unit</span><input value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} className="w-full mt-2 p-3 rounded-xl bg-white border"/></label>
    <label><span className="section-title">Category</span><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full mt-2 p-3 rounded-xl bg-white border">{categories.map(x=><option key={x}>{x}</option>)}</select></label>
    <label><span className="section-title">Assign to</span><select value={form.assignedTo} onChange={e=>setForm({...form,assignedTo:e.target.value})} className="w-full mt-2 p-3 rounded-xl bg-white border"><option value="">Unassigned</option>{guests.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
    <label className="sm:col-span-2"><span className="section-title">Notes</span><input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} className="w-full mt-2 p-3 rounded-xl bg-white border" placeholder="Honeycrisp, buy ripe, specific brand..."/></label>
    <label className="bg-white rounded-2xl p-4 flex gap-3 items-center sm:col-span-2"><input type="checkbox" checked={form.gf} onChange={e=>setForm({...form,gf:e.target.checked})} className="w-5 h-5"/><span><b>Gluten-free</b><p className="text-xs text-stone">Show a GF marker.</p></span></label>
   </div>
   <button onClick={addItem} disabled={!form.name.trim()} className="btn-primary w-full mt-5 disabled:opacity-40">Add to Trip Grocery List</button>
  </div></div>}
 </div>
}
