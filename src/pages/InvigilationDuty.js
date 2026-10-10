import React, { useEffect, useState } from 'react';
import './InvigilationDuty.css';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://backend-exam-paper.vercel.app';

const EXAM_CYCLE_ID = '6abb62c3ad097fe712b475fb';

function InvigilationDuty() {
    const navigate = useNavigate();

    const handleBackToDashboard = () => {
    navigate('/admin');
};

<button
    type="button"
    onClick={handleBackToDashboard}
    className="back-dashboard-btn"
>
    ← Back to Dashboard
</button>

    const [duties, setDuties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchDuties = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch(
                `${API_URL}/invigilation-duties?examCycle=${EXAM_CYCLE_ID}`
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || 'Failed to fetch invigilation duties.'
                );
            }

            setDuties(data.duties || []);
        } catch (err) {
            setError(err.message || 'Unable to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDuties();
    }, []);

    const formatDate = (date) => {
        if (!date) return '—';

        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC'
        });
    };

const getTeacherName = (teacher) => {
    if (!teacher) return 'Unknown teacher';

    return teacher.user?.name || teacher.teacherId || 'Unknown teacher';
};

    return (
        <div className="invigilation-page">
            <div className="invigilation-header">
                <div>
                    <h1>Invigilation Duty Dashboard</h1>
                    <p>Manage and review examination invigilation assignments.</p>
                </div>

                <div className="invigilation-actions">
                    <button
                        type="button"
                        onClick={fetchDuties}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>

                    <button
                        type="button"
                        onClick={() => window.print()}
                        disabled={!duties.length}
                    >
                        Print Duty Chart
                    </button>

                    <button
                        type="button"
                        onClick={handleBackToDashboard}
                        className="back-dashboard-btn"
                    >
                        ← Back to Dashboard
                    </button>

                </div>
            </div>

            <div className="invigilation-summary">
                <div className="invigilation-summary-card">
                    <span>Total Duties</span>
                    <strong>{duties.length}</strong>
                </div>

                <div className="invigilation-summary-card">
                    <span>Assigned</span>
                    <strong>
                        {duties.filter(duty => duty.status === 'Assigned').length}
                    </strong>
                </div>

                <div className="invigilation-summary-card">
                    <span>Completed</span>
                    <strong>
                        {duties.filter(duty => duty.status === 'Completed').length}
                    </strong>
                </div>
            </div>

            {error && (
                <div className="invigilation-error">
                    <p>{error}</p>
                    <button type="button" onClick={fetchDuties}>
                        Try Again
                    </button>
                </div>
            )}

            {loading && duties.length === 0 && (
                <p className="invigilation-message">
                    Loading invigilation duties...
                </p>
            )}

            {!loading && !error && duties.length === 0 && (
                <div className="invigilation-empty">
                    <h3>No duties found</h3>
                    <p>Generate invigilation duties from the backend first.</p>
                </div>
            )}

            {duties.length > 0 && (
                <div className="invigilation-table-wrapper">
                    <table className="invigilation-table">
                        <thead>
                            <tr>
                                <th>S.No.</th>
                                <th>Exam Date</th>
                                <th>Session</th>
                                <th>Time</th>
                                <th>Teacher ID</th>
                                <th>Teacher Name</th>
                                <th>Classroom</th>
                                <th>Duty Role</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {duties.map((duty, index) => (
                                <tr key={duty._id || index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        {formatDate(duty.examSession?.sessionDate)}
                                    </td>
                                    <td>
                                        {duty.examSession?.sessionType || '—'}
                                    </td>
                                    <td>
                                        {duty.examSession?.startTime || '—'}
                                        {' - '}
                                        {duty.examSession?.endTime || '—'}
                                    </td>
                                    <td>
                                        {duty.teacher?.teacherId || '—'}
                                    </td>
                                    <td>{getTeacherName(duty.teacher)}</td>
                                    <td>
                                        {duty.classroom?.roomNumber || '—'}
                                    </td>
                                    <td>{duty.dutyRole || '—'}</td>
                                    <td>
                                        <span
                                            className={`invigilation-status ${
                                                duty.status === 'Completed'
                                                    ? 'completed'
                                                    : duty.status === 'Cancelled'
                                                    ? 'cancelled'
                                                    : 'assigned'
                                            }`}
                                        >
                                            {duty.status || 'Unknown'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
        
    );
}

export default InvigilationDuty;
