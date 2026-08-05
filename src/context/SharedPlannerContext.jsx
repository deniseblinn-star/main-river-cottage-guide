import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import netlifyIdentity from 'netlify-identity-widget'
import { capturePlannerStorage, OWNER_DEVICE_KEY, SHARED_REVISION_KEY } from '../utils/sharedPlanner'

const SharedPlannerContext=createContext(null)

export function SharedPlannerProvider({children}){
  const [user,setUser]=useState(null)
  const [access,setAccess]=useState({authenticated:false,canEdit:false,role:'viewer'})
  const [shared,setShared]=useState(()=>window.__MAIN_RIVER_SHARED__||{available:false,online:false})
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)

  const refreshAccess=async currentUser=>{
    if(!currentUser){setAccess({authenticated:false,canEdit:false,role:'viewer'});return}
    try{
      const jwt=await netlifyIdentity.refresh()
      const response=await fetch('/.netlify/functions/planner-access',{headers:{Authorization:`Bearer ${jwt}`},cache:'no-store'})
      const next=await response.json()
      setAccess(next)
      if(next.canEdit)localStorage.setItem(OWNER_DEVICE_KEY,'1')
      else localStorage.removeItem(OWNER_DEVICE_KEY)
    }catch{setAccess({authenticated:true,canEdit:false,role:'viewer'})}
  }

  useEffect(()=>{
    netlifyIdentity.init()
    const onInit=current=>{setUser(current);refreshAccess(current)}
    const onLogin=current=>{setUser(current);netlifyIdentity.close();refreshAccess(current)}
    const onLogout=()=>{setUser(null);setAccess({authenticated:false,canEdit:false,role:'viewer'});localStorage.removeItem(OWNER_DEVICE_KEY)}
    netlifyIdentity.on('init',onInit);netlifyIdentity.on('login',onLogin);netlifyIdentity.on('logout',onLogout)
    return()=>{netlifyIdentity.off('init',onInit);netlifyIdentity.off('login',onLogin);netlifyIdentity.off('logout',onLogout)}
  },[])

  useEffect(()=>{
    if(access.canEdit)return
    const block=e=>{
      const target=e.target
      const input=target.closest?.('input,textarea,select')
      if(input){
        const searchable=input.type==='search'||/search/i.test(input.placeholder||'')
        if(!searchable){e.preventDefault();e.stopPropagation();setMessage('This is the published family view. Send changes to Denise.');setTimeout(()=>setMessage(''),3500)}
        return
      }
      const button=target.closest?.('button')
      if(button){
        const text=`${button.textContent||''} ${button.title||''}`.toLowerCase()
        if(/add|edit|delete|remove|save|create|copy|reset|clear|assign|unplanned|restaurant|simple plan|planned/.test(text)){
          e.preventDefault();e.stopPropagation();setMessage('This is the published family view. Send changes to Denise.');setTimeout(()=>setMessage(''),3500)
        }
      }
    }
    document.addEventListener('click',block,true)
    document.addEventListener('change',block,true)
    return()=>{document.removeEventListener('click',block,true);document.removeEventListener('change',block,true)}
  },[access.canEdit])

  const publish=async()=>{
    setBusy(true);setMessage('Publishing…')
    try{
      const jwt=await netlifyIdentity.refresh()
      const response=await fetch('/.netlify/functions/planner-publish',{
        method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${jwt}`},
        body:JSON.stringify({localStorage:capturePlannerStorage()})
      })
      if(!response.ok)throw new Error(await response.text())
      const data=await response.json()
      localStorage.setItem(SHARED_REVISION_KEY,String(data.revision))
      localStorage.setItem(OWNER_DEVICE_KEY,'1')
      setShared({available:true,online:true,revision:data.revision,publishedAt:data.publishedAt,publishedBy:data.publishedBy})
      setMessage(`Published revision ${data.revision}.`)
    }catch(error){setMessage(error.message||'Publish failed.')}
    finally{setBusy(false);setTimeout(()=>setMessage(''),5000)}
  }

  const value=useMemo(()=>({user,access,shared,message,busy,publish,login:()=>netlifyIdentity.open('login'),logout:()=>netlifyIdentity.logout()}),[user,access,shared,message,busy])
  return <SharedPlannerContext.Provider value={value}>{children}</SharedPlannerContext.Provider>
}

export function useSharedPlanner(){return useContext(SharedPlannerContext)}
