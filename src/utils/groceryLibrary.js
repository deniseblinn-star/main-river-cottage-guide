import recipeData from '../data/recipes.json'

const STORAGE_KEY='main-river-grocery-library-v1'

export const UNIT_GROUPS={
  weight:{g:1,kg:1000,oz:28.3495,lb:453.592},
  volume:{ml:1,l:1000,tsp:4.92892,tbsp:14.7868,cup:236.588},
  count:{each:1,can:1,bottle:1,box:1,bag:1,jar:1,package:1,pack:1,bunch:1,head:1,clove:1,rack:1,heart:1,stalk:1,dozen:12,stick:1,bulb:1}
}

export const UNIT_ALIASES={
  gram:'g',grams:'g',g:'g',
  kilogram:'kg',kilograms:'kg',kilo:'kg',kilos:'kg',kg:'kg',
  ounce:'oz',ounces:'oz',oz:'oz',
  pound:'lb',pounds:'lb',lbs:'lb',lb:'lb',
  millilitre:'ml',millilitres:'ml',milliliter:'ml',milliliters:'ml',ml:'ml',
  litre:'l',litres:'l',liter:'l',liters:'l',l:'l',
  teaspoon:'tsp',teaspoons:'tsp',tsp:'tsp',
  tablespoon:'tbsp',tablespoons:'tbsp',tbsp:'tbsp',
  cups:'cup',cup:'cup',
  each:'each',item:'each',items:'each',
  cans:'can',can:'can',
  bottles:'bottle',bottle:'bottle',
  boxes:'box',box:'box',
  bags:'bag',bag:'bag',
  jars:'jar',jar:'jar',
  packages:'package',package:'package',
  packs:'pack',pack:'pack',
  bunches:'bunch',bunch:'bunch',
  heads:'head',head:'head',
  cloves:'clove',clove:'clove',
  racks:'rack',rack:'rack',
  hearts:'heart',heart:'heart',
  stalks:'stalk',stalk:'stalk',
  dozen:'dozen',dozens:'dozen',
  sticks:'stick',stick:'stick',
  bulbs:'bulb',bulb:'bulb',
  amount:'amount','to taste':'to taste',dash:'dash'
}

