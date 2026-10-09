import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

function AddCourseEnrollment() {

    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);

    const [student, setStudent] = useState('');
    const [course, setCourse] = useState('');

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {

        const fetchData = async () => {

            try {

                const [studentsResponse, coursesResponse] =   
                    await Promise.all([
                        fetch('https://backend-exam-paper.vercel.app/students'),
                        fetch('https://backend-exam-paper.vercel.app/courses')
                    ]);

                const studentsData = await studentsResponse.json();
                const coursesData = await coursesResponse.json();

                if (studentsResponse.ok) {
                    setStudents(studentsData.students || []);
                }

                if (coursesResponse.ok) {
                    setCourses(coursesData.courses || []);
                }

            } catch (error) {

                console.error('Error loading data:', error);

            } finally {

                setLoading(false);

            }
        };

        fetchData();

    }, []);

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage('');

        if (!student || !course) {
            setMessage('Please select both student and course.');
            return;
        }

        try {

            const response = await fetch(
                'https://backend-exam-paper.vercel.app/course-enrollments/add',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        student,
                        course
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || 'Failed to add enrollment.');
                return;
            }

            alert('Course enrollment added successfully!');

            navigate('/course-enrollments');

        } catch (error) {

            console.error('Error adding enrollment:', error);

            setMessage('Unable to connect to the server.');

        }
    };

    if (loading) {
        return (
            <div className="management-page">
                <p>Loading students and courses...</p>
            </div>
        );
    }

    return (
        <div className="management-page">

            <div className="management-header">

                <div>
                    <h1>Add Course Enrollment</h1>
                    <p>Enroll a student into a course</p>
                </div>

            </div>

            <div className="form-card">

                <form onSubmit={handleSubmit}>

                    <div className="form-group">

                        <label>Student</label>

                        <select
                            value={student}
                            onChange={(e) => setStudent(e.target.value)}
                            required
                        >

                            <option value="">
                                Select Student
                            </option>

                            {students.map((item) => (
                                <option
                                    key={item._id}
                                    value={item._id}
                                >
                                    {item.studentId} - {item.user?.name}
                                </option>
                            ))}

                        </select>

                    </div>

                    <div className="form-group">

                        <label>Course</label>

                        <select
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                            required
                        >

                            <option value="">
                                Select Course
                            </option>

                            {courses.map((item) => (
                                <option
                                    key={item._id}
                                    value={item._id}
                                >
                                    {item.courseCode} - {item.courseName}
                                </option>
                            ))}

                        </select>

                    </div>

                    {message && (
                        <p className="form-error">
                            {message}
                        </p>
                    )}

                    <div className="management-actions">

                        <button
                            type="submit"
                            className="management-button"
                        >
                            Add Enrollment
                        </button>

                        <button
                            type="button"
                            className="management-button"
                            onClick={() =>
                                navigate('/course-enrollments')
                            }
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default AddCourseEnrollment;