import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

const API_BASE = 'https://backend-exam-paper.vercel.app';

function StudentExamShifts() {
    const navigate = useNavigate();

    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStudentShifts = async () => {
            try {
                setLoading(true);
                setError('');

                const token = localStorage.getItem('token');

                if (!token) {
                    throw new Error(
                        'Your session has expired. Please log in again.'
                    );
                }

                const response = await fetch(
                    `${API_BASE}/seating-arrangements/my-sitting`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Unable to load exam shifts (HTTP ${response.status}).`
                    );
                }

                const data = await response.json();

                const records = Array.isArray(data)
                    ? data
                    : data.seatingArrangement ||
                      data.allocations ||
                      data.seatingArrangements ||
                      data.seatingPlan ||
                      data.data ||
                      [];

                const getSession = (item) =>
                    item.examSession || item.session || {};

                const getCourse = (item) => {
                    const session = getSession(item);
                    return item.course || session.course || {};
                };

                const getRoom = (item) => {
                    const room =
                        item.classroom ||
                        item.classroomId ||
                        item.room ||
                        {};

                    return (
                        room.classroomName ||
                        room.roomName ||
                        room.classroomNumber ||
                        room.roomNumber ||
                        room.name ||
                        (typeof room === 'string' ? room : '') ||
                        '-'
                    );
                };

                const formattedShifts = records
                    .map((item, index) => {
                        const session = getSession(item);
                        const course = getCourse(item);

                        const examDate =
                            session.sessionDate ||
                            item.sessionDate ||
                            item.examDate ||
                            item.date ||
                            '';

                        return {
                            id: item._id || item.id || index,

                            courseCode:
                                course.courseCode ||
                                item.courseCode ||
                                '-',

                            courseName:
                                course.courseName ||
                                course.name ||
                                session.subjectName ||
                                item.subjectName ||
                                'Subject unavailable',

                            examDate,

                            startTime:
                                session.startTime ||
                                item.startTime ||
                                '',

                            endTime:
                                session.endTime ||
                                item.endTime ||
                                '',

                            sessionType:
                                session.sessionType ||
                                session.shift ||
                                item.sessionType ||
                                item.shift ||
                                'Not specified',

                            roomNo: getRoom(item)
                        };
                    })
                    .sort((a, b) => {
                        if (!a.examDate) return 1;
                        if (!b.examDate) return -1;

                        return (
                            new Date(a.examDate) -
                            new Date(b.examDate)
                        );
                    });

                setShifts(formattedShifts);
            } catch (err) {
                console.error('STUDENT EXAM SHIFTS ERROR:', err);

                setError(
                    err.message || 'Unable to load exam shifts.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchStudentShifts();
    }, []);

    const formatDate = (date) => {
        if (!date) return 'Not scheduled';

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return date;
        }

        return parsed.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="management-page">
            <div className="management-header">
                <div>
                    <h1>My Exam Shifts</h1>
                    <p>
                        View your examination sessions and timings.
                    </p>
                </div>

                <div className="management-actions">
                    <button
                        type="button"
                        className="management-button secondary"
                        onClick={() => navigate('/student')}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Scheduled Exams</h3>
                    <p>{shifts.length}</p>
                </div>
            </div>

            <div className="management-card">
                <h2>My Examination Sessions</h2>

                {loading && (
                    <p>Loading your exam shifts...</p>
                )}

                {!loading && error && (
                    <div className="management-message">
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && shifts.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">🕒</div>

                        <h3>No Exam Shifts Available</h3>

                        <p>
                            No examination sessions were found in your
                            sitting plan. Please check whether your
                            timetable and seating arrangements have
                            been generated.
                        </p>
                    </div>
                )}

                {!loading && !error && shifts.length > 0 && (
                    <div className="management-table-container">
                        <table className="management-table">
                            <thead>
                                <tr>
                                    <th>Course Code</th>
                                    <th>Course Name</th>
                                    <th>Exam Date</th>
                                    <th>Shift</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Room No.</th>
                                </tr>
                            </thead>

                            <tbody>
                                {shifts.map((shift) => (
                                    <tr key={shift.id}>
                                        <td>
                                            <strong>
                                                {shift.courseCode}
                                            </strong>
                                        </td>

                                        <td>{shift.courseName}</td>

                                        <td>
                                            {formatDate(shift.examDate)}
                                        </td>

                                        <td>{shift.sessionType}</td>

                                        <td>
                                            {shift.startTime || '-'}
                                        </td>

                                        <td>
                                            {shift.endTime || '-'}
                                        </td>

                                        <td>{shift.roomNo}</td>
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

export default StudentExamShifts;
