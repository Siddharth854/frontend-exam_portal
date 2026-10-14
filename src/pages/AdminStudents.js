import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Management.css';

const API_BASE = 'https://backend-exam-paper.vercel.app';

function AdminStudents() {
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const [editingStudent, setEditingStudent] = useState(null);

    const [formData, setFormData] = useState({
        studentId: '',
        name: '',
        email: '',
        department: '',
        semester: ''
    });

    const fetchStudents = async () => {
        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('token');

            const response = await fetch(`${API_BASE}/students`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Unable to load students'
                );
            }

            setStudents(
                Array.isArray(result)
                    ? result
                    : result.students || []
            );
        } catch (err) {
            console.error('Fetch students error:', err);
            setError(err.message || 'Unable to load students');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const openEditModal = (student) => {
        setEditingStudent(student);

        setFormData({
            studentId: student.studentId || '',
            name: student.user?.name || '',
            email: student.user?.email || '',
            department: student.department || '',
            semester: String(student.semester ?? '')
        });

        setMessage('');
        setError('');
    };

    const closeEditModal = () => {
        if (saving) return;

        setEditingStudent(null);
        setMessage('');
        setError('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!editingStudent) return;

        const {
            studentId,
            name,
            email,
            department,
            semester
        } = formData;

        if (
            !studentId.trim() ||
            !name.trim() ||
            !email.trim() ||
            !department.trim() ||
            !semester
        ) {
            setMessage('Please fill in all fields.');
            return;
        }

        const semesterNumber = Number(semester);

        if (
            !Number.isInteger(semesterNumber) ||
            semesterNumber < 1
        ) {
            setMessage('Please enter a valid semester.');
            return;
        }

        try {
            setSaving(true);
            setMessage('');

            const token = localStorage.getItem('token');

            const response = await fetch(
                `${API_BASE}/students/${editingStudent._id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        studentId: studentId.trim(),
                        name: name.trim(),
                        email: email.trim().toLowerCase(),
                        department: department.trim(),
                        semester: semesterNumber
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Unable to update student'
                );
            }

            setStudents((previous) =>
                previous.map((student) =>
                    student._id === editingStudent._id
                        ? {
                              ...student,
                              ...result.student,
                              user:
                                  result.student?.user || {
                                      ...student.user,
                                      name: name.trim(),
                                      email: email.trim().toLowerCase()
                                  }
                          }
                        : student
                )
            );

            setMessage('Student details updated successfully.');

            await fetchStudents();

            setEditingStudent(null);
            setMessage('');
        } catch (err) {
            console.error('UPDATE STUDENT ERROR:', err);
            setMessage(err.message || 'Unable to update student.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="management-page">
            <div className="management-header">
                <div>
                    <h1>Student Management</h1>
                    <p>View and manage registered students</p>
                </div>

                <div className="management-actions">
                    <button
                        type="button"
                        className="management-button"
                        onClick={() => navigate('/admin')}
                    >
                        Back to Dashboard
                    </button>

                    <button
                        type="button"
                        className="management-button"
                        onClick={() => navigate('/students/add')}
                    >
                        + Add Student
                    </button>
                </div>
            </div>

            {error && (
                <p role="alert" style={{ color: 'red' }}>
                    {error}
                </p>
            )}

            {loading ? (
                <p>Loading students...</p>
            ) : (
                <div>
                    <h2>Total Students: {students.length}</h2>

                    {students.length === 0 ? (
                        <p>No student profiles found.</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table
                                style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    marginTop: '20px'
                                }}
                            >
                                <thead>
                                    <tr>
                                        <th style={cellStyle}>Student ID</th>
                                        <th style={cellStyle}>Name</th>
                                        <th style={cellStyle}>Email</th>
                                        <th style={cellStyle}>Department</th>
                                        <th style={cellStyle}>Semester</th>
                                        <th style={cellStyle}>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {students.map((student) => (
                                        <tr key={student._id}>
                                            <td style={cellStyle}>
                                                {student.studentId || '-'}
                                            </td>

                                            <td style={cellStyle}>
                                                {student.user?.name || '-'}
                                            </td>

                                            <td style={cellStyle}>
                                                {student.user?.email || '-'}
                                            </td>

                                            <td style={cellStyle}>
                                                {student.department || '-'}
                                            </td>

                                            <td style={cellStyle}>
                                                {student.semester ?? '-'}
                                            </td>

                                            <td style={cellStyle}>
                                                <button
                                                    type="button"
                                                    title="Edit student"
                                                    aria-label={`Edit ${student.user?.name || 'student'}`}
                                                    onClick={() =>
                                                        openEditModal(student)
                                                    }
                                                    style={editButtonStyle}
                                                >
                                                    ✏️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {editingStudent && (
                <div
                    style={overlayStyle}
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            closeEditModal();
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-student-title"
                        style={modalStyle}
                    >
                        <h2 id="edit-student-title">
                            Edit Student Details
                        </h2>

                        <p style={{ color: '#64748b' }}>
                            Update the student's information below.
                        </p>

                        <form onSubmit={handleUpdate}>
                            <div style={fieldStyle}>
                                <label htmlFor="studentId">
                                    Student ID
                                </label>
                                <input
                                    id="studentId"
                                    name="studentId"
                                    value={formData.studentId}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            <div style={fieldStyle}>
                                <label htmlFor="name">
                                    Student Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            <div style={fieldStyle}>
                                <label htmlFor="email">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            <div style={fieldStyle}>
                                <label htmlFor="department">
                                    Department
                                </label>
                                <input
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            <div style={fieldStyle}>
                                <label htmlFor="semester">
                                    Semester
                                </label>
                                <input
                                    id="semester"
                                    name="semester"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={formData.semester}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            {message && (
                                <p
                                    role="alert"
                                    style={{ color: '#dc2626' }}
                                >
                                    {message}
                                </p>
                            )}

                            <div style={actionStyle}>
                                <button
                                    type="button"
                                    className="management-button"
                                    onClick={closeEditModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="management-button"
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const cellStyle = {
    padding: '12px',
    border: '1px solid #ddd',
    textAlign: 'left'
};

const editButtonStyle = {
    border: 'none',
    background: '#e8eef8',
    borderRadius: '6px',
    padding: '8px 11px',
    cursor: 'pointer',
    fontSize: '16px'
};

const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.55)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    zIndex: 1000,
    overflowY: 'auto'
};

const modalStyle = {
    background: '#ffffff',
    color: '#1e293b',
    borderRadius: '12px',
    padding: '28px',
    width: '100%',
    maxWidth: '520px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
};

const fieldStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '15px'
};

const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '11px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '15px'
};

const actionStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '22px'
};

export default AdminStudents;
