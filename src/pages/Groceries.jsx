import { useMemo, useState } from 'react'
import { Check, RotateCcw, ListChecks, Home, Pencil, Save, Plus, X, Trash2 } from 'lucide-react'
import data from '../data/groceries.json'
import baseData from '../data/baseGroceries.json'

const checkedKey='cottage-groceries-checked'
const baseCheckedKey='cottage-base-groceries-checked'
const baseEditsKey='cottage-base-groceries-edits'
const manualItemsKey='cottage-manual-groceries'
const manualCheckedKey='cottage-manual-groceries-checked'

const emptyForm={
 name:'',
 quantity:1,
 unit:'item',
 category:'Produce',
 store:'Costco',
 notes:'',
 gf:false,
 merge:true
}

export default function Groceries(){
 const [mode,setMode]=useState('trip')
 const [store,setStore]=useState(data.stores[0])
 const [checked,setChecked]=useState(()=>JSON.parse(localStorage.getItem(checkedKey)||'{}'))
 const [baseChecked,setBaseChecked]=useState(()=>JSON.parse(localStorage.getItem(baseCheckedKey)||'{}'))
 const [baseEdits,setBaseEdits]=useState(()=>JSON.parse(localStorage.getItem(baseEditsKey)||'{}'))
 const [editing,setEditing]=useState(null)
 const [manualItems,setManualItems]=useState(()=>JSON.parse(localStorage.getItem(manualItemsKey)||'[]'))
 const [manualChecked,setManualChecked]=useState(()=>JSON.parse(localStorage.getItem(manualCheckedKey)||'{}'))
 const [showAdd,setShowAdd]=useState(false)
 const [form,setForm]=useState(emptyForm)

 const toggle=id=>{const n={...checked,[id]:!checked[id]};setChecked(n);localStorage.setItem(checkedKey,JSON.stringify(n))}
 const toggleBase=id=>{const n={...baseChecked,[id]:!baseChecked[id]};setBaseChecked(n);localStorage.setItem(baseCheckedKey,JSON.stringify(n))}
 const toggleManual=id=>{const n={...manualChecked,[id]:!manualChecked[id]};setManualChecked(n);localStorage.setItem(manualCheckedKey,JSON.stringify(n))}
 const reset=()=>{
  if(mode==='trip'){
   setChecked({})
   setManualChecked({})
   localStorage.removeItem(checkedKey)
   localStorage.removeItem(manualCheckedKey)
  }else{
   setBaseChecked({})
   localStorage.removeItem(baseCheckedKey)
  }
 }
 const updateBase=(id,field,value)=>{const n={...baseEdits,[id]:{...(baseEdits[id]||{}),[field]:value}};setBaseEdits(n);localStorage.setItem(baseEditsKey,JSON.stringify(n))}
 const updateForm=(field,value)=>setForm(current=>({...current,[field]:value}))

 const addManualItem=()=>{
  if(!form.name.trim()) return
  const item={
   id:`manual-${Date.now()}`,
   name:form.name.trim(),
   quantity:Number(form.quantity)||1,
   unit:form.unit.trim()||'item',
   department:form.category,
   store:form.store,
   notes:form.notes.trim(),
   gf:Boolean(form.gf),
   merge:Boolean(form.merge),
   source:'manual'
  }
  const next=[...manualItems,item]
  setManualItems(next)
  localStorage.setItem(manualItemsKey,JSON.stringify(next))
  setForm(emptyForm)
  setShowAdd(false)
  setStore(item.store)
  setMode('trip')
 }

 const deleteManualItem=id=>{
  const next=manualItems.filter(item=>item.id!==id)
  setManualItems(next)
  localStorage.setItem(manualItemsKey,JSON.stringify(next))
  const nextChecked={...manualChecked}
  delete nextChecked[id]
  setManualChecked(nextChecked)
  localStorage.setItem(manualCheckedKey,JSON.stringify(nextChecked))
 }

 const recipeItems=data.items.map(item=>({...item,source:'recipe'}))
 const allTripItems=[...recipeItems,...manualItems]
 const tripDone=recipeItems.filter(i=>checked[i.id]).length + manualItems.filter(i=>manualChecked[i.id]).length
 const storeItems=allTripItems.filter(i=>i.store===store)
 const groups=Object.groupBy
  ? Object.groupBy(storeItems,i=>i.department)
  : storeItems.reduce((a,i)=>((a[i.department]??=[]).push(i),a),{})
 const baseItems=useMemo(()=>baseData.categories.flatMap(c=>c.items),[])
 const baseDone=baseItems.filter(i=>baseChecked[i.id]).length
 const storeNames=[...new Set([...data.stores,...manualItems.map(item=>item.store)])]

 return <div className="space-y-4">
  <div className="flex flex-wrap justify-between gap-3">
   <div>
    <h1 className="page-title">Groceries</h1>
    <p className="text-stone">{mode==='trip'
      ? `${tripDone} of ${allTripItems.length} trip items purchased`
      : `${baseDone} of ${baseItems.length} base items purchased`}
    </p>
   </div>
   <div className="flex gap-2">
    {mode==='trip'&&<button onClick={()=>setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus size={18}/>Add Grocery Item</button>}
    <button onClick={reset} className="p-2 bg-white rounded-xl" title="Reset checked items"><RotateCcw/></button>
   </div>
  </div>

  <div className="grid grid-cols-2 gap-2 bg-white rounded-2xl p-1 shadow-sm">
   <button onClick={()=>setMode('trip')} className={`rounded-xl px-4 py-3 font-semibold flex justify-center items-center gap-2 ${mode==='trip'?'bg-forest text-white':'text-stone'}`}><ListChecks size={18}/>Trip Shopping</button>
   <button onClick={()=>setMode('base')} className={`rounded-xl px-4 py-3 font-semibold flex justify-center items-center gap-2 ${mode==='base'?'bg-forest text-white':'text-stone'}`}><Home size={18}/>Base Cottage List</button>
  </div>

  {mode==='trip'?<>
   <div className="h-3 bg-white rounded-full overflow-hidden"><div className="h-full bg-forest" style={{width:`${allTripItems.length?tripDone/allTripItems.length*100:0}%`}}/></div>

   <div className="bg-white rounded-2xl p-4 border border-black/5">
    <div className="flex flex-wrap gap-2 items-center">
     <span className="badge bg-navy/10 text-navy">Recipe / planned</span>
     <span className="text-sm text-stone">Items already required by the current meal plan.</span>
     <span className="badge bg-wood-100 text-wood-600">Manual</span>
     <span className="text-sm text-stone">Extra vegetables, snacks, ice, supplies or anything else you add.</span>
    </div>
   </div>

   <div className="flex gap-2 overflow-x-auto">
    {storeNames.map(s=><button key={s} onClick={()=>setStore(s)} className={`px-4 py-2 rounded-full whitespace-nowrap font-semibold ${s===store?'bg-forest text-white':'bg-white'}`}>
     {s} ({allTripItems.filter(i=>i.store===s).length})
    </button>)}
   </div>

   {store==='Sobeys'&&<div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm"><b>GF reminder:</b> check bread, buns, tortillas, panko and sauces carefully.</div>}

   {Object.entries(groups).map(([group,items])=><section key={group} className="card">
    <h2 className="section-title mb-2">{group}</h2>
    {items.map(item=>{
     const isManual=item.source==='manual'
     const isChecked=isManual?manualChecked[item.id]:checked[item.id]
     const onToggle=()=>isManual?toggleManual(item.id):toggle(item.id)
     return <div key={item.id} className="flex gap-3 py-3 border-b last:border-0 items-start">
      <button onClick={onToggle} className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${isChecked?'bg-forest border-forest text-white':'border-stone/30'}`}>
       {isChecked&&<Check size={16}/>}
      </button>
      <div className={`flex-1 min-w-0 ${isChecked?'line-through text-stone':''}`}>
       <div className="flex flex-wrap gap-2 items-center">
        <b>{item.name}</b>
        <span>— {item.quantity} {item.unit}</span>
        <span className={isManual?'badge bg-wood-100 text-wood-600':'badge bg-navy/10 text-navy'}>{isManual?'Manual':'Recipe / planned'}</span>
        {item.gf&&<span className="badge-gf">GF</span>}
       </div>
       <p className="text-xs text-stone mt-1">
        {isManual
          ? `${item.notes||'No notes'}${item.merge===false?' · Keep separate from matching recipe items':''}`
          : `${item.usedIn.join(' • ')}${item.notes&&` · ${item.notes}`}`}
       </p>
      </div>
      {isManual&&<button onClick={()=>deleteManualItem(item.id)} className="text-stone hover:text-red-600 p-1" title="Delete manual item"><Trash2 size={18}/></button>}
     </div>
    })}
   </section>)}

   {!storeItems.length&&<div className="card text-center py-10">
    <p className="font-semibold text-navy">No items for this store yet.</p>
    <button onClick={()=>setShowAdd(true)} className="btn-primary mt-3 inline-flex items-center gap-2"><Plus size={18}/>Add an item</button>
   </div>}
  </>:<>
   <div className="h-3 bg-white rounded-full overflow-hidden"><div className="h-full bg-forest" style={{width:`${baseDone/baseItems.length*100}%`}}/></div>
   <div className="bg-forest/5 border border-forest/15 rounded-2xl p-4 text-sm">
    <b>Base Cottage List</b>
    <p className="text-stone mt-1">General breakfast, snack and pantry items not driven by recipes. Quantities and notes are editable and saved on this device.</p>
   </div>

   {baseData.categories.map(category=><section key={category.id} className="card">
    <h2 className="section-title mb-2">{category.name}</h2>
    {category.items.map(item=>{
     const edit=baseEdits[item.id]||{}
     const qty=edit.quantity??item.quantity
     const unit=edit.unit??item.unit
     const notes=edit.notes??item.notes
     const isEditing=editing===item.id
     return <div key={item.id} className="py-4 border-b last:border-0">
      <div className="flex gap-3 items-start">
       <button onClick={()=>toggleBase(item.id)} className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-1 ${baseChecked[item.id]?'bg-forest border-forest text-white':'border-stone/30'}`}>{baseChecked[item.id]&&<Check size={17}/>}</button>
       <div className={`flex-1 min-w-0 ${baseChecked[item.id]?'line-through text-stone':''}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
         <div className="flex flex-wrap items-center gap-2"><b className="text-lg">{item.name}</b><span className="badge bg-forest/10 text-forest">Base list</span></div>
         <button onClick={()=>setEditing(isEditing?null:item.id)} className="text-stone hover:text-forest p-1" title="Edit quantity and notes">{isEditing?<Save size={18}/>:<Pencil size={18}/>}</button>
        </div>
        {isEditing?<div className="grid sm:grid-cols-[100px_140px_1fr] gap-2 mt-3">
          <input type="number" min="0" step="0.5" value={qty} onChange={e=>updateBase(item.id,'quantity',e.target.value)} className="bg-white border rounded-xl p-2" aria-label="Quantity"/>
          <input value={unit} onChange={e=>updateBase(item.id,'unit',e.target.value)} className="bg-white border rounded-xl p-2" aria-label="Unit"/>
          <input value={notes} onChange={e=>updateBase(item.id,'notes',e.target.value)} className="bg-white border rounded-xl p-2" placeholder="Notes" aria-label="Notes"/>
         </div>:<>
          <p className="mt-1"><span className="font-semibold">Quantity:</span> {qty} {unit}</p>
          {notes&&<p className="text-sm text-stone mt-1"><span className="font-semibold">Notes:</span> {notes}</p>}
          <p className="text-xs text-stone mt-1">{item.store}{item.gf?' · Gluten-free':''}</p>
         </>}
       </div>
      </div>
     </div>
    })}
   </section>)}
  </>}

  {showAdd&&<div className="fixed inset-0 z-[80] bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={()=>setShowAdd(false)}>
   <div className="bg-cream rounded-3xl w-full max-w-xl p-5 max-h-[90vh] overflow-auto" onClick={e=>e.stopPropagation()}>
    <div className="flex justify-between items-center">
     <div><h2 className="text-xl font-extrabold text-navy">Add Grocery Item</h2><p className="text-sm text-stone">For extra produce, snacks, supplies or anything not attached to a recipe.</p></div>
     <button onClick={()=>setShowAdd(false)} className="p-2"><X/></button>
    </div>

    <div className="grid sm:grid-cols-2 gap-3 mt-5">
     <label className="sm:col-span-2"><span className="section-title">Item name</span><input autoFocus value={form.name} onChange={e=>updateForm('name',e.target.value)} placeholder="e.g., Mini cucumbers" className="w-full mt-2 p-3 rounded-xl bg-white border"/></label>
     <label><span className="section-title">Quantity</span><input type="number" min="0" step="0.5" value={form.quantity} onChange={e=>updateForm('quantity',e.target.value)} className="w-full mt-2 p-3 rounded-xl bg-white border"/></label>
     <label><span className="section-title">Unit</span><input value={form.unit} onChange={e=>updateForm('unit',e.target.value)} placeholder="packs, bags, each..." className="w-full mt-2 p-3 rounded-xl bg-white border"/></label>
     <label><span className="section-title">Category</span><select value={form.category} onChange={e=>updateForm('category',e.target.value)} className="w-full mt-2 p-3 rounded-xl bg-white border">
      {['Produce','Meat','Seafood','Dairy','Bakery','Pantry','Snacks','Drinks','Household','Other'].map(x=><option key={x}>{x}</option>)}
     </select></label>
     <label><span className="section-title">Store</span><select value={form.store} onChange={e=>updateForm('store',e.target.value)} className="w-full mt-2 p-3 rounded-xl bg-white border">
      {data.stores.map(x=><option key={x}>{x}</option>)}
     </select></label>
     <label className="sm:col-span-2"><span className="section-title">Notes</span><input value={form.notes} onChange={e=>updateForm('notes',e.target.value)} placeholder="For snacks and lunches, specific brand, ripeness..." className="w-full mt-2 p-3 rounded-xl bg-white border"/></label>
    </div>

    <div className="grid sm:grid-cols-2 gap-3 mt-4">
     <label className="bg-white rounded-2xl p-4 flex gap-3 items-center"><input type="checkbox" checked={form.gf} onChange={e=>updateForm('gf',e.target.checked)} className="w-5 h-5"/><span><b>Gluten-free</b><p className="text-xs text-stone">Show a GF marker.</p></span></label>
     <label className="bg-white rounded-2xl p-4 flex gap-3 items-center"><input type="checkbox" checked={form.merge} onChange={e=>updateForm('merge',e.target.checked)} className="w-5 h-5"/><span><b>Merge later</b><p className="text-xs text-stone">May combine with matching recipe items in the future engine.</p></span></label>
    </div>

    <button onClick={addManualItem} disabled={!form.name.trim()} className="btn-primary w-full mt-5 disabled:opacity-40">Add to Trip Shopping</button>
   </div>
  </div>}
 </div>
}
