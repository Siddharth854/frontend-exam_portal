import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

function AddClassroom() {
    const navigate = useNavigate();

    const [classroomInfo, setClassroomInfo] = useState({
        roomNumber: '',
        building: '',
        floor: '',
        capacity: ''
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;

        setClassroomInfo({
            ...classroomInfo,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !classroomInfo.roomNumber ||
            !classroomInfo.building ||
            classroomInfo.floor === '' ||
            classroomInfo.capacity === ''
        ) {
            setMessage('Please fill all fields');
            return;
        }

        try {
            const response = await fetch(
                'https://backend-exam-paper.vercel.app/classrooms/add',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        roomNumber: classroomInfo.roomNumber,
                        building: classroomInfo.building,
                        floor: Number(classroomInfo.floor),
                        capacity: Number(classroomInfo.capacity)
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                setMessage(result.message || 'Unable to add classroom');
                return;
            }

            setMessage('Classroom added successfully');

            setTimeout(() => {
                navigate('/classrooms');
            }, 1000);

        } catch (error) {
            console.error('ADD CLASSROOM ERROR:', error);
            setMessage('Unable to connect to the server');
        }
    };

    return (
        <div className="management-page">

            <div className="management-header">

                <div>
                    <h1>Add Classroom</h1>

                    <p className="management-subtitle">
                        Add a new examination classroom
                    </p>
                </div>

                <div className="management-actions">

                    <button
                        className="management-button secondary"
                        onClick={() => navigate('/classrooms')}
                    >
                        ← Back to Classrooms
                    </button>

                </div>

            </div>


            <div className="form-card">

                <div className="form-card-header">
                    <h2>Classroom Information</h2>

                    <p>
                        Enter the details of the classroom below.
                    </p>
                </div>


                <form
                    className="management-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-row">

                        <div className="form-group">

                            <label>Room Number</label>

                            <input
                                type="text"
                                name="roomNumber"
                                placeholder="Example: R2AB0304"
                                value={classroomInfo.roomNumber}
                                onChange={handleChange}
                            />

                        </div>


                        <div className="form-group">

                            <label>Building</label>

                            <input
                                type="text"
                                name="building"
                                placeholder="Example: AB"
                                value={classroomInfo.building}
                                onChange={handleChange}
                            />

                        </div>

                    </div>


                    <div className="form-row">

                        <div className="form-group">

                            <label>Floor</label>

                            <input
                                type="number"
                                name="floor"
                                placeholder="Example: 3"
                                min="0"
                                value={classroomInfo.floor}
                                onChange={handleChange}
                            />

                        </div>


                        <div className="form-group">

                            <label>Capacity</label>

                            <input
                                type="number"
                                name="capacity"
                                placeholder="Example: 60"
                                min="1"
                                value={classroomInfo.capacity}
                                onChange={handleChange}
                            />

                        </div>

                    </div>


                    {message && (
                        <div className="form-message">
                            {message}
                        </div>
                    )}


                    <div className="form-actions">

                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() => navigate('/classrooms')}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="submit-button"
                        >
                            + Add Classroom
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default AddClassroom;