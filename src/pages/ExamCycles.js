
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

const API_BASE = 'https://backend-exam-paper.vercel.app';

const emptyForm = {
    cycleName: '',
    academicYear: '',
    semester: '1',
    examType: 'Mid Semester',
    startDate: '',
    endDate: '',
    status: 'Upcoming'
};

function toDateInputValue(date) {
    if (!date) return '';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return '';
    }

    return `${parsedDate.getFullYear()}-${String(
        parsedDate.getMonth() + 1
    ).padStart(2, '0')}-${String(
        parsedDate.getDate()
    ).padStart(2, '0')}`;
}

function ExamCycles() {
    const navigate = useNavigate();

    const [examCycles, setExamCycles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const [editingCycle, setEditingCycle] = useState(null);
    const [editForm, setEditForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [editMessage, setEditMessage] = useState('');

    const fetchExamCycles = async () => {
        try {
            setLoading(true);
            setMessage('');

            const response = await fetch(
                `${API_BASE}/exam-cycles`
            );

            const result = await response.json();

            if (!response.ok) {
                setMessage(
                    result.message ||
                    'Unable to fetch exam cycles'
                );
                return;
            }

            setExamCycles(result.examCycles || []);
        } catch (error) {
            console.error(
                'GET EXAM CYCLES ERROR:',
                error
            );

            setMessage(
                'Unable to connect to the server'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExamCycles();
    }, []);

    const totalCycles = examCycles.length;

    const activeCycles = examCycles.filter(
        cycle => cycle.status === 'Active'
    ).length;

    const upcomingCycles = examCycles.filter(
        cycle => cycle.status === 'Upcoming'
    ).length;

    const completedCycles = examCycles.filter(
        cycle => cycle.status === 'Completed'
    ).length;

    const formatDate = date => {
        return new Date(date).toLocaleDateString(
            'en-IN',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }
        );
    };

    const openEditForm = cycle => {
        setEditingCycle(cycle);

        setEditForm({
            cycleName: cycle.cycleName || '',
            academicYear: cycle.academicYear || '',
            semester: String(cycle.semester ?? '1'),
            examType: cycle.examType || 'Mid Semester',
            startDate: toDateInputValue(cycle.startDate),
            endDate: toDateInputValue(cycle.endDate),
            status: cycle.status || 'Upcoming'
        });

        setEditMessage('');
    };

    const closeEditForm = () => {
        if (saving) return;

        setEditingCycle(null);
        setEditMessage('');
    };

    const handleEditChange = event => {
        const { name, value } = event.target;

        setEditForm(current => ({
            ...current,
            [name]: value
        }));
    };

    const handleUpdateCycle = async event => {
        event.preventDefault();
        setEditMessage('');

        if (editForm.startDate > editForm.endDate) {
            setEditMessage(
                'Start date cannot be after the end date.'
            );
            return;
        }

        try {
            setSaving(true);

            const response = await fetch(
                `${API_BASE}/exam-cycles/${editingCycle._id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ...editForm,
                        semester: Number(editForm.semester)
                    })
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                setEditMessage(
                    result.message ||
                    'Unable to update exam cycle.'
                );
                return;
            }

            setExamCycles(current =>
                current.map(cycle =>
                    cycle._id === editingCycle._id
                        ? result.examCycle
                        : cycle
                )
            );

            setEditingCycle(null);
            setMessage('');
        } catch (error) {
            console.error(
                'UPDATE EXAM CYCLE ERROR:',
                error
            );

            setEditMessage(
                'Unable to connect to the server. Please try again.'
            );
        } finally {
            setSaving(false);
        }
    };

    const fieldStyle = {
        width: '100%',
        boxSizing: 'border-box',
        padding: '10px 12px',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        font: 'inherit',
        background: '#fff'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '6px',
        fontWeight: 600,
        fontSize: '14px'
    };

    return (
        <div className="management-page">

            {/* Header */}

            <div className="management-header">
                <div>
                    <h1>Exam Cycle Management</h1>

                    <p className="management-subtitle">
                        Manage examination periods and academic cycles
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
                        onClick={() => navigate('/exam-cycles/add')}
                    >
                        + Add Exam Cycle
                    </button>
                </div>
            </div>

            {/* Statistics */}

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📅</div>
                    <div>
                        <h3>{totalCycles}</h3>
                        <p>Total Cycles</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🟢</div>
                    <div>
                        <h3>{activeCycles}</h3>
                        <p>Active Cycles</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">⏳</div>
                    <div>
                        <h3>{upcomingCycles}</h3>
                        <p>Upcoming Cycles</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">✓</div>
                    <div>
                        <h3>{completedCycles}</h3>
                        <p>Completed</p>
                    </div>
                </div>
            </div>

            {/* Exam Cycle Table */}

            <div className="management-card">
                <div className="table-header">
                    <div>
                        <h2>Exam Cycle List</h2>
                        <p>
                            All examination cycles configured in the system
                        </p>
                    </div>
                </div>

                {loading && (
                    <div className="management-message">
                        Loading exam cycles...
                    </div>
                )}

                {message && (
                    <div className="management-message">
                        {message}
                    </div>
                )}

                {!loading &&
                    !message &&
                    examCycles.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">📅</div>

                            <h3>No Exam Cycles Added</h3>

                            <p>
                                Create an exam cycle to start scheduling examinations.
                            </p>

                            <button
                                className="management-button primary"
                                onClick={() =>
                                    navigate('/exam-cycles/add')
                                }
                            >
                                + Add Exam Cycle
                            </button>
                        </div>
                    )}

                {!loading &&
                    !message &&
                    examCycles.length > 0 && (
                        <div className="table-wrapper">
                            <table className="management-table">
                                <thead>
                                    <tr>
                                        <th>Cycle Name</th>
                                        <th>Academic Year</th>
                                        <th>Semester</th>
                                        <th>Exam Type</th>
                                        <th>Duration</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {examCycles.map(cycle => (
                                        <tr key={cycle._id}>
                                            <td>
                                                <strong>
                                                    {cycle.cycleName}
                                                </strong>
                                            </td>

                                            <td>{cycle.academicYear}</td>

                                            <td>
                                                Semester {cycle.semester}
                                            </td>

                                            <td>{cycle.examType}</td>

                                            <td>
                                                {formatDate(cycle.startDate)}
                                                {' → '}
                                                {formatDate(cycle.endDate)}
                                            </td>

                                            <td>
                                                <span
                                                    className={`status-badge ${
                                                        (cycle.status || '').toLowerCase()
                                                    }`}
                                                >
                                                    {cycle.status}
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className="management-button secondary"
                                                    onClick={() =>
                                                        openEditForm(cycle)
                                                    }
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
            </div>

            {/* Edit Exam Cycle Modal */}

            {editingCycle && (
                <div
                    role="presentation"
                    onMouseDown={event => {
                        if (event.target === event.currentTarget) {
                            closeEditForm();
                        }
                    }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1000,
                        background: 'rgba(15, 23, 42, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                        overflowY: 'auto'
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-exam-cycle-title"
                        style={{
                            width: '100%',
                            maxWidth: '680px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            background: '#fff',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '20px'
                            }}
                        >
                            <div>
                                <h2
                                    id="edit-exam-cycle-title"
                                    style={{ margin: 0 }}
                                >
                                    Edit Exam Cycle
                                </h2>

                                <p
                                    style={{
                                        margin: '6px 0 0',
                                        color: '#64748b'
                                    }}
                                >
                                    Update the selected examination period.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeEditForm}
                                disabled={saving}
                                aria-label="Close edit form"
                                style={{
                                    border: 0,
                                    background: 'transparent',
                                    fontSize: '26px',
                                    cursor: 'pointer'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleUpdateCycle}>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns:
                                        'repeat(auto-fit, minmax(220px, 1fr))',
                                    gap: '16px'
                                }}
                            >
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label
                                        htmlFor="cycleName"
                                        style={labelStyle}
                                    >
                                        Cycle Name
                                    </label>

                                    <input
                                        id="cycleName"
                                        name="cycleName"
                                        value={editForm.cycleName}
                                        onChange={handleEditChange}
                                        required
                                        style={fieldStyle}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="academicYear"
                                        style={labelStyle}
                                    >
                                        Academic Year
                                    </label>

                                    <input
                                        id="academicYear"
                                        name="academicYear"
                                        value={editForm.academicYear}
                                        onChange={handleEditChange}
                                        required
                                        placeholder="2026-27"
                                        style={fieldStyle}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="semester"
                                        style={labelStyle}
                                    >
                                        Semester
                                    </label>

                                    <select
                                        id="semester"
                                        name="semester"
                                        value={editForm.semester}
                                        onChange={handleEditChange}
                                        required
                                        style={fieldStyle}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(
                                            semester => (
                                                <option
                                                    key={semester}
                                                    value={semester}
                                                >
                                                    {semester}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="examType"
                                        style={labelStyle}
                                    >
                                        Exam Type
                                    </label>

                                    <select
                                        id="examType"
                                        name="examType"
                                        value={editForm.examType}
                                        onChange={handleEditChange}
                                        required
                                        style={fieldStyle}
                                    >
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

                                <div>
                                    <label
                                        htmlFor="status"
                                        style={labelStyle}
                                    >
                                        Status
                                    </label>

                                    <select
                                        id="status"
                                        name="status"
                                        value={editForm.status}
                                        onChange={handleEditChange}
                                        required
                                        style={fieldStyle}
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

                                <div>
                                    <label
                                        htmlFor="startDate"
                                        style={labelStyle}
                                    >
                                        Start Date
                                    </label>

                                    <input
                                        id="startDate"
                                        type="date"
                                        name="startDate"
                                        value={editForm.startDate}
                                        onChange={handleEditChange}
                                        required
                                        style={fieldStyle}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="endDate"
                                        style={labelStyle}
                                    >
                                        End Date
                                    </label>

                                    <input
                                        id="endDate"
                                        type="date"
                                        name="endDate"
                                        value={editForm.endDate}
                                        onChange={handleEditChange}
                                        required
                                        style={fieldStyle}
                                    />
                                </div>
                            </div>

                            {editMessage && (
                                <p
                                    role="alert"
                                    style={{
                                        color: '#b91c1c',
                                        margin: '16px 0 0'
                                    }}
                                >
                                    {editMessage}
                                </p>
                            )}

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    flexWrap: 'wrap',
                                    gap: '10px',
                                    marginTop: '24px'
                                }}
                            >
                                <button
                                    type="button"
                                    className="management-button secondary"
                                    onClick={closeEditForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="management-button primary"
                                    disabled={saving}
                                >
                                    {saving
                                        ? 'Saving...'
                                        : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
}

export default ExamCycles;
