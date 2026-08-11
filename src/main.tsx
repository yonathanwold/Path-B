import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import '@fontsource/newsreader/latin-500.css'
import '@fontsource/newsreader/latin-600.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app/App'
import './styles/global.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Path B could not find its root element.')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
