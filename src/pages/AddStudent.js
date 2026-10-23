
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddStudent.css';

const API_URL = 'https://backend-exam-paper.vercel.app';

const PROGRAMS = ['MCA', 'BCA', 'BSC', 'MSC', 'BTECH'];

function AddStudent() {
    const navigate = useNavigate();

    const [studentInfo, setStudentInfo] = useState({
        studentId: '',
        email: '',
        department: '',
        program: 'MCA',
        semester: ''
    });

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setStudentInfo((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        const studentId = studentInfo.studentId.trim();
        const email = studentInfo.email.trim().toLowerCase();
        const department = studentInfo.department.trim();
        const program = studentInfo.program.trim().toUpperCase();
        const semester = Number(studentInfo.semester);

        if (
            !studentId ||
            !email ||
            !department ||
            !program ||
            !studentInfo.semester
        ) {
            setMessage('Please complete all student profile fields.');
            return;
        }

        if (!PROGRAMS.includes(program)) {
            setMessage('Please select a valid program.');
            return;
        }

        if (!Number.isInteger(semester) || semester < 1 || semester > 10) {
            setMessage('Semester must be a whole number from 1 to 10.');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}/students/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token
                        ? { Authorization: `Bearer ${token}` }
                        : {})
                },
                body: JSON.stringify({
                    studentId,
                    email,
                    department,
                    program,
                    semester
                })
            });

            const result = await response.json();

            if (!response.ok) {
                setMessage(result.message || 'Unable to add student.');
                return;
            }

            setMessage('Student profile created successfully.');

            setStudentInfo({
                studentId: '',
                email: '',
                department: '',
                program: 'MCA',
                semester: ''
            });
        } catch (error) {
            console.error('ADD STUDENT ERROR:', error);
            setMessage('Unable to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-student-page">
            <div className="add-student-card">
                <div className="add-student-header">
                    <h1>Register Student Profile</h1>
                    <p>
                        Link an existing student login account to its
                        academic profile.
                    </p>
                </div>

                <form
                    className="add-student-form"
                    onSubmit={handleSubmit}
                >
                    <div className="add-student-field">
                        <label htmlFor="studentId">
                            Registration Number
                        </label>
                        <input
                            id="studentId"
                            name="studentId"
                            value={studentInfo.studentId}
                            onChange={handleChange}
                            placeholder="Enter registration number"
                            required
                        />
                    </div>

                    <div className="add-student-field">
                        <label htmlFor="email">University Email</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={studentInfo.email}
                            onChange={handleChange}
                            placeholder="Enter existing student account email"
                            required
                        />
                    </div>

                    <div className="add-student-field">
                        <label htmlFor="department">Department</label>
                        <input
                            id="department"
                            name="department"
                            value={studentInfo.department}
                            onChange={handleChange}
                            placeholder="e.g. Computer Application"
                            required
                        />
                    </div>

                    <div className="add-student-field">
                        <label htmlFor="program">Program / Branch</label>
                        <select
                            id="program"
                            name="program"
                            value={studentInfo.program}
                            onChange={handleChange}
                            required
                        >
                            {PROGRAMS.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="add-student-field">
                        <label htmlFor="semester">Semester</label>
                        <input
                            id="semester"
                            type="number"
                            name="semester"
                            value={studentInfo.semester}
                            onChange={handleChange}
                            placeholder="Enter semester"
                            min="1"
                            max="10"
                            step="1"
                            required
                        />
                    </div>

                    <div className="add-student-actions">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Registering...' : 'Register Student'}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/students')}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>

                    {message && (
                        <div
                            className="add-student-message"
                            role="status"
                        >
                            {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default AddStudent;
