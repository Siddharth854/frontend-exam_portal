
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AssignCoursesToBatch.css';

const API_URL = 'https://backend-exam-paper.vercel.app';

const PROGRAMS = ['MCA', 'BCA', 'BTECH', 'BSC', 'MSC'];

const DEPARTMENTS = ['Computer Application'];

function getCoursesArray(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.courses)) return data.courses;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

function AssignCoursesToBatch() {
    const navigate = useNavigate();

    const [program, setProgram] = useState('MCA');
    const [semester, setSemester] = useState('3');
    const [department, setDepartment] = useState('Computer Application');

    const [courses, setCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);

    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingPackage, setLoadingPackage] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [packageExists, setPackageExists] = useState(false);

    // Load all courses from the backend.
    useEffect(() => {
        let cancelled = false;

        async function fetchCourses() {
            setLoadingCourses(true);
            setError('');

            try {
                const token = localStorage.getItem('token');

                const response = await fetch(`${API_URL}/courses`, {
                    headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : {}
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || 'Could not load courses.'
                    );
                }

                const records = getCoursesArray(data);

                if (!cancelled) {
                    setCourses(records);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || 'Could not load courses.');
                }
            } finally {
                if (!cancelled) {
                    setLoadingCourses(false);
                }
            }
        }

        fetchCourses();

        return () => {
            cancelled = true;
        };
    }, []);

    // Display courses matching all three selected package fields.
    const filteredCourses = useMemo(() => {
        return courses.filter((course) => {
            const courseProgram = String(course.program || '')
                .trim()
                .toUpperCase();

            const courseDepartment = String(course.department || '')
                .trim()
                .toLowerCase();

            return (
                courseProgram === program &&
                Number(course.semester) === Number(semester) &&
                courseDepartment === department.trim().toLowerCase()
            );
        });
    }, [courses, program, semester, department]);

    // Load the saved package when the selection changes.
    useEffect(() => {
        let cancelled = false;

        async function fetchPackage() {
            setSelectedCourses([]);
            setPackageExists(false);
            setNotice('');
            setError('');

            if (!program || !semester || !department) return;

            setLoadingPackage(true);

            try {
                const token = localStorage.getItem('token');

                const params = new URLSearchParams({
                    program,
                    semester,
                    department
                });

                const response = await fetch(
                    `${API_URL}/course-enrollments/packages?${params}`,
                    {
                        headers: token
                            ? { Authorization: `Bearer ${token}` }
                            : {}
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || 'Could not load saved package.'
                    );
                }

                if (cancelled) return;

                const savedPackage = data.coursePackage;

                if (savedPackage) {
                    const savedIds = (savedPackage.courses || [])
                        .map((course) =>
                            typeof course === 'string'
                                ? course
                                : course?._id
                        )
                        .filter(Boolean)
                        .map(String);

                    setSelectedCourses(savedIds);
                    setPackageExists(true);
                    setNotice(
                        'Existing package loaded. Change the selections and save to update it.'
                    );
                } else {
                    setNotice(
                        'No package exists for this selection. Choose courses to create one.'
                    );
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.message || 'Could not load saved package.'
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingPackage(false);
                }
            }
        }

        fetchPackage();

        return () => {
            cancelled = true;
        };
    }, [program, semester, department]);

    // Change the package criteria.
    const handleFilterChange = (setter, value) => {
        setter(value);
        setSelectedCourses([]);
        setPackageExists(false);
        setNotice('');
        setError('');
    };

    // Select or deselect a course.
    const toggleCourse = (courseId) => {
        setSelectedCourses((previous) =>
            previous.includes(courseId)
                ? previous.filter((id) => id !== courseId)
                : [...previous, courseId]
        );

        setNotice('');
        setError('');
    };

    // Select all currently visible courses.
    const selectAllCourses = () => {
        setSelectedCourses((previous) => {
            const combined = new Set(previous);

            filteredCourses.forEach((course) => {
                combined.add(String(course._id));
            });

            return [...combined];
        });

        setNotice('');
        setError('');
    };

    // Deselect all currently visible courses.
    const clearCourseSelection = () => {
        const visibleIds = new Set(
            filteredCourses.map((course) => String(course._id))
        );

        setSelectedCourses((previous) =>
            previous.filter((id) => !visibleIds.has(id))
        );

        setNotice('');
        setError('');
    };

    // Save or update a reusable package.
    const handleSavePackage = async (event) => {
        event.preventDefault();

        setError('');
        setNotice('');

        if (!department) {
            setError('Please select a department.');
            return;
        }

        if (selectedCourses.length === 0) {
            setError('Select at least one course.');
            return;
        }

        const visibleCourseIds = new Set(
            filteredCourses.map((course) => String(course._id))
        );

        const invalidSelection = selectedCourses.some(
            (id) => !visibleCourseIds.has(String(id))
        );

        if (invalidSelection) {
            setError(
                'Your selection contains courses outside the current package criteria. Please review your selections.'
            );
            return;
        }

        const token = localStorage.getItem('token');

        if (!token) {
            setError('Your session has expired. Please log in again.');
            return;
        }

        try {
            setSubmitting(true);

            const response = await fetch(
                `${API_URL}/course-enrollments/packages`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        program,
                        semester: Number(semester),
                        department,
                        courseIds: selectedCourses
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                const invalidDetails = data.invalidCourses
                    ?.map((course) => {
                        const name =
                            course.courseCode ||
                            course.courseName ||
                            course.id;

                        return `${name}: ${course.reason}`;
                    })
                    .join('; ');

                throw new Error(
                    invalidDetails
                        ? `${data.message} ${invalidDetails}`
                        : data.message || 'Could not save course package.'
                );
            }

            setPackageExists(true);
            setNotice(
                data.message || 'Course package saved successfully.'
            );
        } catch (err) {
            setError(err.message || 'Could not save course package.');
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
                        Create reusable course packages by program,
                        semester, and department.
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

            <form
                className="batch-panel"
                onSubmit={handleSavePackage}
            >
                <h2>Course Package Details</h2>

                <div className="batch-filters">
                    <label>
                        Program / Branch
                        <select
                            value={program}
                            onChange={(event) =>
                                handleFilterChange(
                                    setProgram,
                                    event.target.value
                                )
                            }
                            required
                        >
                            {PROGRAMS.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Semester
                        <select
                            value={semester}
                            onChange={(event) =>
                                handleFilterChange(
                                    setSemester,
                                    event.target.value
                                )
                            }
                            required
                        >
                            {Array.from(
                                { length: 10 },
                                (_, index) => index + 1
                            ).map((number) => (
                                <option key={number} value={number}>
                                    Semester {number}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Department
                        <select
                            value={department}
                            onChange={(event) =>
                                handleFilterChange(
                                    setDepartment,
                                    event.target.value
                                )
                            }
                            required
                        >
                            {DEPARTMENTS.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="batch-package-status">
                    <strong>
                        {program} · Semester {semester}
                    </strong>
                    <span>{department}</span>

                    {loadingPackage ? (
                        <p>Checking for an existing package...</p>
                    ) : (
                        <p>
                            {packageExists
                                ? 'An existing package was found.'
                                : 'No saved package for this combination yet.'}
                        </p>
                    )}
                </div>

                <div className="batch-course-heading">
                    <div>
                        <h2>Available Courses</h2>
                        <p>
                            Select all courses that belong in this package.
                        </p>
                    </div>

                    <div className="batch-course-actions">
                        <button
                            type="button"
                            onClick={selectAllCourses}
                            disabled={
                                loadingCourses ||
                                loadingPackage ||
                                filteredCourses.length === 0
                            }
                        >
                            Select All
                        </button>

                        <button
                            type="button"
                            onClick={clearCourseSelection}
                            disabled={selectedCourses.length === 0}
                        >
                            Clear Selection
                        </button>
                    </div>
                </div>

                {loadingCourses ? (
                    <p>Loading courses...</p>
                ) : filteredCourses.length === 0 ? (
                    <p className="batch-empty">
                        No courses match this program, semester, and
                        department. Check your existing course records
                        before creating a package.
                    </p>
                ) : (
                    <div className="batch-course-list">
                        {filteredCourses.map((course) => (
                            <label
                                className="batch-course-option"
                                key={course._id}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedCourses.includes(
                                        String(course._id)
                                    )}
                                    onChange={() =>
                                        toggleCourse(String(course._id))
                                    }
                                    disabled={loadingPackage || submitting}
                                />

                                <span>
                                    <strong>{course.courseCode}</strong>
                                    {' — '}
                                    {course.courseName}
                                </span>
                            </label>
                        ))}
                    </div>
                )}

                <p className="batch-selection-count">
                    {selectedCourses.length} course(s) selected
                </p>

                {error && (
                    <p className="batch-error" role="alert">
                        {error}
                    </p>
                )}

                {notice && (
                    <p className="batch-notice" role="status">
                        {notice}
                    </p>
                )}

                <button
                    type="submit"
                    className="batch-submit-button"
                    disabled={
                        submitting ||
                        loadingCourses ||
                        loadingPackage ||
                        filteredCourses.length === 0 ||
                        selectedCourses.length === 0
                    }
                >
                    {submitting
                        ? 'Saving Package...'
                        : packageExists
                            ? 'Update Course Package'
                            : 'Save Course Package'}
                </button>

                <p className="batch-package-note">
                    Saving a package does not enroll students yet.
                    Student enrollment will be connected to bulk
                    registration in the next step.
                </p>
            </form>
        </div>
    );
}

export default AssignCoursesToBatch;
    