import { useNavigate } from 'react-router-dom';

function AddStudent() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Add Student</h1>

            <form>

                <div>
                    <label>Student ID</label>
                    <input
                        type="text"
                        name="studentId"
                        placeholder="Enter student ID"
                    />
                </div>

                <br />

                <div>
                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Enter student name"
                    />
                </div>

                <br />

                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter student email"
                    />
                </div>

                <br />

                <div>
                    <label>Department</label>
                    <input
                        type="text"
                        name="department"
                        placeholder="Enter department"
                    />
                </div>

                <br />

                <div>
                    <label>Semester</label>
                    <input
                        type="number"
                        name="semester"
                        placeholder="Enter semester"
                    />
                </div>

                <br />

                <button type="submit">
                    Add Student
                </button>

                <button
                    type="button"
                    onClick={() => navigate('/students')}
                >
                    Cancel
                </button>

            </form>
        </div>
    );
}

export default AddStudent;