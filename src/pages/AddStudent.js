import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
        <div>
            <h1>Add Student</h1>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Student ID</label>
                    <input
                        type="text"
                        name="studentId"
                        value={studentInfo.studentId}
                        onChange={handleChange}
                        placeholder="Enter student ID"
                    />
                </div>

                <br />

                <div>
                    <label>Student Email</label>
                    <input
                        type="email"
                        name="email"
                        value={studentInfo.email}
                        onChange={handleChange}
                        placeholder="Enter student email"
                    />
                </div>

                <br />

                <div>
                    <label>Department</label>
                    <input
                        type="text"
                        name="department"
                        value={studentInfo.department}
                        onChange={handleChange}
                        placeholder="Enter department"
                    />
                </div>

                <br />

                <div>
                    <label>Semester</label>
                    <input
                        type="number"
                        name="semester"
                        value={studentInfo.semester}
                        onChange={handleChange}
                        placeholder="Enter semester"
                        min="1"
                    />
                </div>

                <br />

                <button type="submit">
                    Add Student
                </button>

                <button
                    type="button"
                    onClick={() => navigate('/students')}
                >
                    Cancel
                </button>

            </form>

            {message && (
                <p>{message}</p>
            )}
        </div>
    );
}

export default AddStudent;