import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Cutout from './CutoutUI'

function App() {
  const [count, setCount] = useState(0)

  return <Cutout />;
}

export default App
