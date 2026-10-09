import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

function Teachers() {
    const navigate = useNavigate();

    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await fetch(
                    'https://backend-exam-paper.vercel.app/teachers'
                );

                const result = await response.json();

                console.log('TEACHERS API RESPONSE:', result);

                if (!response.ok) {
                    setMessage(
                        result.message || 'Unable to fetch teachers'
                    );
                    return;
                }

                setTeachers(result.teachers || []);

            } catch (error) {
                console.error('GET TEACHERS ERROR:', error);
                setMessage('Unable to connect to the server');
            } finally {
                setLoading(false);
            }
        };

        fetchTeachers();
    }, []);

    return (
        <div className="management-page">

            <div className="management-header">

                <h1>Teachers Management</h1>

                <div className="management-actions">

                    <button
                        className="management-button"
                        onClick={() => navigate('/admin')}
                    >
                        Back to Dashboard
                    </button>

                    <button
                        className="management-button"
                        onClick={() => navigate('/teachers/add')}
                    >
                        Add Teacher
                    </button>

                </div>

            </div>

            <div className="management-card">

                <h2>Teacher List</h2>

                {loading && (
                    <p className="management-message">
                        Loading teachers...
                    </p>
                )}

                {message && (
                    <p className="management-message">
                        {message}
                    </p>
                )}

                {!loading && !message && teachers.length === 0 && (
                    <p className="management-message">
                        No teachers added yet.
                    </p>
                )}

                {!loading && !message && teachers.length > 0 && (

                    <table className="management-table">

                        <thead>
                            <tr>
                                <th>Teacher ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Designation</th>
                            </tr>
                        </thead>

                        <tbody>

                            {teachers.map((teacher) => (
                                <tr key={teacher._id}>
                                    <td>{teacher.teacherId}</td>
                                    <td>{teacher.user?.name}</td>
                                    <td>{teacher.user?.email}</td>
                                    <td>{teacher.department}</td>
                                    <td>{teacher.designation}</td>
                                </tr>
                            ))}

                        </tbody>

                    </table>

                )}

            </div>

        </div>
    );
}

export default Teachers;
