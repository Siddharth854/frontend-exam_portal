import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function RefreshHandler({ setIsAuthenticated }) {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (token) {
            setIsAuthenticated(true);

            if (
                location.pathname === '/' ||
                location.pathname === '/login' ||
                location.pathname === '/signup'
            ) {
                if (role === 'student') {
                    navigate('/student', { replace: true });
                } 
                else if (role === 'teacher') {
                    navigate('/teacher', { replace: true });
                } 
                else if (role === 'admin') {
                    navigate('/admin', { replace: true });
                } 
                else {
                    navigate('/login', { replace: true });
                }
            }
        } else {
            setIsAuthenticated(false);
        }
    }, [location, navigate, setIsAuthenticated]);

    return null;
}

export default RefreshHandler;

// import React, { useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';

// function RefreshHandler({ setIsAuthenticated }) {
//     const location = useLocation();
//     const navigate = useNavigate();

//     useEffect(() => {
//         const token = localStorage.getItem('token');
//         const role = localStorage.getItem('role');

//         if (token) {
//             setIsAuthenticated(true);

//             if (
//                 location.pathname === '/' ||
//                 location.pathname === '/login' ||
//                 location.pathname === '/signup'
//             ) {
//                 if (role === 'student') {
//                     navigate('/student', { replace: true });
//                 } 
//                 else if (role === 'teacher') {
//                     navigate('/teacher', { replace: true });
//                 } 
//                 else {
//                     navigate('/home', { replace: true });
//                 }
//             }
//         }
//     }, [location, navigate, setIsAuthenticated]);

//     return null;
// }

// export default RefreshHandler;