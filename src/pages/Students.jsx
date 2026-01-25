import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, Download, UserPlus, Phone, GraduationCap, RefreshCw, FileSpreadsheet, FileText } from 'lucide-react';
import { fetchStudents, deleteStudent, clearError } from '../store/slices/studentsSlice';
import { authAPI } from '../services/api';

const Students = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { students, loading, error } = useSelector((state) => state.students);

    const [search, setSearch] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        dispatch(fetchStudents());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            alert(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const getCategoryBadge = (category) => {
        const badges = {
            general: 'badge-info',
            obc: 'badge-success',
            sc: 'badge-warning',
            st: 'badge-warning',
            ews: 'badge-danger',
        };
        return badges[category] || 'badge-info';
    };

    const getStreamBadge = (stream) => {
        if (!stream) return null;
        const badges = {
            'Science': 'badge-primary',
            'Commerce': 'badge-success',
            'Arts/Humanities': 'badge-warning',
        };
        return badges[stream] || 'badge-info';
    };

    const filteredStudents = students.filter((s) => {
        const name = `${s.first_name || ''} ${s.last_name || ''} ${s.admission_number || ''}`.toLowerCase();
        const matchSearch = name.includes(search.toLowerCase());
        const matchClass = !classFilter || s.class_name === classFilter;
        const matchCategory = !categoryFilter || s.category === categoryFilter;
        return matchSearch && matchClass && matchCategory;
    });

    const handleDelete = (id, name) => {
        if (window.confirm(`Are you sure you want to delete student "${name}"?\n\nThis action cannot be undone.`)) {
            dispatch(deleteStudent(id));
        }
    };

    const handleEdit = (id) => {
        navigate(`/students/edit/${id}`);
    };

    const handleResetPassword = async (student) => {
        const newPassword = window.prompt(`ADMIN CONTROL: Set NEW password for ${student.first_name}.\n\nDefault was: ${student.admission_number}`);
        if (newPassword) {
            try {
                await authAPI.adminResetPassword(student.user_id, newPassword);
                alert('ACCESS RESTORED: Student password updated successfully.');
            } catch (err) {
                alert('RECOVERY FAILED: ' + (err.message || 'Unknown error'));
            }
        }
    };

    const handleExportCSV = () => {
        if (filteredStudents.length === 0) {
            alert('No student records found to export.');
            return;
        }

        const headers = ['Admission No', 'First Name', 'Last Name', 'Class', 'Section', 'Stream', 'Category', 'Phone', 'Father Name', 'Mother Name', 'Status'];
        const csvRows = [headers.join(',')];

        filteredStudents.forEach(s => {
            const row = [
                s.admission_number,
                s.first_name,
                s.last_name || '',
                s.class_name,
                s.section_name,
                s.stream || '',
                s.category,
                s.phone || '',
                s.father_name || '',
                s.mother_name || '',
                s.status
            ].map(val => `"${(val || '').toString().replace(/"/g, '""')}"`).join(',');
            csvRows.push(row);
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Student_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintPDF = () => {
        window.print();
    };

    // Get unique classes from students for filter
    const classes = [...new Set(students.map(s => s.class_name).filter(Boolean))].sort();

    return (
        <>
            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon primary">
                        <UserPlus size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{students.length}</h3>
                        <p>Total Students</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon success">
                        <GraduationCap size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{students.filter(s => s.status === 'active').length}</h3>
                        <p>Active Students</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon warning">
                        <UserPlus size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{students.filter(s => s.stream === 'Science').length}</h3>
                        <p>Science Stream</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon info">
                        <UserPlus size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{students.filter(s => s.stream === 'Commerce').length}</h3>
                        <p>Commerce Stream</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-body">
                    <div className="filters">
                        <div className="search-box">
                            <Search />
                            <input
                                type="text"
                                placeholder="Search by name or admission no..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <select
                            className="form-select"
                            style={{ width: '180px' }}
                            value={classFilter}
                            onChange={(e) => setClassFilter(e.target.value)}
                        >
                            <option value="">All Classes</option>
                            {classes.map(cls => (
                                <option key={cls} value={cls}>{cls}</option>
                            ))}
                        </select>

                        <select
                            className="form-select"
                            style={{ width: '180px' }}
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            <option value="general">General</option>
                            <option value="obc">OBC</option>
                            <option value="sc">SC</option>
                            <option value="st">ST</option>
                            <option value="ews">EWS</option>
                        </select>

                        <button className="btn btn-primary" onClick={() => navigate('/students/add')}>
                            <Plus size={18} /> Add Student
                        </button>

                        <button className="btn btn-outline" onClick={handleExportCSV} title="Download Excel (CSV)">
                            <FileSpreadsheet size={18} /> Excel
                        </button>

                        <button className="btn btn-outline" onClick={handlePrintPDF} title="Download/Print PDF">
                            <FileText size={18} /> PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Students Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">All Students ({filteredStudents.length})</h3>
                </div>
                <div className="table-container">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                            Loading students...
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Admission No</th>
                                    <th>Name</th>
                                    <th>Class</th>
                                    <th>Section</th>
                                    <th>Stream</th>
                                    <th>Category</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => (
                                        <tr key={student.id}>
                                            <td><strong>{student.admission_number}</strong></td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div className="user-avatar" style={{ width: '36px', height: '36px', fontSize: '0.875rem' }}>
                                                        {(student.first_name?.[0] || 'S').toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 500 }}>{student.first_name} {student.last_name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                            {student.father_name ? `S/o ${student.father_name}` : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{student.class_name}</td>
                                            <td>{student.section_name}</td>
                                            <td>
                                                {student.stream ? (
                                                    <span className={`badge ${getStreamBadge(student.stream)}`}>
                                                        {student.stream}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td>
                                                <span className={`badge ${getCategoryBadge(student.category)}`}>
                                                    {(student.category || 'N/A').toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                {student.phone && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                                                        <Phone size={14} /> {student.phone}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge ${student.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                                    {student.status === 'active' ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        className="btn btn-outline"
                                                        style={{ padding: '0.375rem' }}
                                                        onClick={() => setSelectedStudent(student)}
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        className="btn btn-outline"
                                                        style={{ padding: '0.375rem' }}
                                                        onClick={() => handleEdit(student.id)}
                                                        title="Edit Student"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="btn btn-outline"
                                                        style={{ padding: '0.375rem', color: '#ef4444' }}
                                                        onClick={() => handleDelete(student.id, `${student.first_name} ${student.last_name}`)}
                                                        title="Delete Student"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                                            No students found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Student Detail Modal */}
            {selectedStudent && (
                <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">👤 Student Details</h3>
                            <button className="btn btn-outline" onClick={() => setSelectedStudent(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div className="user-avatar" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                                    {(selectedStudent.first_name?.[0] || 'S').toUpperCase()}
                                </div>
                                <div>
                                    <h2 style={{ marginBottom: '0.25rem' }}>
                                        {selectedStudent.first_name} {selectedStudent.middle_name} {selectedStudent.last_name}
                                    </h2>
                                    <p style={{ color: '#6b7280' }}>Admission No: {selectedStudent.admission_number}</p>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <span className={`badge ${getCategoryBadge(selectedStudent.category)}`}>
                                            {(selectedStudent.category || 'General').toUpperCase()}
                                        </span>
                                        {selectedStudent.stream && (
                                            <span className={`badge ${getStreamBadge(selectedStudent.stream)}`}>
                                                {selectedStudent.stream}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                    <h4 style={{ marginBottom: '0.75rem', color: '#374151' }}>📚 Academic Info</h4>
                                    <p><strong>Class:</strong> {selectedStudent.class_name} - {selectedStudent.section_name}</p>
                                    <p><strong>Roll No:</strong> {selectedStudent.roll_number || 'N/A'}</p>
                                    {selectedStudent.stream && <p><strong>Stream:</strong> {selectedStudent.stream}</p>}
                                    <p><strong>Status:</strong> {selectedStudent.status}</p>
                                </div>
                                <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                    <h4 style={{ marginBottom: '0.75rem', color: '#374151' }}>👨‍👩‍👧 Parent Info</h4>
                                    <p><strong>Father:</strong> {selectedStudent.father_name || 'N/A'}</p>
                                    <p><strong>Mother:</strong> {selectedStudent.mother_name || 'N/A'}</p>
                                    <p><strong>Phone:</strong> {selectedStudent.phone || 'N/A'}</p>
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <h4 style={{ margin: 0, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        🔑 Login Credentials (Admin Only)
                                    </h4>
                                    <button
                                        onClick={() => handleResetPassword(selectedStudent)}
                                        className="btn btn-outline"
                                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderColor: '#0369a1', color: '#0369a1' }}
                                    >
                                        <RefreshCw size={12} /> Reset Password
                                    </button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block' }}>App Login ID:</span>
                                        <code style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{selectedStudent.admission_number}</code>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block' }}>Default Password:</span>
                                        <code style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{selectedStudent.admission_number}</code>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setSelectedStudent(null)}>Close</button>
                            <button className="btn btn-primary" onClick={() => { setSelectedStudent(null); handleEdit(selectedStudent.id); }}>
                                <Edit size={16} /> Edit Student
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Students;
