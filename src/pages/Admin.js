import { useNavigate } from 'react-router-dom';
    
import './Admin.css';

function Admin() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('role');

        navigate('/login');
    };

    return (
        <div className="admin-container">

            {/* Sidebar */}

            <aside className="admin-sidebar">

                <h2>Exam Portal</h2>

                <div className="sidebar-section">
                    <p className="sidebar-title">Management</p>

                <button className="sidebar-button"
                    onClick={() => navigate('/students')}> Students
                </button>

                    <button
                        className="sidebar-button"
                        onClick={() => navigate('/teachers')}
                    >
                        Teachers
                    </button>

                    <button
                        className="sidebar-button"
                        onClick={() => navigate('/courses')} >
                        Courses
                    </button>

                    <button className="sidebar-button"
                            onClick={() => navigate('/classrooms')}>
                        Classrooms
                    </button>

                    <button className="sidebar-button"
                            onClick={() => navigate('/exam-cycles')}>
                        Exam Cycles
                    </button>

                    <button className="sidebar-button"
                            onClick={() => navigate('/exam-sessions')} >
                        Exam Sessions
                    </button>
                    
                </div>

                <div className="sidebar-section">
                    <p className="sidebar-title">Scheduling</p>

                    <button className="sidebar-button">
                        Generate Timetable
                    </button>

                    <button className="sidebar-button">
                        Room Allocation
                    </button>

                    <button className="sidebar-button">
                        Seating Arrangement
                    </button>

                    <button className="sidebar-button">
                        Invigilation Duty
                    </button>

                    <button
                        className="sidebar-button"
                        onClick={() => navigate('/courses')}
                    >
                        Courses
                    </button>

                    <button
                        className="sidebar-button"
                        onClick={() => navigate('/classrooms')}
                    >
                        Classrooms
                    </button>

                </div>

            </aside>


            {/* Main Content */}

            <main className="admin-main">

                <header className="admin-header">

                    <div>
                        <h1>Admin Dashboard</h1>

                        <p>
                            Welcome, {localStorage.getItem('loggedInUser')}
                        </p>
                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </header>


                {/* Dashboard Cards */}

                <div className="dashboard-grid">

                    <div className="dashboard-card">
                        <h3>Students</h3>
                        <p>0</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Teachers</h3>
                        <p>0</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Courses</h3>
                        <p>0</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Classrooms</h3>
                        <p>0</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Exam Cycles</h3>
                        <p>0</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Exam Sessions</h3>
                        <p>0</p>
                    </div>

                </div>


                {/* Scheduling */}

                <section className="scheduling-section">

                    <h2>Scheduling Operations</h2>

                    <div className="scheduling-grid">

                        <button className="scheduling-card">
                            Generate Timetable
                        </button>

                        <button className="scheduling-card">
                            Room Allocation
                        </button>

                        <button className="scheduling-card">
                            Seating Arrangement
                        </button>

                        <button className="scheduling-card">
                            Invigilation Duty
                        </button>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Admin;

// import { useNavigate } from 'react-router-dom';

// function Admin() {
//     const navigate = useNavigate();

//     const handleLogout = () => {
//         localStorage.removeItem('token');
//         localStorage.removeItem('loggedInUser');
//         localStorage.removeItem('role');

//         navigate('/login');
//     };

//     return (
//         <div>
//             <h1>Admin Dashboard</h1>

//             <p>Welcome, {localStorage.getItem('loggedInUser')}</p>

//             <hr />

//             <h2>Exam Scheduling Management</h2>

//             <div>
//                 <button>Students</button>
//                 <button>Teachers</button>
//                 <button>Courses</button>
//                 <button>Classrooms</button>
//                 <button>Exam Cycles</button>
//                 <button>Exam Sessions</button>
//             </div>

//             <hr />

//             <h2>Scheduling</h2>

//             <div>
//                 <button>Generate Timetable</button>
//                 <button>Room Allocation</button>
//                 <button>Seating Arrangement</button>
//                 <button>Invigilation Duty</button>
//             </div>

//             <hr />

//             <button onClick={handleLogout}>Logout</button>
//         </div>
//     );
// }

// export default Admin;