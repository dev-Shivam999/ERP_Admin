import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Save, Plus, Trash2, Download, BookOpen, Clock,
    Sparkles, Calendar, Layers, ShieldCheck, Send, Info, AlertTriangle, Fingerprint, Check, Wand2
} from 'lucide-react';
import { fetchExamById, updateExam, fetchExamSchedule } from '../store/slices/examsSlice';
import { fetchClasses, createClass, fetchSubjects } from '../store/slices/academicSlice';
import { fetchSubjectsForClass } from '../store/slices/resultsSlice';

const EditExam = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedExam, examSchedules, loading } = useSelector((state) => state.exams);
    const { classes, subjects: allSubjects } = useSelector((state) => state.academic);

    const [formData, setFormData] = useState({
        name: '',
        examType: 'unit_test',
        startDate: '',
        endDate: '',
        description: '',
    });

    const [selectedClasses, setSelectedClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [newSubject, setNewSubject] = useState({ name: '', maxMarks: 100, passingMarks: 33, date: '', startTime: '09:00', duration: 3 });

    useEffect(() => {
        dispatch(fetchExamById(id));
        dispatch(fetchExamSchedule(id));
        dispatch(fetchClasses());
        dispatch(fetchSubjects());
    }, [dispatch, id]);

    useEffect(() => {
        if (selectedExam) {
            setFormData({
                name: selectedExam.name || '',
                examType: selectedExam.exam_type || 'unit_test',
                startDate: selectedExam.start_date ? new Date(selectedExam.start_date).toISOString().split('T')[0] : '',
                endDate: selectedExam.end_date ? new Date(selectedExam.end_date).toISOString().split('T')[0] : '',
                description: selectedExam.description || '',
            });
        }
    }, [selectedExam]);

    useEffect(() => {
        const schedule = examSchedules[id];
        if (schedule && schedule.length > 0) {
            // Unique classes
            const classIds = [...new Set(schedule.map(s => s.class_id))];
            setSelectedClasses(classIds);

            // Unique subjects
            const uniqueSubjects = [];
            const subjectNames = new Set();

            schedule.forEach(s => {
                if (!subjectNames.has(s.subject_name)) {
                    subjectNames.add(s.subject_name);
                    uniqueSubjects.push({
                        name: s.subject_name,
                        maxMarks: s.max_marks || 100,
                        passingMarks: s.passing_marks || 33,
                        date: s.exam_date ? new Date(s.exam_date).toISOString().split('T')[0] : '',
                        startTime: s.start_time ? s.start_time.slice(0, 5) : '09:00',
                        duration: 3
                    });
                }
            });
            setSubjects(uniqueSubjects);
        }
    }, [examSchedules, id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClassToggle = (classId) => {
        setSelectedClasses(prev =>
            prev.includes(classId)
                ? prev.filter(cid => cid !== classId)
                : [...prev, classId]
        );
    };

    const handleQuickAddClass = async (className) => {
        const trimmed = className.trim();
        if (!trimmed) return;

        const existing = classes.find(c => c.name.toLowerCase() === trimmed.toLowerCase());
        if (existing) {
            if (!selectedClasses.includes(existing.id)) {
                handleClassToggle(existing.id);
            }
            return;
        }

        const result = await dispatch(createClass({
            name: trimmed,
            numericValue: (classes.length + 1) || 1,
            monthlyFeeAmount: 0
        }));

        if (!result.error) {
            handleClassToggle(result.payload.id);
        }
    };

    const handleSubjectChange = (index, field, value) => {
        setSubjects(prev => prev.map((sub, i) =>
            i === index ? { ...sub, [field]: value } : sub
        ));
    };

    const addSubject = () => {
        if (!newSubject.name) return;
        setSubjects(prev => [...prev, { ...newSubject }]);
        setNewSubject({ name: '', maxMarks: 100, passingMarks: 33, date: '', startTime: '09:00', duration: 3 });
    };

    const removeSubject = (index) => {
        setSubjects(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.startDate || !formData.endDate || selectedClasses.length === 0) {
            alert('Selection incomplete: Verify classes and schedule dates.');
            return;
        }

        const result = await dispatch(updateExam({
            id,
            data: {
                ...formData,
                classes: selectedClasses,
                subjects: subjects
            }
        }));

        if (!result.error) {
            alert('ORCHESTRATION SUCCESS: Exam matrix recalibrated.');
            navigate('/exams');
        } else {
            alert(`UPDATE ABORTED: ${result.payload || 'Database rejection'}`);
        }
    };

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', opacity: 0.1 }}><Fingerprint size={120} /></div>;

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <button
                            onClick={() => navigate('/exams')}
                            style={{ padding: '1.25rem', background: '#fff', borderRadius: '1.5rem', border: '1px solid #e2e8f0', cursor: 'pointer', shadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}
                        >
                            <ArrowLeft size={24} style={{ color: '#64748b' }} />
                        </button>
                        <div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.05em', margin: 0 }}>Modify Cycle</h2>
                            <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.875rem', marginTop: '0.25rem' }}>Unified Examination Control Terminal</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) minmax(300px, 0.8fr) minmax(450px, 1.2fr)', gap: '2.5rem', alignItems: 'start' }}>

                    {/* Column 1: Global Parameters */}
                    <div style={{ background: '#fff', borderRadius: '3rem', padding: '3rem', border: '1px solid #e2e8f0', shadow: '0 25px 50px -12px rgb(0 0 0 / 0.05)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
                            <div style={{ width: '3.5rem', height: '3.5rem', background: '#4f46e5', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><BookOpen size={24} /></div>
                            <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.85rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Global Parameters</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="form-group">
                                <label style={{ fontWeight: 800, fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem', display: 'block', marginLeft: '1rem', letterSpacing: '0.1em' }}>Designation Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. ANNUAL MATRIX 2026"
                                    style={{ height: '4.5rem', width: '100%', borderRadius: '1.5rem', border: '3px solid #f1f5f9', background: '#f8fafc', padding: '0 2rem', fontWeight: 700, fontSize: '1.1rem', outline: 'none' }}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: 800, fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem', display: 'block', marginLeft: '1rem', letterSpacing: '0.1em' }}>Classification Type</label>
                                <select
                                    name="examType"
                                    value={formData.examType}
                                    onChange={handleInputChange}
                                    style={{ height: '4.5rem', width: '100%', borderRadius: '1.5rem', border: '3px solid #f1f5f9', background: '#f8fafc', padding: '0 2rem', fontWeight: 700, fontSize: '1.1rem', outline: 'none' }}
                                >
                                    <option value="unit_test">Unit Test</option>
                                    <option value="mid_term">Mid Term / Half Yearly</option>
                                    <option value="final">Final / Annual Exam</option>
                                    <option value="class_test">Class Test</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ fontWeight: 800, fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem', display: 'block', marginLeft: '1rem', letterSpacing: '0.1em' }}>Start Marker</label>
                                    <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} style={{ height: '4rem', width: '100%', borderRadius: '1.5rem', border: '3px solid #f1f5f9', background: '#f8fafc', padding: '0 1.5rem', fontWeight: 700, outline: 'none' }} required />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 800, fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem', display: 'block', marginLeft: '1rem', letterSpacing: '0.1em' }}>End Marker</label>
                                    <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} style={{ height: '4rem', width: '100%', borderRadius: '1.5rem', border: '3px solid #f1f5f9', background: '#f8fafc', padding: '0 1.5rem', fontWeight: 700, outline: 'none' }} required />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Class Selection with Checkboxes */}
                    <div style={{ background: '#fff', borderRadius: '3rem', padding: '3rem', border: '1px solid #e2e8f0', shadow: '0 25px 50px -12px rgb(0 0 0 / 0.05)', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
                            <div style={{ width: '3.5rem', height: '3.5rem', background: '#0f172a', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Layers size={24} /></div>
                            <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.2rem', fontSize: '0.85rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Participating Classes</h3>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '1rem' }}>
                            {/* Quick Add Input */}
                            <div style={{ padding: '0 0.5rem 1rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder="+ Quick Establish (e.g. Class 10)..."
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleQuickAddClass(e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '1.25rem 3.5rem 1.25rem 1.5rem',
                                            borderRadius: '1.5rem',
                                            border: '3px dashed #e2e8f0',
                                            background: '#fff',
                                            fontWeight: 800,
                                            fontSize: '0.85rem',
                                            color: '#4f46e5',
                                            outline: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                    />
                                    <div style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }}>
                                        <Wand2 size={18} />
                                    </div>
                                </div>
                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.75rem', marginLeft: '0.5rem' }}>Type & Press Enter to Establish</p>
                            </div>

                            {classes.length > 0 ? classes.map(cls => (
                                <label
                                    key={cls.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1.5rem',
                                        padding: '1.25rem 2rem',
                                        borderRadius: '1.5rem',
                                        background: selectedClasses.includes(cls.id) ? '#f5f3ff' : '#f8fafc',
                                        border: '3px solid',
                                        borderColor: selectedClasses.includes(cls.id) ? '#4f46e5' : '#f1f5f9',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                >
                                    <div style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '8px',
                                        border: '3px solid',
                                        borderColor: selectedClasses.includes(cls.id) ? '#4f46e5' : '#cbd5e1',
                                        background: selectedClasses.includes(cls.id) ? '#4f46e5' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff'
                                    }}>
                                        {selectedClasses.includes(cls.id) && <Check size={18} strokeWidth={4} />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={selectedClasses.includes(cls.id)}
                                        onChange={() => handleClassToggle(cls.id)}
                                        style={{ display: 'none' }}
                                    />
                                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: selectedClasses.includes(cls.id) ? '#4338ca' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {cls.name}
                                    </span>
                                </label>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '4rem 2rem', opacity: 0.3 }}>
                                    <Layers size={48} style={{ margin: '0 auto 1rem' }} />
                                    <p style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>No Classes Found</p>
                                </div>
                            )}
                        </div>

                        <div style={{ background: '#eef2ff', borderRadius: '2rem', padding: '1.5rem', border: '1px solid #c7d2fe', display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '2.5rem' }}>
                            <Send size={24} style={{ color: '#4f46e5' }} />
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4338ca', margin: 0 }}>Saving will notify all students and parents of selected classes instantly.</p>
                        </div>
                    </div>

                    {/* Column 3: Subject Timeline Matrix */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ background: '#0f172a', borderRadius: '3.5rem', padding: '3.5rem', color: '#fff', shadow: '0 25px 75px -12px rgb(0 0 0 / 0.3)', border: '10px solid #fff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3.5rem' }}>
                                <div style={{ width: '4rem', height: '4rem', background: '#fff', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a' }}><Clock size={28} /></div>
                                <h4 style={{ textTransform: 'uppercase', letterSpacing: '0.4rem', fontSize: '0.9rem', fontWeight: 900, color: '#fff', margin: 0 }}>Subject Timeline Matrix</h4>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {subjects.map((sub, idx) => (
                                    <div key={idx} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '2rem', padding: '1.75rem', display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 40px', gap: '1.5rem', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div>
                                            <p style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>Subject Link</p>
                                            <input type="text" value={sub.name} onChange={(e) => handleSubjectChange(idx, 'name', e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', fontWeight: 900, fontSize: '1.25rem', outline: 'none', width: '100%', letterSpacing: '-0.02em' }} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>Temporal Marker</p>
                                            <input type="date" value={sub.date} onChange={(e) => handleSubjectChange(idx, 'date', e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', fontWeight: 800, fontSize: '0.9rem', outline: 'none' }} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>Quantum</p>
                                            <p style={{ fontWeight: 900, color: '#fff', margin: 0, fontSize: '1rem' }}>{sub.maxMarks}M | {sub.duration}H</p>
                                        </div>
                                        <button type="button" onClick={() => removeSubject(idx)} style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#ef4444', borderRadius: '1rem', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={20} /></button>
                                    </div>
                                ))}
                            </div>

                            {/* Add Flow */}
                            <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '2.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', border: '3px dashed rgba(255,255,255,0.1)' }}>
                                <select
                                    value={newSubject.name}
                                    onChange={(e) => {
                                        const selected = allSubjects.find(s => s.name === e.target.value);
                                        setNewSubject({ ...newSubject, name: e.target.value });
                                    }}
                                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontWeight: 700, fontSize: '1.1rem', appearance: 'none' }}
                                >
                                    <option value="" style={{ color: '#000' }}>Select or Type Subject...</option>
                                    {allSubjects.map(sub => (
                                        <option key={sub.id} value={sub.name} style={{ color: '#000' }}>{sub.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Or custom name..."
                                    value={newSubject.name}
                                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                                    style={{ flex: 0.5, background: 'rgba(255,255,255,0.1)', border: 'none', outline: 'none', color: '#fff', fontWeight: 700, fontSize: '0.9rem', borderRadius: '1rem', padding: '0.5rem 1rem' }}
                                />
                                <button type="button" onClick={addSubject} style={{ padding: '1.1rem 2.5rem', background: '#fff', color: '#0f172a', fontWeight: 900, borderRadius: '1.25rem', border: 'none', cursor: 'pointer', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.15em' }}>Apply Entry</button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.5rem', marginTop: 'auto' }}>
                            <button type="button" onClick={() => navigate('/exams')} style={{ padding: '1.5rem 2.5rem', background: 'transparent', border: '3px solid #e2e8f0', borderRadius: '2rem', fontWeight: 900, color: '#64748b', cursor: 'pointer', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Discard Changes</button>
                            <button type="submit" disabled={loading} style={{ padding: '1.5rem 4rem', background: '#4f46e5', border: 'none', borderRadius: '2rem', fontWeight: 900, color: '#fff', cursor: 'pointer', shadow: '0 25px 30px -10px rgba(79, 70, 229, 0.3)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {loading ? 'SYNCHRONIZING...' : <><ShieldCheck size={22} /> Authorize Sync</>}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditExam;
