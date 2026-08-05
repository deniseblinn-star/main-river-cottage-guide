import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import SharedPlannerBanner from '../shared/SharedPlannerBanner'
export default function AppShell({children}) {
  return <div className="min-h-screen bg-cream">
    <Sidebar/>
    <div className="lg:pl-64">
      <SharedPlannerBanner/>
      <TopBar/>
      <main className="max-w-7xl mx-auto px-4 py-5 pb-28 lg:pb-8">{children}</main>
    </div>
    <BottomNav/>
  </div>
}
