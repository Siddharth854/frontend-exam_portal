import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddTeacher() {
    const navigate = useNavigate();

    const [teacherInfo, setTeacherInfo] = useState({
        teacherId: '',
        email: '',
        department: '',
        designation: ''
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;

        setTeacherInfo({
            ...teacherInfo,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const {
            teacherId,
            email,
            department,
            designation
        } = teacherInfo;

        if (!teacherId || !email || !department || !designation) {
            setMessage('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch(
                'https://backend-exam-paper.vercel.app/teachers/add',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        teacherId,
                        email,
                        department,
                        designation
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                setMessage(result.message || 'Unable to add teacher');
                return;
            }

            setMessage('Teacher added successfully');

            setTeacherInfo({
                teacherId: '',
                email: '',
                department: '',
                designation: ''
            });

        } catch (error) {
            console.error('ADD TEACHER ERROR:', error);
            setMessage('Unable to connect to the server');
        }
    };

    return (
        <div>
            <h1>Add Teacher</h1>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Teacher ID</label>

                    <input
                        type="text"
                        name="teacherId"
                        value={teacherInfo.teacherId}
                        onChange={handleChange}
                        placeholder="Enter teacher ID"
                    />
                </div>

                <br />

                <div>
                    <label>Teacher Email</label>

                    <input
                        type="email"
                        name="email"
                        value={teacherInfo.email}
                        onChange={handleChange}
                        placeholder="Enter teacher email"
                    />
                </div>

                <br />

                <div>
                    <label>Department</label>

                    <input
                        type="text"
                        name="department"
                        value={teacherInfo.department}
                        onChange={handleChange}
                        placeholder="Enter department"
                    />
                </div>

                <br />

                <div>
                    <label>Designation</label>

                    <input
                        type="text"
                        name="designation"
                        value={teacherInfo.designation}
                        onChange={handleChange}
                        placeholder="Enter designation"
                    />
                </div>

                <br />

                <button type="submit">
                    Add Teacher
                </button>

                <button
                    type="button"
                    onClick={() => navigate('/teachers')}
                >
                    Cancel
                </button>

            </form>

            {message && <p>{message}</p>}
        </div>
    );
}

export default AddTeacher;