import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

function ExamCycles() {
    const navigate = useNavigate();

    const [examCycles, setExamCycles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchExamCycles = async () => {
            try {
                const response = await fetch(
                    'https://backend-exam-paper.vercel.app/exam-cycles'
                );

                const result = await response.json();

                console.log('EXAM CYCLES API RESPONSE:', result);

                if (!response.ok) {
                    setMessage(
                        result.message || 'Unable to fetch exam cycles'
                    );
                    return;
                }

                setExamCycles(result.examCycles || []);

            } catch (error) {
                console.error('GET EXAM CYCLES ERROR:', error);
                setMessage('Unable to connect to the server');
            } finally {
                setLoading(false);
            }
        };

        fetchExamCycles();
    }, []);

    const totalCycles = examCycles.length;

    const activeCycles = examCycles.filter(
        (cycle) => cycle.status === 'Active'
    ).length;

    const upcomingCycles = examCycles.filter(
        (cycle) => cycle.status === 'Upcoming'
    ).length;

    const completedCycles = examCycles.filter(
        (cycle) => cycle.status === 'Completed'
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

            {/* Header */}

            <div className="management-header">

                <div>
                    <h1>Exam Cycle Management</h1>

                    <p className="management-subtitle">
                        Manage examination periods and academic cycles
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
                        onClick={() => navigate('/exam-cycles/add')}
                    >
                        + Add Exam Cycle
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
                        <h3>{totalCycles}</h3>
                        <p>Total Cycles</p>
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon">
                        🟢
                    </div>

                    <div>
                        <h3>{activeCycles}</h3>
                        <p>Active Cycles</p>
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon">
                        ⏳
                    </div>

                    <div>
                        <h3>{upcomingCycles}</h3>
                        <p>Upcoming Cycles</p>
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon">
                        ✓
                    </div>

                    <div>
                        <h3>{completedCycles}</h3>
                        <p>Completed</p>
                    </div>

                </div>

            </div>


            {/* Exam Cycle Table */}

            <div className="management-card">

                <div className="table-header">

                    <div>
                        <h2>Exam Cycle List</h2>

                        <p>
                            All examination cycles configured in the system
                        </p>
                    </div>

                </div>


                {loading && (
                    <div className="management-message">
                        Loading exam cycles...
                    </div>
                )}


                {message && (
                    <div className="management-message">
                        {message}
                    </div>
                )}


                {!loading &&
                    !message &&
                    examCycles.length === 0 && (
                        <div className="empty-state">

                            <div className="empty-icon">
                                📅
                            </div>

                            <h3>
                                No Exam Cycles Added
                            </h3>

                            <p>
                                Create an exam cycle to start
                                scheduling examinations.
                            </p>

                            <button
                                className="management-button primary"
                                onClick={() =>
                                    navigate('/exam-cycles/add')
                                }
                            >
                                + Add Exam Cycle
                            </button>

                        </div>
                    )}


                {!loading &&
                    !message &&
                    examCycles.length > 0 && (

                        <div className="table-wrapper">

                            <table className="management-table">

                                <thead>

                                    <tr>
                                        <th>Cycle Name</th>
                                        <th>Academic Year</th>
                                        <th>Semester</th>
                                        <th>Exam Type</th>
                                        <th>Duration</th>
                                        <th>Status</th>
                                    </tr>

                                </thead>


                                <tbody>

                                    {examCycles.map((cycle) => (

                                        <tr key={cycle._id}>

                                            <td>
                                                <strong>
                                                    {cycle.cycleName}
                                                </strong>
                                            </td>

                                            <td>
                                                {cycle.academicYear}
                                            </td>

                                            <td>
                                                Semester {cycle.semester}
                                            </td>

                                            <td>
                                                {cycle.examType}
                                            </td>

                                            <td>
                                                {formatDate(cycle.startDate)}
                                                {' → '}
                                                {formatDate(cycle.endDate)}
                                            </td>

                                            <td>

                                                <span
                                                    className={`status-badge ${cycle.status.toLowerCase()}`}
                                                >
                                                    {cycle.status}
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

export default ExamCycles;