const BASE_GROCERY_LIBRARY_SEED=[
  {id:'apple-cider-vinegar',name:'Apple Cider Vinegar',aliases:['ACV','apple cider vinegar','apple cider vinegar + juice for spritz'],category:'Pantry',subcategory:'Oils & Vinegars',defaultPurchaseUnit:'bottle',packageSize:946,packageUnit:'ml',allowedUnits:['tsp','tbsp','cup','ml','l','bottle']},
  {id:'olive-oil',name:'Olive Oil',aliases:['extra virgin olive oil','EVOO'],category:'Pantry',subcategory:'Oils & Vinegars',defaultPurchaseUnit:'bottle',packageSize:1,packageUnit:'l',allowedUnits:['tsp','tbsp','cup','ml','l','bottle']},
  {id:'red-wine-vinegar',name:'Red Wine Vinegar',aliases:[],category:'Pantry',subcategory:'Oils & Vinegars',defaultPurchaseUnit:'bottle',packageSize:500,packageUnit:'ml',allowedUnits:['tsp','tbsp','cup','ml','l','bottle']},
  {id:'pasta',name:'Pasta',aliases:['dry pasta','pasta noodles'],category:'Pantry',subcategory:'Pasta & Rice',defaultPurchaseUnit:'package',packageSize:454,packageUnit:'g',allowedUnits:['g','kg','oz','lb','package']},
  {id:'rice',name:'Rice',aliases:[],category:'Pantry',subcategory:'Pasta & Rice',defaultPurchaseUnit:'bag',packageSize:2,packageUnit:'kg',allowedUnits:['g','kg','oz','lb','bag']},
  {id:'cucumber',name:'Cucumber',aliases:['cucumbers'],category:'Produce',subcategory:'Fresh Vegetables',defaultPurchaseUnit:'each',packageSize:1,packageUnit:'each',allowedUnits:['each','g','kg']},
  {id:'romaine-lettuce',name:'Romaine Lettuce',aliases:['romaine','romaine hearts','romaine heart'],category:'Produce',subcategory:'Fresh Vegetables',defaultPurchaseUnit:'package',packageSize:3,packageUnit:'heart',allowedUnits:['head','heart','package']},
  {id:'garlic',name:'Garlic',aliases:['garlic cloves','fresh garlic'],category:'Produce',subcategory:'Fresh Vegetables',defaultPurchaseUnit:'head',packageSize:1,packageUnit:'head',allowedUnits:['clove','head']},
  {id:'lemon',name:'Lemon',aliases:['lemons'],category:'Produce',subcategory:'Fresh Fruit',defaultPurchaseUnit:'each',packageSize:1,packageUnit:'each',allowedUnits:['each']},
  {id:'milk',name:'Milk',aliases:['2% milk','whole milk'],category:'Dairy',subcategory:'Milk',defaultPurchaseUnit:'l',packageSize:4,packageUnit:'l',allowedUnits:['ml','l','cup']},
  {id:'butter',name:'Butter',aliases:['unsalted butter','salted butter'],category:'Dairy',subcategory:'Butter',defaultPurchaseUnit:'package',packageSize:454,packageUnit:'g',allowedUnits:['g','kg','oz','lb','tbsp','cup','package']},
  {id:'eggs',name:'Eggs',aliases:['egg','large eggs','large egg'],category:'Dairy',subcategory:'Eggs',defaultPurchaseUnit:'package',packageSize:12,packageUnit:'each',allowedUnits:['each','package']},
  {id:'parmesan-cheese',name:'Parmesan Cheese',aliases:['parmesan','parmigiano reggiano','parmigiano-reggiano'],category:'Dairy',subcategory:'Cheese',defaultPurchaseUnit:'package',packageSize:200,packageUnit:'g',allowedUnits:['g','kg','oz','lb','cup','package']},
  {id:'beef-sirloin',name:'Beef Sirloin',aliases:['sirloin','sirloin steak','top sirloin'],category:'Meat',subcategory:'Beef',defaultPurchaseUnit:'kg',packageSize:1,packageUnit:'kg',allowedUnits:['g','kg','oz','lb']},
  {id:'chicken-breast',name:'Chicken Breast',aliases:['chicken breasts'],category:'Meat',subcategory:'Chicken',defaultPurchaseUnit:'kg',packageSize:1,packageUnit:'kg',allowedUnits:['g','kg','oz','lb','each']},
  {id:'cereal',name:'Cereal',aliases:['breakfast cereal'],category:'Pantry',subcategory:'Breakfast',defaultPurchaseUnit:'box',packageSize:1,packageUnit:'box',allowedUnits:['box','each']},
  {id:'crackers',name:'Crackers',aliases:['cracker'],category:'Pantry',subcategory:'Snacks & Crackers',defaultPurchaseUnit:'box',packageSize:1,packageUnit:'box',allowedUnits:['box','package']},
  {id:'ketchup',name:'Ketchup',aliases:[],category:'Pantry',subcategory:'Condiments',defaultPurchaseUnit:'bottle',packageSize:1,packageUnit:'bottle',allowedUnits:['ml','l','cup','bottle']},
  {id:'mustard',name:'Mustard',aliases:['yellow mustard'],category:'Pantry',subcategory:'Condiments',defaultPurchaseUnit:'bottle',packageSize:1,packageUnit:'bottle',allowedUnits:['tsp','tbsp','cup','ml','bottle']},
  {id:'mayonnaise',name:'Mayonnaise',aliases:['mayo'],category:'Pantry',subcategory:'Condiments',defaultPurchaseUnit:'jar',packageSize:890,packageUnit:'ml',allowedUnits:['tsp','tbsp','cup','ml','l']}
]

