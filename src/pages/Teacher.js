import { useNavigate } from 'react-router-dom';

function Teachers() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Teachers Management</h1>

            <button onClick={() => navigate('/admin')}>
                Back to Dashboard
            </button>

            <hr />

            <button>
                Add Teacher
            </button>

            <h2>Teacher List</h2>

            <p>No teachers added yet.</p>
        </div>
    );
}

export default Teachers;