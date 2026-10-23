
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './RegisterStudent.css';
import './BulkRegisterStudents.css';

const API_URL = 'https://backend-exam-paper.vercel.app';

const PROGRAMS = [
    { value: 'MCA', label: 'MCA — Master of Computer Applications' },
    { value: 'BCA', label: 'BCA — Bachelor of Computer Applications' },
    { value: 'BSC', label: 'BSc — Bachelor of Science' },
    { value: 'MSC', label: 'MSc — Master of Science' },
    { value: 'BTECH', label: 'BTech — Bachelor of Technology' }
];

const normalizeHeader = (value) =>
    String(value ?? '').trim().toLowerCase().replace(/[\s_-]+/g, '');

function getCell(row, ...aliases) {
    for (const alias of aliases) {
        const key = Object.keys(row).find(
            (header) => normalizeHeader(header) === normalizeHeader(alias)
        );

        if (
            key !== undefined &&
            row[key] !== undefined &&
            row[key] !== null
        ) {
            return String(row[key]).trim();
        }
    }

    return '';
}

function BulkRegisterStudents() {
    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [program, setProgram] = useState('MCA');
    const [department, setDepartment] = useState('');
    const [semester, setSemester] = useState('3');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState([]);
    const [summary, setSummary] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files?.[0] || null);
        setError('');
        setResults([]);
        setSummary(null);
    };

    const readExcel = async (selectedFile) => {
        const buffer = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });

        if (!workbook.SheetNames.length) {
            throw new Error('The Excel file contains no worksheets.');
        }

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        return XLSX.utils.sheet_to_json(sheet, {
            defval: '',
            raw: false
        });
    };

    const handleImport = async (event) => {
        event.preventDefault();

        setError('');
        setResults([]);
        setSummary(null);

        if (!file) {
            setError('Please select an Excel file.');
            return;
        }

        if (!program) {
            setError('Please select the students’ program or branch.');
            return;
        }

        if (!department.trim()) {
            setError('Please enter the department for these students.');
            return;
        }

        const semesterNumber = Number(semester);

        if (
            !Number.isInteger(semesterNumber) ||
            semesterNumber < 1 ||
            semesterNumber > 10
        ) {
            setError('Semester must be a whole number between 1 and 10.');
            return;
        }

        const token = localStorage.getItem('token');

        if (!token) {
            setError('Your session has expired. Please log in again.');
            return;
        }

        setLoading(true);

        const report = [];

        const addResult = (student, status, details) => {
            report.push({
                registrationNo: student.registrationNo || '—',
                username: student.username || '—',
                email: student.email || '—',
                status,
                details
            });

            setResults([...report]);
        };

        try {
            const rows = await readExcel(file);

            if (!rows.length) {
                throw new Error(
                    'The Excel worksheet contains no student records.'
                );
            }

            const students = rows.map((row) => ({
                registrationNo: getCell(
                    row,
                    'Registration No',
                    'Registration Number',
                    'RegistrationNo',
                    'studentId'
                ),
                username: getCell(row, 'Username', 'Name', 'Full Name'),
                email: getCell(row, 'Email', 'University Email').toLowerCase(),
                password: getCell(row, 'Password', 'Initial Password')
            }));

            // Validate the spreadsheet before sending it to the backend.
            const missingRow = students.findIndex(
                (student) =>
                    !student.registrationNo ||
                    !student.username ||
                    !student.email ||
                    !student.password
            );

            if (missingRow !== -1) {
                throw new Error(
                    `Row ${missingRow + 2} is missing a required value. ` +
                    'Check Registration No, Username, Email, and Password.'
                );
            }

            const response = await fetch(
                `${API_URL}/students/bulk-register`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        students,
                        program,
                        department: department.trim(),
                        semester: semesterNumber
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Bulk registration request failed.'
                );
            }

            setSummary(data.summary);

            setResults(
                (data.results || []).map((item) => ({
                    registrationNo: item.studentId || '—',
                    username:
                        students[item.row - 2]?.username || '—',
                    email: item.email || '—',
                    status:
                        item.status === 'registered'
                            ? 'Registered'
                            : item.status === 'skipped'
                                ? 'Skipped'
                                : 'Failed',
                    details: item.message || 'No additional details.'
                }))
            );
        } catch (importError) {
            console.error('Bulk student registration error:', importError);
            setError(
                importError.message || 'Unable to process the Excel file.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-student-page">
            <div className="register-student-wrapper">
                <header className="register-student-header">
                    <div>
                        <span className="register-eyebrow">
                            EXAM ADMINISTRATION
                        </span>

                        <h1>Bulk Student Registration</h1>

                        <p>
                            Import student accounts from an Excel spreadsheet.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="register-back-button"
                        onClick={() => navigate('/register-student')}
                    >
                        ← Back to Registration
                    </button>
                </header>

                <section className="register-student-card">
                    <div className="register-card-heading">
                        <div className="register-card-icon">↑</div>

                        <div>
                            <h2>Upload Student Spreadsheet</h2>

                            <p>
                                Each row is processed individually.
                                Existing email addresses and registration
                                numbers are skipped.
                            </p>
                        </div>
                    </div>

                    <div className="bulk-template">
                        <h3>Required Excel columns</h3>

                        <p>
                            Registration No · Username · Email · Password
                        </p>

                        <p>
                            The first worksheet is used. Column names are
                            case-insensitive.
                        </p>
                    </div>

                    <form onSubmit={handleImport}>
                        <div className="bulk-settings">
                            <div className="register-form-group">
                                <label htmlFor="bulk-program">
                                    Program / Branch *
                                </label>

                                <select
                                    id="bulk-program"
                                    value={program}
                                    onChange={(event) => {
                                        setProgram(event.target.value);
                                        setError('');
                                        setResults([]);
                                        setSummary(null);
                                    }}
                                    required
                                    disabled={loading}
                                >
                                    {PROGRAMS.map((item) => (
                                        <option
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </option>
                                    ))}
                                </select>

                                <small className="bulk-field-help">
                                    Select the academic program for every
                                    student in this spreadsheet.
                                </small>
                            </div>

                            <div className="register-form-group">
                                <label htmlFor="bulk-department">
                                    Department *
                                </label>

                                <input
                                    id="bulk-department"
                                    type="text"
                                    value={department}
                                    onChange={(event) => {
                                        setDepartment(event.target.value);
                                        setError('');
                                        setResults([]);
                                        setSummary(null);
                                    }}
                                    placeholder="e.g. Computer Application"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="register-form-group">
                                <label htmlFor="bulk-semester">
                                    Semester *
                                </label>

                                <select
                                    id="bulk-semester"
                                    value={semester}
                                    onChange={(event) => {
                                        setSemester(event.target.value);
                                        setError('');
                                        setResults([]);
                                        setSummary(null);
                                    }}
                                    required
                                    disabled={loading}
                                >
                                    {Array.from(
                                        { length: 10 },
                                        (_, index) => index + 1
                                    ).map((number) => (
                                        <option
                                            key={number}
                                            value={number}
                                        >
                                            Semester {number}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="bulk-academic-summary">
                            <span className="bulk-summary-icon">i</span>

                            <div>
                                <strong>Registration details</strong>

                                <p>
                                    Program: {
                                        PROGRAMS.find(
                                            (item) => item.value === program
                                        )?.value
                                    }
                                    {' · '}
                                    Semester {semester}
                                    {' · '}
                                    {department.trim() || 'Department not entered'}
                                </p>

                                <small>
                                    All students in this import will use
                                    these academic settings.
                                </small>
                            </div>
                        </div>

                        <div className="bulk-file-picker">
                            <label htmlFor="bulk-file">
                                Excel File (.xlsx or .xls) *
                            </label>

                            <input
                                id="bulk-file"
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                                disabled={loading}
                                required
                            />

                            {file && (
                                <p className="bulk-file-name">
                                    Selected: {file.name}
                                </p>
                            )}
                        </div>

                        {error && (
                            <div
                                className="register-message error"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        <div className="register-form-footer">
                            <p>
                                {loading
                                    ? 'Processing rows. Please keep this page open.'
                                    : 'Review the program, department, semester, and file before importing.'}
                            </p>

                            <button
                                type="submit"
                                className="register-submit-button"
                                disabled={loading || !file}
                            >
                                {loading
                                    ? 'Processing...'
                                    : '↑ Import Students'}
                            </button>
                        </div>
                    </form>
                </section>

                {summary && (
                    <section className="register-student-card bulk-results">
                        <h2>Import Results</h2>

                        <p className="bulk-results-context">
                            {program} · Semester {semester} · {department}
                        </p>

                        <div className="bulk-summary-grid">
                            <div>
                                <span>Total Rows</span>
                                <strong>{summary.total}</strong>
                            </div>

                            <div>
                                <span>Registered</span>
                                <strong>{summary.registered}</strong>
                            </div>

                            <div>
                                <span>Skipped</span>
                                <strong>{summary.skipped}</strong>
                            </div>

                            <div>
                                <span>Failed</span>
                                <strong>{summary.failed}</strong>
                            </div>
                        </div>
                    </section>
                )}

                {results.length > 0 && (
                    <section className="register-student-card bulk-results">
                        <h2>Row-by-row Report</h2>

                        <div className="bulk-table-wrapper">
                            <table className="bulk-results-table">
                                <thead>
                                    <tr>
                                        <th>Registration No.</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {results.map((result, index) => (
                                        <tr
                                            key={`${result.registrationNo}-${index}`}
                                        >
                                            <td>{result.registrationNo}</td>
                                            <td>{result.username}</td>
                                            <td>{result.email}</td>
                                            <td>
                                                <span
                                                    className={`bulk-status ${result.status.toLowerCase()}`}
                                                >
                                                    {result.status}
                                                </span>
                                            </td>
                                            <td>{result.details}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

export default BulkRegisterStudents;
