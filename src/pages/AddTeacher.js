
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddTeacher.css';

function AddTeacher() {
    const navigate = useNavigate();

    const [teacherInfo, setTeacherInfo] = useState({
        teacherId: '',
        email: '',
        department: '',
        designation: ''
    });

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setTeacherInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const {
            teacherId,
            email,
            department,
            designation
        } = teacherInfo;

        if (!teacherId.trim() || !email.trim() ||
            !department.trim() || !designation.trim()) {
            setMessage('Please fill in all required fields.');
            return;
        }

        try {
            setLoading(true);
            setMessage('');

            const response = await fetch(
                'https://backend-exam-paper.vercel.app/teachers/add',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        teacherId: teacherId.trim(),
                        email: email.trim(),
                        department: department.trim(),
                        designation: designation.trim()
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                setMessage(result.message || 'Unable to add teacher.');
                return;
            }

            setMessage('Teacher added successfully!');

            setTeacherInfo({
                teacherId: '',
                email: '',
                department: '',
                designation: ''
            });

        } catch (error) {
            console.error('ADD TEACHER ERROR:', error);
            setMessage('Unable to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-teacher-page">

            <div className="teacher-page-header">
                <span className="teacher-eyebrow">
                    ACADEMIC MANAGEMENT
                </span>

                <h1>Add a New Teacher</h1>

                <p>
                    Add teacher details to your academic directory
                    for examination scheduling and management.
                </p>
            </div>

            <div className="teacher-form-card">

                <div className="teacher-card-heading">

                    <div className="teacher-icon">
                        <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        >
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                    </div>

                    <div>
                        <h2>Teacher Information</h2>
                        <p>
                            Enter the details below to register a teacher.
                        </p>
                    </div>

                </div>

                <div className="teacher-divider"></div>

                <form onSubmit={handleSubmit}>

                    <div className="teacher-form-grid">

                        <div className="teacher-field">
                            <label>
                                Teacher ID <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="teacherId"
                                value={teacherInfo.teacherId}
                                onChange={handleChange}
                                placeholder="e.g. MUJ1024"
                                required
                            />

                            <small>
                                Enter the official teacher identifier.
                            </small>
                        </div>

                        <div className="teacher-field">
                            <label>
                                Teacher Email <span>*</span>
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={teacherInfo.email}
                                onChange={handleChange}
                                placeholder="e.g. teacher@muj.jaipur.edu"
                                required
                            />

                            <small>
                                Enter the registered email address.
                            </small>
                        </div>

                        <div className="teacher-field">
                            <label>
                                Department <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="department"
                                value={teacherInfo.department}
                                onChange={handleChange}
                                placeholder="e.g. Computer Applications"
                                required
                            />

                            <small>
                                Enter the academic department.
                            </small>
                        </div>

                        <div className="teacher-field">
                            <label>
                                Designation <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="designation"
                                value={teacherInfo.designation}
                                onChange={handleChange}
                                placeholder="e.g. Assistant Professor"
                                required
                            />

                            <small>
                                Enter the teacher's designation.
                            </small>
                        </div>

                    </div>

                    {message && (
                        <div className={`teacher-message ${
                            message.includes('successfully')
                                ? 'success'
                                : 'error'
                        }`}>
                            {message}
                        </div>
                    )}

                    <div className="teacher-divider footer-divider"></div>

                    <div className="teacher-form-footer">

                        <p>
                            <span>*</span> Required fields
                        </p>

                        <div className="teacher-actions">

                            <button
                                type="button"
                                className="teacher-cancel-btn"
                                onClick={() => navigate('/teachers')}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="teacher-submit-btn"
                                disabled={loading}
                            >
                                <span>+</span>
                                {loading ? 'Adding...' : 'Add Teacher'}
                            </button>

                        </div>

                    </div>

                </form>

            </div>
        </div>
    );
}

export default AddTeacher;