function inferredCategory(name){
 const text=name.toLowerCase()
 if(/beef|brisket|pork|rib|chicken|bacon|salami|prosciutto|soppressata|meat/.test(text))return ['Meat','Meat']
 if(/lobster|mussel|shrimp|seafood/.test(text))return ['Seafood','Seafood']
 if(/lettuce|cabbage|broccoli|greens|avocado|lime|lemon|onion|garlic|dill|thyme|rosemary|parsley|cilantro|jalapeno|tomato|pepper|potato|cucumber|carrot|celery|grape|berr|strawber/.test(text))return ['Produce','Produce']
 if(/milk|butter|cream|cheese|yogurt|egg/.test(text))return ['Dairy','Dairy']
 if(/bread|bun|roll|biscuit|tortilla|crouton/.test(text))return ['Bakery','Bread & Wraps']
 if(/wine|juice|ice/.test(text))return ['Drinks','Beverages']
 if(/cracker|chip|popcorn/.test(text))return ['Snacks','Snacks']
 if(/paper/.test(text))return ['Household','Cooking Supplies']
 return ['Pantry','Other']
}

function inferredPackage(name,unit){
 const text=name.toLowerCase(),normalized=normalizeUnit(unit)
 if(/beef|brisket|pork|rib|chicken|bacon|salami|prosciutto|soppressata|lobster meat|mussel|shrimp|italian meats|cheese$|berries|strawberries|grapes/.test(text))return {defaultPurchaseUnit:'kg',packageSize:1,packageUnit:'kg',allowedUnits:['g','kg','oz','lb']}
 if(normalized==='bunch')return {defaultPurchaseUnit:'bunch',packageSize:1,packageUnit:'bunch',allowedUnits:['bunch']}
 if(normalized==='clove'||normalized==='head'||normalized==='bulb')return {defaultPurchaseUnit:'bulb',packageSize:10,packageUnit:'clove',allowedUnits:['clove','head','bulb']}
 if(['each','head','heart','stalk','rack'].includes(normalized))return {defaultPurchaseUnit:'each',packageSize:1,packageUnit:normalized,allowedUnits:[normalized,'each']}
 if(['can','jar','bottle','box','bag','package','pack'].includes(normalized))return {defaultPurchaseUnit:normalized,packageSize:1,packageUnit:normalized,allowedUnits:[normalized]}
 if(/oil|vinegar|juice|sauce|dressing|mayonnaise|mustard|wine|broth|cream|milk|yogurt|honey|extract|horseradish|salsa|preserves/.test(text))return {defaultPurchaseUnit:'bottle',packageSize:500,packageUnit:'ml',allowedUnits:['tsp','tbsp','cup','ml','l','bottle','jar']}
 if(['g','kg','oz','lb'].includes(normalized))return {defaultPurchaseUnit:'package',packageSize:454,packageUnit:'g',allowedUnits:['g','kg','oz','lb','package']}
 return {defaultPurchaseUnit:'package',packageSize:1,packageUnit:'package',allowedUnits:[...new Set([normalized,'tsp','tbsp','cup','g'])]}
}

function recipeLibrarySeeds(){
 const seen=new Set(BASE_GROCERY_LIBRARY_SEED.map(item=>item.id)),items=[]
 for(const recipe of recipeData.recipes)for(const ingredient of recipe.ingredients||[]){
  if(typeof ingredient==='string')continue
  const id=ingredient.groceryItemId||slug(ingredient.name)
  if(!id||seen.has(id))continue
  seen.add(id)
  const [category,subcategory]=inferredCategory(ingredient.name)
  items.push({id,name:ingredient.name,aliases:[],category,subcategory,...inferredPackage(ingredient.name,ingredient.unit)})
 }
 return items
}

export const GROCERY_LIBRARY_SEED=[...BASE_GROCERY_LIBRARY_SEED,...recipeLibrarySeeds()]

function slug(value){
  return String(value||'').toLowerCase().trim().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
}
function cleanName(value){
  return String(value||'').toLowerCase().replace(/\([^)]*\)/g,' ').replace(/\b(fresh|large|small|medium|chopped|diced|sliced|minced|for spritz|plus juice|juice for spritz)\b/g,' ').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ')
}

