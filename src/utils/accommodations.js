export const accommodationSeed=[
 {id:'denise-cottage',name:"Denise & Steve's Cottage",type:'Cottage',rooms:[
  {id:'denise-master',name:'Master Bedroom',spaces:[{id:'denise-master-queen',name:'Queen Bed',type:'Queen',capacity:2}]},
  {id:'denise-bedroom-2',name:'Bedroom 2',spaces:[{id:'denise-bedroom-2-queen',name:'Queen Bed',type:'Queen',capacity:2}]},
  {id:'denise-bedroom-3',name:'Bedroom 3',spaces:[{id:'denise-bedroom-3-double',name:'Double Bed',type:'Double',capacity:2},{id:'denise-bedroom-3-twin',name:'Twin Bed',type:'Twin',capacity:1}]},
  {id:'denise-living-room',name:'Living Room',spaces:[{id:'denise-couch',name:'Couch',type:'Couch',capacity:1}]}
 ]},
 {id:'danielle-cottage',name:"Danielle & Kevin's Cottage",type:'Cottage',rooms:[
  {id:'danielle-master',name:'Master Bedroom',spaces:[{id:'danielle-master-queen',name:'Queen Bed',type:'Queen',capacity:2}]},
  {id:'danielle-bedroom-2',name:'Bedroom 2',spaces:[{id:'danielle-bedroom-2-double',name:'Double Bed',type:'Double',capacity:2}]},
  {id:'danielle-bedroom-3',name:'Bedroom 3',spaces:[{id:'danielle-bedroom-3-double',name:'Double Bed',type:'Double',capacity:2}]},
  {id:'danielle-living-room',name:'Living Room',spaces:[{id:'danielle-couch',name:'Couch',type:'Couch',capacity:1}]}
 ]},
 {id:'catherine-cottage',name:"Catherine's Cottage",type:'Rental Cottage',rooms:[1,2,3,4].map(n=>({id:`catherine-bedroom-${n}`,name:`Bedroom ${n}`,spaces:[{id:`catherine-bedroom-${n}-double`,name:'Double Bed',type:'Double',capacity:2}]}))},
 {id:'trailer-1',name:'Trailer 1',type:'Trailer',rooms:[{id:'trailer-1-main',name:'Trailer',spaces:[1,2,3].map(n=>({id:`trailer-1-double-${n}`,name:`Double Bed ${n}`,type:'Double',capacity:2}))}]},
 {id:'trailer-2',name:'Trailer 2',type:'Trailer',rooms:[{id:'trailer-2-main',name:'Trailer',spaces:[1,2,3].map(n=>({id:`trailer-2-double-${n}`,name:`Double Bed ${n}`,type:'Double',capacity:2}))}]}
]

export const flattenSpaces=accommodations=>accommodations.flatMap(accommodation=>accommodation.rooms.flatMap(room=>room.spaces.map(space=>({...space,roomId:room.id,roomName:room.name,accommodationId:accommodation.id,accommodationName:accommodation.name}))))

export const eventNights=event=>{
 if(!event?.startDate||!event?.endDate)return []
 const nights=[]
 const cursor=new Date(`${event.startDate}T12:00:00`)
 const end=new Date(`${event.endDate}T12:00:00`)
 while(cursor<end){nights.push(cursor.toISOString().slice(0,10));cursor.setDate(cursor.getDate()+1)}
 return nights
}

export const presentForNight=(attendance,date)=>{
 if(!attendance?.arrival||!attendance?.departure)return false
 const nightStart=new Date(`${date}T18:00:00`)
 const next=new Date(`${date}T18:00:00`);next.setDate(next.getDate()+1);next.setHours(10,0,0,0)
 const arrival=new Date(attendance.arrival)
 const departure=new Date(attendance.departure)
 return arrival<next&&departure>nightStart
}

export const assignedSpaceFor=(event,date,profileId)=>{
 const nightly=event?.nightlyBedOverrides?.[date]||{}
 if(Object.prototype.hasOwnProperty.call(nightly,profileId))return nightly[profileId]||''
 return event?.defaultBedAssignments?.[profileId]||''
}

export const accommodationCapacity=accommodation=>accommodation.rooms.reduce((total,room)=>total+room.spaces.reduce((sum,space)=>sum+Number(space.capacity||0),0),0)
