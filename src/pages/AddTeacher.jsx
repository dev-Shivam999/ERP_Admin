import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, GraduationCap, User, Mail, Phone, Briefcase, Award, ShieldCheck, Bookmark, LayoutGrid, Shield } from 'lucide-react';
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
        { id: 'manage_students', label: 'Manage Students', desc: 'Add/Edit/Delete students' },
        { id: 'mark_attendance', label: 'Mark Attendance', desc: 'Can mark student attendance' },
        { id: 'collect_fees', label: 'Collect Fees', desc: 'Can process fee payments' },
        { id: 'manage_exams', label: 'Manage Exams', desc: 'Schedule exams and enter marks' },
        { id: 'view_reports', label: 'View Reports', desc: 'Financial & academic reports' },
        { id: 'manage_homework', label: 'Manage Homework', desc: 'Create and review assignments' },
        { id: 'manage_schedule', label: 'View Schedule', desc: 'Access class timetables' },
    ];

    useEffect(() => {
        const loadMetadata = async () => {
            const res = await dispatch(fetchFeeMetadata());
            if (res.payload?.classes) {
                setClasses(res.payload.classes);
                // Initially use sections from first class if available
                if (res.payload.classes.length > 0) {
                    // This assumes the metadata returns sections inside classes or as a separate array
                    // Based on previous knowledge, metadata usually has classes with nested sections or a flat array
                }
            }
        };
        loadMetadata();
    }, [dispatch]);

    // Simple section filter based on class selection
    useEffect(() => {
        if (formData.classId) {
            const selectedClass = classes.find(c => c.id === formData.classId);
            if (selectedClass && selectedClass.sections) {
                setSections(selectedClass.sections);
            } else {
                // Fallback for demo/basic setups
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
            alert('Core Validation Failed: Name and Connectivity (Email) are mandatory.');
            return;
        }

        const submitData = {
            ...formData,
            experienceYears: formData.experienceYears === '' ? 0 : parseInt(formData.experienceYears)
        };

        const result = await dispatch(createTeacher(submitData));
        if (!result.error) {
            alert(`Onboarding Complete!\nEmployee ID: ${result.payload?.employeeId}\nSystem Access: ${result.payload?.defaultPassword}`);
            navigate('/teachers');
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '1.25rem 1.75rem',
        background: '#f8fafc',
        border: '2px solid #f1f5f9',
        borderRadius: '1.5rem',
        fontSize: '1rem',
        fontWeight: 700,
        color: '#0f172a',
        transition: 'all 0.2s',
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
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.05em' }}>Teacher Onboarding</h2>
                        <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>Personnel Registry & Assignment Terminal</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Primary Data */}
                    <div style={{ background: '#fff', borderRadius: '3rem', padding: '3rem', border: '1px solid #e2e8f0', shadow: '0 25px 50px -12px rgb(0 0 0 / 0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                            <div style={{ width: '3rem', height: '3rem', background: '#4f46e5', borderRadius: '1rem', display: 'flex', alignItems: 'center', justify: 'center', color: '#fff' }}><User size={20} /></div>
                            <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.75rem', fontWeight: 900 }}>Identity Matrix</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Given Name *</label>
                                <input name="firstName" value={formData.firstName} onChange={handleInputChange} style={inputStyle} placeholder="First Name" required />
                            </div>
                            <div>
                                <label style={labelStyle}>Family Name</label>
                                <input name="lastName" value={formData.lastName} onChange={handleInputChange} style={inputStyle} placeholder="Last Name" />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Connectivity Email *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={inputStyle} placeholder="name@school.com" required />
                            </div>
                            <div>
                                <label style={labelStyle}>Interface Phone</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} style={inputStyle} placeholder="+91 XXXX XXXX" />
                            </div>
                        </div>
                    </div>

                    {/* Professional Protocol */}
                    <div style={{ background: '#fff', borderRadius: '3rem', padding: '3rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                            <div style={{ width: '3rem', height: '3rem', background: '#0f172a', borderRadius: '1rem', display: 'flex', alignItems: 'center', justify: 'center', color: '#fff' }}><Briefcase size={20} /></div>
                            <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.75rem', fontWeight: 900 }}>Onboarding metadata</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Institutional Designation</label>
                                <select name="designation" value={formData.designation} onChange={handleInputChange} style={inputStyle}>
                                    <option value="teacher">Teacher</option>
                                    <option value="senior_teacher">Senior Teacher</option>
                                    <option value="head_teacher">Department Head</option>
                                    <option value="principal">Executive Head</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Historical Tenure (Years)</label>
                                <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleInputChange} style={inputStyle} placeholder="Ex: 5" />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Academic Credentials</label>
                            <input name="qualification" value={formData.qualification} onChange={handleInputChange} style={inputStyle} placeholder="M.Ed, Ph.D, B.Sc Mathematics" />
                        </div>
                    </div>

                    {/* Class Teacher Assignment - CRITICAL SECTION */}
                    <div style={{ background: '#0f172a', borderRadius: '3rem', padding: '3rem', color: '#fff', border: '8px solid #fff', shadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '3rem', height: '3rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justify: 'center' }}><Bookmark size={20} /></div>
                                <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.75rem', fontWeight: 900 }}>Command Assignment</h3>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1.5rem', borderRadius: '1.2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <input type="checkbox" name="isClassTeacher" checked={formData.isClassTeacher} onChange={handleInputChange} style={{ width: '1.2rem', height: '1.2rem', borderRadius: '0.4rem' }} />
                                <span style={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Initialize as Class Teacher</span>
                            </label>
                        </div>

                        {formData.isClassTeacher && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', animate: 'fadeIn 0.3s ease' }}>
                                <div>
                                    <label style={{ ...labelStyle, color: 'rgba(255,255,255,0.4)' }}>Class link</label>
                                    <select name="classId" value={formData.classId} onChange={handleInputChange} style={{ ...inputStyle, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                                        <option value="" className="bg-slate-900">Select Class</option>
                                        {classes.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ ...labelStyle, color: 'rgba(255,255,255,0.4)' }}>Section Marker</label>
                                    <select name="sectionId" value={formData.sectionId} onChange={handleInputChange} style={{ ...inputStyle, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                                        <option value="" className="bg-slate-900">Select Section</option>
                                        {sections.map(s => <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ ...labelStyle, color: 'rgba(255,255,255,0.4)' }}>Stream Specification (Optional)</label>
                                    <select name="stream" value={formData.stream} onChange={handleInputChange} style={{ ...inputStyle, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                                        <option value="" className="bg-slate-900">General/None</option>
                                        <option value="science" className="bg-slate-900">Science</option>
                                        <option value="commerce" className="bg-slate-900">Commerce</option>
                                        <option value="humanities" className="bg-slate-900">Humanities</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {!formData.isClassTeacher && (
                            <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.3 }}>
                                <p style={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>No direct class command assigned to this profile.</p>
                            </div>
                        )}
                    </div>

                    {/* Security Clearances (Granular Permissions) */}
                    <div style={{ background: '#fff', borderRadius: '3rem', padding: '3rem', border: '1px solid #0ea5e9', marginBottom: '2rem' }}>
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
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.5rem', marginTop: '1rem' }}>
                        <button type="button" onClick={() => navigate('/teachers')} style={{ padding: '1.25rem 2.5rem', background: 'transparent', border: '2px solid #e2e8f0', borderRadius: '1.5rem', fontWeight: 900, color: '#64748b', cursor: 'pointer' }}>Cancel Entry</button>
                        <button type="submit" disabled={loading} style={{ padding: '1.25rem 3.5rem', background: '#4f46e5', border: 'none', borderRadius: '1.5rem', fontWeight: 900, color: '#fff', cursor: 'pointer', shadow: '0 20px 25px -5px rgb(79 70 229 / 0.4)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {loading ? 'PROCESSING...' : <><ShieldCheck size={20} /> AUTHORIZE REGISTRY</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTeacher;
