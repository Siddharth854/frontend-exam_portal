import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

function AddExamSession() {
    const navigate = useNavigate();

    const [examCycles, setExamCycles] = useState([]);

    const [sessionInfo, setSessionInfo] = useState({
        examCycle: '',
        sessionDate: '',
        startTime: '',
        endTime: '',
        sessionType: ''
    });

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // Fetch Exam Cycles
    useEffect(() => {
        const fetchExamCycles = async () => {
            try {
                const response = await fetch(
                    'http://localhost:8080/exam-cycles'
                );

                const result = await response.json();

                if (!response.ok) {
                    setMessage(
                        result.message || 'Unable to fetch exam cycles'
                    );
                    return;
                }

                setExamCycles(result.examCycles || []);

            } catch (error) {
                console.error('GET EXAM CYCLES ERROR:', error);
                setMessage('Unable to connect to the server');
            } finally {
                setLoading(false);
            }
        };

        fetchExamCycles();
    }, []);


    const handleChange = (e) => {
        const { name, value } = e.target;

        setSessionInfo({
            ...sessionInfo,
            [name]: value
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !sessionInfo.examCycle ||
            !sessionInfo.sessionDate ||
            !sessionInfo.startTime ||
            !sessionInfo.endTime ||
            !sessionInfo.sessionType
        ) {
            setMessage('Please fill all fields');
            return;
        }

        if (sessionInfo.startTime >= sessionInfo.endTime) {
            setMessage('Start time must be before end time');
            return;
        }

        try {
            const response = await fetch(
                'http://localhost:8080/exam-sessions/add',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(sessionInfo)
                }
            );

            const result = await response.json();

            if (!response.ok) {
                setMessage(
                    result.message || 'Unable to add exam session'
                );
                return;
            }

            setMessage('Exam session added successfully');

            setTimeout(() => {
                navigate('/exam-sessions');
            }, 1000);

        } catch (error) {
            console.error('ADD EXAM SESSION ERROR:', error);
            setMessage('Unable to connect to the server');
        }
    };


    return (
        <div className="management-page">

            {/* Header */}

            <div className="management-header">

                <div>
                    <h1>Add Exam Session</h1>

                    <p className="management-subtitle">
                        Create an examination date and time slot
                    </p>
                </div>

                <div className="management-actions">

                    <button
                        className="management-button secondary"
                        onClick={() => navigate('/exam-sessions')}
                    >
                        ← Back to Exam Sessions
                    </button>

                </div>

            </div>


            {/* Form */}

            <div className="form-card">

                <div className="form-card-header">

                    <h2>Exam Session Information</h2>

                    <p>
                        Select an exam cycle and define the examination
                        date and time.
                    </p>

                </div>


                <form
                    className="management-form"
                    onSubmit={handleSubmit}
                >

                    {/* Exam Cycle */}

                    <div className="form-group full-width">

                        <label>Exam Cycle</label>

                        <select
                            name="examCycle"
                            value={sessionInfo.examCycle}
                            onChange={handleChange}
                            disabled={loading}
                        >

                            <option value="">
                                {loading
                                    ? 'Loading exam cycles...'
                                    : 'Select Exam Cycle'}
                            </option>

                            {examCycles.map((cycle) => (

                                <option
                                    key={cycle._id}
                                    value={cycle._id}
                                >
                                    {cycle.cycleName}
                                </option>

                            ))}

                        </select>

                    </div>


                    {/* Date + Session Type */}

                    <div className="form-row">

                        <div className="form-group">

                            <label>Session Date</label>

                            <input
                                type="date"
                                name="sessionDate"
                                value={sessionInfo.sessionDate}
                                onChange={handleChange}
                            />

                        </div>


                        <div className="form-group">

                            <label>Session Type</label>

                            <select
                                name="sessionType"
                                value={sessionInfo.sessionType}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select Session Type
                                </option>

                                <option value="Morning">
                                    Morning
                                </option>

                                <option value="Afternoon">
                                    Afternoon
                                </option>

                                <option value="Evening">
                                    Evening
                                </option>

                            </select>

                        </div>

                    </div>


                    {/* Time */}

                    <div className="form-row">

                        <div className="form-group">

                            <label>Start Time</label>

                            <input
                                type="time"
                                name="startTime"
                                value={sessionInfo.startTime}
                                onChange={handleChange}
                            />

                        </div>


                        <div className="form-group">

                            <label>End Time</label>

                            <input
                                type="time"
                                name="endTime"
                                value={sessionInfo.endTime}
                                onChange={handleChange}
                            />

                        </div>

                    </div>


                    {message && (
                        <div className="form-message">
                            {message}
                        </div>
                    )}


                    {/* Buttons */}

                    <div className="form-actions">

                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() => navigate('/exam-sessions')}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="submit-button"
                        >
                            + Add Exam Session
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default AddExamSession;