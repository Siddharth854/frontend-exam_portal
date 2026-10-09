import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

function AddExamSchedule() {

    const navigate = useNavigate();


    const [examCycles, setExamCycles] = useState([]);
    const [examSessions, setExamSessions] = useState([]);
    const [courses, setCourses] = useState([]);


    const [scheduleInfo, setScheduleInfo] = useState({
        examCycle: '',
        examSession: '',
        course: ''
    });


    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');


    // Fetch all required data

    useEffect(() => {

        const fetchData = async () => {

            try {

                const [
                    cyclesResponse,
                    sessionsResponse,
                    coursesResponse
                ] = await Promise.all([

                    fetch(
                        'https://backend-exam-paper.vercel.app/exam-cycles'
                    ),

                    fetch(
                        'https://backend-exam-paper.vercel.app/exam-sessions'
                    ),

                    fetch(
                        'https://backend-exam-paper.vercel.app/courses'
                    )

                ]);


                const cyclesResult =
                    await cyclesResponse.json();

                const sessionsResult =
                    await sessionsResponse.json();

                const coursesResult =
                    await coursesResponse.json();


                if (!cyclesResponse.ok) {

                    setMessage(
                        cyclesResult.message ||
                        'Unable to fetch exam cycles'
                    );

                    return;
                }


                if (!sessionsResponse.ok) {

                    setMessage(
                        sessionsResult.message ||
                        'Unable to fetch exam sessions'
                    );

                    return;
                }


                if (!coursesResponse.ok) {

                    setMessage(
                        coursesResult.message ||
                        'Unable to fetch courses'
                    );

                    return;
                }


                setExamCycles(
                    cyclesResult.examCycles || []
                );


                setExamSessions(
                    sessionsResult.examSessions || []
                );


                setCourses(
                    coursesResult.courses || []
                );


            } catch (error) {

                console.error(
                    'GET SCHEDULE DATA ERROR:',
                    error
                );

                setMessage(
                    'Unable to connect to the server'
                );

            } finally {

                setLoading(false);
            }

        };


        fetchData();

    }, []);


    const handleChange = (e) => {

        const { name, value } = e.target;

        setScheduleInfo({
            ...scheduleInfo,
            [name]: value
        });

    };


    // Only show sessions belonging
    // to selected exam cycle

    const filteredSessions =
        examSessions.filter(
            (session) =>
                session.examCycle?._id ===
                scheduleInfo.examCycle
        );


    const handleSubmit = async (e) => {

        e.preventDefault();


        if (
            !scheduleInfo.examCycle ||
            !scheduleInfo.examSession ||
            !scheduleInfo.course
        ) {

            setMessage(
                'Please select exam cycle, session and course'
            );

            return;
        }


        try {

            const response = await fetch(
                'https://backend-exam-paper.vercel.app/exam-schedules/add',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify(
                        scheduleInfo
                    )
                }
            );


            const result =
                await response.json();


            if (!response.ok) {

                setMessage(
                    result.message ||
                    'Unable to schedule course'
                );

                return;
            }


            setMessage(
                'Course scheduled successfully'
            );


            setTimeout(() => {

                navigate(
                    '/exam-schedules'
                );

            }, 1000);


        } catch (error) {

            console.error(
                'ADD EXAM SCHEDULE ERROR:',
                error
            );

            setMessage(
                'Unable to connect to the server'
            );

        }

    };


    return (

        <div className="management-page">


            {/* Header */}

            <div className="management-header">

                <div>

                    <h1>
                        Schedule Course
                    </h1>

                    <p className="management-subtitle">
                        Assign a course to an examination session
                    </p>

                </div>


                <div className="management-actions">

                    <button
                        className="management-button secondary"
                        onClick={() =>
                            navigate(
                                '/exam-schedules'
                            )
                        }
                    >
                        ← Back to Schedule
                    </button>

                </div>

            </div>


            {/* Form */}

            <div className="form-card">


                <div className="form-card-header">

                    <h2>
                        Exam Schedule Information
                    </h2>

                    <p>
                        Select the examination cycle,
                        session and course.
                    </p>

                </div>


                <form
                    className="management-form"
                    onSubmit={handleSubmit}
                >


                    {/* Exam Cycle */}

                    <div className="form-group full-width">

                        <label>
                            Exam Cycle
                        </label>


                        <select
                            name="examCycle"
                            value={
                                scheduleInfo.examCycle
                            }
                            onChange={handleChange}
                            disabled={loading}
                        >

                            <option value="">
                                {loading
                                    ? 'Loading exam cycles...'
                                    : 'Select Exam Cycle'}
                            </option>


                            {examCycles.map(
                                (cycle) => (

                                    <option
                                        key={
                                            cycle._id
                                        }
                                        value={
                                            cycle._id
                                        }
                                    >
                                        {
                                            cycle.cycleName
                                        }
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* Exam Session */}

                    <div className="form-group full-width">

                        <label>
                            Exam Session
                        </label>


                        <select
                            name="examSession"
                            value={
                                scheduleInfo.examSession
                            }
                            onChange={handleChange}
                            disabled={
                                !scheduleInfo.examCycle
                            }
                        >

                            <option value="">

                                {!scheduleInfo.examCycle
                                    ? 'Select Exam Cycle First'
                                    : 'Select Exam Session'}

                            </option>


                            {filteredSessions.map(
                                (session) => (

                                    <option
                                        key={
                                            session._id
                                        }
                                        value={
                                            session._id
                                        }
                                    >

                                        {
                                            new Date(
                                                session.sessionDate
                                            ).toLocaleDateString(
                                                'en-IN',
                                                {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                }
                                            )
                                        }

                                        {' — '}

                                        {
                                            session.startTime
                                        }

                                        {' - '}

                                        {
                                            session.endTime
                                        }

                                        {' — '}

                                        {
                                            session.sessionType
                                        }

                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* Course */}

                    <div className="form-group full-width">

                        <label>
                            Course
                        </label>


                        <select
                            name="course"
                            value={
                                scheduleInfo.course
                            }
                            onChange={handleChange}
                        >

                            <option value="">
                                Select Course
                            </option>


                            {courses.map(
                                (course) => (

                                    <option
                                        key={
                                            course._id
                                        }
                                        value={
                                            course._id
                                        }
                                    >

                                        {
                                            course.courseCode
                                        }

                                        {' — '}

                                        {
                                            course.courseName
                                        }

                                    </option>

                                )
                            )}

                        </select>

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
                            onClick={() =>
                                navigate(
                                    '/exam-schedules'
                                )
                            }
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="submit-button"
                        >
                            + Schedule Course
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default AddExamSchedule;