import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

function Classrooms() {
    const navigate = useNavigate();

    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                const response = await fetch(
                    'https://backend-exam-paper.vercel.app/classrooms'
                );

                const result = await response.json();

                console.log('CLASSROOMS API RESPONSE:', result);

                if (!response.ok) {
                    setMessage(result.message || 'Unable to fetch classrooms');
                    return;
                }

                setClassrooms(result.classrooms || []);

            } catch (error) {
                console.error('GET CLASSROOMS ERROR:', error);
                setMessage('Unable to connect to the server');
            } finally {
                setLoading(false);
            }
        };

        fetchClassrooms();
    }, []);

    // Dashboard statistics
    const totalRooms = classrooms.length;

    const totalCapacity = classrooms.reduce(
        (total, classroom) => total + classroom.capacity,
        0
    );

    const totalBuildings = new Set(
        classrooms.map((classroom) => classroom.building)
    ).size;

    return (
        <div className="management-page">

            {/* Header */}
            <div className="management-header">

                <div>
                    <h1>Classroom Management</h1>
                    <p className="management-subtitle">
                        Manage examination classrooms and seating capacity
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
                        onClick={() => navigate('/classrooms/add')}
                    >
                        + Add Classroom
                    </button>

                </div>

            </div>


            {/* Statistics */}
            <div className="stats-grid">

                <div className="stat-card">
                    <div className="stat-icon">🏫</div>
                    <div>
                        <h3>{totalRooms}</h3>
                        <p>Total Classrooms</p>
                    </div>
                </div>


                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div>
                        <h3>{totalCapacity}</h3>
                        <p>Total Capacity</p>
                    </div>
                </div>


                <div className="stat-card">
                    <div className="stat-icon">🏢</div>
                    <div>
                        <h3>{totalBuildings}</h3>
                        <p>Buildings</p>
                    </div>
                </div>

            </div>


            {/* Classroom Table */}
            <div className="management-card">

                <div className="table-header">

                    <div>
                        <h2>Classroom List</h2>
                        <p>
                            All classrooms available for examination scheduling
                        </p>
                    </div>

                </div>


                {loading && (
                    <div className="management-message">
                        Loading classrooms...
                    </div>
                )}


                {message && (
                    <div className="management-message">
                        {message}
                    </div>
                )}


                {!loading && !message && classrooms.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">🏫</div>
                        <h3>No Classrooms Added</h3>
                        <p>
                            Add your first classroom to start managing
                            examination rooms.
                        </p>

                        <button
                            className="management-button primary"
                            onClick={() => navigate('/classrooms/add')}
                        >
                            + Add Classroom
                        </button>
                    </div>
                )}


                {!loading && classrooms.length > 0 && (
                    <div className="table-wrapper">

                        <table className="management-table">

                            <thead>
                                <tr>
                                    <th>Room Number</th>
                                    <th>Building</th>
                                    <th>Floor</th>
                                    <th>Capacity</th>
                                </tr>
                            </thead>

                            <tbody>

                                {classrooms.map((classroom) => (

                                    <tr key={classroom._id}>

                                        <td>
                                            <strong>
                                                {classroom.roomNumber}
                                            </strong>
                                        </td>

                                        <td>
                                            {classroom.building}
                                        </td>

                                        <td>
                                            Floor {classroom.floor}
                                        </td>

                                        <td>
                                            <span className="capacity-badge">
                                                {classroom.capacity} Seats
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

export default Classrooms;