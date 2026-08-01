const KEY='main-river-custom-recipes'
export function getCustomRecipes(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}}
export function saveCustomRecipe(recipe){const next=[...getCustomRecipes().filter(r=>r.id!==recipe.id),recipe];localStorage.setItem(KEY,JSON.stringify(next));return next}
export function getCustomRecipe(id){return getCustomRecipes().find(r=>r.id===id)}
export function deleteCustomRecipe(id){const next=getCustomRecipes().filter(r=>r.id!==id);localStorage.setItem(KEY,JSON.stringify(next));return next}
