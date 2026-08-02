import { Link } from 'react-router-dom'
import { CalendarDays, ShoppingCart, BookOpen, Users, Flame, AlertTriangle, CalendarHeart, BedDouble, Clock, MapPin } from 'lucide-react'
import week from '../data/week.json'
import groceryData from '../data/groceries.json'
import { getDaysUntil } from '../utils'
import PhotoRail from '../components/PhotoRail'
import { useEvent } from '../context/EventContext'
import { activityDateLabel, activityTimeLabel } from '../utils/activities'

export default function Dashboard(){
 const {activeEvent,activityTemplates}=useEvent()
 const c=getDaysUntil(activeEvent?.startDate||'2026-08-22',activeEvent?.endDate||'2026-08-30')
 const checked=JSON.parse(localStorage.getItem('cottage-groceries-checked')||'{}')
 const done=Object.values(checked).filter(Boolean).length, total=groceryData.items.length
 const links=[
  ['/planner',CalendarDays,'Meal Planner'],
  ['/groceries',ShoppingCart,'Groceries'],
  ['/recipes',BookOpen,'Recipes'],
  ['/people',Users,'People'],
  ['/accommodations',BedDouble,'Accommodations'],
  ['/events',CalendarHeart,'Activities']
 ]
 const templateMap=Object.fromEntries((activityTemplates||[]).map(item=>[item.id,item]))
 const activities=[...(activeEvent?.activityInstances||[])]
   .sort((a,b)=>`${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))
   .slice(0,5)

 return <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_290px] xl:gap-6 xl:items-start">
  <div className="space-y-5 min-w-0">
    <section className="rounded-3xl bg-gradient-to-br from-forest to-forest-800 text-white p-6 shadow-card">
      <p className="text-sm opacity-80">{activeEvent?.startDate}–{activeEvent?.endDate}</p>
      <h2 className="text-3xl font-extrabold mt-1">{c.label}</h2>
      <p className="mt-2 opacity-90">{activeEvent?.name||'Main River Cottage Planner'}</p>
    </section>

    <div className="grid grid-cols-2 gap-3">
      <div className="card"><p className="section-title">Saturday guests</p><p className="text-xl font-extrabold text-navy">{week.days[0].guestCountLabel}</p></div>
      <div className="card"><p className="section-title">Shopping</p><p className="text-3xl font-extrabold text-forest">{Math.round(done/total*100)||0}%</p></div>
    </div>

    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
      <AlertTriangle className="text-amber-600 shrink-0"/>
      <div><b>Gluten-free plan</b><p className="text-sm text-amber-800">Steve and Adele need separate utensils, prep and serving items.</p></div>
    </div>

    <section>
      <h3 className="section-title mb-3">Quick links</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {links.map(([to,I,t])=><Link key={to} to={to} className="card card-hover flex items-center gap-3"><I className="text-forest"/><b>{t}</b></Link>)}
      </div>
    </section>

    <section>
      <div className="flex justify-between items-center mb-3">
        <h3 className="section-title">Upcoming activities</h3>
        <Link to="/events" className="text-sm font-semibold text-forest">View all</Link>
      </div>
      <div className="space-y-2">
        {activities.map(activity=>{
          const template=templateMap[activity.templateId]
          return <Link to="/events" key={activity.id} className="card card-hover block">
            <div className="flex flex-wrap justify-between gap-2">
              <div><b className="text-navy">{template?.name||'Activity'}</b><p className="text-sm text-stone mt-1">{template?.description||''}</p></div>
              <span className="badge-forest">{template?.category||'Activity'}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-stone mt-3">
              <span className="flex items-center gap-1"><Clock size={14}/>{activityDateLabel(activity.date)} · {activityTimeLabel(activity.startTime)}</span>
              {activity.location&&<span className="flex items-center gap-1"><MapPin size={14}/>{activity.location}</span>}
              <span>{(activity.attendeeIds||[]).length} participants</span>
              <span>{(activity.linkedMealSlotIds||[]).length} linked meals</span>
            </div>
          </Link>
        })}
        {!activities.length&&<div className="card text-center text-stone">No activities scheduled yet.</div>}
      </div>
    </section>

    <section>
      <h3 className="section-title mb-3">This week</h3>
      <div className="space-y-2">
        {week.days.map(d=><Link to={`/daily/${d.id}`} key={d.id} className="card flex justify-between items-center">
          <div><b>{d.label}</b><p className="text-sm text-stone">{d.meals.dinner.items.slice(0,3).join(' • ')}</p></div>
          <span className="badge-navy">{d.guestCount} guests</span>
        </Link>)}
      </div>
    </section>
  </div>
  <PhotoRail/>
 </div>
}
