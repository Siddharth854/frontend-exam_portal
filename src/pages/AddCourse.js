
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddCourse.css';

const initialCourseInfo = {
    courseCode: '',
    courseName: '',
    program: '',
    department: '',
    semester: '',
    examDuration: ''
};

function AddCourse() {
    const navigate = useNavigate();

    const [courseInfo, setCourseInfo] = useState(initialCourseInfo);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [saving, setSaving] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setCourseInfo((previous) => ({
            ...previous,
            [name]: value
        }));

        setMessage('');
        setMessageType('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setMessageType('');

        const {
            courseCode,
            courseName,
            program,
            department,
            semester,
            examDuration
        } = courseInfo;

        if (
            !courseCode.trim() ||
            !courseName.trim() ||
            !program ||
            !department.trim() ||
            !semester ||
            !examDuration
        ) {
            setMessage('Please complete all fields before submitting.');
            setMessageType('error');
            return;
        }

        if (
            Number(semester) < 1 ||
            Number(semester) > 10 ||
            Number(examDuration) < 30
        ) {
            setMessage(
                'Semester must be between 1 and 10, and exam duration must be at least 30 minutes.'
            );
            setMessageType('error');
            return;
        }

        try {
            setSaving(true);

            const response = await fetch(
                'https://backend-exam-paper.vercel.app/courses/add',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        courseCode: courseCode.trim(),
                        courseName: courseName.trim(),
                        program: program.trim().toUpperCase(),
                        department: department.trim(),
                        semester: Number(semester),
                        examDuration: Number(examDuration)
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Unable to add course.'
                );
            }

            setCourseInfo({ ...initialCourseInfo });
            setMessage(
                result.message || 'Course added successfully!'
            );
            setMessageType('success');
        } catch (error) {
            console.error('ADD COURSE ERROR:', error);

            setMessage(
                error.message || 'Unable to connect to the server.'
            );
            setMessageType('error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="add-course-page">
            <header className="add-course-header">
                <div className="add-course-brand">
                    <div className="add-course-brand-icon">AC</div>
                    <span>EXAM PORTAL</span>
                </div>

                <button
                    type="button"
                    className="add-course-back-button"
                    onClick={() => navigate('/courses')}
                >
                    <span aria-hidden="true">←</span>
                    Back to Courses
                </button>
            </header>

            <section className="add-course-intro">
                <span className="add-course-eyebrow">
                    ACADEMIC MANAGEMENT
                </span>

                <h1>Add a New Course</h1>

                <p>
                    Add course details to your academic catalogue
                    for examination scheduling and resource planning.
                </p>
            </section>

            <section className="add-course-card">
                <div className="add-course-card-heading">
                    <div className="add-course-heading-icon">
                        <svg
                            viewBox="0 0 24 24"
                            width="25"
                            height="25"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                    </div>

                    <div>
                        <h2>Course Information</h2>
                        <p>
                            Enter the details below to register a course.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="add-course-form-grid">
                        <div className="add-course-field">
                            <label htmlFor="courseCode">
                                Course Code <span>*</span>
                            </label>

                            <input
                                id="courseCode"
                                type="text"
                                name="courseCode"
                                value={courseInfo.courseCode}
                                onChange={handleChange}
                                placeholder="e.g. CAP7105"
                                maxLength={30}
                                required
                            />

                            <small>
                                Enter the official course identifier.
                            </small>
                        </div>

                        <div className="add-course-field">
                            <label htmlFor="courseName">
                                Course Name <span>*</span>
                            </label>

                            <input
                                id="courseName"
                                type="text"
                                name="courseName"
                                value={courseInfo.courseName}
                                onChange={handleChange}
                                placeholder="e.g. Android Application Development"
                                maxLength={150}
                                required
                            />

                            <small>
                                Use the official course title.
                            </small>
                        </div>

                        <div className="add-course-field">
                            <label htmlFor="program">
                                Program / Branch <span>*</span>
                            </label>

                            <select
                                id="program"
                                name="program"
                                value={courseInfo.program}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Select a program
                                </option>
                                <option value="MCA">MCA</option>
                                <option value="BCA">BCA</option>
                                <option value="BSC">BSc</option>
                                <option value="MSC">MSc</option>
                                <option value="BTECH">BTech</option>
                            </select>
                        </div>

                        <div className="add-course-field">
                            <label htmlFor="department">
                                Department <span>*</span>
                            </label>

                            <input
                                id="department"
                                type="text"
                                name="department"
                                value={courseInfo.department}
                                onChange={handleChange}
                                placeholder="e.g. Computer Application"
                                maxLength={100}
                                required
                            />
                        </div>

                        <div className="add-course-field">
                            <label htmlFor="semester">
                                Semester <span>*</span>
                            </label>

                            <select
                                id="semester"
                                name="semester"
                                value={courseInfo.semester}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Select semester
                                </option>

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
                        </div>

                        <div className="add-course-field">
                            <label htmlFor="examDuration">
                                Exam Duration <span>*</span>
                            </label>

                            <div className="add-course-duration-input">
                                <input
                                    id="examDuration"
                                    type="number"
                                    name="examDuration"
                                    value={courseInfo.examDuration}
                                    onChange={handleChange}
                                    placeholder="e.g. 180"
                                    min="30"
                                    max="600"
                                    step="1"
                                    required
                                />

                                <span>minutes</span>
                            </div>

                            <small>
                                Minimum 30 minutes.
                            </small>
                        </div>
                    </div>

                    {message && (
                        <div
                            className={`add-course-message ${messageType}`}
                            role={messageType === 'error' ? 'alert' : 'status'}
                        >
                            <span className="add-course-message-icon">
                                {messageType === 'success' ? '✓' : '!'}
                            </span>
                            <p>{message}</p>
                        </div>
                    )}

                    <div className="add-course-form-footer">
                        <p>
                            <span>*</span> Required fields
                        </p>

                        <div className="add-course-actions">
                            <button
                                type="button"
                                className="add-course-cancel"
                                onClick={() => navigate('/courses')}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="add-course-submit"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <span className="add-course-spinner" />
                                        Saving Course...
                                    </>
                                ) : (
                                    <>
                                        <span aria-hidden="true">+</span>
                                        Add Course
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </section>

            <p className="add-course-bottom-note">
                University Examination Scheduling &amp; Resource Allocation
            </p>
        </main>
    );
}

export default AddCourse;
