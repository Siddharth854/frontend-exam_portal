import { useNavigate } from 'react-router-dom';

function Students() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Students Management</h1>

            <button onClick={() => navigate('/admin')}>
                Back to Dashboard
            </button>

            <hr />

            <button onClick={() => navigate('/students/add')}>
                Add Student
            </button>

            <h2>Student List</h2>

            <p>No students added yet.</p>
        </div>
    );
}

export default Students;