import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import Data from './Pages/Data'
import {Scene} from './sections/Rocket';
const App = () => {
  return (
    <div>
      <Routes>
        <Route element={<Home/>} path='/' />
        <Route element={<Data/>} path='/data' />
        <Route element={<Scene/>} path='/model' />
      </Routes>
    </div>
  )
}

export default App