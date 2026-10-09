import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

function Courses() {
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch(
                    'https://backend-exam-paper.vercel.app/courses'
                );

                const result = await response.json();

                console.log('COURSES API RESPONSE:', result);

                if (!response.ok) {
                    setMessage(result.message || 'Unable to fetch courses');
                    return;
                }

                setCourses(result.courses || []);

            } catch (error) {
                console.error('GET COURSES ERROR:', error);
                setMessage('Unable to connect to the server');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

        return (
        <div className="management-page">

            <div className="management-header">

                <h1>Courses Management</h1>

                <div className="management-actions">

                    <button
                        className="management-button"
                        onClick={() => navigate('/admin')}
                    >
                        Back to Dashboard
                    </button>

                    <button
                        className="management-button"
                        onClick={() => navigate('/courses/add')}
                    >
                        Add Course
                    </button>

                </div>

            </div>

            <div className="management-card">

                <h2>Course List</h2>

                {loading && (
                    <p className="management-message">
                        Loading courses...
                    </p>
                )}

                {message && (
                    <p className="management-message">
                        {message}
                    </p>
                )}

                {!loading && !message && courses.length === 0 && (
                    <p className="management-message">
                        No courses added yet.
                    </p>
                )}

                {!loading && courses.length > 0 && (

                    <table className="management-table">

                        <thead>
                            <tr>
                                <th>Course Code</th>
                                <th>Course Name</th>
                                <th>Department</th>
                                <th>Semester</th>
                                <th>Exam Duration</th>
                            </tr>
                        </thead>

                        <tbody>

                            {courses.map((course) => (

                                <tr key={course._id}>

                                    <td>{course.courseCode}</td>

                                    <td>{course.courseName}</td>

                                    <td>{course.department}</td>

                                    <td>{course.semester}</td>

                                    <td>
                                        {course.examDuration} minutes
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                )}

            </div>

        </div>
    );
}

export default Courses;