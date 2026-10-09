import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

function Timetable() {

    const navigate = useNavigate();

    const [examCycles, setExamCycles] = useState([]);
    const [selectedCycle, setSelectedCycle] = useState('');
    const [examMode, setExamMode] = useState('two');
    const [timetable, setTimetable] = useState([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchExamCycles();
    }, []);

    const fetchExamCycles = async () => {

        try {

            const response = await fetch(
                'https://backend-exam-paper.vercel.app/exam-cycles'
            );

            const data = await response.json();

            if (response.ok) {
                setExamCycles(data.examCycles || []);
            }

        } catch (error) {

            console.error('Error fetching exam cycles:', error);

        }
    };

    const generateTimetable = async () => {

        if (!selectedCycle) {
            setMessage('Please select an exam cycle.');
            return;
        }

        setLoading(true);
        setMessage('');

        try {

            const response = await fetch(
                `https://backend-exam-paper.vercel.app/timetable/generate?examCycle=${selectedCycle}&examMode=${examMode}`
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || 'Failed to generate timetable.');
                setTimetable([]);
                return;
            }

            setTimetable(data.timetable || []);

            setMessage(
                `Timetable generated successfully for ${data.examCycle.cycleName}`
            );

        } catch (error) {

            console.error('Generate Timetable Error:', error);

            setMessage('Unable to connect to the server.');

        } finally {

            setLoading(false);

        }
    };

    const fetchSavedTimetable = async () => {
    if (!selectedCycle) {
        setMessage('Please select an exam cycle.');
        return;
    }

    console.log('Selected exam cycle:', selectedCycle);

    setLoading(true);
    setMessage('');

    // Keep the rest of your existing function unchanged.

        try {

            const response = await fetch(
                `https://backend-exam-paper.vercel.app/timetable?examCycle=${selectedCycle}`
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || 'Failed to fetch timetable.');
                return;
            }

            const savedTimetable = Array.isArray(data.timetable)
            ? data.timetable
            : [];

            setTimetable(savedTimetable);

            if (savedTimetable.length === 0) {
                setMessage('No timetable found for this exam cycle.');
            }

        } catch (error) {

            console.error('Fetch Timetable Error:', error);

            setMessage('Unable to connect to the server.');

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="management-page">

            <div className="management-header">

                <div>
                    <h1>Exam Timetable</h1>
                    <p>Generate and view the examination timetable</p>
                </div>

                <div className="management-actions">

                    <button
                        className="management-button"
                        onClick={() => navigate('/admin')}
                    >
                        Back to Admin
                    </button>

                </div>

            </div>

            
<div className="form-card">

    <div className="form-group">
        <label>Exam Cycle</label>

        <select
    value={selectedCycle}
    onChange={(e) => setSelectedCycle(e.target.value)}
        >
            <option value="">Select Exam Cycle</option>

            {examCycles.map((cycle) => (
                <option key={cycle._id} value={cycle._id}>
                    {cycle.cycleName}
                </option>
            ))}
        </select>
    </div>

    {/* NEW: Ask admin for scheduling preference */}
    <div className="form-group">
        <label>Exams Per Day</label>

        <select
            value={examMode}
            onChange={(e) => setExamMode(e.target.value)}
        >
            <option value="two">Two Exams Per Day</option>
            <option value="one">One Exam Per Day</option>
        </select>
    </div>

    {examMode === 'two' && (
        <div className="form-group">
            <p>Morning Shift: 9:30 AM - 12:30 PM</p>
            <p>Afternoon Shift: 2:00 PM - 5:00 PM</p>
        </div>
    )}

    {examMode === 'one' && (
        <div className="form-group">
            <p>One exam per day: 9:30 AM - 12:30 PM</p>
        </div>
    )}

    <div className="management-actions">
        <button
            className="management-button"
            onClick={generateTimetable}
            disabled={loading}
        >
            {loading ? 'Generating...' : 'Generate Timetable'}
        </button>

        <button
            className="management-button"
            onClick={fetchSavedTimetable}
            disabled={loading}
        >
            View Saved Timetable
        </button>
    </div>
</div>


            {timetable.length > 0 && (

                <div className="management-card">

                    <h2>Generated Timetable</h2>

                    <div className="management-table-container">

                        <table className="management-table">

                            <thead>

                                <tr>
                                    <th>Course Code</th>
                                    <th>Course Name</th>
                                    <th>Date</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Session</th>
                                    <th>Classroom</th>
                                </tr>

                            </thead>

                            <tbody>

                                {timetable.map((item) => (

                                    <tr key={item.course?.id || item._id}>
 
                                        <td>
                                            {item.course?.courseCode || '-'}
                                        </td>

                                        <td>
                                            {item.course?.courseName || '-'}
                                        </td>

                                        <td>
                                            {item.examSession?.date
                                                ? new Date(
                                                    item.examSession.date
                                                ).toLocaleDateString()
                                                : item.examSession?.sessionDate
                                                    ? new Date(
                                                        item.examSession.sessionDate
                                                    ).toLocaleDateString()
                                                    : '-'}
                                        </td>

                                        <td>
                                            {item.examSession?.startTime || '-'}
                                        </td>

                                        <td>
                                            {item.examSession?.endTime || '-'}
                                        </td>

                                        <td>
                                            {item.examSession?.sessionType || '-'}
                                        </td>

                                        {/* <td>
                                            {item.classrooms?.length > 0
                                                ? item.classrooms
                                                    .map(room => room.roomNumber)
                                                    .join(', ')
                                                : '-'}
                                        </td> */}

                                        
                                        <td>
                                            {item.classrooms?.length > 0
                                                ? item.classrooms
                                                    .map(room =>
                                                        typeof room === 'string'
                                                        ? room
                                                        : room.roomNumber
                                                    )
                                                    .filter(Boolean)
                                                    .join(', ') || '-'
                                                : '-'}
                                        </td>


                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Timetable;