import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const root = document.createElement('div')
root.id = '__otto_complete_container'
document.body.append(root)

createRoot(root).render(
  <StrictMode>
    <></>
  </StrictMode>
)
