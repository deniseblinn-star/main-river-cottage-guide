import { finalAttendeeIds, formatMealDate } from './mealPlanner'
import { getRecipeCatalogue } from './recipeCatalogue'
import { convertQuantity, getGroceryLibrary, normalizeUnit, standardizeIngredient, unitFamily } from './groceryLibrary'

const FRACTIONS={
  '½':0.5,'¼':0.25,'¾':0.75,'⅓':1/3,'⅔':2/3,'⅛':0.125,'⅜':0.375,'⅝':0.625,'⅞':0.875
}

function numberFromToken(token){
  if(!token)return null
  if(FRACTIONS[token])return FRACTIONS[token]
  if(/^\d+(?:\.\d+)?$/.test(token))return Number(token)
  const mixed=token.match(/^(\d+)([½¼¾⅓⅔⅛⅜⅝⅞])$/)
  if(mixed)return Number(mixed[1])+FRACTIONS[mixed[2]]
  const slash=token.match(/^(\d+)\/(\d+)$/)
  if(slash)return Number(slash[1])/Number(slash[2])
  return null
}

export function parseLegacyIngredient(value){
  const text=String(value||'').trim()
  const match=text.match(/^(\d+(?:\.\d+)?|\d+\/\d+|\d+[½¼¾⅓⅔⅛⅜⅝⅞]|[½¼¾⅓⅔⅛⅜⅝⅞])\s+([^\s]+)\s+(.+)$/)
  if(match){
    const quantity=numberFromToken(match[1])
    const unit=normalizeUnit(match[2].toLowerCase().replace(/[,.]$/,''))
    if(quantity!==null)return {name:match[3].trim(),quantity,unit,shopping:true,legacy:unit==='amount'}
  }
  const quantityOnly=text.match(/^(\d+(?:\.\d+)?|\d+\/\d+|\d+[½¼¾⅓⅔⅛⅜⅝⅞]|[½¼¾⅓⅔⅛⅜⅝⅞])\s+(.+)$/)
  if(quantityOnly){
    const quantity=numberFromToken(quantityOnly[1])
    if(quantity!==null)return {name:quantityOnly[2].trim(),quantity,unit:'each',shopping:true,legacy:false}
  }
  return {name:text,quantity:1,unit:'amount',shopping:true,legacy:true}
}

export function normalizeRecipeIngredients(recipe){
  const library=getGroceryLibrary()
  return (recipe?.ingredients||[]).map(row=>{
    const parsed=typeof row==='string'?parseLegacyIngredient(row):{
      name:String(row.name||row.ingredient||'Ingredient').trim(),
      quantity:Number(row.quantity)||0,
      unit:normalizeUnit(row.unit||'each'),
      shopping:row.shopping!==false,
      groceryItemId:row.groceryItemId||'',
      legacy:false
    }
    return standardizeIngredient(parsed,library)
  }).filter(row=>row.name&&row.shopping)
}

function round(value,unit){
  const wholeUnits=['each','clove','head','heart','rack','bottle','bag','bunch','package','pack','box','can']
  if(wholeUnits.includes(unit))return Math.ceil(value)
  if(value>=10)return Math.round(value*10)/10
  return Math.round(value*100)/100
}

function fallbackCategory(name){
  const text=name.toLowerCase()
  if(/beef|sirloin|tenderloin|steak|pork|rib|chicken|turkey|sausage|bacon|ham/.test(text))return 'Meat'
  if(/lobster|shrimp|prawn|salmon|fish|scallop|crab|seafood/.test(text))return 'Seafood'
  if(/lettuce|romaine|avocado|lime|lemon|onion|garlic|cilantro|jalapeno|apple|strawber|tomato|pepper|potato|cucumber/.test(text))return 'Produce'
  if(/milk|butter|cream|cheese|parmesan|yogurt|egg/.test(text))return 'Dairy'
  if(/bread|bun|bagel|muffin|crouton|tortilla/.test(text))return 'Bakery'
  if(/beer|wine|juice|water|pop|soda|coffee|tea/.test(text))return 'Drinks'
  if(/chip|candy|marshmallow|snack|cracker/.test(text))return 'Snacks'
  if(/paper|garbage|foil|wrap|clean|soap/.test(text))return 'Household'
  return 'Pantry'
}

