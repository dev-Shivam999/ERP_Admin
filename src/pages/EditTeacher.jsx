import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Save, User, Mail, Phone, Briefcase, Award,
    ShieldCheck, Bookmark, LayoutGrid, Fingerprint, Trash2, Plus, Shield
} from 'lucide-react';
import { fetchTeacherById, updateTeacher } from '../store/slices/teachersSlice';
import { fetchFeeMetadata } from '../store/slices/feesSlice';
import { fetchSubjects, createSubject } from '../store/slices/academicSlice';

const EditTeacher = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedTeacher, loading, updating } = useSelector((state) => state.teachers);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        designation: '',
        qualification: '',
        experienceYears: '',
        status: 'active',
        isClassTeacher: false,
        classId: '',
        sectionId: '',
        permissions: {},
    });

    const PERMISSIONS_LIST = [
        { id: 'manage_students', label: 'Manage Students', desc: 'Add/Edit/Delete students' },
        { id: 'mark_attendance', label: 'Mark Attendance', desc: 'Can mark student attendance' },
        { id: 'collect_fees', label: 'Collect Fees', desc: 'Can process fee payments' },
        { id: 'manage_exams', label: 'Manage Exams', desc: 'Schedule exams and enter marks' },
        { id: 'view_reports', label: 'View Reports', desc: 'Financial & academic reports' },
        { id: 'manage_homework', label: 'Manage Homework', desc: 'Create and review assignments' },
        { id: 'manage_schedule', label: 'View Schedule', desc: 'Access class timetables' },
    ];

    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectCode, setNewSubjectCode] = useState('');

    const [subjectRows, setSubjectRows] = useState([]);

    // ... useEffects ...

    const handleCreateSubject = async () => {
        if (!newSubjectName) return;
        const result = await dispatch(createSubject({ name: newSubjectName, code: newSubjectCode }));
        if (!result.error) {
            setNewSubjectName('');
            setNewSubjectCode('');
            setShowSubjectModal(false);
        } else {
            alert('Failed to create subject');
        }
    };
    const { subjects } = useSelector((state) => state.academic);
    useEffect(() => {
        dispatch(fetchTeacherById(id));
        dispatch(fetchFeeMetadata()).then(res => {
            if (res.payload?.classes) setClasses(res.payload.classes);
        });
        dispatch(fetchSubjects());
    }, [dispatch, id]);

    useEffect(() => {
        if (selectedTeacher) {
            const classAssignment = selectedTeacher.assignments?.find(a => a.is_class_teacher);
            // Subject assignments are those where is_class_teacher is false
            const subjAssignments = selectedTeacher.assignments?.filter(a => !a.is_class_teacher) || [];

            setSubjectRows(subjAssignments.map(a => ({
                classId: a.class_id,
                sectionId: a.section_id,
                subjectId: a.subject_id // Note: API might return object, insure naming matches
            })));

            setFormData({
                firstName: selectedTeacher.first_name || '',
                lastName: selectedTeacher.last_name || '',
                email: selectedTeacher.email || '',
                phone: selectedTeacher.phone || '',
                designation: selectedTeacher.designation || 'teacher',
                qualification: selectedTeacher.qualification || '',
                experienceYears: selectedTeacher.experience_years || '',
                status: selectedTeacher.status || 'active',
                isClassTeacher: !!classAssignment,
                classId: classAssignment?.class_id || '',
                sectionId: classAssignment?.section_id || '',
                permissions: selectedTeacher.permissions || {},
            });
        }
    }, [selectedTeacher]);

    // Update sections when class changes
    useEffect(() => {
        if (formData.classId && classes.length > 0) {
            const selectedClass = classes.find(c => c.id === formData.classId);
            if (selectedClass && selectedClass.sections) {
                setSections(selectedClass.sections);
            }
        } else {
            setSections([]);
        }
    }, [formData.classId, classes]);

    const handleSubjectRowChange = (index, field, value) => {
        console.log(`📝 Row ${index} - ${field} changed to:`, value);
        const newRows = [...subjectRows];
        newRows[index] = { ...newRows[index], [field]: value };

        // Reset section if class changes
        if (field === 'classId') {
            console.log(`🔄 Resetting section for row ${index}`);
            newRows[index].sectionId = '';

            // Log available sections for the new class
            const selectedClass = classes.find(c => c.id === value);
            console.log(`📚 Available sections for class ${value}:`, selectedClass?.sections);
        }
        setSubjectRows(newRows);
    };

    const addSubjectRow = () => {
        setSubjectRows([...subjectRows, { classId: '', sectionId: '', subjectId: '' }]);
    };

    const removeSubjectRow = (index) => {
        const newRows = [...subjectRows];
        newRows.splice(index, 1);
        setSubjectRows(newRows);
    };

    const getSectionsForClass = (clsId) => {
        if (!clsId) return [];
        const cls = classes.find(c => c.id === clsId);
        return cls ? cls.sections || [] : [];
    };

    const handlePermissionToggle = (permissionId) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [permissionId]: !prev.permissions[permissionId]
            }
        }));
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(updateTeacher({
            id,
            data: {
                profile: {
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                },
                teacher: {
                    designation: formData.designation,
                    qualification: formData.qualification,
                    experience_years: formData.experienceYears === '' ? null : parseInt(formData.experienceYears),
                    status: formData.status,
                },
                assignment: formData.isClassTeacher ? {
                    classId: formData.classId,
                    sectionId: formData.sectionId,
                    isClassTeacher: true
                } : null,
                permissions: formData.permissions,
                subjectAssignments: subjectRows.filter(r => r.classId && r.sectionId && r.subjectId)
            }
        }));

        if (!result.error) {
            alert('RE-INITIALIZATION SUCCESSFUL: Profile and assignments updated.');
            navigate('/teachers');
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen opacity-20"><Fingerprint size={80} className="animate-pulse" /></div>;

    const inputStyle = {
        width: '100%',
        padding: '1.25rem 1.75rem',
        background: '#f8fafc',
        border: '2px solid #f1f5f9',
        borderRadius: '1.5rem',
        fontSize: '1rem',
        fontWeight: 700,
        color: '#0f172a',
        outline: 'none'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.75rem',
        fontWeight: 900,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: '0.75rem',
        marginLeft: '1rem'
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
                    <button
                        onClick={() => navigate('/teachers')}
                        style={{ padding: '1rem', background: '#fff', borderRadius: '1.2rem', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.05em' }}>Modify Registry</h2>
                        <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>EID: {selectedTeacher?.employee_id} • Status: {formData.status.toUpperCase()}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ background: '#fff', borderRadius: '3rem', padding: '3rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                            <div style={{ width: '3rem', height: '3rem', background: '#4f46e5', borderRadius: '1rem', display: 'flex', alignItems: 'center', justify: 'center', color: '#fff' }}><User size={20} /></div>
                            <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.75rem', fontWeight: 900 }}>Profile Modification</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Given Name</label>
                                <input name="firstName" value={formData.firstName} onChange={handleInputChange} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Family Name</label>
                                <input name="lastName" value={formData.lastName} onChange={handleInputChange} style={inputStyle} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Designation</label>
                                <select name="designation" value={formData.designation} onChange={handleInputChange} style={inputStyle}>
                                    <option value="teacher">Teacher</option>
                                    <option value="senior_teacher">Senior Teacher</option>
                                    <option value="head_teacher">Department Head</option>
                                    <option value="principal">Executive Head</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Deployment Status</label>
                                <select name="status" value={formData.status} onChange={handleInputChange} style={inputStyle}>
                                    <option value="active">Active Service</option>
                                    <option value="inactive">Inactive / On Hold</option>
                                    <option value="on_leave">Extended Leave</option>
                                    <option value="resigned">Registry Terminated</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div style={{ background: '#0f172a', borderRadius: '3rem', padding: '3rem', color: '#fff', border: '8px solid #fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '3rem', height: '3rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justify: 'center' }}><Bookmark size={20} /></div>
                                <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.75rem', fontWeight: 900 }}>Active Commands</h3>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1.5rem', borderRadius: '1.2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <input type="checkbox" name="isClassTeacher" checked={formData.isClassTeacher} onChange={handleInputChange} style={{ width: '1.2rem', height: '1.2rem' }} />
                                <span style={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Main Class Teacher Role</span>
                            </label>
                        </div>

                        {formData.isClassTeacher && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ ...labelStyle, color: 'rgba(255,255,255,0.4)' }}>Class link</label>
                                    <select name="classId" value={formData.classId} onChange={handleInputChange} style={{ ...inputStyle, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                                        <option value="" style={{ color: '#000' }}>Select Class</option>
                                        {classes.map(c => <option key={c.id} value={c.id} style={{ color: '#000' }}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ ...labelStyle, color: 'rgba(255,255,255,0.4)' }}>Section Marker</label>
                                    <select name="sectionId" value={formData.sectionId} onChange={handleInputChange} style={{ ...inputStyle, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                                        <option value="" style={{ color: '#000' }}>Select Section</option>
                                        {sections.map(s => (
                                            <option key={s.id} value={s.id} style={{ color: '#000' }}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '2.5rem', height: '2.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.8rem', display: 'flex', alignItems: 'center', justify: 'center' }}><LayoutGrid size={16} /></div>
                                    <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.75rem', fontWeight: 900 }}>Subject Assignments</h3>
                                </div>
                                <button type="button" onClick={addSubjectRow} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#4f46e5', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.8rem', color: '#fff', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
                                    <Plus size={14} /> ADD ASSIGNMENT
                                </button>
                            </div>

                            {subjectRows.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem', padding: '1rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '1rem' }}>No subject assignments active</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {subjectRows.map((row, index) => (
                                        <div key={index} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) minmax(100px, 1fr) 1fr auto', gap: '1rem', alignItems: 'flex-end', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '1rem' }}>
                                            <div>
                                                <label style={{ ...labelStyle, color: 'rgba(255,255,255,0.4)', marginLeft: 0 }}>Class</label>
                                                <select
                                                    value={row.classId}
                                                    onChange={(e) => handleSubjectRowChange(index, 'classId', e.target.value)}
                                                    style={{ ...inputStyle, padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.875rem' }}
                                                >
                                                    <option value="" style={{ color: '#000' }}>Select Class</option>
                                                    {classes.map(c => <option key={c.id} value={c.id} style={{ color: '#000' }}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ ...labelStyle, color: 'rgba(255,255,255,0.4)', marginLeft: 0 }}>Section</label>
                                                <select
                                                    value={row.sectionId}
                                                    onChange={(e) => handleSubjectRowChange(index, 'sectionId', e.target.value)}
                                                    style={{ ...inputStyle, padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.875rem' }}
                                                >
                                                    <option value="" style={{ color: '#000' }}>{row.classId ? 'Select' : '-'}</option>
                                                    {getSectionsForClass(row.classId).map(s => (
                                                        <option key={s.id} value={s.id} style={{ color: '#000' }}>{s.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ ...labelStyle, color: 'rgba(255,255,255,0.4)', marginLeft: 0 }}>Subject</label>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <select
                                                        value={row.subjectId}
                                                        onChange={(e) => handleSubjectRowChange(index, 'subjectId', e.target.value)}
                                                        style={{ ...inputStyle, padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.875rem', flex: 1 }}
                                                    >
                                                        <option value="" style={{ color: '#000' }}>Select Subject</option>
                                                        {subjects.map(sub => (
                                                            <option key={sub.id} value={sub.id} style={{ color: '#000' }}>{sub.name} {sub.code ? `(${sub.code})` : ''}</option>
                                                        ))}
                                                    </select>
                                                    <button type="button" onClick={() => setShowSubjectModal(true)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem', width: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }} title="Create New Subject">
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeSubjectRow(index)}
                                                style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', width: '2.5rem', height: '2.5rem', borderRadius: '0.8rem', display: 'flex', alignItems: 'center', justify: 'center', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Subject Creation Modal */}
                    {showSubjectModal && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                            <div style={{ background: '#fff', padding: '2rem', borderRadius: '1.5rem', width: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>Add New Subject</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>Subject Name</label>
                                        <input
                                            placeholder="e.g. Sanskrit"
                                            value={newSubjectName}
                                            onChange={(e) => setNewSubjectName(e.target.value)}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>Subject Code (Optional)</label>
                                        <input
                                            placeholder="e.g. SAN"
                                            value={newSubjectCode}
                                            onChange={(e) => setNewSubjectCode(e.target.value)}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        <button type="button" onClick={() => setShowSubjectModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: 'transparent', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                                        <button type="button" onClick={handleCreateSubject} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', background: '#4f46e5', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Create</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Clearances (Granular Permissions) */}
                    <div style={{ background: '#fff', borderRadius: '3rem', padding: '3rem', border: '1px solid #0ea5e9', shadow: '0 25px 50px -12px rgba(14, 165, 233, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                            <div style={{ width: '3rem', height: '3rem', background: '#0ea5e9', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Shield size={20} /></div>
                            <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.75rem', fontWeight: 900 }}>Security Clearance (PBAC)</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {PERMISSIONS_LIST.map(p => (
                                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', background: formData.permissions[p.id] ? '#f0f9ff' : '#f8fafc', border: `2px solid ${formData.permissions[p.id] ? '#0ea5e9' : '#f1f5f9'}`, borderRadius: '1.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!formData.permissions[p.id]}
                                        onChange={() => handlePermissionToggle(p.id)}
                                        style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer' }}
                                    />
                                    <div>
                                        <p style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a', margin: 0 }}>{p.label}</p>
                                        <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: '0.2rem 0 0 0' }}>{p.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                        <p style={{ marginTop: '1.5rem', fontSize: '11px', color: '#94a3b8', fontWeight: 700, paddingLeft: '1rem' }}>
                            NOTE: Admin users retain all operational permissions regardless of these selections.
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.5rem' }}>
                        <button type="button" onClick={() => navigate('/teachers')} style={{ padding: '1.25rem 2.5rem', background: 'transparent', border: '2px solid #e2e8f0', borderRadius: '1.5rem', fontWeight: 900, color: '#64748b', cursor: 'pointer' }}>Disconnect</button>
                        <button type="submit" disabled={updating} style={{ padding: '1.25rem 3.5rem', background: '#4f46e5', border: 'none', borderRadius: '1.5rem', fontWeight: 900, color: '#fff', cursor: 'pointer', shadow: '0 20px 25px -5px rgb(79 70 229 / 0.4)' }}>
                            {updating ? 'SERIALIZING...' : 'COMMIT CHANGES'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTeacher;