export function normalizeUnit(value){
  const key=String(value||'each').trim().toLowerCase().replace(/\.$/,'')
  return UNIT_ALIASES[key]||key
}
export function unitFamily(unit){
  const normalized=normalizeUnit(unit)
  return Object.entries(UNIT_GROUPS).find(([,map])=>map[normalized]!==undefined)?.[0]||null
}
export function convertQuantity(quantity,fromUnit,toUnit){
  const from=normalizeUnit(fromUnit),to=normalizeUnit(toUnit)
  if(from===to)return Number(quantity)
  const family=unitFamily(from)
  if(!family||family!==unitFamily(to))return null
  return Number(quantity)*UNIT_GROUPS[family][from]/UNIT_GROUPS[family][to]
}

export function getGroceryLibrary(){
  try{
    const stored=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')
    if(Array.isArray(stored)&&stored.length){
      const ids=new Set(stored.map(item=>item.id))
      return [...stored,...GROCERY_LIBRARY_SEED.filter(item=>!ids.has(item.id))]
    }
  }catch{}
  return GROCERY_LIBRARY_SEED
}
export function saveGroceryLibrary(items){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(items))
  return items
}
export function saveGroceryItem(item){
  const library=getGroceryLibrary()
  const clean={...item,id:item.id||slug(item.name)||`grocery-${Date.now()}`,aliases:[...new Set((item.aliases||[]).map(value=>value.trim()).filter(Boolean))]}
  const next=library.some(row=>row.id===clean.id)?library.map(row=>row.id===clean.id?clean:row):[...library,clean]
  saveGroceryLibrary(next)
  return clean
}
export function deleteGroceryItem(id){
  const next=getGroceryLibrary().filter(item=>item.id!==id)
  saveGroceryLibrary(next)
  return next
}

export function matchGroceryItem(name,library=getGroceryLibrary()){
  const exact=cleanName(name)
  if(!exact)return null
  let best=null
  for(const item of library){
    const candidates=[item.name,...(item.aliases||[])].map(cleanName)
    if(candidates.includes(exact))return {...item,matchType:'exact'}
    const candidate=candidates.find(value=>value&&(
      exact.startsWith(value+' ')||exact.endsWith(' '+value)||value.startsWith(exact+' ')||value.endsWith(' '+exact)
    ))
    if(candidate&&(!best||candidate.length>best.length))best={...item,matchType:'alias',length:candidate.length}
  }
  if(best){delete best.length;return best}
  return null
}

export function standardizeIngredient(ingredient,library=getGroceryLibrary()){
  const linked=ingredient.groceryItemId?library.find(item=>item.id===ingredient.groceryItemId):null
  const matched=matchGroceryItem(ingredient.name,library)
  // Exact name/alias matches are more trustworthy than stale legacy IDs.
  // Examples repaired here:
  //   Gruyere Cheese stored as groceryItemId=cheese
  //   Garlic Powder stored as groceryItemId=garlic
  // This changes only the link used by grocery generation; recipe quantity/unit
  // and the user's Grocery Library/package edits are untouched.
  const groceryItem=(matched&&matched.matchType==='exact'&&matched.id!==linked?.id)
    ?matched
    :(linked||matched)
  return {
    ...ingredient,
    groceryItemId:groceryItem?.id||ingredient.groceryItemId||'',
    standardName:groceryItem?.name||ingredient.name,
    category:groceryItem?.category||ingredient.category||'Pantry',
    subcategory:groceryItem?.subcategory||ingredient.subcategory||'Other',
    unit:normalizeUnit(ingredient.unit),
    groceryItem
  }
}

export function packageSuggestion(item){
  const grocery=item.groceryItem
  if(!grocery?.packageSize||!grocery.packageUnit)return null
  const requiredInPackageUnit=convertQuantity(item.quantity,item.unit,grocery.packageUnit)
  if(requiredInPackageUnit===null)return null
  const count=Math.ceil(requiredInPackageUnit/Number(grocery.packageSize))
  if(!Number.isFinite(count)||count<=0)return null
  return {
    count,
    purchaseUnit:grocery.defaultPurchaseUnit||'package',
    packageSize:grocery.packageSize,
    packageUnit:grocery.packageUnit,
    label:`Buy ${count} × ${grocery.packageSize} ${grocery.packageUnit} ${grocery.defaultPurchaseUnit||'package'}${count===1?'':'s'}`
  }
}
