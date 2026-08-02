import { Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'
import WeeklyPlanner from './pages/WeeklyPlanner'
import PlannerV3 from './pages/PlannerV3'
import PeopleV3 from './pages/PeopleV3'
import OverallEvents from './pages/OverallEvents'
import Accommodations from './pages/Accommodations'
import DailyPlanner from './pages/DailyPlanner'
import Recipes from './pages/Recipes'
import RecipeEngine from './pages/RecipeEngine'
import RecipeDetail from './pages/RecipeDetail'
import AddRecipe from './pages/AddRecipe'
import Groceries from './pages/Groceries'
import Guests from './pages/Guests'
import SmokerHQ from './pages/SmokerHQ'
import Hosting from './pages/Hosting'
import Settings from './pages/Settings'
import Events from './pages/Events'
import Photos from './pages/Photos'
export default function App() {
  return <AppShell><Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/planner" element={<PlannerV3 />} />
    <Route path="/legacy-planner" element={<WeeklyPlanner />} />
    <Route path="/daily" element={<DailyPlanner />} />
    <Route path="/daily/:dayId" element={<DailyPlanner />} />
    <Route path="/recipes" element={<Recipes />} />
    <Route path="/recipes/new" element={<AddRecipe />} />
    <Route path="/recipes/:id/edit" element={<AddRecipe />} />
    <Route path="/recipe-engine" element={<RecipeEngine />} />
    <Route path="/recipes/:id" element={<RecipeDetail />} />
    <Route path="/groceries" element={<Groceries />} />
    <Route path="/guests" element={<PeopleV3 />} />
    <Route path="/people" element={<PeopleV3 />} />
    <Route path="/gathering" element={<OverallEvents />} />
    <Route path="/accommodations" element={<Accommodations />} />
    <Route path="/smoker" element={<SmokerHQ />} />
    <Route path="/hosting" element={<Hosting />} />
    <Route path="/events" element={<Events />} />
        <Route path="/photos" element={<Photos />} />
        <Route path="/settings" element={<Settings />} />
  </Routes></AppShell>
}
