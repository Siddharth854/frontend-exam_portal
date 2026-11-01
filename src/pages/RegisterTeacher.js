
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterTeacher.css';

const API_BASE = 'https://backend-exam-paper.vercel.app';

function RegisterTeacher() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        teacherId: '',
        department: '',
        designation: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage('');

        const token = localStorage.getItem('token');

        if (!token) {
            setMessageType('error');
            setMessage('Your session has expired. Please log in again.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/teachers/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Teacher registration failed');
            }

            setMessageType('success');
            setMessage(data.message || 'Teacher registered successfully!');

            setFormData({
                name: '',
                email: '',
                password: '',
                teacherId: '',
                department: '',
                designation: ''
            });

        } catch (error) {
            setMessageType('error');
            setMessage(error.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-teacher-page">
            <div className="register-teacher-container">

                <button
                    type="button"
                    className="teacher-back-button"
                    onClick={() => navigate('/admin')}
                >
                    ← Back to Dashboard
                </button>

                <div className="teacher-form-header">
                    <div className="teacher-header-icon">👨‍🏫</div>
                    <h1>Register New Teacher</h1>
                    <p>Create a teacher login account and academic profile.</p>
                </div>

                <form onSubmit={handleSubmit} className="teacher-registration-form">

                    <div className="teacher-form-grid">

                        <div className="teacher-form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                placeholder="Enter teacher's full name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="teacher-form-group">
                            <label htmlFor="email">University Email</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="teacher@muj.jaipur.edu"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="teacher-form-group">
                            <label htmlFor="password">Initial Password</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Minimum 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                minLength="6"
                                required
                            />
                        </div>

                        <div className="teacher-form-group">
                            <label htmlFor="teacherId">Teacher ID</label>
                            <input
                                id="teacherId"
                                type="text"
                                name="teacherId"
                                placeholder="Enter teacher ID"
                                value={formData.teacherId}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="teacher-form-group">
                            <label htmlFor="department">Department</label>
                            <input
                                id="department"
                                type="text"
                                name="department"
                                placeholder="e.g. Computer Science"
                                value={formData.department}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="teacher-form-group">
                            <label htmlFor="designation">Designation</label>
                            <select
                                id="designation"
                                name="designation"
                                value={formData.designation}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select designation</option>
                                <option value="Assistant Professor">
                                    Assistant Professor
                                </option>
                                <option value="Associate Professor">
                                    Associate Professor
                                </option>
                                <option value="Professor">Professor</option>
                                <option value="Lecturer">Lecturer</option>
                                <option value="Head of Department">
                                    Head of Department
                                </option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                    </div>

                    {message && (
                        <div className={`teacher-form-message ${messageType}`}>
                            {message}
                        </div>
                    )}

                    <div className="teacher-form-actions">
                        <button
                            type="button"
                            className="teacher-cancel-button"
                            onClick={() => navigate('/admin')}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="teacher-submit-button"
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Register Teacher'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default RegisterTeacher;
