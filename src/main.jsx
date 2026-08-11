import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { SharedPlannerProvider } from './context/SharedPlannerContext.jsx'
import { bootstrapSharedPlanner } from './utils/sharedPlanner.js'
import './index.css'

async function startApp(){
  await bootstrapSharedPlanner()
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode><BrowserRouter><SharedPlannerProvider><App /></SharedPlannerProvider></BrowserRouter></React.StrictMode>
  )
}

startApp()
