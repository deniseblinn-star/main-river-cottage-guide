import { getStore } from '@netlify/blobs'
import { getUser, verifyRequestOrigin } from '@netlify/identity'

const STORE='main-river-planner'
const CURRENT='published/current'
const METADATA='metadata/current'

function safeTimestamp(value){return value.replace(/[:.]/g,'-')}

export default async (req) => {
  if(req.method!=='POST')return new Response('Method not allowed',{status:405,headers:{Allow:'POST'}})
  verifyRequestOrigin(req)
  const user=await getUser()
  if(!user)return new Response('Sign in required',{status:401})

  const store=getStore({name:STORE,consistency:'strong'})
  const existingMeta=await store.get(METADATA,{type:'json',consistency:'strong'})
  const email=user.email?.toLowerCase()
  if(existingMeta?.ownerEmail&&existingMeta.ownerEmail.toLowerCase()!==email){
    return new Response('Only the planner owner can publish.',{status:403})
  }

  let body
  try{body=await req.json()}catch{return new Response('Invalid JSON',{status:400})}
  if(!body?.localStorage||typeof body.localStorage!=='object')return new Response('Planner snapshot is missing',{status:400})

  const current=await store.get(CURRENT,{type:'json',consistency:'strong'})
  const revision=Number(existingMeta?.revision||0)+1
  const publishedAt=new Date().toISOString()
  if(current){
    await store.setJSON(`history/revision-${String(existingMeta.revision||0).padStart(5,'0')}-${safeTimestamp(existingMeta.publishedAt||publishedAt)}`,current)
  }
  const record={
    schemaVersion:'3.8.0',revision,publishedAt,
    publishedBy:user.user_metadata?.full_name||user.email,
    localStorage:body.localStorage
  }
  const metadata={schemaVersion:'3.8.0',revision,publishedAt,publishedBy:record.publishedBy,ownerEmail:user.email}
  await store.setJSON(CURRENT,record)
  await store.setJSON(METADATA,metadata)
  if(!existingMeta)await store.setJSON('master/initial',record)
  return Response.json({ok:true,...metadata})
}
