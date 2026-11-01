import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './BulkRegisterTeachers.css';

const API_BASE = 'https://backend-exam-paper.vercel.app';

function BulkRegisterTeachers() {
    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [message, setMessage] = useState('');

    const normalizeHeader = (header) =>
        String(header || '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];

        setFile(selectedFile || null);
        setTeachers([]);
        setResults(null);
        setMessage('');

        if (!selectedFile) return;

        try {
            const buffer = await selectedFile.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];

            const rawRows = XLSX.utils.sheet_to_json(worksheet, {
                defval: ''
            });

            if (rawRows.length === 0) {
                setMessage('The uploaded Excel file is empty.');
                return;
            }

            const parsedTeachers = rawRows.map((row) => {
                const normalizedRow = {};

                Object.entries(row).forEach(([key, value]) => {
                    normalizedRow[normalizeHeader(key)] = String(value).trim();
                });

                return {
                    teacherId:
                        normalizedRow.teacherid || '',
                    name:
                        normalizedRow.name ||
                        normalizedRow.fullname || '',
                    email:
                        normalizedRow.email ||
                        normalizedRow.universityemail || '',
                    password:
                        normalizedRow.password ||
                        normalizedRow.initialpassword || '',
                    department:
                        normalizedRow.department || '',
                    designation:
                        normalizedRow.designation || ''
                };
            });

            setTeachers(parsedTeachers);

            const missingColumns = [];

            const headers = Object.keys(rawRows[0]).map(normalizeHeader);

            const requiredColumns = [
                { names: ['teacherid'], label: 'Teacher ID' },
                { names: ['name', 'fullname'], label: 'Name' },
                { names: ['email', 'universityemail'], label: 'Email' },
                { names: ['password', 'initialpassword'], label: 'Password' },
                { names: ['department'], label: 'Department' },
                { names: ['designation'], label: 'Designation' }
            ];

            requiredColumns.forEach((column) => {
                if (!column.names.some(name => headers.includes(name))) {
                    missingColumns.push(column.label);
                }
            });

            if (missingColumns.length > 0) {
                setMessage(
                    `Missing Excel columns: ${missingColumns.join(', ')}`
                );
                setTeachers([]);
                return;
            }

            setMessage(`${parsedTeachers.length} teacher records loaded successfully.`);

        } catch (error) {
            console.error('EXCEL FILE ERROR:', error);
            setMessage('Unable to read this file. Please upload a valid Excel file.');
            setTeachers([]);
        }
    };

    const handleBulkRegistration = async () => {
        if (teachers.length === 0) {
            setMessage('Please upload a valid Excel file first.');
            return;
        }

        const token = localStorage.getItem('token');

        if (!token) {
            setMessage('Your session has expired. Please log in again.');
            return;
        }

        setLoading(true);
        setMessage('');
        setResults(null);

        try {
            const response = await fetch(
                `${API_BASE}/teachers/bulk-register`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ teachers })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Bulk registration failed.');
            }

            setResults(data);
            setMessage(data.message || 'Bulk registration completed.');

        } catch (error) {
            console.error('BULK REGISTRATION ERROR:', error);
            setMessage(error.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const template = [
            {
                'Teacher ID': 'TCH001',
                'Name': 'John Smith',
                'Email': 'john@example.com',
                'Password': 'Teacher@123',
                'Department': 'Computer Science',
                'Designation': 'Assistant Professor'
            },
            {
                'Teacher ID': 'TCH002',
                'Name': 'Jane Doe',
                'Email': 'jane@example.com',
                'Password': 'Teacher@123',
                'Department': 'Information Technology',
                'Designation': 'Associate Professor'
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(template);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Teachers');

        XLSX.writeFile(workbook, 'Teacher_Registration_Template.xlsx');
    };

    return (
        <div className="bulk-teacher-page">
            <div className="bulk-teacher-container">

                <button
                    type="button"
                    className="bulk-teacher-back"
                    onClick={() => navigate('/admin')}
                >
                    ← Back to Dashboard
                </button>

                <div className="bulk-teacher-header">
                    <div className="bulk-teacher-icon">📊</div>
                    <h1>Bulk Teacher Registration</h1>
                    <p>
                        Upload an Excel file to create multiple teacher
                        accounts and profiles.
                    </p>
                </div>

                <div className="bulk-teacher-instructions">
                    <h3>Excel File Requirements</h3>

                    <p>Your Excel sheet must contain these columns:</p>

                    <div className="bulk-teacher-columns">
                        {[
                            'Teacher ID',
                            'Name',
                            'Email',
                            'Password',
                            'Department',
                            'Designation'
                        ].map(column => (
                            <span key={column}>{column}</span>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="download-template-button"
                        onClick={downloadTemplate}
                    >
                        ↓ Download Excel Template
                    </button>
                </div>

                <div className="bulk-teacher-upload">
                    <div className="upload-icon">📁</div>

                    <h3>Upload Teacher Excel File</h3>

                    <p>Select an .xlsx or .xls file from your computer.</p>

                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                    />

                    {file && (
                        <div className="selected-teacher-file">
                            Selected file: <strong>{file.name}</strong>
                        </div>
                    )}
                </div>

                {teachers.length > 0 && (
                    <div className="bulk-teacher-preview">
                        <h3>Preview Teacher Records</h3>

                        <div className="bulk-teacher-table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Teacher ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Department</th>
                                        <th>Designation</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {teachers.map((teacher, index) => (
                                        <tr key={index}>
                                            <td>{teacher.teacherId}</td>
                                            <td>{teacher.name}</td>
                                            <td>{teacher.email}</td>
                                            <td>{teacher.department}</td>
                                            <td>{teacher.designation}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <p className="teacher-preview-count">
                            Total records loaded: {teachers.length}
                        </p>
                    </div>
                )}

                {message && (
                    <div className="bulk-teacher-message">
                        {message}
                    </div>
                )}

                <button
                    type="button"
                    className="bulk-register-button"
                    onClick={handleBulkRegistration}
                    disabled={loading || teachers.length === 0}
                >
                    {loading
                        ? 'Registering Teachers...'
                        : `Register ${teachers.length} Teachers`}
                </button>

                {results && (
                    <div className="bulk-teacher-results">

                        <h2>Registration Results</h2>

                        <div className="bulk-result-summary">

                            <div className="bulk-result-card total">
                                <span>Total</span>
                                <strong>{results.summary.total}</strong>
                            </div>

                            <div className="bulk-result-card registered">
                                <span>Registered</span>
                                <strong>{results.summary.registered}</strong>
                            </div>

                            <div className="bulk-result-card skipped">
                                <span>Skipped</span>
                                <strong>{results.summary.skipped}</strong>
                            </div>

                            <div className="bulk-result-card failed">
                                <span>Failed</span>
                                <strong>{results.summary.failed}</strong>
                            </div>

                        </div>

                        <h3>Row-by-Row Details</h3>

                        <div className="bulk-teacher-table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Excel Row</th>
                                        <th>Teacher ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Message</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {results.results.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.row}</td>
                                            <td>{item.teacherId}</td>
                                            <td>{item.name}</td>
                                            <td>{item.email}</td>
                                            <td>
                                                <span className={`teacher-status ${item.status}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td>{item.message}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}

export default BulkRegisterTeachers;
