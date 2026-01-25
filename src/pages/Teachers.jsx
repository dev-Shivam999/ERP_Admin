import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Eye, Edit, Trash2, GraduationCap, Phone,
    Mail, ShieldCheck, Bookmark, LayoutGrid, MapPin, Award, Fingerprint, RefreshCw, Shield
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
        if (window.confirm('PROTOCOL: Terminate teacher registry? This action is tracked.')) {
            dispatch(deleteTeacher(id));
        }
    };

    const handleResetPassword = async (teacher) => {
        const newPassword = window.prompt(`ADMIN CONTROL: Set NEW password for ${teacher.first_name}.\n\nDefault was: ${teacher.employee_id}`);
        if (newPassword) {
            try {
                await authAPI.adminResetPassword(teacher.user_id, newPassword);
                alert('ACCESS RESTORED: User password updated successfully.');
            } catch (err) {
                alert('RECOVERY FAILED: ' + (err.message || 'Unknown error'));
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
            alert('PERMISSIONS BROADCAST: Security clearance updated.');
            setSelectedTeacherForPermissions(null);
            dispatch(fetchTeachers()); // Refresh list
        } catch (err) {
            alert('SYNC FAILED: ' + (err.message || 'Unknown error'));
        }
    };

    const cardStyle = {
        background: '#fff',
        borderRadius: '4rem',
        padding: '3rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 40px 80px -20px rgba(0,0,0,0.04)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
    };

    const iconBoxStyle = {
        width: '6rem',
        height: '6rem',
        background: '#0f172a',
        borderRadius: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '2.5rem',
        fontWeight: 900,
        boxShadow: '0 25px 30px -10px rgba(0,0,0,0.15)'
    };

    const metaLabelStyle = {
        fontSize: '12px',
        fontWeight: 800,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.15em'
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
                    <div>
                        <h2 style={{ fontSize: '4rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.06em', margin: 0 }}>Teachers</h2>
                        <p style={{ fontSize: '12px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4em', margin: '0.5rem 0 0 0' }}>Personnel Registry Terminal</p>
                    </div>

                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <Search style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                            <input
                                type="text"
                                placeholder="Search Identity..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ width: '350px', height: '4.5rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1.75rem', padding: '0 2rem 0 4rem', fontWeight: 700, outline: 'none', fontSize: '15px' }}
                            />
                        </div>
                        <button
                            onClick={() => navigate('/teachers/add')}
                            style={{ height: '4.5rem', padding: '0 2.5rem', background: '#0f172a', color: '#fff', borderRadius: '1.75rem', fontWeight: 900, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.15em', shadow: '0 20px 25px -10px rgba(0,0,0,0.1)' }}
                        >
                            <Plus size={24} /> Add Personnel
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.5rem' }}>
                        {[1, 2, 3].map(i => <div key={i} style={{ height: '450px', background: '#f1f5f9', borderRadius: '4rem', animation: 'pulse 2s infinite' }}></div>)}
                    </div>
                ) : filteredTeachers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '12rem 2rem', border: '10px dashed #f1f5f9', borderRadius: '5rem' }}>
                        <GraduationCap size={120} style={{ color: '#e2e8f0', marginBottom: '2.5rem' }} />
                        <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.3em' }}>Registry Empty</h3>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2.5rem' }}>
                        {filteredTeachers.map((teacher) => (
                            <div key={teacher.id} style={cardStyle}>
                                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2.5rem' }}>
                                    <div style={iconBoxStyle}>
                                        {teacher.first_name?.[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', margin: 0, lineHeight: 1 }}>{teacher.first_name} {teacher.last_name}</h4>
                                        <p style={{ fontSize: '12px', fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.2em', margin: '0.6rem 0 0 0' }}>{teacher.designation?.replace('_', ' ')}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <Fingerprint size={20} style={{ color: '#cbd5e1' }} />
                                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{teacher.employee_id || 'NO-EID-LOG'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <Award size={20} style={{ color: '#cbd5e1' }} />
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>{teacher.qualification || 'General Credentials'}</span>
                                    </div>
                                </div>

                                <div style={{ background: '#f8fafc', borderRadius: '2.5rem', padding: '2rem', marginBottom: '2.5rem', border: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Login Credentials</span>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button
                                                onClick={() => handleOpenPermissions(teacher)}
                                                style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                            >
                                                <Shield size={12} /> Permissions
                                            </button>
                                            <button
                                                onClick={() => handleResetPassword(teacher)}
                                                style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                            >
                                                <RefreshCw size={12} /> Reset Password
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>App ID:</span>
                                            <span style={{ fontSize: teacher.employee_id ? '12px' : '10px', fontWeight: 800, color: '#1e293b', background: '#eef2ff', padding: '2px 8px', borderRadius: '4px' }}>{teacher.employee_id || 'NOT SET'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>Default Pass:</span>
                                            <span style={{ fontSize: teacher.employee_id ? '12px' : '10px', fontWeight: 800, color: '#1e293b', background: '#eef2ff', padding: '2px 8px', borderRadius: '4px' }}>{teacher.employee_id || 'NOT SET'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: '#f8fafc', borderRadius: '2.5rem', padding: '2rem', marginBottom: '2.5rem', border: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Current Deployment</span>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        {teacher.assignments?.some(a => a.is_class_teacher) ? (
                                            teacher.assignments.map((a, idx) => a.is_class_teacher && (
                                                <div key={idx} style={{ padding: '0.75rem 1.5rem', background: '#4f46e5', color: '#fff', borderRadius: '1rem', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: '0.6rem', shadow: '0 10px 15px -5px rgba(79, 70, 229, 0.3)' }}>
                                                    <ShieldCheck size={14} /> Class {a.class_name} • Sec {a.section_name}
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ padding: '0.75rem 1.5rem', background: '#fff', border: '2px solid #e2e8f0', color: '#94a3b8', borderRadius: '1rem', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Subject Specialist</div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => navigate(`/teachers/edit/${teacher.id}`)} style={{ flex: 1, height: '4rem', background: '#f8fafc', border: '2px solid #f1f5f9', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', cursor: 'pointer', transition: 'all 0.2s' }}>
                                        <Edit size={22} />
                                    </button>
                                    <button onClick={() => handleDelete(teacher.id)} style={{ flex: 1, height: '4rem', background: '#fff1f2', border: 'none', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48', cursor: 'pointer', transition: 'all 0.2s' }}>
                                        <Trash2 size={22} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Permissions Modal */}
                {selectedTeacherForPermissions && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                        <div style={{ background: '#fff', width: '100%', maxWidth: '500px', borderRadius: '3rem', padding: '3rem', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.25)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                <div style={{ width: '4rem', height: '4rem', background: '#0ea5e9', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Security Clearance</h3>
                                    <p style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0.2rem 0 0 0' }}>Assigning Roles for {selectedTeacherForPermissions.first_name}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
                                {PERMISSIONS_LIST.map(p => (
                                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', background: tempPermissions[p.id] ? '#f0f9ff' : '#f8fafc', border: `2px solid ${tempPermissions[p.id] ? '#0ea5e9' : '#f1f5f9'}`, borderRadius: '1.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                                        <input
                                            type="checkbox"
                                            checked={!!tempPermissions[p.id]}
                                            onChange={() => handleTogglePermission(p.id)}
                                            style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer' }}
                                        />
                                        <div>
                                            <p style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a', margin: 0 }}>{p.label}</p>
                                            <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: '0.2rem 0 0 0' }}>{p.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <button onClick={() => setSelectedTeacherForPermissions(null)} style={{ flex: 1, height: '4.5rem', background: '#f8fafc', border: 'none', borderRadius: '1.5rem', fontWeight: 900, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleSavePermissions} style={{ flex: 2, height: '4.5rem', background: '#0f172a', border: 'none', borderRadius: '1.5rem', fontWeight: 900, color: '#fff', cursor: 'pointer' }}>Broadcast Updates</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Teachers;
