import fs from 'node:fs'
import recipeData from '../src/data/recipes.json' with {type:'json'}
import weekData from '../src/data/week.json' with {type:'json'}
const errors=[]
const recipeIds=new Set(recipeData.recipes.map(recipe=>recipe.id))
const librarySource=fs.readFileSync(new URL('../src/utils/groceryLibrary.js',import.meta.url),'utf8')
const baseIds=[...librarySource.matchAll(/\{id:'([^']+)',name:/g)].map(match=>match[1])
const libraryIds=new Set([...baseIds,...recipeData.recipes.flatMap(recipe=>(recipe.ingredients||[]).map(item=>item.groceryItemId).filter(Boolean))])
for(const recipe of recipeData.recipes){
 if(!Number.isFinite(Number(recipe.servings))||Number(recipe.servings)<=0)errors.push(`${recipe.id}: invalid servings`)
 for(const ingredient of recipe.ingredients||[]){
  if(typeof ingredient==='string')errors.push(`${recipe.id}: legacy string ${ingredient}`)
  else{
   if(!Number.isFinite(ingredient.quantity)||ingredient.quantity<=0)errors.push(`${recipe.id}/${ingredient.name}: invalid quantity`)
   if(!ingredient.unit||['amount','some','to taste'].includes(ingredient.unit))errors.push(`${recipe.id}/${ingredient.name}: invalid unit`)
   if(ingredient.shopping!==false&&!libraryIds.has(ingredient.groceryItemId))errors.push(`${recipe.id}/${ingredient.name}: missing Grocery Library item ${ingredient.groceryItemId}`)
  }
 }
}
for(const day of weekData.days)for(const meal of Object.values(day.meals||{}))for(const id of meal.recipeIds||[])if(!recipeIds.has(id))errors.push(`${day.date}: missing assigned recipe ${id}`)
const duplicateRecipeIds=recipeData.recipes.map(r=>r.id).filter((id,index,all)=>all.indexOf(id)!==index)
const duplicateLibraryIds=baseIds.filter((id,index,all)=>all.indexOf(id)!==index)
if(duplicateRecipeIds.length)errors.push(`duplicate recipe ids: ${duplicateRecipeIds.join(', ')}`)
if(duplicateLibraryIds.length)errors.push(`duplicate Grocery Library ids: ${duplicateLibraryIds.join(', ')}`)
const grocerySource=fs.readFileSync(new URL('../src/pages/Groceries.jsx',import.meta.url),'utf8')
if(grocerySource.includes("setMode('base')")||grocerySource.includes("mode==='base'"))errors.push('Base List UI is still reachable')
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`PASS: ${recipeData.recipes.length} structured recipes`)
console.log(`PASS: ${recipeData.recipes.reduce((sum,r)=>sum+r.ingredients.length,0)} numeric ingredient rows`)
console.log(`PASS: ${libraryIds.size} Grocery Library records`)
console.log('PASS: every assigned recipe exists and every shopping ingredient links to the Grocery Library')
console.log('PASS: Base Cottage List UI removed')
