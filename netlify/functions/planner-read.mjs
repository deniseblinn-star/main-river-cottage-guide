import { getStore } from '@netlify/blobs'

const STORE='main-river-planner'
const CURRENT='published/current'

export default async () => {
  const store=getStore({name:STORE,consistency:'strong'})
  const current=await store.get(CURRENT,{type:'json',consistency:'strong'})
  if(!current){
    return Response.json({available:false,message:'No shared planner has been published yet.'},{status:404,headers:{'Cache-Control':'no-store'}})
  }
  return Response.json({available:true,...current},{headers:{'Cache-Control':'no-store'}})
}
