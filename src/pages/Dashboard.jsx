import { Link } from 'react-router-dom'
import { CalendarDays, ShoppingCart, BookOpen, Users, Flame, ClipboardCheck, AlertTriangle } from 'lucide-react'
import week from '../data/week.json'
import guestData from '../data/guests.json'
import groceryData from '../data/groceries.json'
import { getDaysUntil } from '../utils'
import PhotoRail from '../components/PhotoRail'

export default function Dashboard(){
 const c=getDaysUntil(guestData.cottageDates.start,guestData.cottageDates.end)
 const checked=JSON.parse(localStorage.getItem('cottage-groceries-checked')||'{}')
 const done=Object.values(checked).filter(Boolean).length, total=groceryData.items.length
 const links=[['/planner',CalendarDays,'Week'],['/groceries',ShoppingCart,'Groceries'],['/recipes',BookOpen,'Recipes'],['/guests',Users,'Guests'],['/smoker',Flame,'Smoker HQ'],['/hosting',ClipboardCheck,'Hosting']]

 return <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_290px] xl:gap-6 xl:items-start">
  <div className="space-y-5 min-w-0">
    <section className="rounded-3xl bg-gradient-to-br from-forest to-forest-800 text-white p-6 shadow-card">
      <p className="text-sm opacity-80">August 22–30, 2026</p>
      <h2 className="text-3xl font-extrabold mt-1">{c.label}</h2>
      <p className="mt-2 opacity-90">Updated food plan, guest schedule, shopping and cooking schedules for Main River.</p>
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

    <PhotoRail/>

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
