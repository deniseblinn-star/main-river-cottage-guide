import { Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'
import WeeklyPlanner from './pages/WeeklyPlanner'
import DailyPlanner from './pages/DailyPlanner'
import Recipes from './pages/Recipes'
import RecipeEngine from './pages/RecipeEngine'
import RecipeDetail from './pages/RecipeDetail'
import AddRecipe from './pages/AddRecipe'
import Groceries from './pages/Groceries'
import Guests from './pages/Guests'
import SmokerHQ from './pages/SmokerHQ'
import Settings from './pages/Settings'
import Events from './pages/Events'
import Photos from './pages/Photos'
import OverallEvents from './pages/OverallEvents'
import PeopleAttendance from './pages/PeopleAttendance'
import Accommodations from './pages/Accommodations'
import OperationsReport from './pages/OperationsReport'
import { EventProvider } from './context/EventContext'

export default function App(){
 return <EventProvider><AppShell><Routes>
  <Route path="/" element={<Dashboard/>}/>
  <Route path="/overall-events" element={<OverallEvents/>}/>
  <Route path="/people" element={<PeopleAttendance/>}/>
  <Route path="/accommodations" element={<Accommodations/>}/>
  <Route path="/planner" element={<WeeklyPlanner/>}/>
  <Route path="/daily" element={<DailyPlanner/>}/>
  <Route path="/daily/:dayId" element={<DailyPlanner/>}/>
  <Route path="/recipes" element={<Recipes/>}/>
  <Route path="/recipes/new" element={<AddRecipe/>}/>
  <Route path="/recipes/:id/edit" element={<AddRecipe/>}/>
  <Route path="/recipe-engine" element={<RecipeEngine/>}/>
  <Route path="/recipes/:id" element={<RecipeDetail/>}/>
  <Route path="/groceries" element={<Groceries/>}/>
  <Route path="/guests" element={<Guests/>}/>
  <Route path="/smoker" element={<SmokerHQ/>}/>
  <Route path="/events" element={<Events/>}/>
  <Route path="/photos" element={<Photos/>}/>
  <Route path="/report" element={<OperationsReport/>}/>
  <Route path="/settings" element={<Settings/>}/>
 </Routes></AppShell></EventProvider>
}
