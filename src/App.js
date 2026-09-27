import {Navigate, Routes, Route} from 'react-router-dom'
import './App.css'
import Login from './pages/Login.js'
import Signup from './pages/Signup.js'
import Home from './pages/Home.js'
import { useState } from 'react';
import RefreshHandler from './RefreshHandler.js';  
import Student from './pages/Student.js'
import Teacher from './pages/Teacher.js'
import Admin from './pages/Admin.js'

function App() {
  const [isAuthenticated, setIsAuthenticated] =useState(false);
  
  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  }
  return (
    <div className="App">
      <RefreshHandler setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path='/' element={<Navigate to="/login" />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/home' element={<PrivateRoute element={<Home />} /> } />
        <Route path='/student' element={<PrivateRoute element={<Student />} />} />
        <Route path='/teacher' element={<PrivateRoute element={<Teacher />} />} />
        <Route path='/admin' element={<PrivateRoute element={<Admin />} />} />
        
      </Routes>
    </div>  
  )
}

export default App;