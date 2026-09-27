import { Navigate, Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './pages/Login.js'
import Signup from './pages/Signup.js'
import Home from './pages/Home.js'
import { useState } from 'react';
import RefreshHandler from './RefreshHandler.js';
import Students from './pages/Students.js'
import Student from './pages/Student.js'
import Teacher from './pages/Teacher.js'
import Admin from './pages/Admin.js'
import AddStudent from './pages/AddStudent.js'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const getDashboard = () => {
    const role = localStorage.getItem('role');

    if (role === 'student') {
      return '/student';
    }

    if (role === 'teacher') {
      return '/teacher';
    }

    if (role === 'admin') {
      return '/admin';
    }

    return '/login';
  };

  const PrivateRoute = ({ element, allowedRoles }) => {
    const role = localStorage.getItem('role');

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(role)) {
      return <Navigate to={getDashboard()} replace />;
    }

    return element;
  };

  return (
    <div className="App">
      <RefreshHandler setIsAuthenticated={setIsAuthenticated} />

      <Routes>
        
        <Route path='/' element={<Navigate to="/login" />} />

        <Route path='/login' element={<Login />} />

        <Route path='/signup' element={<Signup />} />

        <Route
          path='/home'
          element={
            <PrivateRoute
              element={<Home />}
              allowedRoles={['student', 'teacher', 'admin']}
            />
          }
        />

        <Route
          path='/student'
          element={
            <PrivateRoute
              element={<Student />}
              allowedRoles={['student']}
            />
          }
        />

        <Route
          path='/teacher'
          element={
            <PrivateRoute
              element={<Teacher />}
              allowedRoles={['teacher']}
            />
          }
        />

        <Route
          path='/admin'
          element={
            <PrivateRoute
              element={<Admin />}
              allowedRoles={['admin']}
            />
          }
        />

        <Route
          path='/students'
          element={
            <PrivateRoute
              element={<Students />}
              allowedRoles={['admin']}
            />
          }
        />

        <Route
        path='/students/add'
        element={
        <PrivateRoute
          element={<AddStudent />}
          allowedRoles={['admin']}
            />
          }
        />

      </Routes>
    </div>
  )
}

export default App;
