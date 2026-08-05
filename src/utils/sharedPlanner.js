export const SHARED_REVISION_KEY='main-river-shared-revision'
export const OWNER_DEVICE_KEY='main-river-owner-device'
export const SHARED_CACHE_KEY='main-river-shared-cache'

const EXCLUDED_KEYS=[
  SHARED_REVISION_KEY,OWNER_DEVICE_KEY,SHARED_CACHE_KEY,
  'gotrue.user','netlify-identity-user','netlifySiteURL'
]

function isIdentityKey(key){
  return key.startsWith('netlify')||key.startsWith('gotrue')||key.includes('nf_jwt')||key.includes('nf_refresh')
}

export function isPlannerStorageKey(key){
  return Boolean(key)&&!EXCLUDED_KEYS.includes(key)&&!isIdentityKey(key)
}

export function capturePlannerStorage(){
  const local={}
  for(let i=0;i<localStorage.length;i+=1){
    const key=localStorage.key(i)
    if(isPlannerStorageKey(key))local[key]=localStorage.getItem(key)
  }
  return local
}

export function applyPlannerStorage(values){
  const preserved={}
  for(let i=0;i<localStorage.length;i+=1){
    const key=localStorage.key(i)
    if(!isPlannerStorageKey(key))preserved[key]=localStorage.getItem(key)
  }
  Object.keys(localStorage).filter(isPlannerStorageKey).forEach(key=>localStorage.removeItem(key))
  Object.entries(values||{}).forEach(([key,value])=>{
    if(isPlannerStorageKey(key)&&typeof value==='string')localStorage.setItem(key,value)
  })
  Object.entries(preserved).forEach(([key,value])=>value!==null&&localStorage.setItem(key,value))
}

export async function bootstrapSharedPlanner(){
  const result={available:false,online:false,hydrated:false,error:''}
  try{
    const response=await fetch('/.netlify/functions/planner-read',{cache:'no-store'})
    if(response.status===404){window.__MAIN_RIVER_SHARED__=result;return result}
    if(!response.ok)throw new Error(`Shared planner read failed (${response.status})`)
    const data=await response.json()
    result.available=true;result.online=true;result.revision=data.revision;result.publishedAt=data.publishedAt;result.publishedBy=data.publishedBy
    const ownerDevice=localStorage.getItem(OWNER_DEVICE_KEY)==='1'
    const localRevision=Number(localStorage.getItem(SHARED_REVISION_KEY)||0)
    const shouldHydrate=!ownerDevice||Number(data.revision)>localRevision
    if(shouldHydrate){
      applyPlannerStorage(data.localStorage)
      localStorage.setItem(SHARED_REVISION_KEY,String(data.revision))
      localStorage.setItem(SHARED_CACHE_KEY,JSON.stringify(data))
      result.hydrated=true
    }
  }catch(error){
    result.error=error.message
    try{
      const cached=JSON.parse(localStorage.getItem(SHARED_CACHE_KEY)||'null')
      if(cached){result.available=true;result.revision=cached.revision;result.publishedAt=cached.publishedAt;result.publishedBy=cached.publishedBy;result.offline=true}
    }catch{}
  }
  window.__MAIN_RIVER_SHARED__=result
  return result
}
