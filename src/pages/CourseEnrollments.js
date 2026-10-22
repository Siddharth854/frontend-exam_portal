
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

function CourseEnrollments() {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [departmentSort, setDepartmentSort] = useState('asc');

    const navigate = useNavigate();

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch(
                'https://backend-exam-paper.vercel.app/course-enrollments'
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Unable to fetch enrollments.'
                );
            }

            // Support either an array or an object containing enrollments.
            const records = Array.isArray(data)
                ? data
                : data.enrollments || [];

            setEnrollments(records);
        } catch (err) {
            console.error('Error fetching enrollments:', err);
            setError(err.message || 'Unable to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnrollments();
    }, []);

    // Group enrollment records so each student appears only once.
    const students = useMemo(() => {
        const studentMap = new Map();

        enrollments.forEach((item) => {
            const student = item.student;

            if (!student) return;

            const studentKey = String(
                student._id || student.studentId ||
                student.user?._id || student.user?.email || ''
            );

            if (!studentKey) return;

            if (!studentMap.has(studentKey)) {
                studentMap.set(studentKey, {
                    key: studentKey,
                    studentId: student.studentId || '-',
                    name: student.user?.name || '-',
                    email: student.user?.email || '-',
                    department: student.department || '-',
                    semester: student.semester || '-',
                    courses: [],
                    courseIds: new Set()
                });
            }

            const groupedStudent = studentMap.get(studentKey);
            const course = item.course;

            if (course) {
                const courseKey = String(
                    course._id || course.courseCode || ''
                );

                // Count each course only once per student.
                if (
                    courseKey &&
                    !groupedStudent.courseIds.has(courseKey)
                ) {
                    groupedStudent.courseIds.add(courseKey);

                    groupedStudent.courses.push({
                        id: courseKey,
                        courseCode: course.courseCode || '-',
                        courseName: course.courseName || '-',
                        semester: course.semester || '-'
                    });
                }
            }
        });

        return Array.from(studentMap.values()).map((student) => ({
            ...student,
            courses: student.courses.sort((a, b) =>
                a.courseCode.localeCompare(b.courseCode)
            )
        }));
    }, [enrollments]);

    // Sort unique students by department.
    const sortedStudents = useMemo(() => {
        return [...students].sort((a, b) => {
            const departmentComparison = a.department.localeCompare(
                b.department,
                undefined,
                { sensitivity: 'base' }
            );

            if (departmentComparison !== 0) {
                return departmentSort === 'asc'
                    ? departmentComparison
                    : -departmentComparison;
            }

            return a.name.localeCompare(
                b.name,
                undefined,
                { sensitivity: 'base' }
            );
        });
    }, [students, departmentSort]);

    const totalCourses = new Set(
        enrollments
            .map((item) => item.course?._id || item.course?.courseCode)
            .filter(Boolean)
    ).size;

    const closeCourseDetails = () => {
        setSelectedStudent(null);
    };

    return (
        <div className="management-page">

            {/* Page Header */}
     
            <div className="management-actions">
                <button
                    type="button"
                    className="management-button"
                    onClick={() => navigate('/course-enrollments/add')}
                >
                    + Add Enrollment
                </button>

                <button
                    type="button"
                    className="management-button"
                    onClick={() => navigate('/assign-courses-batch')}
                >
                    Bulk Course Assignment
                </button>

                <button
                    type="button"
                    className="management-button"
                    onClick={() => navigate('/admin')}
                >
                    Back to Admin
                </button>
            </div>

            {/* Statistics */}

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Enrollments</h3>
                    <p>{enrollments.length}</p>
                </div>

                <div className="stat-card">
                    <h3>Students</h3>
                    <p>{students.length}</p>
                </div>

                <div className="stat-card">
                    <h3>Courses</h3>
                    <p>{totalCourses}</p>
                </div>
            </div>

            {/* Student Table */}

            <div className="management-card">

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        marginBottom: '20px'
                    }}
                >
                    <div>
                        <h2>Student Course Registrations</h2>
                        <p>
                            Each student appears only once.
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="departmentSort"
                            style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontWeight: 600
                            }}
                        >
                            Sort by Department
                        </label>

                        <select
                            id="departmentSort"
                            value={departmentSort}
                            onChange={(event) =>
                                setDepartmentSort(event.target.value)
                            }
                            style={{
                                padding: '10px 12px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                background: '#fff'
                            }}
                        >
                            <option value="asc">
                                Department: A to Z
                            </option>
                            <option value="desc">
                                Department: Z to A
                            </option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <p>Loading student enrollments...</p>
                ) : error ? (
                    <div className="management-message">
                        <p>{error}</p>

                        <button
                            className="management-button"
                            onClick={fetchEnrollments}
                        >
                            Retry
                        </button>
                    </div>
                ) : students.length === 0 ? (
                    <p>No student enrollments found.</p>
                ) : (
                    <div className="management-table-container">
                        <table className="management-table">
                            <thead>
                                <tr>
                                    <th>Student ID</th>
                                    <th>Student Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Semester</th>
                                    <th>Registered Courses</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {sortedStudents.map((student) => (
                                    <tr key={student.key}>
                                        <td>{student.studentId}</td>

                                        <td>
                                            <strong>{student.name}</strong>
                                        </td>

                                        <td>{student.email}</td>

                                        <td>{student.department}</td>

                                        <td>{student.semester}</td>

                                        <td>
                                            <strong>
                                                {student.courses.length}
                                            </strong>
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                className="management-button secondary"
                                                title="View registered courses"
                                                aria-label={`View courses for ${student.name}`}
                                                onClick={() =>
                                                    setSelectedStudent(student)
                                                }
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    minWidth: '42px'
                                                }}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && !error && students.length > 0 && (
                    <p style={{ marginTop: '16px' }}>
                        Showing {students.length} unique students.
                    </p>
                )}
            </div>

            {/* Course Details Popup */}

            {selectedStudent && (
                <div
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            closeCourseDetails();
                        }
                    }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1000,
                        background: 'rgba(15, 23, 42, 0.55)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="course-details-title"
                        style={{
                            width: '100%',
                            maxWidth: '650px',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            background: '#fff',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: '12px'
                            }}
                        >
                            <div>
                                <h2 id="course-details-title">
                                    Registered Courses
                                </h2>

                                <p>
                                    <strong>
                                        {selectedStudent.name}
                                    </strong>
                                </p>

                                <p>{selectedStudent.studentId}</p>

                                <p>
                                    Total registered subjects:{' '}
                                    <strong>
                                        {selectedStudent.courses.length}
                                    </strong>
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeCourseDetails}
                                aria-label="Close course details"
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    fontSize: '28px',
                                    cursor: 'pointer'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {selectedStudent.courses.length === 0 ? (
                            <p>This student has no registered courses.</p>
                        ) : (
                            <div className="management-table-container">
                                <table className="management-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Course Code</th>
                                            <th>Course Name</th>
                                            <th>Semester</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {selectedStudent.courses.map(
                                            (course, index) => (
                                                <tr key={course.id}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        {course.courseCode}
                                                    </td>
                                                    <td>
                                                        {course.courseName}
                                                    </td>
                                                    <td>
                                                        {course.semester}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                marginTop: '20px'
                            }}
                        >
                            <button
                                type="button"
                                className="management-button"
                                onClick={closeCourseDetails}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CourseEnrollments;
