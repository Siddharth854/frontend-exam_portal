import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddCourse() {
    const navigate = useNavigate();

    const [courseInfo, setCourseInfo] = useState({
        courseCode: '',
        courseName: '',
        department: '',
        semester: '',
        examDuration: ''
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;

        setCourseInfo({
            ...courseInfo,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const {
            courseCode,
            courseName,
            department,
            semester,
            examDuration
        } = courseInfo;

        if (
            !courseCode ||
            !courseName ||
            !department ||
            !semester ||
            !examDuration
        ) {
            setMessage('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch(
                'https://backend-exam-paper.vercel.app/courses/add',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        courseCode,
                        courseName,
                        department,
                        semester: Number(semester),
                        examDuration: Number(examDuration)
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                setMessage(result.message || 'Unable to add course');
                return;
            }

            setMessage('Course added successfully');

            setCourseInfo({
                courseCode: '',
                courseName: '',
                department: '',
                semester: '',
                examDuration: ''
            });

        } catch (error) {
            console.error('ADD COURSE ERROR:', error);
            setMessage('Unable to connect to the server');
        }
    };

    return (
        <div>
            <h1>Add Course</h1>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Course Code</label>

                    <input
                        type="text"
                        name="courseCode"
                        value={courseInfo.courseCode}
                        onChange={handleChange}
                        placeholder="Enter course code"
                    />
                </div>

                <br />

                <div>
                    <label>Course Name</label>

                    <input
                        type="text"
                        name="courseName"
                        value={courseInfo.courseName}
                        onChange={handleChange}
                        placeholder="Enter course name"
                    />
                </div>

                <br />

                <div>
                    <label>Department</label>

                    <input
                        type="text"
                        name="department"
                        value={courseInfo.department}
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
                        value={courseInfo.semester}
                        onChange={handleChange}
                        placeholder="Enter semester"
                        min="1"
                    />
                </div>

                <br />

                <div>
                    <label>Exam Duration (minutes)</label>

                    <input
                        type="number"
                        name="examDuration"
                        value={courseInfo.examDuration}
                        onChange={handleChange}
                        placeholder="Enter duration in minutes"
                        min="30"
                    />
                </div>

                <br />

                <button type="submit">
                    Add Course
                </button>

                <button
                    type="button"
                    onClick={() => navigate('/courses')}
                >
                    Cancel
                </button>

            </form>

            {message && <p>{message}</p>}
        </div>
    );
}

export default AddCourse;