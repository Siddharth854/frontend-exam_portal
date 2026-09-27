import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
                    setMessage(result.message || 'Unable to fetch teachers');
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
        <div>
            <h1>Teachers Management</h1>

            <button onClick={() => navigate('/admin')}>
                Back to Dashboard
            </button>

            <button onClick={() => navigate('/teachers/add')}>
                Add Teacher
            </button>

            <h2>Teacher List</h2>

            {loading && <p>Loading teachers...</p>}

            {message && <p>{message}</p>}

            {!loading && !message && teachers.length === 0 && (
                <p>No teachers added yet.</p>
            )}

            {!loading && teachers.length > 0 && (
                <table border="1" cellPadding="10">
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
    );
}

export default Teachers;