
import { useNavigate } from 'react-router-dom';
import './Management.css';

function Students() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const features = [
        {
            title: 'My Exam Schedule',
            description:
                'View your examination dates, subjects, and exam timings.',
            icon: '📅',
            path: '/student/exam-schedule'
        },
        {
            title: 'My Sitting Plan',
            description:
                'Check your assigned examination room and seat details.',
            icon: '🪑',
            path: '/student/sitting-plan'
        },
        {
            title: 'My Exam Shifts',
            description:
                'View your morning or afternoon exam shifts and reporting times.',
            icon: '🕒',
            path: '/student/exam-shifts'
        }
    ];

    return (
        <div className="management-page">
            <div className="management-header">
                <div>
                    <h1>Student Dashboard</h1>
                    <p>View your examination information</p>
                </div>

                <div className="management-actions">
                    <button
                        type="button"
                        className="management-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="student-feature-grid">
                {features.map((feature) => (
                    <div className="student-feature-card" key={feature.path}>
                        <div className="student-feature-icon">
                            {feature.icon}
                        </div>

                        <h2>{feature.title}</h2>
                        <p>{feature.description}</p>

                        <button
                            type="button"
                            className="management-button"
                            onClick={() => navigate(feature.path)}
                        >
                            View Details
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Students;