function preferredMergeUnit(unit){
  const family=unitFamily(unit)
  if(family==='weight')return 'g'
  if(family==='volume')return 'ml'
  return normalizeUnit(unit)
}
function keyFor(ingredient,mergeUnit){
  const id=ingredient.groceryItemId||ingredient.standardName.toLowerCase().replace(/[^a-z0-9]+/g,'-')
  const family=unitFamily(mergeUnit)||mergeUnit
  return `${id}|${family}`
}

export function getEventGeneratedGroceries(event){
  if(!event)return []
  const recipes=getRecipeCatalogue()
  const recipeMap=Object.fromEntries(recipes.map(recipe=>[recipe.id,recipe]))
  const merged={}

  for(const slot of event.mealSlots||[]){
    if(slot.planType!=='recipes'||!slot.recipeIds?.length)continue
    const attendance=finalAttendeeIds(event,slot).length
    for(const recipeId of slot.recipeIds){
      const recipe=recipeMap[recipeId]
      const recipeYield=Number(recipe?.servings)||0
      if(!recipe||recipeYield<=0||attendance<=0)continue
      const scale=attendance/recipeYield

      for(const ingredient of normalizeRecipeIngredients(recipe)){
        const scaled=ingredient.legacy?ingredient.quantity:Number(ingredient.quantity)*scale
        const mergeUnit=preferredMergeUnit(ingredient.unit)
        const converted=convertQuantity(scaled,ingredient.unit,mergeUnit)
        const mergeQuantity=converted===null?scaled:converted
        const actualMergeUnit=converted===null?ingredient.unit:mergeUnit
        const key=keyFor(ingredient,actualMergeUnit)

        const source={
          recipeId:recipe.id,
          recipe:recipe.title,
          mealSlotId:slot.id,
          meal:`${formatMealDate(slot.date)} ${slot.label}`,
          attendance,
          yield:recipeYield,
          scale:Number(scale.toFixed(2)),
          quantity:round(scaled,ingredient.unit),
          unit:ingredient.unit,
          originalName:ingredient.name,
          legacy:ingredient.legacy
        }

        if(!merged[key]){
          merged[key]={
            id:`event-generated-${event.id}-${key.replace('|','-')}`,
            groceryItemId:ingredient.groceryItemId||'',
            groceryItem:ingredient.groceryItem||null,
            name:ingredient.standardName,
            aliasesMerged:ingredient.name!==ingredient.standardName?[ingredient.name]:[],
            quantity:mergeQuantity,
            unit:actualMergeUnit,
            department:ingredient.category||fallbackCategory(ingredient.standardName),
            subcategory:ingredient.subcategory||'Other',
            source:'recipe',
            notes:ingredient.legacy?'Quantity not structured yet—edit this recipe ingredient before final shopping.':'',
            sources:[source]
          }
        }else{
          merged[key].quantity+=mergeQuantity
          merged[key].sources.push(source)
          if(ingredient.name!==ingredient.standardName&&!merged[key].aliasesMerged.includes(ingredient.name))merged[key].aliasesMerged.push(ingredient.name)
          if(ingredient.legacy)merged[key].notes='Quantity not structured yet—edit this recipe ingredient before final shopping.'
        }
      }
    }
  }

  return Object.values(merged).map(item=>{
    let quantity=item.quantity,unit=item.unit
    if(unit==='g'&&quantity>=1000){quantity=quantity/1000;unit='kg'}
    if(unit==='ml'&&quantity>=1000){quantity=quantity/1000;unit='l'}
    return {...item,quantity:round(quantity,unit),unit}
  }).sort((a,b)=>a.department.localeCompare(b.department)||a.name.localeCompare(b.name))
}

export function recipeAssignmentCount(event,recipeId){
  return (event?.mealSlots||[]).filter(slot=>slot.recipeIds?.includes(recipeId)).length
}
