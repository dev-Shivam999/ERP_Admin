import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Save, User, Mail, Phone, Briefcase, GraduationCap,
    Calendar, MapPin, Shield, Users, BookOpen, Check, X, Plus, Trash2, Loader2
} from 'lucide-react';
import { fetchTeacherById, updateTeacher } from '../store/slices/teachersSlice';
import { fetchFeeMetadata } from '../store/slices/feesSlice';
import { fetchSubjects, createSubject } from '../store/slices/academicSlice';

const EditTeacher = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedTeacher, loading, updating } = useSelector((state) => state.teachers);
    const { subjects } = useSelector((state) => state.academic);
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
        { id: 'manage_students', label: 'Manage Students', desc: 'Add, edit, and manage student records', icon: Users },
        { id: 'mark_attendance', label: 'Mark Attendance', desc: 'Record daily student attendance', icon: Check },
        { id: 'collect_fees', label: 'Collect Fees', desc: 'Process fee payments and receipts', icon: Briefcase },
        { id: 'manage_exams', label: 'Manage Exams', desc: 'Create exams and enter marks', icon: BookOpen },
        { id: 'view_reports', label: 'View Reports', desc: 'Access academic and financial reports', icon: GraduationCap },
        { id: 'manage_homework', label: 'Manage Homework', desc: 'Assign and review homework', icon: Calendar },
    ];

    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectCode, setNewSubjectCode] = useState('');
    const [subjectRows, setSubjectRows] = useState([]);

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
            const subjAssignments = selectedTeacher.assignments?.filter(a => !a.is_class_teacher) || [];

            setSubjectRows(subjAssignments.map(a => ({
                classId: a.class_id,
                sectionId: a.section_id,
                subjectId: a.subject_id
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
        const newRows = [...subjectRows];
        newRows[index] = { ...newRows[index], [field]: value };

        if (field === 'classId') {
            newRows[index].sectionId = '';
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
            alert('Teacher updated successfully.');
            navigate('/teachers');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: '#64748b' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>Loading teacher details...</div>
            </div>
        </div>
    );

    return (
        <div className="page-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/teachers')} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', height: 42, padding: '0 1rem' }}>
                        <ArrowLeft size={18} /> Back
                    </button>
                    <div>
                        <h2 className="page-title" style={{ margin: 0 }}>Edit Teacher</h2>
                        <div style={{ color: '#64748b', fontWeight: 600 }}>
                            Employee ID: {selectedTeacher?.employee_id} • Status: {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="button" className="btn-secondary" onClick={() => navigate('/teachers')} style={{ height: 42, padding: '0 1rem' }}>
                        Cancel
                    </button>
                    <button type="submit" form="edit-teacher-form" className="btn-primary" disabled={loading || updating} style={{ height: 42, padding: '0 1.1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        {(loading || updating) ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {(loading || updating) ? 'Updating...' : 'Update Teacher'}
                    </button>
                </div>
            </div>

            <form id="edit-teacher-form" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
                {/* Left Column */}
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {/* Personal Information */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={18} /> Personal Information
                            </h3>
                        </div>
                        <div className="card-body" style={{ display: 'grid', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Enter last name"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="teacher@school.com"
                                        disabled
                                        style={{ background: '#f8fafc', color: '#64748b' }}
                                    />
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                        Email cannot be changed after creation
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Professional Information */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Briefcase size={18} /> Professional Details
                            </h3>
                        </div>
                        <div className="card-body" style={{ display: 'grid', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Designation</label>
                                    <select name="designation" value={formData.designation} onChange={handleInputChange} className="form-select">
                                        <option value="teacher">Teacher</option>
                                        <option value="senior_teacher">Senior Teacher</option>
                                        <option value="head_teacher">Head Teacher</option>
                                        <option value="principal">Principal</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange} className="form-select">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="on_leave">On Leave</option>
                                        <option value="resigned">Resigned</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Experience (Years)</label>
                                    <input
                                        type="number"
                                        name="experienceYears"
                                        value={formData.experienceYears}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Qualification</label>
                                    <input
                                        type="text"
                                        name="qualification"
                                        value={formData.qualification}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="B.Ed, M.A, Ph.D"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subject Assignments */}
                    <div className="card">
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                <BookOpen size={18} /> Subject Assignments
                            </h3>
                            <button type="button" onClick={addSubjectRow} className="btn-primary" style={{ height: 36, padding: '0 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Plus size={16} /> Add Subject
                            </button>
                        </div>
                        <div className="card-body" style={{ display: 'grid', gap: '0.75rem' }}>
                            {subjectRows.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                    <BookOpen size={40} style={{ marginBottom: '0.75rem', opacity: 0.6 }} />
                                    <div style={{ fontWeight: 700 }}>No subject assignments</div>
                                    <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Click "Add Subject" to assign subjects to this teacher</div>
                                </div>
                            ) : (
                                subjectRows.map((row, index) => (
                                    <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'end', padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Class</label>
                                            <select
                                                value={row.classId}
                                                onChange={(e) => handleSubjectRowChange(index, 'classId', e.target.value)}
                                                className="form-select"
                                            >
                                                <option value="">Select Class</option>
                                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Section</label>
                                            <select
                                                value={row.sectionId}
                                                onChange={(e) => handleSubjectRowChange(index, 'sectionId', e.target.value)}
                                                className="form-select"
                                            >
                                                <option value="">{row.classId ? 'Select Section' : '-'}</option>
                                                {getSectionsForClass(row.classId).map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Subject</label>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <select
                                                    value={row.subjectId}
                                                    onChange={(e) => handleSubjectRowChange(index, 'subjectId', e.target.value)}
                                                    className="form-select"
                                                    style={{ flex: 1 }}
                                                >
                                                    <option value="">Select Subject</option>
                                                    {subjects.map(sub => (
                                                        <option key={sub.id} value={sub.id}>{sub.name} {sub.code ? `(${sub.code})` : ''}</option>
                                                    ))}
                                                </select>
                                                <button type="button" onClick={() => setShowSubjectModal(true)} className="btn-secondary" style={{ height: 42, width: 42, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title="Create New Subject">
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeSubjectRow(index)}
                                            className="btn-secondary"
                                            style={{ height: 42, width: 42, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#fff1f2', borderColor: '#fecdd3', color: '#e11d48' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {/* Class Assignment */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Users size={18} /> Class Teacher Assignment
                            </h3>
                        </div>
                        <div className="card-body" style={{ display: 'grid', gap: '1rem' }}>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
                                    <input
                                        type="checkbox"
                                        name="isClassTeacher"
                                        checked={formData.isClassTeacher}
                                        onChange={handleInputChange}
                                        style={{ width: '1.1rem', height: '1.1rem' }}
                                    />
                                    Assign as Class Teacher
                                </label>
                                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                                    Class teachers have additional responsibilities for their assigned class
                                </div>
                            </div>

                            {formData.isClassTeacher && (
                                <div style={{ display: 'grid', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Class</label>
                                            <select name="classId" value={formData.classId} onChange={handleInputChange} className="form-select">
                                                <option value="">Select Class</option>
                                                {classes.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Section</label>
                                            <select name="sectionId" value={formData.sectionId} onChange={handleInputChange} className="form-select">
                                                <option value="">Select Section</option>
                                                {sections.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Shield size={18} /> Permissions
                            </h3>
                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                Select what this teacher can access
                            </div>
                        </div>
                        <div className="card-body" style={{ display: 'grid', gap: '0.75rem' }}>
                            {PERMISSIONS_LIST.map(permission => {
                                const IconComponent = permission.icon;
                                return (
                                    <label
                                        key={permission.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '0.75rem',
                                            padding: '1rem',
                                            borderRadius: '0.75rem',
                                            border: `1px solid ${formData.permissions[permission.id] ? '#c7d2fe' : '#e2e8f0'}`,
                                            background: formData.permissions[permission.id] ? '#eef2ff' : '#fff',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={!!formData.permissions[permission.id]}
                                            onChange={() => handlePermissionToggle(permission.id)}
                                            style={{ width: '1.1rem', height: '1.1rem', marginTop: '0.1rem' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                <IconComponent size={16} style={{ color: formData.permissions[permission.id] ? '#4f46e5' : '#64748b' }} />
                                                <div style={{ fontWeight: 700, color: '#111827' }}>{permission.label}</div>
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{permission.desc}</div>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </form>

            {/* Subject Creation Modal */}
            {showSubjectModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div className="card" style={{ width: '400px', margin: 0 }}>
                        <div className="card-header">
                            <h3 className="card-title">Add New Subject</h3>
                        </div>
                        <div className="card-body" style={{ display: 'grid', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Subject Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Sanskrit"
                                    value={newSubjectName}
                                    onChange={(e) => setNewSubjectName(e.target.value)}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Subject Code (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. SAN"
                                    value={newSubjectCode}
                                    onChange={(e) => setNewSubjectCode(e.target.value)}
                                    className="form-input"
                                />
                            </div>
                        </div>
                        <div className="card-footer" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setShowSubjectModal(false)} className="btn-secondary">
                                Cancel
                            </button>
                            <button type="button" onClick={handleCreateSubject} className="btn-primary">
                                Create Subject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditTeacher;