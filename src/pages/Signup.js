import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import './Auth.css';

function Signup() {
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student'
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        setSignupInfo((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        const { name, email, password, role } = signupInfo;

        if (!name || !email || !password || !role) {
            return handleError('Please fill in all fields');
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail.endsWith('@muj.manipal.edu')) {
            return handleError(
                'Please use your university email ending with @muj.manipal.edu'
            );
        }

        try {
            const response = await fetch(
                'https://backend-exam-paper.vercel.app/auth/signup',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ...signupInfo,
                        email: normalizedEmail
                    })
                }
            );

            const result = await response.json();
            const { success, message, error } = result;

            if (success) {
                handleSuccess('Signup successful');

                setTimeout(() => {
                    navigate('/login');
                }, 1000);
            } else if (error) {
                const details = error?.details?.[0]?.message || message;
                handleError(details || 'Signup failed');
            } else {
                handleError(message || 'Signup failed');
            }
        } catch (err) {
            console.error('Signup error:', err);
            handleError('An error occurred while signing up');
        }
    };

    return (
        <div className="auth-page">
            <div className="container">
                <h1>Create Account</h1>

                <form onSubmit={handleSignup}>
                    <div>
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            onChange={handleChange}
                            type="text"
                            name="name"
                            autoComplete="name"
                            autoFocus
                            placeholder="Enter your full name"
                            value={signupInfo.name}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="email">University Email</label>
                        <input
                            id="email"
                            onChange={handleChange}
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={signupInfo.email}
                            placeholder="username@muj.manipal.edu"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="role">Account Type</label>
                        <select
                            id="role"
                            name="role"
                            value={signupInfo.role}
                            onChange={handleChange}
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            onChange={handleChange}
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            value={signupInfo.password}
                            placeholder="Create a password"
                            required
                        />
                    </div>

                    <button className="auth-button" type="submit">
                        CREATE ACCOUNT
                    </button>

                    <span>
                        Already have an account? <Link to="/login">Sign in</Link>
                    </span>
                </form>

                <ToastContainer />
            </div>
        </div>
    );
}

export default Signup;