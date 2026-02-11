import { createRoot } from '@remix-run/component'

function App() {
  return () => (
    <div>test</div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)