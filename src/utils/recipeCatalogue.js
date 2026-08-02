import data from '../data/recipes.json'
import { deleteCustomRecipe, getCustomRecipe, getCustomRecipes, saveCustomRecipe } from './customRecipes'

const DELETED_KEY='main-river-deleted-built-in-recipes'

function getDeletedBuiltIns(){
 try{return JSON.parse(localStorage.getItem(DELETED_KEY)||'[]')}
 catch{return []}
}

function saveDeletedBuiltIns(ids){
 localStorage.setItem(DELETED_KEY,JSON.stringify(ids))
}

export function getRecipeCatalogue(){
 const custom=getCustomRecipes()
 const customById=new Map(custom.map(recipe=>[recipe.id,recipe]))
 const deleted=new Set(getDeletedBuiltIns())
 const builtIns=data.recipes
  .filter(recipe=>!deleted.has(recipe.id))
  .map(recipe=>customById.get(recipe.id)||{...recipe,builtIn:true})
 const builtInIds=new Set(data.recipes.map(recipe=>recipe.id))
 const customOnly=custom.filter(recipe=>!builtInIds.has(recipe.id)).map(recipe=>({...recipe,builtIn:false}))
 return [...builtIns,...customOnly]
}

export function getCatalogueRecipe(id){
 return getRecipeCatalogue().find(recipe=>recipe.id===id)
}

export function copyRecipe(id){
 const source=getCatalogueRecipe(id)
 if(!source)return null
 const copy={
  ...source,
  id:`custom-${Date.now()}`,
  title:`${source.title} Copy`,
  builtIn:false,
  createdAt:new Date().toISOString(),
  updatedAt:new Date().toISOString()
 }
 delete copy.originalId
 saveCustomRecipe(copy)
 return copy
}

export function deleteRecipe(id){
 const builtIn=data.recipes.some(recipe=>recipe.id===id)
 if(builtIn){
  deleteCustomRecipe(id)
  const deleted=new Set(getDeletedBuiltIns())
  deleted.add(id)
  saveDeletedBuiltIns([...deleted])
  return getRecipeCatalogue()
 }
 return deleteCustomRecipe(id)
}

export function restoreBuiltInRecipe(id){
 const deleted=new Set(getDeletedBuiltIns())
 deleted.delete(id)
 saveDeletedBuiltIns([...deleted])
 deleteCustomRecipe(id)
 return getRecipeCatalogue()
}
