import { getGroceryLibrary, matchGroceryItem } from './groceryLibrary'

const KEY='main-river-custom-recipes'
const REPAIR_KEY='main-river-recipe-link-repair-v373'

function rawCustomRecipes(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}}

function repairIngredientLinks(recipes){
 const library=getGroceryLibrary()
 let changed=false
 const repaired=recipes.map(recipe=>{
  if(!Array.isArray(recipe.ingredients))return recipe
  let recipeChanged=false
  const ingredients=recipe.ingredients.map(ingredient=>{
   if(!ingredient||typeof ingredient==='string'||!ingredient.name)return ingredient
   const matched=matchGroceryItem(ingredient.name,library)
   if(!matched||matched.matchType!=='exact'||matched.id===ingredient.groceryItemId)return ingredient
   // Exact standard-name/alias matches are authoritative. This repairs stale
   // legacy links such as Gruyere Cheese -> generic Cheese and
   // Garlic Powder -> fresh Garlic without changing quantities or units.
   recipeChanged=true
   return {...ingredient,groceryItemId:matched.id}
  })
  if(!recipeChanged)return recipe
  changed=true
  return {...recipe,ingredients,updatedAt:recipe.updatedAt||new Date().toISOString()}
 })
 return {changed,repaired}
}

export function repairSavedRecipeIngredientLinks(){
 const recipes=rawCustomRecipes()
 const {changed,repaired}=repairIngredientLinks(recipes)
 if(changed)localStorage.setItem(KEY,JSON.stringify(repaired))
 localStorage.setItem(REPAIR_KEY,new Date().toISOString())
 return {changed,count:repaired.length}
}

export function getCustomRecipes(){
 const recipes=rawCustomRecipes()
 const {changed,repaired}=repairIngredientLinks(recipes)
 if(changed)localStorage.setItem(KEY,JSON.stringify(repaired))
 return repaired
}
export function saveCustomRecipe(recipe){const next=[...getCustomRecipes().filter(r=>r.id!==recipe.id),recipe];localStorage.setItem(KEY,JSON.stringify(next));return next}
export function getCustomRecipe(id){return getCustomRecipes().find(r=>r.id===id)}
export function deleteCustomRecipe(id){const next=getCustomRecipes().filter(r=>r.id!==id);localStorage.setItem(KEY,JSON.stringify(next));return next}
