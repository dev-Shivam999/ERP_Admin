import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, User, Mail, Phone, Briefcase, GraduationCap,
    Calendar, MapPin, Shield, Users, BookOpen, Check, X, Loader2
} from 'lucide-react';
import { createTeacher } from '../store/slices/teachersSlice';
import { fetchFeeMetadata } from '../store/slices/feesSlice';

const AddTeacher = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.teachers);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        designation: 'teacher',
        qualification: '',
        experienceYears: '',
        joiningDate: new Date().toISOString().split('T')[0],
        gender: 'male',
        dateOfBirth: '',
        address: '',
        isClassTeacher: false,
        classId: '',
        sectionId: '',
        stream: '',
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

    useEffect(() => {
        const loadMetadata = async () => {
            const res = await dispatch(fetchFeeMetadata());
            if (res.payload?.classes) {
                setClasses(res.payload.classes);
            }
        };
        loadMetadata();
    }, [dispatch]);

    useEffect(() => {
        if (formData.classId) {
            const selectedClass = classes.find(c => c.id === formData.classId);
            if (selectedClass && selectedClass.sections) {
                setSections(selectedClass.sections);
            } else {
                setSections([{ id: '1', name: 'A' }, { id: '2', name: 'B' }, { id: '3', name: 'C' }]);
            }
        }
    }, [formData.classId, classes]);

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
        if (!formData.firstName || !formData.email) {
            alert('Please fill in the required fields: First Name and Email.');
            return;
        }

        const submitData = {
            ...formData,
            experienceYears: formData.experienceYears === '' ? 0 : parseInt(formData.experienceYears)
        };

        const result = await dispatch(createTeacher(submitData));
        if (!result.error) {
            alert(`Teacher created successfully!\nEmployee ID: ${result.payload?.employeeId}\nDefault Password: ${result.payload?.defaultPassword}`);
            navigate('/teachers');
        }
    };

    return (
        <div className="page-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/teachers')} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', height: 42, padding: '0 1rem' }}>
                        <ArrowLeft size={18} /> Back
                    </button>
                    <div>
                        <h2 className="page-title" style={{ margin: 0 }}>Add Teacher</h2>
                        <div style={{ color: '#64748b', fontWeight: 600 }}>Create a new teacher profile and assign permissions.</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="button" className="btn-secondary" onClick={() => navigate('/teachers')} style={{ height: 42, padding: '0 1rem' }}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="add-teacher-form"
                        className="btn-primary"
                        disabled={loading}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', height: 42, padding: '0 1.1rem' }}>
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                        {loading ? 'Creating...' : 'Create Teacher'}
                    </button>
                </div>
            </div>

            <form id="add-teacher-form" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
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
                                    <label className="form-label">First Name *</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Enter first name"
                                        required
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
                                    <label className="form-label">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="teacher@school.com"
                                        required
                                    />
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

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="form-select">
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Enter complete address"
                                    rows={3}
                                    style={{ resize: 'vertical' }}
                                />
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
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                                <div className="form-group">
                                    <label className="form-label">Joining Date</label>
                                    <input
                                        type="date"
                                        name="joiningDate"
                                        value={formData.joiningDate}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {/* Class Assignment */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Users size={18} /> Class Assignment
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
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Stream (Optional)</label>
                                        <select name="stream" value={formData.stream} onChange={handleInputChange} className="form-select">
                                            <option value="">General/None</option>
                                            <option value="science">Science</option>
                                            <option value="commerce">Commerce</option>
                                            <option value="humanities">Humanities</option>
                                        </select>
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
        </div>
    );
};

export default AddTeacher;