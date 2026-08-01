import ingredientsData from '../data/ingredients.json'
import data from '../data/recipeEngine.json'
const im=Object.fromEntries(ingredientsData.ingredients.map(i=>[i.id,i]))
const rm=Object.fromEntries(data.recipes.map(r=>[r.id,r]))
const round=(v,m)=>m==='whole-up'?Math.ceil(v):Math.round(v*100)/100
export function getScaledRecipe(a){const r=rm[a.recipeId],s=a.attendance/r.yield.quantity;return{assignment:a,recipe:r,scale:s,ingredients:r.ingredients.map(x=>({...x,ingredient:im[x.ingredientId],scaledQuantity:round(x.quantity*s,x.rounding)}))}}
export function getRecipeEngineData(){return data}
export function getGeneratedGroceries(){const out=[];for(const a of data.mealAssignments){const x=getScaledRecipe(a);for(const i of x.ingredients){if(!i.shopping)continue;out.push({id:`gen-${a.id}-${i.ingredientId}`,name:i.ingredient.name,quantity:i.scaledQuantity,unit:i.unit,department:i.ingredient.category,store:i.ingredient.preferredStore,source:'recipe',notes:i.ingredient.purchaseNote||'',sources:[{recipe:x.recipe.name,meal:a.mealName,attendance:a.attendance}]})}}return out}
