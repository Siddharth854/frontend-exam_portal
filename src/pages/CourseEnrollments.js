import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

function CourseEnrollments() {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const fetchEnrollments = async () => {
        try {
            const response = await fetch(
                'https://backend-exam-paper.vercel.app/course-enrollments'
            );

            const data = await response.json();

            if (response.ok) {
                setEnrollments(data);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching enrollments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnrollments();
    }, []);

    return (
        <div className="management-page">

            <div className="management-header">
                <div>
                    <h1>Course Enrollments</h1>
                    <p>Manage student course enrollments</p>
                </div>

                <div className="management-actions">
                    <button
                        className="management-button"
                        onClick={() => navigate('/course-enrollments/add')}
                    >
                        + Add Enrollment
                    </button>

                    <button
                        className="management-button"
                        onClick={() => navigate('/admin')}
                    >
                        Back to Admin
                    </button>
                </div>
            </div>

            <div className="stats-grid">

                <div className="stat-card">
                    <h3>Total Enrollments</h3>
                    <p>{enrollments.length}</p>
                </div>

                <div className="stat-card">
                    <h3>Students</h3>
                    <p>
                        {
                            new Set(
                                enrollments
                                    .map(item => item.student?._id)
                                    .filter(Boolean)
                            ).size
                        }
                    </p>
                </div>

                <div className="stat-card">
                    <h3>Courses</h3>
                    <p>
                        {
                            new Set(
                                enrollments
                                    .map(item => item.course?._id)
                                    .filter(Boolean)
                            ).size
                        }
                    </p>
                </div>

            </div>

            <div className="management-card">

                {loading ? (
                    <p>Loading enrollments...</p>
                ) : enrollments.length === 0 ? (
                    <p>No course enrollments found.</p>
                ) : (
                    <div className="management-table-container">

                        <table className="management-table">

                            <thead>
                                <tr>
                                    <th>Student ID</th>
                                    <th>Student Name</th>
                                    <th>Email</th>
                                    <th>Course Code</th>
                                    <th>Course Name</th>
                                    <th>Semester</th>
                                </tr>
                            </thead>

                            <tbody>

                                {enrollments.map((item) => (
                                    <tr key={item._id}>

                                        <td>
                                            {item.student?.studentId || '-'}
                                        </td>

                                        <td>
                                            {item.student?.user?.name || '-'}
                                        </td>

                                        <td>
                                            {item.student?.user?.email || '-'}
                                        </td>

                                        <td>
                                            {item.course?.courseCode || '-'}
                                        </td>

                                        <td>
                                            {item.course?.courseName || '-'}
                                        </td>

                                        <td>
                                            {item.course?.semester || '-'}
                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </div>
    );
}

export default CourseEnrollments;