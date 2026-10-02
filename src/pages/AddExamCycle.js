import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

function AddExamCycle() {
    const navigate = useNavigate();

    const [cycleInfo, setCycleInfo] = useState({
        cycleName: '',
        academicYear: '',
        semester: '',
        examType: '',
        startDate: '',
        endDate: '',
        status: 'Upcoming'
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;

        setCycleInfo({
            ...cycleInfo,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !cycleInfo.cycleName ||
            !cycleInfo.academicYear ||
            !cycleInfo.semester ||
            !cycleInfo.examType ||
            !cycleInfo.startDate ||
            !cycleInfo.endDate
        ) {
            setMessage('Please fill all required fields');
            return;
        }

        if (
            new Date(cycleInfo.startDate) >
            new Date(cycleInfo.endDate)
        ) {
            setMessage('Start date cannot be after end date');
            return;
        }

        try {
            const response = await fetch(
                'https://backend-exam-paper.vercel.app/exam-cycles/add',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        cycleName: cycleInfo.cycleName,
                        academicYear: cycleInfo.academicYear,
                        semester: Number(cycleInfo.semester),
                        examType: cycleInfo.examType,
                        startDate: cycleInfo.startDate,
                        endDate: cycleInfo.endDate,
                        status: cycleInfo.status
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                setMessage(
                    result.message || 'Unable to add exam cycle'
                );
                return;
            }

            setMessage('Exam cycle added successfully');

            setTimeout(() => {
                navigate('/exam-cycles');
            }, 1000);

        } catch (error) {
            console.error('ADD EXAM CYCLE ERROR:', error);
            setMessage('Unable to connect to the server');
        }
    };

    return (
        <div className="management-page">

            {/* Header */}

            <div className="management-header">

                <div>
                    <h1>Add Exam Cycle</h1>

                    <p className="management-subtitle">
                        Create a new examination cycle
                    </p>
                </div>

                <div className="management-actions">

                    <button
                        className="management-button secondary"
                        onClick={() => navigate('/exam-cycles')}
                    >
                        ← Back to Exam Cycles
                    </button>

                </div>

            </div>


            {/* Form Card */}

            <div className="form-card">

                <div className="form-card-header">

                    <h2>Exam Cycle Information</h2>

                    <p>
                        Enter the details of the examination cycle below.
                    </p>

                </div>


                <form
                    className="management-form"
                    onSubmit={handleSubmit}
                >

                    {/* Cycle Name */}

                    <div className="form-group full-width">

                        <label>Cycle Name</label>

                        <input
                            type="text"
                            name="cycleName"
                            placeholder="Example: MCA Semester III End Semester Examination"
                            value={cycleInfo.cycleName}
                            onChange={handleChange}
                        />

                    </div>


                    {/* Academic Year + Semester */}

                    <div className="form-row">

                        <div className="form-group">

                            <label>Academic Year</label>

                            <input
                                type="text"
                                name="academicYear"
                                placeholder="Example: 2026-27"
                                value={cycleInfo.academicYear}
                                onChange={handleChange}
                            />

                        </div>


                        <div className="form-group">

                            <label>Semester</label>

                            <input
                                type="number"
                                name="semester"
                                min="1"
                                placeholder="Example: 3"
                                value={cycleInfo.semester}
                                onChange={handleChange}
                            />

                        </div>

                    </div>


                    {/* Exam Type + Status */}

                    <div className="form-row">

                        <div className="form-group">

                            <label>Exam Type</label>

                            <select
                                name="examType"
                                value={cycleInfo.examType}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Select Exam Type
                                </option>

                                <option value="Mid Semester">
                                    Mid Semester
                                </option>

                                <option value="End Semester">
                                    End Semester
                                </option>

                                <option value="Supplementary">
                                    Supplementary
                                </option>

                            </select>

                        </div>


                        <div className="form-group">

                            <label>Status</label>

                            <select
                                name="status"
                                value={cycleInfo.status}
                                onChange={handleChange}
                            >
                                <option value="Upcoming">
                                    Upcoming
                                </option>

                                <option value="Active">
                                    Active
                                </option>

                                <option value="Completed">
                                    Completed
                                </option>

                            </select>

                        </div>

                    </div>


                    {/* Dates */}

                    <div className="form-row">

                        <div className="form-group">

                            <label>Start Date</label>

                            <input
                                type="date"
                                name="startDate"
                                value={cycleInfo.startDate}
                                onChange={handleChange}
                            />

                        </div>


                        <div className="form-group">

                            <label>End Date</label>

                            <input
                                type="date"
                                name="endDate"
                                value={cycleInfo.endDate}
                                onChange={handleChange}
                            />

                        </div>

                    </div>


                    {/* Message */}

                    {message && (
                        <div className="form-message">
                            {message}
                        </div>
                    )}


                    {/* Actions */}

                    <div className="form-actions">

                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() => navigate('/exam-cycles')}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="submit-button"
                        >
                            + Add Exam Cycle
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default AddExamCycle;