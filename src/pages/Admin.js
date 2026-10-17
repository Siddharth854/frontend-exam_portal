
import './Admin.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Admin() {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        students: null,
        teachers: null,
        courses: null,
        classrooms: null,
        examCycles: null,
        examSessions: null
    });

    const [statsError, setStatsError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            const baseUrl = 'https://backend-exam-paper.vercel.app';
            const token = localStorage.getItem('token');

            const endpoints = [
                ['students', '/students', 'students'],
                ['teachers', '/teachers', 'teachers'],
                ['courses', '/courses', 'courses'],
                ['classrooms', '/classrooms', 'classrooms'],
                ['examCycles', '/exam-cycles', 'examCycles'],
                ['examSessions', '/exam-sessions', 'examSessions']
            ];

            try {
                const results = await Promise.all(
                    endpoints.map(async ([key, path, dataKey]) => {
                        const response = await fetch(
                            `${baseUrl}${path}`,
                            {
                                headers: token
                                    ? {
                                        Authorization: `Bearer ${token}`
                                    }
                                    : {}
                            }
                        );

                        const data = await response.json();

                        if (!response.ok) {
                            throw new Error(
                                `${path}: ${
                                    data.message || response.statusText
                                }`
                            );
                        }

                        const records = Array.isArray(data)
                            ? data
                            : data[dataKey];

                        if (!Array.isArray(records)) {
                            throw new Error(
                                `Unexpected response from ${path}`
                            );
                        }

                        return [key, records.length];
                    })
                );

                setStats(Object.fromEntries(results));
                setStatsError('');
            } catch (error) {
                console.error(
                    'Dashboard statistics error:',
                    error
                );
                setStatsError(error.message);
            }
        };

        fetchStats();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('studentEmail');
        localStorage.removeItem('role');

        navigate('/login');
    };

    return (
        <div className="admin-container">

            {/* Sidebar */}
            <aside className="admin-sidebar">

                <h2>Exam Portal</h2>

                {/* Management Section */}
                <div className="sidebar-section">
                    <p className="sidebar-title">Management</p>

                    <button
                        type="button"
                        className="sidebar-button"
                        onClick={() => navigate('/students')}
                    >
                        Students
                    </button>

                    <button
                        type="button"
                        className="sidebar-button"
                        onClick={() => navigate('/teachers')}
                    >
                        Teachers
                    </button>

                    <button
                        type="button"
                        className="sidebar-button"
                        onClick={() => navigate('/courses')}
                    >
                        Courses
                    </button>

                    <button
                        type="button"
                        className="sidebar-button"
                        onClick={() => navigate('/classrooms')}
                    >
                        Classrooms
                    </button>

                    <button
                        type="button"
                        className="sidebar-button"
                        onClick={() => navigate('/exam-cycles')}
                    >
                        Exam Cycles
                    </button>

                    <button
                        type="button"
                        className="sidebar-button"
                        onClick={() => navigate('/exam-sessions')}
                    >
                        Exam Sessions
                    </button>

                    <button
                        type="button"
                        className="sidebar-button"
                        onClick={() => navigate('/course-enrollments')}
                    >
                        Course Enrollments
                    </button>

                    {/* <button
                        type="button"
                        className="sidebar-button"
                        onClick={() => navigate('/resessional-exams')}
                    >
                        Resessional Exam Management
                    </button> */}
                </div>

                {/* Scheduling Section */}
                <div className="sidebar-section">
                    <p className="sidebar-title">Scheduling</p>

                    <button
                        type="button"
                        className="sidebar-button"
                        onClick={() => navigate('/exam-schedules')}
                    >
                        Exam Schedules
                    </button>

                    <button
                        type="button"
                        className="sidebar-button"
                        onClick={() => navigate('/room-allocation')}
                    >
                        Room Allocation
                    </button>

                    <button
                        type="button"
                        className="sidebar-button"
                        onClick={() => navigate('/seating-arrangement')}
                    >
                        Seating Arrangement
                    </button>

                    <button
                        type="button"
                        className="sidebar-button"
                        onClick={() => navigate('/invigilation-duty')}
                    >
                        Invigilation Duty
                    </button>
                </div>

            </aside>

            {/* Main Content */}
            <main className="admin-main">

                {/* Header */}
                <header className="admin-header">

                    <div>
                        <h1>Admin Dashboard</h1>

                        <p>
                            Welcome, {localStorage.getItem('loggedInUser')}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </header>

                {/* Dashboard Statistics */}
                <div className="dashboard-grid">

                    <div className="dashboard-card">
                        <h3>Students</h3>
                        <p>{stats.students ?? '—'}</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Teachers</h3>
                        <p>{stats.teachers ?? '—'}</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Courses</h3>
                        <p>{stats.courses ?? '—'}</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Classrooms</h3>
                        <p>{stats.classrooms ?? '—'}</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Exam Cycles</h3>
                        <p>{stats.examCycles ?? '—'}</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Exam Sessions</h3>
                        <p>{stats.examSessions ?? '—'}</p>
                    </div>

                </div>

                {/* Statistics Error */}
                {statsError && (
                    <p
                        role="alert"
                        style={{
                            color: 'red',
                            marginTop: '12px'
                        }}
                    >
                        Unable to load dashboard statistics: {statsError}
                    </p>
                )}

                {/* Scheduling Operations */}
                <section className="scheduling-section">

                    <h2>Scheduling Operations</h2>

                    <div className="scheduling-grid">

                        <button
                            type="button"
                            className="scheduling-card"
                            onClick={() => navigate('/timetable')}
                        >
                            Timetable
                        </button>

                        <button
                            type="button"
                            className="scheduling-card"
                            onClick={() => navigate('/room-allocation')}
                        >
                            Room Allocation
                        </button>

                        <button
                            type="button"
                            className="scheduling-card"
                            onClick={() => navigate('/seating-arrangement')}
                        >
                            Seating Arrangement
                        </button>

                        <button
                            type="button"
                            className="scheduling-card"
                            onClick={() => navigate('/invigilation-duty')}
                        >
                            Invigilation Duty
                        </button>

                        <button
                            type="button"
                            className="scheduling-card"
                            onClick={() => navigate('/resessional-exams')}
                        >
                            Resessional Exam Management
                        </button>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Admin;