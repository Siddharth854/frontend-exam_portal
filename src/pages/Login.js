import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import './Auth.css';

function Login() {
    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        setLoginInfo((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        const { email, password } = loginInfo;

        if (!email || !password) {
            return handleError('Please fill in all fields');
        }

        try {
            const response = await fetch(
                'https://backend-exam-paper.vercel.app/auth/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loginInfo)
                }
            );

            const result = await response.json();

            const {
                success,
                message,
                jwtToken,
                name,
                email: accountEmail,
                role,
                error
            } = result;

            if (success) {
                handleSuccess(message || 'Login successful');

                localStorage.setItem('token', jwtToken);
                localStorage.setItem('loggedInUser', name);
                localStorage.setItem('studentEmail', accountEmail);
                localStorage.setItem('role', role);

                setTimeout(() => {
                    if (role === 'student') {
                        navigate('/student');
                    } else if (role === 'teacher') {
                        navigate('/teacher');
                    } else if (role === 'admin') {
                        navigate('/admin');
                    } else {
                        navigate('/home');
                    }
                }, 1000);
            } else if (error) {
                const details = error?.details?.[0]?.message;
                handleError(details || message || 'Login failed');
            } else {
                handleError(message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            handleError('An error occurred while logging in');
        }
    };

    return (
        <div className="auth-page">
            <div className="container">
                <h1>Login</h1>

                <form onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            onChange={handleChange}
                            type="email"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            placeholder="Enter your email address"
                            value={loginInfo.email}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            onChange={handleChange}
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            value={loginInfo.password}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button className="auth-button" type="submit">
                        SIGN IN
                    </button>
                    {/* make it uncomment only when you want to make student refgistration public else  don't touch */}
                    {/* <span>
                        Don't have an account? <Link to="/signup">Create one</Link>
                    </span> */}
                </form>

                <ToastContainer />
            </div>
        </div>
    );
}

export default Login;
