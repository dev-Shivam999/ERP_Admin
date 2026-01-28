import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Edit, Trash2, GraduationCap, Award, Fingerprint, RefreshCw, Shield
} from 'lucide-react';
import { fetchTeachers, deleteTeacher, clearError } from '../store/slices/teachersSlice';
import { authAPI } from '../services/api';

const Teachers = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { teachers, loading, error } = useSelector((state) => state.teachers);
    const [search, setSearch] = useState('');
    const [selectedTeacherForPermissions, setSelectedTeacherForPermissions] = useState(null);
    const [tempPermissions, setTempPermissions] = useState({});

    const PERMISSIONS_LIST = [
        { id: 'manage_students', label: 'Manage Students', desc: 'Add/Edit/Delete students' },
        { id: 'mark_attendance', label: 'Mark Attendance', desc: 'Can mark student attendance' },
        { id: 'collect_fees', label: 'Collect Fees', desc: 'Can process fee payments' },
        { id: 'manage_exams', label: 'Manage Exams', desc: 'Schedule exams and enter marks' },
        { id: 'view_reports', label: 'View Reports', desc: 'Access to financial & academic reports' },
        { id: 'manage_teachers', label: 'Manage Teachers', desc: 'View/Edit faculty profiles' },
    ];

    useEffect(() => {
        dispatch(fetchTeachers());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            alert(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const filteredTeachers = teachers.filter((t) => {
        const name = `${t.first_name || ''} ${t.last_name || ''} ${t.employee_id || ''}`.toLowerCase();
        return name.includes(search.toLowerCase());
    });

    const handleDelete = (id) => {
        if (window.confirm('Delete this teacher? This cannot be undone.')) {
            dispatch(deleteTeacher(id));
        }
    };

    const handleResetPassword = async (teacher) => {
        const newPassword = window.prompt(`Set a new password for ${teacher.first_name} ${teacher.last_name || ''}.\n\nDefault password is usually the Employee ID: ${teacher.employee_id}`);
        if (newPassword) {
            try {
                await authAPI.adminResetPassword(teacher.user_id, newPassword);
                alert('Password updated successfully.');
            } catch (err) {
                alert('Password update failed: ' + (err.message || 'Unknown error'));
            }
        }
    };

    const handleOpenPermissions = (teacher) => {
        setSelectedTeacherForPermissions(teacher);
        setTempPermissions(teacher.permissions || {});
    };

    const handleTogglePermission = (id) => {
        setTempPermissions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleSavePermissions = async () => {
        try {
            await authAPI.updateUserPermissions(selectedTeacherForPermissions.user_id, tempPermissions);
            alert('Permissions updated successfully.');
            setSelectedTeacherForPermissions(null);
            dispatch(fetchTeachers()); // Refresh list
        } catch (err) {
            alert('Failed to update permissions: ' + (err.message || 'Unknown error'));
        }
    };

    return (
        <div className="page-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <div>
                    <h2 className="page-title" style={{ margin: 0 }}>Teachers</h2>
                    <p style={{ margin: 0, color: '#64748b' }}>Manage teacher profiles, permissions, and passwords.</p>
                </div>
                <button
                    onClick={() => navigate('/teachers/add')}
                    className="btn-primary"
                    style={{ height: 42, padding: '0 1.1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={18} /> Add teacher
                </button>
            </div>

            <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div className="card-body" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search by name or employee id…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: 38 }}
                        />
                    </div>
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => dispatch(fetchTeachers())}
                        style={{ height: 42, padding: '0 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
                        title="Refresh"
                    >
                        <RefreshCw size={18} /> Refresh
                    </button>
                </div>
            </div>

                {loading ? (
                    <div className="card">
                        <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: '#94a3b8', gap: '0.75rem' }}>
                            <Fingerprint size={28} />
                            <span style={{ fontWeight: 700 }}>Loading teachers…</span>
                        </div>
                    </div>
                ) : filteredTeachers.length === 0 ? (
                    <div className="card">
                        <div className="card-body" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                            <GraduationCap size={48} style={{ marginBottom: '0.75rem', opacity: 0.6 }} />
                            <div style={{ fontWeight: 700 }}>No teachers found.</div>
                            <div style={{ marginTop: '0.25rem' }}>Try a different search or add a teacher.</div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
                        {filteredTeachers.map((teacher) => (
                            <div key={teacher.id} className="card">
                                <div className="card-body" style={{ display: 'grid', gap: '0.9rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                            <div style={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: 12,
                                                background: '#4f46e5',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 900
                                            }}>
                                                {(teacher.first_name || '?')[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.05rem' }}>
                                                    {teacher.first_name} {teacher.last_name}
                                                </div>
                                                <div style={{ color: '#64748b', fontWeight: 700, fontSize: '0.9rem', textTransform: 'capitalize' }}>
                                                    {teacher.designation?.replace('_', ' ') || 'Teacher'}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                                            <button className="btn-secondary" type="button" onClick={() => navigate(`/teachers/edit/${teacher.id}`)} style={{ height: 36, width: 36, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Edit size={16} />
                                            </button>
                                            <button className="btn-secondary" type="button" onClick={() => handleDelete(teacher.id)} style={{ height: 36, width: 36, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#fff1f2', borderColor: '#fecdd3', color: '#e11d48' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.75rem' }}>
                                            <div style={{ color: '#64748b', fontWeight: 700, fontSize: '0.8rem' }}>Employee ID</div>
                                            <div style={{ fontWeight: 900, color: '#0f172a' }}>{teacher.employee_id || '-'}</div>
                                        </div>
                                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.75rem' }}>
                                            <div style={{ color: '#64748b', fontWeight: 700, fontSize: '0.8rem' }}>Qualification</div>
                                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{teacher.qualification || '-'}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <button className="btn-secondary" type="button" onClick={() => handleOpenPermissions(teacher)} style={{ height: 38, padding: '0 0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                                            <Shield size={16} /> Permissions
                                        </button>
                                        <button className="btn-secondary" type="button" onClick={() => handleResetPassword(teacher)} style={{ height: 38, padding: '0 0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                                            <RefreshCw size={16} /> Reset password
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Permissions Modal */}
                {selectedTeacherForPermissions && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                        <div className="card" style={{ width: '100%', maxWidth: 560 }}>
                            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                                <div>
                                    <h3 className="card-title" style={{ margin: 0 }}>Permissions</h3>
                                    <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>
                                        {selectedTeacherForPermissions.first_name} {selectedTeacherForPermissions.last_name || ''}
                                    </div>
                                </div>
                                <button className="btn-secondary" type="button" onClick={() => setSelectedTeacherForPermissions(null)} style={{ height: 40, padding: '0 0.95rem', fontWeight: 700 }}>
                                    Close
                                </button>
                            </div>

                            <div className="card-body" style={{ display: 'grid', gap: '0.75rem' }}>
                                {PERMISSIONS_LIST.map(p => (
                                    <label key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.85rem 0.9rem', border: '1px solid #e2e8f0', borderRadius: 12, background: tempPermissions[p.id] ? '#eef2ff' : '#fff', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={!!tempPermissions[p.id]}
                                            onChange={() => handleTogglePermission(p.id)}
                                            style={{ marginTop: 3 }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{p.label}</div>
                                            <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>{p.desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button className="btn-secondary" type="button" onClick={() => setSelectedTeacherForPermissions(null)} style={{ height: 40, padding: '0 0.95rem', fontWeight: 700 }}>
                                    Cancel
                                </button>
                                <button className="btn-primary" type="button" onClick={handleSavePermissions} style={{ height: 40, padding: '0 0.95rem', fontWeight: 700 }}>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default Teachers;
