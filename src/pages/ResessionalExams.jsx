import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

const API = 'https://backend-exam-paper.vercel.app';

function ResessionalExams() {

const [editingStudentId, setEditingStudentId] = useState('');
const [editingRegistrationId, setEditingRegistrationId] = useState('');
const [editCourse, setEditCourse] = useState('');
const [editSaving, setEditSaving] = useState(false);
const [editError, setEditError] = useState('');
    
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [cycles, setCycles] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [registrations, setRegistrations] = useState([]);

    const [examCycle, setExamCycle] = useState('');
    const [student, setStudent] = useState('');
    const [course, setCourse] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [studentCourses, setStudentCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [courseError, setCourseError] = useState('');

    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // Declare label helpers BEFORE groupedRegistrations uses courseLabel.
    const studentLabel = (item) =>
        item?.user?.name ||
        item?.name ||
        item?.studentId ||
        item?.user?.email ||
        item?._id ||
        'Unknown student';

    const courseLabel = (item) =>
        `${item?.courseCode || ''} ${item?.courseName || item?.name || ''}`.trim() ||
        item?._id ||
        'Course details unavailable';

    // Group registrations by student so a student appears once per exam cycle.
    const groupedRegistrations = Object.values(
        registrations.reduce((groups, item) => {
            const studentValue = item.student?._id || item.student;
            const studentId = String(studentValue || 'unknown-student');

            if (!groups[studentId]) {
                groups[studentId] = {
                    studentId,
                    student: item.student || {},
                    examCycle: item.examCycle,
                    courses: [],
                    registrationIds: []
                };
            }

            const courseValue = item.course;
            const courseId = courseValue?._id || courseValue;
            const courseKey = String(courseId || '');

            if (
                courseKey &&
                !groups[studentId].courses.some(
                    (registeredCourse) =>
                        String(registeredCourse._id) === courseKey
                )
            ) {
                groups[studentId].courses.push({
                    _id: courseKey,
                    label:
                        courseValue && typeof courseValue === 'object'
                            ? courseLabel(courseValue)
                            : 'Course details unavailable'
                });
            }

            if (item._id) {
                groups[studentId].registrationIds.push(item._id);
            }

            return groups;
        }, {})
    );

    useEffect(() => {
        const loadData = async () => {
            try {
                const [cycleRes, studentRes, courseRes] = await Promise.all([
                    fetch(`${API}/exam-cycles`, { headers }),
                    fetch(`${API}/students`, { headers }),
                    fetch(`${API}/courses`, { headers })
                ]);

                const [cycleData, studentData, courseData] = await Promise.all([
                    cycleRes.json(),
                    studentRes.json(),
                    courseRes.json()
                ]);

                if (!cycleRes.ok || !studentRes.ok || !courseRes.ok) {
                    throw new Error(
                        cycleData.message ||
                        studentData.message ||
                        courseData.message ||
                        'Unable to load cycles, students, or courses.'
                    );
                }

                setCycles(
                    Array.isArray(cycleData)
                        ? cycleData
                        : cycleData.examCycles || cycleData.cycles || []
                );

                setStudents(
                    Array.isArray(studentData)
                        ? studentData
                        : studentData.students || []
                );

                setCourses(
                    Array.isArray(courseData)
                        ? courseData
                        : courseData.courses || []
                );
            } catch (err) {
                setError(err.message || 'Unable to load data.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
        // Initial page load only.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadRegistrations = async (cycleId) => {
        if (!cycleId) {
            setRegistrations([]);
            return;
        }

        try {
            setError('');

            const response = await fetch(
                `${API}/course-enrollments/exam-registration/cycle/${cycleId}`,
                { headers }
            );

            const responseText = await response.text();
            let data;

            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error(
                    `The backend returned a non-JSON response (${response.status}). ` +
                    'Check the API route and deployment.'
                );
            }

            if (!response.ok) {
                throw new Error(data.message || 'Unable to load registrations.');
            }

            setRegistrations(data.registrations || []);
        } catch (err) {
            setRegistrations([]);
            setError(err.message || 'Unable to load registrations.');
        }
    };

    const fetchStudentCourses = async (studentId) => {
        setStudentCourses([]);
        setCourse('');
        setCourseError('');

        if (!studentId) return;

        setLoadingCourses(true);

        try {
            const response = await fetch(`${API}/course-enrollments`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Failed to fetch course enrollments.'
                );
            }

            const enrollments = Array.isArray(data)
                ? data
                : data.enrollments || data.courseEnrollments || [];

            const filteredCourses = enrollments
                .filter((enrollment) => {
                    const enrolledStudent =
                        enrollment.student?._id || enrollment.student;
                    return String(enrolledStudent) === String(studentId);
                })
                .map((enrollment) => enrollment.course)
                .filter(Boolean);

            const uniqueCourses = Array.from(
                new Map(
                    filteredCourses.map((item) => [String(item._id), item])
                ).values()
            );

            setStudentCourses(uniqueCourses);
        } catch (err) {
            console.error('Error fetching student courses:', err);
            setCourseError(err.message || 'Failed to fetch courses for student.');
        } finally {
            setLoadingCourses(false);
        }
    };

    const handleCycleChange = (value) => {
        setExamCycle(value);
        setMessage('');
        setError('');
        loadRegistrations(value);
    };

    const handleRegister = async (event) => {
        event.preventDefault();
        setMessage('');
        setError('');

        if (!examCycle || !student || !course) {
            setError('Select an exam cycle, student, and course.');
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(
                `${API}/course-enrollments/exam-registration/add`,
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        student,
                        course,
                        examCycle
                    })
                }
            );

            const responseText = await response.text();
            let data;

            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error(
                    `The backend returned a non-JSON response (${response.status}).`
                );
            }

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed.');
            }

            setMessage(data.message || 'Student registered successfully.');
            setStudent('');
            setCourse('');
            setStudentCourses([]);
            await loadRegistrations(examCycle);
        } catch (err) {
            setError(err.message || 'Registration failed.');
        } finally {
            setSaving(false);
        }
    };

    
            const handleEditStudent = (studentId) => {
            const studentRegistrations = registrations.filter((item) => {
                const id = item.student?._id || item.student;
                return String(id) === String(studentId);
            });

            if (studentRegistrations.length === 0) {
                setError('No registrations found for this student.');
                return;
            }

            setEditingStudentId(studentId);
            setEditingRegistrationId(studentRegistrations[0]._id);

            const firstCourse = studentRegistrations[0].course;
            setEditCourse(String(firstCourse?._id || firstCourse || ''));

            setEditError('');
            setError('');
        };

    
            const handleSaveSubject = async (event) => {
    event.preventDefault();

    const registration = registrations.find(
        (item) => String(item._id) === String(editingRegistrationId)
    );

    if (!registration || !editCourse) {
        setEditError('Please select a registration and course.');
        return;
    }

    const currentStudent =
        registration.student?._id || registration.student;

    const currentCycle =
        registration.examCycle?._id || registration.examCycle;

    setEditSaving(true);
    setEditError('');

    try {
        const response = await fetch(
            `${API}/course-enrollments/exam-registration/${registration._id}`,
            {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    student: currentStudent,
                    course: editCourse,
                    examCycle: currentCycle
                })
            }
        );

        const responseText = await response.text();
        let data;

        try {
            data = JSON.parse(responseText);
        } catch {
            throw new Error(
                `Backend returned an invalid response (${response.status}).`
            );
        }

        if (!response.ok) {
            throw new Error(
                data.message || 'Unable to update the subject.'
            );
        }

        setMessage(data.message || 'Subject updated successfully.');
        setEditingStudentId('');
        setEditingRegistrationId('');
        setEditCourse('');

        await loadRegistrations(examCycle);
    } catch (err) {
        setEditError(err.message || 'Unable to update the subject.');
    } finally {
        setEditSaving(false);
    }
};

    const handleDeleteEdit = async () => {
    if (!editingRegistrationId) return;

    if (!window.confirm('Delete this exam registration permanently?')) {
        return;
    }

    setEditSaving(true);
    setEditError('');

    try {
        const response = await fetch(
            `${API}/course-enrollments/exam-registration/${editingRegistrationId}`,
            {
                method: 'DELETE',
                headers
            }
        );

        const responseText = await response.text();
        let data;

        try {
            data = JSON.parse(responseText);
        } catch {
            throw new Error(
                `Backend returned a non-JSON response (${response.status}). Check the deployed DELETE route.`
            );
        }

        if (!response.ok) {
            throw new Error(
                data.message || 'Failed to delete registration.'
            );
        }

        setEditingStudentId('');
        setEditingRegistrationId('');
        setEditCourse('');
        setEditError('');

        setMessage(
            data.message || 'Registration deleted successfully.'
        );

        await loadRegistrations(examCycle);
    } catch (err) {
        setEditError(err.message || 'Failed to delete registration.');
    } finally {
        setEditSaving(false);
    }
};

    if (loading) {
        return (
            <div className="management-page">
                Loading resessional exam data...
            </div>
        );
    }

   
