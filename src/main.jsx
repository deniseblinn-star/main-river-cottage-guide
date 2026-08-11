import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { SharedPlannerProvider } from './context/SharedPlannerContext.jsx'
import { bootstrapSharedPlanner } from './utils/sharedPlanner.js'
import './index.css'

async function startApp() {
  await bootstrapSharedPlanner()

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode><BrowserRouter><SharedPlannerProvider><App /></SharedPlannerProvider></BrowserRouter></React.StrictMode>
  )
}

startApp().catch(error => {
  console.error('Failed to start Main River Cottage Planner', error)
  ReactDOM.createRoot(document.getElementById('root')).render(
    <div style={{padding:'2rem',fontFamily:'system-ui,sans-serif'}}>
      <h1>Main River Cottage Planner</h1>
      <p>The planner could not finish starting. Refresh the page and try again.</p>
    </div>
  )
})
