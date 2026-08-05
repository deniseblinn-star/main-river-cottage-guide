import { getStore } from '@netlify/blobs'
import { getUser } from '@netlify/identity'

export default async () => {
  const user=await getUser()
  if(!user)return Response.json({authenticated:false,canEdit:false})
  const store=getStore({name:'main-river-planner',consistency:'strong'})
  const metadata=await store.get('metadata/current',{type:'json',consistency:'strong'})
  const ownerEmail=metadata?.ownerEmail?.toLowerCase()
  const email=user.email?.toLowerCase()
  const isOwner=!ownerEmail||ownerEmail===email
  return Response.json({authenticated:true,canEdit:isOwner,email:user.email,name:user.user_metadata?.full_name||user.email,role:isOwner?'owner':'viewer'})
}
