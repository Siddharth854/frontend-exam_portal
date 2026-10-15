import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

const API_URL = 'https://backend-exam-paper.vercel.app';

function StudentExamSchedule() {
    const navigate = useNavigate();

    const [examCycles, setExamCycles] = useState([]);
    const [selectedCycle, setSelectedCycle] = useState('');
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchExamCycles = async () => {
            try {
                const response = await fetch(`${API_URL}/exam-cycles`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Unable to load exam cycles.');
                }

                const data = await response.json();

                const cycles = Array.isArray(data)
                    ? data
                    : data.examCycles || data.cycles || [];

                setExamCycles(cycles);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchExamCycles();
    }, [token]);

    useEffect(() => {
        if (!selectedCycle) {
            setExams([]);
            return;
        }

        const fetchSchedule = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await fetch(
                    `${API_URL}/timetable?examCycle=${encodeURIComponent(selectedCycle)}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Unable to load the exam timetable.');
                }

                const data = await response.json();

                const records = Array.isArray(data)
                    ? data
                    : data.timetable || data.schedule || data.data || [];

                setExams(records);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [selectedCycle, token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const getExamName = (exam) => {
    const session = exam.examSession || exam.session || {};

    const subject = session.subject || exam.subject || {};
    const course = session.course || exam.course || {};

    return (
        subject.subjectName ||
        subject.name ||
        subject.courseName ||
        course.courseName ||
        course.name ||
        session.subjectName ||
        session.courseName ||
        exam.subjectName ||
        exam.courseName ||
        exam.subjectCode ||
        'Subject name unavailable'
    );
};

    const getExamDate = (exam) => {
        const session = exam.examSession || exam.session || {};
        const date = session.sessionDate || exam.sessionDate || exam.examDate || exam.date;

        if (!date) return 'Date not available';

        const parsedDate = new Date(date);

        return Number.isNaN(parsedDate.getTime())
            ? 'Date not available'
            : parsedDate.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
    };

    const getExamTime = (exam) => {
        const session = exam.examSession || exam.session || {};

        const start = session.startTime || exam.startTime;
        const end = session.endTime || exam.endTime;

        if (start && end) return `${start} - ${end}`;
        if (start) return start;

        return session.shift || exam.shift || 'Time not available';
    };

    return (
        <div className="management-page">
            <div className="management-header">
                <div>
                    <h1>My Exam Schedule</h1>
                    <p>View your examination dates, subjects, and timings.</p>
                </div>

                <div className="management-actions">
                    <button
                        type="button"
                        className="management-button"
                        onClick={() => navigate('/student')}
                    >
                        Back to Dashboard
                    </button>

                    <button
                        type="button"
                        className="management-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="management-card">
                <label htmlFor="examCycle">
                    <strong>Select Exam Cycle</strong>
                </label>

                <select
                    id="examCycle"
                    value={selectedCycle}
                    onChange={(event) => setSelectedCycle(event.target.value)}
                >
                    <option value="">-- Select Exam Cycle --</option>

                    {examCycles.map((cycle) => (
                        <option
                            key={cycle._id || cycle.id}
                            value={cycle._id || cycle.id}
                        >
                            {cycle.name ||
                                cycle.cycleName ||
                                cycle.examCycleName ||
                                'Exam Cycle'}
                        </option>
                    ))}
                </select>
            </div>

            {error && (
                <p role="alert" className="error-message">
                    {error}
                </p>
            )}

            {loading && <p>Loading exam schedule...</p>}

            {!loading && selectedCycle && exams.length === 0 && !error && (
                <p>No timetable entries found for this exam cycle.</p>
            )}

            {!loading && exams.length > 0 && (
                <div className="management-table-container">
                    <table className="management-table">
                        <thead>
                            <tr>
                                <th>Exam / Subject</th>
                                <th>Date</th>
                                <th>Time / Shift</th>
                            </tr>
                        </thead>

                        <tbody>
                            {exams.map((exam, index) => (
                                <tr key={exam._id || exam.id || index}>
                                    <td>{getExamName(exam)}</td>
                                    <td>{getExamDate(exam)}</td>
                                    <td>{getExamTime(exam)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default StudentExamSchedule;