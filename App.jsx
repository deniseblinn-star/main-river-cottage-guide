export const dateLabel=d=>new Date(d+'T12:00:00').toLocaleDateString('en-CA',{month:'short',day:'numeric'})
export const guestsForDate=(guests,date)=>guests.filter(g=>g.arrival<=date&&g.departure>=date)
export const getDaysUntil=(start,end)=>{
 const now=new Date(); now.setHours(0,0,0,0)
 const s=new Date(start+'T00:00:00'), e=new Date(end+'T23:59:59')
 if(now<s) return {label:`${Math.ceil((s-now)/86400000)} days to go`,state:'before'}
 if(now<=e) return {label:'Cottage Week!',state:'during'}
 return {label:'See you next year!',state:'after'}
}
