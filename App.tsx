import { myCreateRoot } from './utils/myCreateRoot'

function App() {
  return () => (
    <div>
      <h1>Hello, Remix 3 Renderer!</h1>
      <p>テスト</p>
    </div>
  )
}

myCreateRoot(document.getElementById('root')!).render(<App />)