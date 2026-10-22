
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AssignCoursesToBatch.css';

const API_URL = 'https://backend-exam-paper.vercel.app';

function AssignCoursesToBatch() {
    const navigate = useNavigate();

    const [department, setDepartment] = useState('Computer Application');
    const [semester, setSemester] = useState('3');
    const [courses, setCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const token = localStorage.getItem('token');

                const response = await fetch(`${API_URL}/courses`, {
                    headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : {}
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Could not load courses.');
                }

                const records = Array.isArray(data)
                    ? data
                    : data.courses;

                if (!Array.isArray(records)) {
                    throw new Error('Unexpected courses response format.');
                }

                setCourses(records);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoadingCourses(false);
            }
        };

        fetchCourses();
    }, []);

    const filteredCourses = useMemo(() => {
        return courses.filter(course =>
            String(course.department || '').trim().toLowerCase() ===
                department.trim().toLowerCase() &&
            Number(course.semester) === Number(semester)
        );
    }, [courses, department, semester]);

    const handleFilterChange = (setter, value) => {
        setter(value);
        setSelectedCourses([]);
        setResult(null);
        setError('');
    };

    const toggleCourse = (courseId) => {
        setSelectedCourses(previous =>
            previous.includes(courseId)
                ? previous.filter(id => id !== courseId)
                : [...previous, courseId]
        );
        setResult(null);
        setError('');
    };

    const handleAssign = async (event) => {
        event.preventDefault();
        setError('');
        setResult(null);

        if (!department.trim()) {
            setError('Please enter a department.');
            return;
        }

        if (selectedCourses.length === 0) {
            setError('Select at least one course.');
            return;
        }

        try {
            setSubmitting(true);

            const token = localStorage.getItem('token');

            const response = await fetch(
                `${API_URL}/course-enrollments/assign-batch`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token
                            ? { Authorization: `Bearer ${token}` }
                            : {})
                    },
                    body: JSON.stringify({
                        department: department.trim(),
                        semester: Number(semester),
                        courseIds: selectedCourses
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Batch assignment failed.');
            }

            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="batch-assignment-page">
            <header className="batch-header">
                <div>
                    <h1>Bulk Course Assignment</h1>
                    <p>
                        Assign multiple courses to all students in a
                        department and semester.
                    </p>
                </div>

                <button
                    type="button"
                    className="batch-back-button"
                    onClick={() => navigate('/admin')}
                >
                    Back to Dashboard
                </button>
            </header>

            <form className="batch-panel" onSubmit={handleAssign}>
                <div className="batch-filters">
                    <label>
                        Department
                        <input
                            type="text"
                            value={department}
                            onChange={event =>
                                handleFilterChange(
                                    setDepartment,
                                    event.target.value
                                )
                            }
                            placeholder="e.g. Computer Application"
                            required
                        />
                    </label>

                    <label>
                        Semester
                        <select
                            value={semester}
                            onChange={event =>
                                handleFilterChange(
                                    setSemester,
                                    event.target.value
                                )
                            }
                        >
                            {[1, 2, 3, 4, 5, 6].map(number => (
                                <option key={number} value={number}>
                                    Semester {number}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <h2>Available Courses</h2>

                {loadingCourses ? (
                    <p>Loading courses...</p>
                ) : filteredCourses.length === 0 ? (
                    <p className="batch-empty">
                        No courses found for this department and semester.
                        Check the department spelling and stored course data.
                    </p>
                ) : (
                    <>
                        <div className="batch-course-list">
                            {filteredCourses.map(course => (
                                <label
                                    className="batch-course-option"
                                    key={course._id}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedCourses.includes(
                                            course._id
                                        )}
                                        onChange={() =>
                                            toggleCourse(course._id)
                                        }
                                    />

                                    <span>
                                        <strong>{course.courseCode}</strong>
                                        {' — '}
                                        {course.courseName}
                                    </span>
                                </label>
                            ))}
                        </div>

                        <p className="batch-selection-count">
                            {selectedCourses.length} course(s) selected
                        </p>
                    </>
                )}

                {error && (
                    <p className="batch-error" role="alert">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    className="batch-submit-button"
                    disabled={
                        submitting ||
                        loadingCourses ||
                        filteredCourses.length === 0
                    }
                >
                    {submitting ? 'Assigning Courses...' : 'Assign Courses'}
                </button>
            </form>

            {result && (
                <section className="batch-result" aria-live="polite">
                    <h2>{result.message}</h2>

                    <div className="batch-result-grid">
                        <div>
                            <span>Students</span>
                            <strong>{result.summary?.students ?? 0}</strong>
                        </div>

                        <div>
                            <span>Courses</span>
                            <strong>{result.summary?.courses ?? 0}</strong>
                        </div>

                        <div>
                            <span>Created</span>
                            <strong>{result.summary?.created ?? 0}</strong>
                        </div>

                        <div>
                            <span>Skipped</span>
                            <strong>{result.summary?.skipped ?? 0}</strong>
                        </div>

                        <div>
                            <span>Failed</span>
                            <strong>{result.summary?.failed ?? 0}</strong>
                        </div>
                    </div>

                    <p>
                        Existing enrollments were skipped rather than
                        duplicated.
                    </p>
                </section>
            )}
        </div>
    );
}

export default AssignCoursesToBatch;
