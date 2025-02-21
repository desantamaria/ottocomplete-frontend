import React from 'react'
import { Autocompletion } from './components/Autocompletion'
import { createRoot } from 'react-dom/client'

// Create and mount the monitoring component
const root = document.createElement('div')
root.id = '__otto_complete_container'
document.body.append(root)

createRoot(root).render(
  <React.StrictMode>
    <Autocompletion />
  </React.StrictMode>
)
