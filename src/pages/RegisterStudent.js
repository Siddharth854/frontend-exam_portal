
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterStudent.css';

function RegisterStudent() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        studentId: '',
        department: '',
        program: '',
        semester: '3'
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const API_URL = 'https://backend-exam-paper.vercel.app';

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage('');
        setMessageType('');

        const token = localStorage.getItem('token');
        const email = formData.email.trim().toLowerCase();
        const semester = Number(formData.semester);

        if (!token) {
            setMessage('Your session has expired. Please log in again.');
            setMessageType('error');
            return;
        }

        if (!/^[a-zA-Z0-9._%+-]+@muj\.manipal\.edu$/.test(email)) {
            setMessage('Please use a valid @muj.manipal.edu email address.');
            setMessageType('error');
            return;
        }

        if (
            !Number.isInteger(semester) ||
            semester < 1 ||
            semester > 10
        ) {
            setMessage('Semester must be a whole number between 1 and 10.');
            setMessageType('error');
            return;
        }

        if (formData.password.length < 8) {
            setMessage('The initial password must contain at least 8 characters.');
            setMessageType('error');
            return;
        }

        setLoading(true);
        let accountCreated = false;

        try {
            // Step 1: Create the student login account.
            const signupResponse = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email,
                    password: formData.password,
                    role: 'student'
                })
            });

            const signupData = await signupResponse.json();

            if (!signupResponse.ok) {
                throw new Error(
                    signupData.message || 'Unable to create the student account.'
                );
            }

            accountCreated = true;

            // Step 2: Create the student academic profile.
            const profileResponse = await fetch(`${API_URL}/students/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    studentId: formData.studentId.trim(),
                    email,
                    department: formData.department.trim(),
                    program: formData.program.trim().toUpperCase(),
                    semester
                })
            });

            const profileData = await profileResponse.json();

            if (!profileResponse.ok) {
                throw new Error(
                    profileData.message ||
                    'The student account was created, but the profile could not be created.'
                );
            }

            setMessage('Student registered successfully!');
            setMessageType('success');

            setFormData({
                name: '',
                email: '',
                password: '',
                studentId: '',
                department: '',
                semester: '3'
            });
        } catch (error) {
            console.error('Student registration error:', error);

            setMessage(
                accountCreated
                    ? `The login account was created, but profile registration failed: ${error.message} Resolve this before retrying.`
                    : error.message || 'Student registration failed.'
            );

            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-student-page">
            <div className="register-student-wrapper">
                <header className="register-student-header">
                    <div>
                        <span className="register-eyebrow">
                            EXAM ADMINISTRATION
                        </span>

                        <h1>Register New Student</h1>

                        <p>
                            Create a student login account and academic profile.
                        </p>
                    </div>

                    <div className="register-header-actions">
                        <button
                            type="button"
                            className="register-back-button"
                            onClick={() => navigate('/admin')}
                        >
                            ← Dashboard
                        </button>

                        <button
                            type="button"
                            className="register-back-button"
                            onClick={() => navigate('/bulk-register-students')}
                        >
                            ↑ Bulk Registration
                        </button>
                    </div>
                </header>

                <section className="register-student-card">
                    <div className="register-card-heading">
                        <div className="register-card-icon">+</div>

                        <div>
                            <h2>Student Information</h2>
                            <p>
                                Enter the student's personal and academic details.
                            </p>
                        </div>
                    </div>                  
                    <form onSubmit={handleSubmit}>
                        <div className="register-form-grid">
                            <div className="register-form-group">
                                <label htmlFor="student-name">Full Name</label>
                                <input
                                    id="student-name"
                                    name="name"
                                    type="text"
                                    placeholder="Enter full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    autoComplete="name"
                                    required
                                />
                            </div>

                            <div className="register-form-group">
                                <label htmlFor="student-email">University Email</label>
                                <input
                                    id="student-email"
                                    name="email"
                                    type="email"
                                    placeholder="student@muj.manipal.edu"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="off"
                                    required
                                />
                            </div>

                            <div className="register-form-group">
                                <label htmlFor="student-password">Initial Password</label>
                                <input
                                    id="student-password"
                                    name="password"
                                    type="password"
                                    placeholder="Create an initial password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                />
                                <small>Use at least 8 characters.</small>
                            </div>

                            <div className="register-form-group">
                                <label htmlFor="student-registration">
                                    Registration Number
                                </label>
                                <input
                                    id="student-registration"
                                    name="studentId"
                                    type="text"
                                    placeholder="Enter registration number"
                                    value={formData.studentId}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="register-form-group">
                                <label htmlFor="student-department">Department</label>
                                <input
                                    id="student-department"
                                    name="department"
                                    type="text"
                                    placeholder="Enter department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* NEW: Program / Branch dropdown */}
                            <div className="register-form-group">
                                <label htmlFor="student-program">Program / Branch</label>
                                <select
                                    id="student-program"
                                    name="program"
                                    value={formData.program}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select program</option>
                                    <option value="MCA">MCA</option>
                                    <option value="BCA">BCA</option>
                                    <option value="BSC">BSc</option>
                                    <option value="MSC">MSc</option>
                                    <option value="BTECH">BTech</option>
                                </select>
                            </div>

                            <div className="register-form-group">
                                <label htmlFor="student-semester">Semester</label>
                                <input
                                    id="student-semester"
                                    name="semester"
                                    type="number"
                                    min="1"
                                    max="10"
                                    step="1"
                                    placeholder="Enter semester (1–10)"
                                    value={formData.semester}
                                    onChange={handleChange}
                                    onKeyDown={(event) => {
                                        if (['e', 'E', '+', '-', '.'].includes(event.key)) {
                                            event.preventDefault();
                                        }
                                    }}
                                    required
                                />
                                <small>Enter a whole number from 1 to 10.</small>
                            </div>
                        </div>

                        {message && (
                            <div
                                className={`register-message ${messageType}`}
                                role="alert"
                            >
                                {message}
                            </div>
                        )}

                        <div className="register-form-footer">
                            <p>Please verify all details before submitting.</p>

                            <button
                                type="submit"
                                className="register-submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Registering...' : '+ Register Student'}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}

export default RegisterStudent;
