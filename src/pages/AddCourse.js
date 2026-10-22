
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddCourse() {
    const navigate = useNavigate();

    const [courseInfo, setCourseInfo] = useState({
        courseCode: '',
        courseName: '',
        program: '',
        department: '',
        semester: '',
        examDuration: ''
    });

    const [message, setMessage] = useState('');
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setCourseInfo((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

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
            setMessage('Please fill in all fields.');
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

            setMessage('Course added successfully.');

            setCourseInfo({
                courseCode: '',
                courseName: '',
                program: '',
                department: '',
                semester: '',
                examDuration: ''
            });
        } catch (error) {
            console.error('ADD COURSE ERROR:', error);
            setMessage(
                error.message || 'Unable to connect to the server.'
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <h1>Add Course</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="courseCode">Course Code</label>
                    <input
                        id="courseCode"
                        type="text"
                        name="courseCode"
                        value={courseInfo.courseCode}
                        onChange={handleChange}
                        placeholder="Enter course code"
                        required
                    />
                </div>

                <br />

                <div>
                    <label htmlFor="courseName">Course Name</label>
                    <input
                        id="courseName"
                        type="text"
                        name="courseName"
                        value={courseInfo.courseName}
                        onChange={handleChange}
                        placeholder="Enter course name"
                        required
                    />
                </div>

                <br />

                <div>
                    <label htmlFor="program">Program / Branch</label>
                    <select
                        id="program"
                        name="program"
                        value={courseInfo.program}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select program</option>
                        <option value="MCA">MCA</option>
                        <option value="BCA">BCA</option>
                        <option value="BSC">BSc</option>
                        <option value="MSC">MSc</option>
                        <option value="BTECH">BTech</option>
                    </select>
                </div>

                <br />

                <div>
                    <label htmlFor="department">Department</label>
                    <input
                        id="department"
                        type="text"
                        name="department"
                        value={courseInfo.department}
                        onChange={handleChange}
                        placeholder="e.g. Computer Application"
                        required
                    />
                </div>

                <br />

                <div>
                    <label htmlFor="semester">Semester</label>
                    <input
                        id="semester"
                        type="number"
                        name="semester"
                        value={courseInfo.semester}
                        onChange={handleChange}
                        placeholder="Enter semester"
                        min="1"
                        max="10"
                        required
                    />
                </div>

                <br />

                <div>
                    <label htmlFor="examDuration">
                        Exam Duration (minutes)
                    </label>
                    <input
                        id="examDuration"
                        type="number"
                        name="examDuration"
                        value={courseInfo.examDuration}
                        onChange={handleChange}
                        placeholder="Enter duration in minutes"
                        min="30"
                        required
                    />
                </div>

                <br />

                <button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Add Course'}
                </button>

                <button
                    type="button"
                    onClick={() => navigate('/courses')}
                    disabled={saving}
                >
                    Cancel
                </button>
            </form>

            {message && <p role="status">{message}</p>}
        </div>
    );
}

export default AddCourse;
