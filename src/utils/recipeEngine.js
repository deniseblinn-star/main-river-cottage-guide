import ingredientsData from '../data/ingredients.json'
import data from '../data/recipeEngine.json'

const ingredientMap=Object.fromEntries(ingredientsData.ingredients.map(i=>[i.id,i]))
const recipeMap=Object.fromEntries(data.recipes.map(r=>[r.id,r]))
const detailToEngine={
  'sous-vide-filet':'filet',
  'caesar-salad':'caesar',
  'guacamole':'guacamole'
}

const roundQuantity=(value,mode)=>{
  if(mode==='whole-up') return Math.ceil(value)
  if(value>=10) return Math.round(value*10)/10
  return Math.round(value*100)/100
}

export function getScaledRecipe(assignment){
  const recipe=recipeMap[assignment.recipeId]
  if(!recipe) return null
  const scale=assignment.attendance/recipe.yield.quantity
  return {assignment,recipe,scale,ingredients:recipe.ingredients.map(row=>({
    ...row,
    ingredient:ingredientMap[row.ingredientId],
    scaledQuantity:roundQuantity(row.quantity*scale,row.rounding)
  }))}
}

export function getRecipeContextByDetailId(detailId){
  const recipeId=detailToEngine[detailId]
  if(!recipeId) return null
  const assignment=data.mealAssignments.find(a=>a.recipeId===recipeId)
  return assignment?getScaledRecipe(assignment):null
}

export function getRecipeEngineData(){return data}

export function getGeneratedGroceries(){
  const merged={}
  for(const assignment of data.mealAssignments){
    const scaled=getScaledRecipe(assignment)
    if(!scaled) continue
    for(const row of scaled.ingredients){
      if(!row.shopping) continue
      const ingredient=row.ingredient
      const key=`${row.ingredientId}|${row.unit}|${ingredient.preferredStore}`
      const source={recipe:scaled.recipe.name,meal:assignment.mealName,attendance:assignment.attendance,yield:scaled.recipe.yield.quantity,quantity:row.scaledQuantity}
      if(!merged[key]) merged[key]={
        id:`generated-${row.ingredientId}-${row.unit}-${ingredient.preferredStore}`,
        ingredientId:row.ingredientId,
        name:ingredient.name,
        quantity:row.scaledQuantity,
        unit:row.unit,
        department:ingredient.category,
        store:ingredient.preferredStore,
        source:'recipe',
        notes:ingredient.purchaseNote||'',
        sources:[source]
      }
      else {
        merged[key].quantity=roundQuantity(merged[key].quantity+row.scaledQuantity,row.rounding)
        merged[key].sources.push(source)
      }
    }
  }
  return Object.values(merged)
}
