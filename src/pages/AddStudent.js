import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddStudent.css';

function AddStudent() {
    const navigate = useNavigate();

    const [studentInfo, setStudentInfo] = useState({
        studentId: '',
        email: '',
        department: '',
        semester: ''
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;

        setStudentInfo({
            ...studentInfo,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const {
            studentId,
            email,
            department,
            semester
        } = studentInfo;

        if (!studentId || !email || !department || !semester) {
            setMessage('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch(
                'https://backend-exam-paper.vercel.app/students/add',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        studentId,
                        email,
                        department,
                        semester: Number(semester)
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                setMessage(result.message || 'Unable to add student');
                return;
            }

            setMessage('Student added successfully');

            setStudentInfo({
                studentId: '',
                email: '',
                department: '',
                semester: ''
            });

        } catch (error) {
            console.error('ADD STUDENT ERROR:', error);
            setMessage('Unable to connect to the server');
        }
    };

    return (
    <div className="add-student-page">
        <div className="add-student-card">
            <div className="add-student-header">
                <h1>Add Student</h1>
                <p>
                    Register a student profile in the Exam Scheduling System.
                </p>
            </div>

            <form className="add-student-form" onSubmit={handleSubmit}>
                <div className="add-student-field">
                    <label htmlFor="studentId">Student ID</label>
                    <input
                        id="studentId"
                        type="text"
                        name="studentId"
                        value={studentInfo.studentId}
                        onChange={handleChange}
                        placeholder="Enter student ID"
                        required
                    />
                </div>

                <div className="add-student-field">
                    <label htmlFor="email">Student Email</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={studentInfo.email}
                        onChange={handleChange}
                        placeholder="Enter student email"
                        required
                    />
                </div>

                <div className="add-student-field">
                    <label htmlFor="department">Department</label>
                    <input
                        id="department"
                        type="text"
                        name="department"
                        value={studentInfo.department}
                        onChange={handleChange}
                        placeholder="Enter department"
                        required
                    />
                </div>

                <div className="add-student-field">
                    <label htmlFor="semester">Semester</label>
                    <input
                        id="semester"
                        type="number"
                        name="semester"
                        value={studentInfo.semester}
                        onChange={handleChange}
                        placeholder="Enter semester"
                        min="1"
                        required
                    />
                </div>

                <div className="add-student-actions">
                    <button
                        type="submit"
                        className="add-student-submit"
                    >
                        Add Student
                    </button>

                    <button
                        type="button"
                        className="add-student-cancel"
                        onClick={() => navigate('/students')}
                    >
                        Cancel
                    </button>
                </div>

                {message && (
                    <div className="add-student-message" role="status">
                        {message}
                    </div>
                )}
            </form>
        </div>
    </div>
);

}

export default AddStudent;