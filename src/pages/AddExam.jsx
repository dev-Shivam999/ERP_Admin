import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, Trash2, BookOpen, Clock, Calendar, Layers, Check, Loader2
} from 'lucide-react';
import { createExam } from '../store/slices/examsSlice';
import { fetchClasses, createClass } from '../store/slices/academicSlice';

const AddExam = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.exams);
    const { classes } = useSelector((state) => state.academic);

    const [formData, setFormData] = useState({
        name: '',
        examType: 'unit_test',
        startDate: '',
        endDate: '',
        description: '',
    });

    const [selectedClasses, setSelectedClasses] = useState([]);
    const [subjects, setSubjects] = useState([
        { name: 'Hindi', maxMarks: 100, passingMarks: 33, date: '', startTime: '09:00', duration: 3 },
        { name: 'English', maxMarks: 100, passingMarks: 33, date: '', startTime: '09:00', duration: 3 },
        { name: 'Mathematics', maxMarks: 100, passingMarks: 33, date: '', startTime: '09:00', duration: 3 },
    ]);

    const [newSubject, setNewSubject] = useState({ name: '', maxMarks: 100, passingMarks: 33, date: '', startTime: '09:00', duration: 3 });

    useEffect(() => {
        dispatch(fetchClasses());
    }, [dispatch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClassToggle = (classId) => {
        setSelectedClasses(prev =>
            prev.includes(classId)
                ? prev.filter(id => id !== classId)
                : [...prev, classId]
        );
    };

    const handleQuickAddClass = async (className) => {
        const trimmed = className.trim();
        if (!trimmed) return;

        // Prevent duplicate local selection
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
            alert('Please fill exam name, dates, and select at least one class.');
            return;
        }

        const result = await dispatch(createExam({
            ...formData,
            classes: selectedClasses,
            subjects: subjects,
        }));

        if (!result.error) {
            alert('Exam created successfully.');
            navigate('/exams');
        }
    };

    return (
        <div className="page-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/exams')} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', height: 42, padding: '0 1rem' }}>
                        <ArrowLeft size={18} /> Back
                    </button>
                    <div>
                        <h2 className="page-title" style={{ margin: 0 }}>Add Exam</h2>
                        <div style={{ color: '#64748b', fontWeight: 600 }}>Create an exam and set the timetable.</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="button" className="btn-secondary" onClick={() => navigate('/exams')} style={{ height: 42, padding: '0 1rem' }}>
                        Cancel
                    </button>
                    <button type="submit" form="add-exam-form" className="btn-primary" disabled={loading} style={{ height: 42, padding: '0 1.1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                        {loading ? 'Creating...' : 'Create exam'}
                    </button>
                </div>
            </div>

            <form id="add-exam-form" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.25rem', alignItems: 'start' }}>
                {/* Left: exam details */}
                <div style={{ display: 'grid', gap: '1.25rem' }}>
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <BookOpen size={18} /> Exam details
                            </h3>
                        </div>
                        <div className="card-body" style={{ display: 'grid', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Exam name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="e.g. Annual Exam 2026"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Exam type</label>
                                <select name="examType" value={formData.examType} onChange={handleInputChange} className="form-select">
                                    <option value="unit_test">Unit Test</option>
                                    <option value="mid_term">Mid Term / Half Yearly</option>
                                    <option value="final">Final / Annual Exam</option>
                                    <option value="class_test">Class Test</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Start date</label>
                                    <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End date</label>
                                    <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="form-input" required />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={18} /> Subjects & timetable
                            </h3>
                        </div>
                        <div className="card-body" style={{ display: 'grid', gap: '0.75rem' }}>
                            {subjects.map((sub, idx) => (
                                <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.9rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <div style={{ fontWeight: 800, color: '#111827' }}>Subject #{idx + 1}</div>
                                        <button type="button" className="btn-secondary" onClick={() => removeSubject(idx)} style={{ height: 34, width: 34, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#fff1f2', borderColor: '#fecdd3', color: '#e11d48' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Name</label>
                                            <input type="text" className="form-input" value={sub.name} onChange={(e) => handleSubjectChange(idx, 'name', e.target.value)} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Date</label>
                                            <input type="date" className="form-input" value={sub.date} onChange={(e) => handleSubjectChange(idx, 'date', e.target.value)} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Start time</label>
                                            <input type="time" className="form-input" value={sub.startTime} onChange={(e) => handleSubjectChange(idx, 'startTime', e.target.value)} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Max marks</label>
                                            <input type="number" className="form-input" value={sub.maxMarks} onChange={(e) => handleSubjectChange(idx, 'maxMarks', e.target.value)} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Passing marks</label>
                                            <input type="number" className="form-input" value={sub.passingMarks} onChange={(e) => handleSubjectChange(idx, 'passingMarks', e.target.value)} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Duration (hours)</label>
                                            <input type="number" className="form-input" value={sub.duration} onChange={(e) => handleSubjectChange(idx, 'duration', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="New subject name…"
                                    value={newSubject.name}
                                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                                    style={{ flex: 1, minWidth: 240 }}
                                />
                                <button type="button" className="btn-primary" onClick={addSubject} style={{ height: 42, padding: '0 1rem' }}>
                                    Add subject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: class selection */}
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            <Layers size={18} /> Classes
                        </h3>
                        <div style={{ color: '#64748b', fontWeight: 700, fontSize: '0.9rem' }}>
                            Selected: {selectedClasses.length}
                        </div>
                    </div>
                    <div className="card-body" style={{ display: 'grid', gap: '0.75rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Quick add class (press Enter)</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Class 10"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleQuickAddClass(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 520, overflow: 'auto' }}>
                            {classes.length > 0 ? classes.map(cls => (
                                <label
                                    key={cls.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 0.9rem',
                                        borderRadius: 12,
                                        border: `1px solid ${selectedClasses.includes(cls.id) ? '#c7d2fe' : '#e2e8f0'}`,
                                        background: selectedClasses.includes(cls.id) ? '#eef2ff' : '#fff',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedClasses.includes(cls.id)}
                                        onChange={() => handleClassToggle(cls.id)}
                                    />
                                    <div style={{ fontWeight: 800, color: '#111827' }}>{cls.name}</div>
                                </label>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                    <Layers size={40} style={{ marginBottom: '0.75rem', opacity: 0.6 }} />
                                    <div style={{ fontWeight: 700 }}>No classes found.</div>
                                </div>
                            )}
                        </div>

                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                            Saving this exam will notify students and class teachers for the selected classes.
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddExam;

