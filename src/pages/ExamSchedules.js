import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

function ExamSchedules() {

    const navigate = useNavigate();

    const [examSchedules, setExamSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');


    useEffect(() => {

        const fetchExamSchedules = async () => {

            try {

                const response = await fetch(
                    'https://backend-exam-paper.vercel.app/exam-schedules'
                );

                const result = await response.json();

                console.log(
                    'EXAM SCHEDULES API RESPONSE:',
                    result
                );


                if (!response.ok) {

                    setMessage(
                        result.message ||
                        'Unable to fetch exam schedules'
                    );

                    return;
                }


                setExamSchedules(
                    result.examSchedules || []
                );

            } catch (error) {

                console.error(
                    'GET EXAM SCHEDULES ERROR:',
                    error
                );

                setMessage(
                    'Unable to connect to the server'
                );

            } finally {

                setLoading(false);
            }
        };


        fetchExamSchedules();

    }, []);


    const totalSchedules = examSchedules.length;


    const formatDate = (date) => {

        return new Date(date).toLocaleDateString(
            'en-IN',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }
        );
    };


    return (

        <div className="management-page">


            {/* Header */}

            <div className="management-header">

                <div>

                    <h1>
                        Exam Schedule Management
                    </h1>

                    <p className="management-subtitle">
                        Assign courses to examination sessions
                    </p>

                </div>


                <div className="management-actions">

                    <button
                        className="management-button secondary"
                        onClick={() => navigate('/admin')}
                    >
                        ← Dashboard
                    </button>


                    <button
                        className="management-button primary"
                        onClick={() =>
                            navigate('/exam-schedules/add')
                        }
                    >
                        + Schedule Course
                    </button>

                </div>

            </div>


            {/* Statistics */}

            <div className="stats-grid">


                <div className="stat-card">

                    <div className="stat-icon">
                        📋
                    </div>

                    <div>

                        <h3>
                            {totalSchedules}
                        </h3>

                        <p>
                            Scheduled Courses
                        </p>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon">
                        📅
                    </div>

                    <div>

                        <h3>
                            {
                                new Set(
                                    examSchedules.map(
                                        schedule =>
                                            schedule.examSession?._id
                                    )
                                ).size
                            }
                        </h3>

                        <p>
                            Exam Sessions Used
                        </p>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon">
                        📚
                    </div>

                    <div>

                        <h3>
                            {
                                new Set(
                                    examSchedules.map(
                                        schedule =>
                                            schedule.course?._id
                                    )
                                ).size
                            }
                        </h3>

                        <p>
                            Courses Scheduled
                        </p>

                    </div>

                </div>

            </div>


            {/* Schedule Table */}

            <div className="management-card">


                <div className="table-header">

                    <div>

                        <h2>
                            Exam Schedule
                        </h2>

                        <p>
                            Courses assigned to examination sessions
                        </p>

                    </div>

                </div>


                {loading && (

                    <div className="management-message">
                        Loading exam schedules...
                    </div>

                )}


                {message && (

                    <div className="management-message">
                        {message}
                    </div>

                )}


                {!loading &&
                    !message &&
                    examSchedules.length === 0 && (

                        <div className="empty-state">

                            <div className="empty-icon">
                                📋
                            </div>

                            <h3>
                                No Courses Scheduled
                            </h3>

                            <p>
                                Assign a course to an exam
                                session to create your schedule.
                            </p>


                            <button
                                className="management-button primary"
                                onClick={() =>
                                    navigate(
                                        '/exam-schedules/add'
                                    )
                                }
                            >
                                + Schedule Course
                            </button>

                        </div>

                    )}


                {!loading &&
                    !message &&
                    examSchedules.length > 0 && (

                        <div className="table-wrapper">

                            <table className="management-table">


                                <thead>

                                    <tr>

                                        <th>
                                            Course
                                        </th>

                                        <th>
                                            Exam Cycle
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Time
                                        </th>

                                        <th>
                                            Session
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {examSchedules.map(
                                        (schedule) => (

                                            <tr
                                                key={
                                                    schedule._id
                                                }
                                            >

                                                <td>

                                                    <strong>
                                                        {
                                                            schedule.course?.courseCode
                                                        }
                                                    </strong>

                                                    <br />

                                                    <span
                                                        style={{
                                                            color: '#64748b',
                                                            fontSize: '13px'
                                                        }}
                                                    >
                                                        {
                                                            schedule.course?.courseName
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    {
                                                        schedule.examCycle?.cycleName ||
                                                        'N/A'
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        schedule.examSession
                                                            ? formatDate(
                                                                schedule
                                                                    .examSession
                                                                    .sessionDate
                                                            )
                                                            : 'N/A'
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        schedule.examSession
                                                            ? `${schedule.examSession.startTime} - ${schedule.examSession.endTime}`
                                                            : 'N/A'
                                                    }

                                                </td>


                                                <td>

                                                    <span className="capacity-badge">

                                                        {
                                                            schedule.examSession
                                                                ?.sessionType ||
                                                            'N/A'
                                                        }

                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

            </div>

        </div>
    );
}

export default ExamSchedules;