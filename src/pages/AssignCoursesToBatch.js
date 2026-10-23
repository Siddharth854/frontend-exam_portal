
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

    // Load all available courses.
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

                if (!cancelled) {
                    setCourses(getCoursesArray(data));
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.message || 'Could not load courses.'
                    );
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

    // Filter courses using program, semester and department.
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

    // Automatically look up an existing package.
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
                        'Existing package loaded. Review the selected courses before updating.'
                    );
                } else {
                    setNotice(
                        'No package exists for this combination. Select courses to create one.'
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

    // Change package criteria.
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

    // Select all visible courses.
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

    // Clear visible course selections.
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

    // Save a new package or update an existing one.
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
                'Your selection contains courses outside the current criteria. Review your selections.'
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
                data.message ||
                'Course package saved successfully.'
            );
        } catch (err) {
            setError(
                err.message || 'Could not save course package.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="batch-assignment-page">
            <header className="batch-header">
                <div>
                    <span className="batch-eyebrow">
                        ADMINISTRATION / ACADEMICS
                    </span>

                    <h1>Bulk Course Assignment</h1>

                    <p>
                        Create and manage reusable course packages
                        by program, semester, and department.
                    </p>
                </div>

                <button
                    type="button"
                    className="batch-back-button"
                    onClick={() => navigate('/admin')}
                >
                    ← Back to Dashboard
                </button>
            </header>

            <form
                className="batch-panel"
                onSubmit={handleSavePackage}
            >
                <div className="batch-section-heading">
                    <div className="batch-heading-icon">01</div>

                    <div>
                        <h2>Course Package Details</h2>
                        <p>
                            Choose the academic combination for this package.
                        </p>
                    </div>
                </div>

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
                                <option
                                    key={number}
                                    value={number}
                                >
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

                {/* Existing package warning or new package status */}
                <div
                    className={`batch-package-status ${
                        loadingPackage
                            ? 'is-loading'
                            : packageExists
                                ? 'is-existing'
                                : 'is-new'
                    }`}
                    aria-live="polite"
                >
                    <div
                        className="batch-package-status-icon"
                        aria-hidden="true"
                    >
                        {loadingPackage
                            ? '…'
                            : packageExists
                                ? '✓'
                                : '+'}
                    </div>

                    <div className="batch-package-status-content">
                        <div className="batch-package-status-heading">
                            <strong>
                                {program} · Semester {semester}
                            </strong>

                            <span
                                className={`batch-status-pill ${
                                    loadingPackage
                                        ? 'is-loading'
                                        : packageExists
                                            ? 'is-existing'
                                            : 'is-new'
                                }`}
                            >
                                {loadingPackage
                                    ? 'Checking'
                                    : packageExists
                                        ? 'Package exists'
                                        : 'New package'}
                            </span>
                        </div>

                        <p className="batch-package-department">
                            {department}
                        </p>

                        <p className="batch-package-status-message">
                            {loadingPackage
                                ? 'Checking whether a package has already been saved for this combination…'
                                : packageExists
                                    ? 'A course package already exists for these details. Review the selected courses below. Saving changes will update the existing package instead of creating another one.'
                                    : 'No package exists for this combination yet. Select the courses you want to include, then create the package.'}
                        </p>
                    </div>
                </div>

                <div className="batch-course-heading">
                    <div>
                        <span className="batch-eyebrow">
                            COURSE CATALOGUE
                        </span>

                        <h2>Available Courses</h2>

                        <p>
                            Select the courses that belong in this package.
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
                    <div className="batch-loading">
                        Loading courses…
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="batch-empty">
                        <strong>No matching courses found</strong>
                        <p>
                            No courses match this program, semester,
                            and department. Check your course records.
                        </p>
                    </div>
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
                                    disabled={
                                        loadingPackage || submitting
                                    }
                                />

                                <span className="batch-course-option-text">
                                    <strong>{course.courseCode}</strong>
                                    <span className="batch-course-dash">
                                        —
                                    </span>
                                    {course.courseName}
                                </span>

                                {selectedCourses.includes(
                                    String(course._id)
                                ) && (
                                    <span className="batch-selected-label">
                                        Selected
                                    </span>
                                )}
                            </label>
                        ))}
                    </div>
                )}

                <div className="batch-selection-summary">
                    <div>
                        <span className="batch-selection-number">
                            {selectedCourses.length}
                        </span>

                        <span>
                            course(s) selected
                        </span>
                    </div>

                    <span className="batch-summary-program">
                        {program} / Sem {semester}
                    </span>
                </div>

                {error && (
                    <div className="batch-error" role="alert">
                        <strong>Unable to continue</strong>
                        <p>{error}</p>
                    </div>
                )}

                {notice && (
                    <div
                        className={`batch-notice ${
                            packageExists
                                ? 'batch-notice-existing'
                                : ''
                        }`}
                        role="status"
                    >
                        {notice}
                    </div>
                )}

                <div className="batch-submit-area">
                    <div className="batch-submit-description">
                        <strong>
                            {packageExists
                                ? 'Update existing package'
                                : 'Create course package'}
                        </strong>

                        <p>
                            {packageExists
                                ? 'Your changes will be saved to this package.'
                                : 'Your selection will be saved as a reusable package.'}
                        </p>
                    </div>

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
                            ? 'Saving Package…'
                            : packageExists
                                ? 'Update Course Package →'
                                : 'Create Course Package →'}
                    </button>
                </div>

                <p className="batch-package-note">
                    Saving a package does not enroll students.
                    Student enrollment remains a separate operation.
                </p>
            </form>
        </div>
    );
}

export default AssignCoursesToBatch;
