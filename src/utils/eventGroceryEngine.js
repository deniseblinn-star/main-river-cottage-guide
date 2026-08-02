import { finalAttendeeIds, formatMealDate } from './mealPlanner'
import { getRecipeCatalogue } from './recipeCatalogue'

const FRACTIONS={
  '½':0.5,'¼':0.25,'¾':0.75,'⅓':1/3,'⅔':2/3,'⅛':0.125,'⅜':0.375,'⅝':0.625,'⅞':0.875
}

const unitAliases={
  kilograms:'kg',kilogram:'kg',kilos:'kg',kilo:'kg',kg:'kg',
  grams:'g',gram:'g',g:'g',
  cups:'cup',cup:'cup',
  tablespoons:'tbsp',tablespoon:'tbsp',tbsp:'tbsp',
  teaspoons:'tsp',teaspoon:'tsp',tsp:'tsp',
  cloves:'clove',clove:'clove',
  heads:'head',head:'head',
  hearts:'heart',heart:'heart',
  racks:'rack',rack:'rack',
  bottles:'bottle',bottle:'bottle',
  bags:'bag',bag:'bag',
  bunches:'bunch',bunch:'bunch',
  packages:'package',package:'package',packs:'pack',pack:'pack',
  each:'each'
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
    const rawUnit=match[2].toLowerCase().replace(/[,.]$/,'')
    const unit=unitAliases[rawUnit]
    if(quantity!==null&&unit)return {name:match[3].trim(),quantity,unit,shopping:true,legacy:false}
  }
  const quantityOnly=text.match(/^(\d+(?:\.\d+)?|\d+\/\d+|\d+[½¼¾⅓⅔⅛⅜⅝⅞]|[½¼¾⅓⅔⅛⅜⅝⅞])\s+(.+)$/)
  if(quantityOnly){
    const quantity=numberFromToken(quantityOnly[1])
    if(quantity!==null)return {name:quantityOnly[2].trim(),quantity,unit:'each',shopping:true,legacy:false}
  }
  return {name:text,quantity:1,unit:'amount',shopping:true,legacy:true}
}

export function normalizeRecipeIngredients(recipe){
  return (recipe?.ingredients||[]).map(row=>{
    if(typeof row==='string')return parseLegacyIngredient(row)
    return {
      name:String(row.name||row.ingredient||'Ingredient').trim(),
      quantity:Number(row.quantity)||0,
      unit:String(row.unit||'each').trim(),
      shopping:row.shopping!==false,
      legacy:false
    }
  }).filter(row=>row.name&&row.shopping)
}

function round(value,unit){
  const wholeUnits=['each','clove','head','heart','rack','bottle','bag','bunch','package','pack']
  if(wholeUnits.includes(unit))return Math.ceil(value)
  if(value>=10)return Math.round(value*10)/10
  return Math.round(value*100)/100
}

function categoryFor(name){
  const text=name.toLowerCase()
  if(/beef|sirloin|tenderloin|steak|pork|rib|chicken|turkey|sausage|bacon|ham/.test(text))return 'Meat'
  if(/lobster|shrimp|prawn|salmon|fish|scallop|crab|seafood/.test(text))return 'Seafood'
  if(/lettuce|romaine|avocado|lime|lemon|onion|garlic|cilantro|jalapeno|apple|strawber|tomato|pepper|potato|herb|rosemary|thyme|oregano/.test(text))return 'Produce'
  if(/milk|butter|cream|cheese|parmesan|yogurt|egg/.test(text))return 'Dairy'
  if(/bread|bun|bagel|muffin|crouton|tortilla/.test(text))return 'Bakery'
  if(/beer|wine|juice|water|pop|soda|coffee|tea/.test(text))return 'Drinks'
  if(/chip|candy|sour patch|marshmallow|snack/.test(text))return 'Snacks'
  if(/paper|garbage|foil|wrap|clean|soap|bag/.test(text))return 'Household'
  if(/frozen|ice cream/.test(text))return 'Frozen'
  return 'Pantry'
}

function keyFor(name,unit){return `${name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}|${unit.toLowerCase()}`}

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
        const scaledQuantity=ingredient.legacy?ingredient.quantity:round(ingredient.quantity*scale,ingredient.unit)
        const key=keyFor(ingredient.name,ingredient.unit)
        const source={
          recipeId:recipe.id,
          recipe:recipe.title,
          mealSlotId:slot.id,
          meal:`${formatMealDate(slot.date)} ${slot.label}`,
          attendance,
          yield:recipeYield,
          scale:Number(scale.toFixed(2)),
          quantity:scaledQuantity,
          legacy:ingredient.legacy
        }
        if(!merged[key])merged[key]={
          id:`event-generated-${event.id}-${key.replace('|','-')}`,
          name:ingredient.name,
          quantity:scaledQuantity,
          unit:ingredient.unit,
          department:categoryFor(ingredient.name),
          source:'recipe',
          notes:ingredient.legacy?'Quantity not structured yet—edit this recipe ingredient before final shopping.':'',
          sources:[source]
        }
        else{
          merged[key].quantity=round(merged[key].quantity+scaledQuantity,ingredient.unit)
          merged[key].sources.push(source)
          if(ingredient.legacy)merged[key].notes='Quantity not structured yet—edit this recipe ingredient before final shopping.'
        }
      }
    }
  }
  return Object.values(merged).sort((a,b)=>a.department.localeCompare(b.department)||a.name.localeCompare(b.name))
}

export function recipeAssignmentCount(event,recipeId){
  return (event?.mealSlots||[]).filter(slot=>slot.recipeIds?.includes(recipeId)).length
}
