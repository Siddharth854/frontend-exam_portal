import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

function ExamSessions() {
    const navigate = useNavigate();

    const [examSessions, setExamSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchExamSessions = async () => {
            try {
                const response = await fetch(
                    'http://localhost:8080/exam-sessions'
                );

                const result = await response.json();

                console.log('EXAM SESSIONS API RESPONSE:', result);

                if (!response.ok) {
                    setMessage(
                        result.message || 'Unable to fetch exam sessions'
                    );
                    return;
                }

                setExamSessions(result.examSessions || []);

            } catch (error) {
                console.error('GET EXAM SESSIONS ERROR:', error);
                setMessage('Unable to connect to the server');
            } finally {
                setLoading(false);
            }
        };

        fetchExamSessions();
    }, []);

    const totalSessions = examSessions.length;

    const morningSessions = examSessions.filter(
        (session) => session.sessionType === 'Morning'
    ).length;

    const afternoonSessions = examSessions.filter(
        (session) => session.sessionType === 'Afternoon'
    ).length;

    const eveningSessions = examSessions.filter(
        (session) => session.sessionType === 'Evening'
    ).length;

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="management-page">

            <div className="management-header">

                <div>
                    <h1>Exam Session Management</h1>

                    <p className="management-subtitle">
                        Manage individual examination dates and time slots
                    </p>
                </div>

                <div className="management-actions">

                    <button
                        className="management-button secondary"
                        onClick={() => navigate('/admin')}
                    >
                        ← Dashboard
                    </button>

                    <button
                        className="management-button primary"
                        onClick={() => navigate('/exam-sessions/add')}
                    >
                        + Add Exam Session
                    </button>

                </div>

            </div>


            {/* Statistics */}

            <div className="stats-grid">

                <div className="stat-card">

                    <div className="stat-icon">
                        📅
                    </div>

                    <div>
                        <h3>{totalSessions}</h3>
                        <p>Total Sessions</p>
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon">
                        🌅
                    </div>

                    <div>
                        <h3>{morningSessions}</h3>
                        <p>Morning</p>
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon">
                        ☀️
                    </div>

                    <div>
                        <h3>{afternoonSessions}</h3>
                        <p>Afternoon</p>
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon">
                        🌙
                    </div>

                    <div>
                        <h3>{eveningSessions}</h3>
                        <p>Evening</p>
                    </div>

                </div>

            </div>


            {/* Session List */}

            <div className="management-card">

                <div className="table-header">

                    <div>
                        <h2>Exam Session List</h2>

                        <p>
                            All examination sessions configured in the system
                        </p>
                    </div>

                </div>


                {loading && (
                    <div className="management-message">
                        Loading exam sessions...
                    </div>
                )}


                {message && (
                    <div className="management-message">
                        {message}
                    </div>
                )}


                {!loading &&
                    !message &&
                    examSessions.length === 0 && (

                        <div className="empty-state">

                            <div className="empty-icon">
                                📅
                            </div>

                            <h3>
                                No Exam Sessions Added
                            </h3>

                            <p>
                                Create an exam session to define
                                an examination date and time slot.
                            </p>

                            <button
                                className="management-button primary"
                                onClick={() =>
                                    navigate('/exam-sessions/add')
                                }
                            >
                                + Add Exam Session
                            </button>

                        </div>
                    )}


                {!loading &&
                    !message &&
                    examSessions.length > 0 && (

                        <div className="table-wrapper">

                            <table className="management-table">

                                <thead>

                                    <tr>
                                        <th>Exam Cycle</th>
                                        <th>Date</th>
                                        <th>Start Time</th>
                                        <th>End Time</th>
                                        <th>Session</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {examSessions.map((session) => (

                                        <tr key={session._id}>

                                            <td>
                                                <strong>
                                                    {session.examCycle?.cycleName ||
                                                        'N/A'}
                                                </strong>
                                            </td>

                                            <td>
                                                {formatDate(
                                                    session.sessionDate
                                                )}
                                            </td>

                                            <td>
                                                {session.startTime}
                                            </td>

                                            <td>
                                                {session.endTime}
                                            </td>

                                            <td>
                                                <span className="capacity-badge">
                                                    {session.sessionType}
                                                </span>
                                            </td>

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

export default ExamSessions;