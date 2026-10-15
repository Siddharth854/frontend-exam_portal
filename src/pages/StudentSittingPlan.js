import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

const API_URL = 'https://backend-exam-paper.vercel.app';

function StudentSittingPlan() {
    const navigate = useNavigate();
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSittingPlan = async () => {
            try {
                const token = localStorage.getItem('token');

                const response = await fetch(
                    `${API_URL}/seating-arrangements/my-sitting`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Unable to load sitting plan (HTTP ${response.status}).`
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

                setAllocations(records);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSittingPlan();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const getSubject = (item) => {
        const session = item.examSession || item.session || {};
        const subject = session.subject || item.subject || {};
        const course = item.course || session.course || {};

        return (
            course.courseName ||
            course.name ||
            subject.subjectName ||
            subject.name ||
            session.subjectName ||
            item.subjectName ||
            'Subject unavailable'
        );
    };

    const getDate = (item) => {
        const session = item.examSession || item.session || {};
        const value =
            session.sessionDate ||
            item.sessionDate ||
            item.examDate ||
            item.date;

        if (!value) return 'Date unavailable';

        const date = new Date(value);

        return Number.isNaN(date.getTime())
            ? 'Date unavailable'
            : date.toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
              });
    };

    const getShift = (item) => {
        const session = item.examSession || item.session || {};

        return (
            session.sessionType ||
            session.shift ||
            item.sessionType ||
            item.shift ||
            'Shift unavailable'
        );
    };

    const getTiming = (item) => {
        const session = item.examSession || item.session || {};
        const startTime = session.startTime || item.startTime;
        const endTime = session.endTime || item.endTime;

        if (startTime && endTime) {
            return `${startTime} - ${endTime}`;
        }

        if (startTime) return `Starts at ${startTime}`;

        return 'Timing unavailable';
    };

    const getClassroom = (item) => {
        const room =
            item.classroom ||
            item.classroomId ||
            item.room ||
            {};

        return (
            room.classroomName ||
            room.roomName ||
            room.name ||
            room.classroomNumber ||
            room.roomNumber ||
            (typeof room === 'string' ? room : '') ||
            'Room unavailable'
        );
    };

    const getSeat = (item) =>
        item.seatNumber ??
        item.seatNo ??
        item.assignedSeat ??
        item.seat?.seatNumber ??
        'Seat unavailable';

    return (
        <div className="management-page">
            <div className="management-header">
                <div>
                    <h1>My Sitting Plan</h1>
                    <p>
                        View your examination date, shift, timing,
                        classroom and assigned seat.
                    </p>
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

            {loading && <p>Loading your sitting plan...</p>}

            {error && (
                <p role="alert" className="error-message">
                    {error}
                </p>
            )}

            {!loading && !error && allocations.length === 0 && (
                <p>No sitting plan is available for your account yet.</p>
            )}

            {!loading && !error && allocations.length > 0 && (
                <div className="management-table-container">
                    <table className="management-table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Exam Date</th>
                                <th>Shift</th>
                                <th>Timing</th>
                                <th>Classroom</th>
                                <th>Seat Number</th>
                            </tr>
                        </thead>

                        <tbody>
                            {allocations.map((item, index) => (
                                <tr key={item._id || item.id || index}>
                                    <td>{getSubject(item)}</td>
                                    <td>{getDate(item)}</td>
                                    <td>{getShift(item)}</td>
                                    <td>{getTiming(item)}</td>
                                    <td>{getClassroom(item)}</td>
                                    <td>{getSeat(item)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default StudentSittingPlan;