return (
    <div className="management-page resessional-page">
        <div className="resessional-hero">
            <div className="resessional-hero-content">
                <span className="resessional-eyebrow">
                    EXAM ADMINISTRATION
                </span>
                <h1>Resessional Exam Management</h1>
                <p>
                    Manage student registrations and organize courses for
                    resessional examinations.
                </p>
            </div>

            <button
                className="management-button secondary resessional-dashboard-btn"
                onClick={() => navigate('/admin')}
            >
                ← Dashboard
            </button>
        </div>

        {message && (
            <div className="resessional-alert success" role="status">
                <span>✓</span> {message}
            </div>
        )}

        {error && (
            <div className="resessional-alert error" role="alert">
                <span>!</span> {error}
            </div>
        )}

        <div className="resessional-stats">
            <div className="resessional-stat-card">
                <div className="resessional-stat-icon purple">♙</div>
                <div>
                    <p>Registered Students</p>
                    <h2>{groupedRegistrations.length}</h2>
                    <span>In selected exam cycle</span>
                </div>
            </div>

            <div className="resessional-stat-card">
                <div className="resessional-stat-icon blue">▤</div>
                <div>
                    <p>Course Registrations</p>
                    <h2>{registrations.length}</h2>
                    <span>Total retake entries</span>
                </div>
            </div>

            <div className="resessional-stat-card">
                <div className="resessional-stat-icon green">▣</div>
                <div>
                    <p>Available Exam Cycles</p>
                    <h2>{cycles.length}</h2>
                    <span>Configured cycles</span>
                </div>
            </div>
        </div>

        <section className="management-card resessional-form-card">
            <div className="resessional-section-heading">
                <div className="resessional-heading-icon">＋</div>
                <div>
                    <h2>Register a Student</h2>
                    <p>Select an exam cycle, student, and course to retake.</p>
                </div>
            </div>

            <form
                className="resessional-registration-form"
                onSubmit={handleRegister}
            >
                <div className="resessional-field">
                    <label htmlFor="examCycle">Exam Cycle</label>
                    <select
                        id="examCycle"
                        value={examCycle}
                        onChange={(event) =>
                            handleCycleChange(event.target.value)
                        }
                        required
                    >
                        <option value="">Select exam cycle</option>
                        {cycles.map((item) => (
                            <option key={item._id} value={item._id}>
                                {item.cycleName}
                            </option>
                        ))}
                    </select>
                    <small>Choose the resessional examination.</small>
                </div>

                <div className="resessional-field">
                    <label htmlFor="student">Student</label>
                    <select
                        id="student"
                        value={student}
                        onChange={(event) => {
                            const selectedStudent = event.target.value;
                            setStudent(selectedStudent);
                            fetchStudentCourses(selectedStudent);
                        }}
                        required
                    >
                        <option value="">Select a student</option>
                        {students.map((item) => (
                            <option key={item._id} value={item._id}>
                                {studentLabel(item)}
                            </option>
                        ))}
                    </select>
                    <small>Choose the student to register.</small>
                </div>

                <div className="resessional-field">
                    <label htmlFor="course">Course to Retake</label>
                    <select
                        id="course"
                        value={course}
                        onChange={(event) => setCourse(event.target.value)}
                        disabled={!student || loadingCourses}
                        required
                    >
                        <option value="">
                            {!student
                                ? 'Select a student first'
                                : loadingCourses
                                  ? 'Loading courses...'
                                  : studentCourses.length === 0
                                    ? 'No registered courses found'
                                    : 'Select a course'}
                        </option>

                        {studentCourses.map((item) => (
                            <option key={item._id} value={item._id}>
                                {courseLabel(item)}
                            </option>
                        ))}
                    </select>
                    <small>Only courses enrolled by the student are listed.</small>
                </div>

                {courseError && (
                    <p className="resessional-inline-error" role="alert">
                        {courseError}
                    </p>
                )}

                <div className="resessional-form-footer">
                    <p>Check your selections before submitting.</p>
                    <button
                        type="submit"
                        className="management-button primary resessional-submit-btn"
                        disabled={saving || loadingCourses}
                    >
                        {saving ? 'Registering...' : '＋ Register Student'}
                    </button>
                </div>
            </form>
        </section>

        <section className="management-card resessional-list-card">
            <div className="resessional-list-header">
                <div>
                    <span className="resessional-eyebrow">REGISTRATION RECORDS</span>
                    <h2>Registered Students</h2>
                    <p>Review students and their assigned retake courses.</p>
                </div>

                <span className="resessional-record-badge">
                    {registrations.length} registrations
                </span>
            </div>

            {!examCycle ? (
                <div className="resessional-empty-state">
                    <div>▤</div>
                    <h3>Select an exam cycle</h3>
                    <p>Choose an exam cycle above to view its registrations.</p>
                </div>
            ) : groupedRegistrations.length === 0 ? (
                <div className="resessional-empty-state">
                    <div>♙</div>
                    <h3>No registrations yet</h3>
                    <p>Registered students will appear here for this exam cycle.</p>
                </div>
            ) : (
                <div className="table-wrapper resessional-table-wrapper">
                    <table className="management-table resessional-table">
                        <thead>
                            <tr>
                                <th>STUDENT</th>
                                <th>COURSES</th>
                                <th>REGISTERED COURSES</th>
                                <th>EXAM CYCLE</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>

                        <tbody>
                            {groupedRegistrations.map((item) => (
                                <tr key={item.studentId}>
                                    <td>
                                        <div className="resessional-student-cell">
                                            <div className="resessional-avatar">
                                                {String(
                                                    studentLabel(item.student)
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <div>
                                                <strong>
                                                    {studentLabel(item.student)}
                                                </strong>
                                                <small>Student</small>
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <span className="course-count resessional-course-count">
                                            {item.courses.length}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="resessional-course-list">
                                            {item.courses.map((registeredCourse) => (
                                                <span
                                                    className="resessional-course-chip"
                                                    key={registeredCourse._id}
                                                >
                                                    {registeredCourse.label}
                                                </span>
                                            ))}
                                        </div>
                                    </td>

                                    <td>
                                        <span className="resessional-cycle-label">
                                            {item.examCycle?.cycleName ||
                                                'Selected cycle'}
                                        </span>
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            className="edit-registration-button"
                                            title="Select student"
                                            aria-label={`Select ${studentLabel(item.student)}`}
                                            onClick={() =>
                                                handleEditStudent(item.studentId)
                                            }
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                aria-hidden="true"
                                            >
                                                <path d="M12 20h9" />
                                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4Z" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
        {editingStudentId && (
    <div className="registration-modal-overlay">
        <div
            className="registration-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-subject-title"
        >
            <h2 id="edit-subject-title">Change Resessional Subject</h2>

            <p>
                Select the student's existing registration, then choose
                the replacement subject.
            </p>

            {editError && (
                <p className="resessional-inline-error" role="alert">
                    {editError}
                </p>
            )}

            <form onSubmit={handleSaveSubject}>
                <label htmlFor="edit-registration">
                    Registration to edit
                </label>

                <select
                    id="edit-registration"
                    value={editingRegistrationId}
                    onChange={(event) => {
                        const id = event.target.value;
                        setEditingRegistrationId(id);

                        const selected = registrations.find(
                            (item) => String(item._id) === String(id)
                        );

                        const selectedCourse = selected?.course;
                        setEditCourse(
                            String(selectedCourse?._id || selectedCourse || '')
                        );

                        setEditError('');
                    }}
                    required
                >
                    {registrations
                        .filter((item) => {
                            const id = item.student?._id || item.student;
                            return String(id) === String(editingStudentId);
                        })
                        .map((item) => (
                            <option key={item._id} value={item._id}>
                                {courseLabel(
                                    typeof item.course === 'object'
                                        ? item.course
                                        : courses.find(
                                              (c) =>
                                                  String(c._id) ===
                                                  String(item.course)
                                          ) || {}
                                )}
                            </option>
                        ))}
                </select>

                <label htmlFor="edit-course">New Subject</label>

                <select
                    id="edit-course"
                    value={editCourse}
                    onChange={(event) => setEditCourse(event.target.value)}
                    required
                >
                    <option value="">Select replacement subject</option>

                    {courses.map((item) => (
                        <option key={item._id} value={item._id}>
                            {courseLabel(item)}
                        </option>
                    ))}
                </select>

                <div className="registration-modal-actions">
                    <button
                        type="button"
                        className="registration-delete-button"
                        onClick={handleDeleteEdit}
                        disabled={editSaving}
                    >
                        {editSaving ? 'Processing...' : 'Delete Registration'}
                    </button>

                    <button type="submit" disabled={editSaving}>
                        {editSaving ? 'Saving...' : 'Save Subject'}
                    </button>
                </div>
            </form>
        </div>
    </div>
)}
    </div>
);

}

export default ResessionalExams;