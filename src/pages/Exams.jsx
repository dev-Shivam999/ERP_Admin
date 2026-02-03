import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Plus, BookOpen, Calendar, Clock, AlertCircle, BarChart3, Fingerprint,
    Printer, ShieldCheck, Edit, Trash2, Check, FileText
} from 'lucide-react';
import { fetchExams, publishResults, clearError, fetchExamStats, deleteExam, fetchExamSchedule } from '../store/slices/examsSlice';
import api from '../services/api';

const Exams = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { exams, examStats, examSchedules, loading, error } = useSelector((state) => state.exams);

    useEffect(() => {
        dispatch(fetchExams());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            alert(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handlePublish = (examId) => {
        if (window.confirm('Publish results for this exam? Students and teachers will be notified.')) {
            dispatch(publishResults(examId));
        }
    };

    const handleDelete = (examId) => {
        if (window.confirm('Delete this exam and all related marks? This cannot be undone.')) {
            dispatch(deleteExam(examId));
        }
    };

    const downloadSchedule = async (exam) => {
        try {
            const res = await api.get(`/exams/${exam.id}/schedule`);
            if (res.success) {
                const schedules = res.data;
                const html = `
                    <html>
                        <head>
                            <title>OFFICIAL TIMETABLE | ${exam.name}</title>
                            <style>
                                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                                body { font-family: 'Inter', sans-serif; padding: 60px; color: #0f172a; }
                                .header { border-bottom: 6px solid #0f172a; padding-bottom: 30px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
                                h1 { margin: 0; font-size: 42px; font-weight: 900; letter-spacing: -2px; text-transform: uppercase; }
                                .meta { font-size: 14px; font-weight: 900; color: #4f46e5; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 10px; }
                                .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-bottom: 50px; background: #f8fafc; padding: 30px; border-radius: 20px; }
                                .info-item b { display: block; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; }
                                .info-item span { font-size: 16px; font-weight: 800; }
                                table { width: 100%; border-collapse: collapse; }
                                th { background: #0f172a; color: #fff; padding: 20px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; }
                                td { padding: 20px; border-bottom: 2px solid #f1f5f9; font-size: 15px; font-weight: 700; }
                                .footer { margin-top: 80px; text-align: center; font-size: 11px; color: #94a3b8; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; border-top: 2px solid #f1f5f9; padding-top: 40px; }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <div>
                                    <div class="meta">Examination Authority</div>
                                    <h1>${exam.name}</h1>
                                </div>
                                <div style="text-align: right">
                                    <div class="meta">Cycle Status</div>
                                    <span style="font-size: 20px; font-weight: 900;">OFFICIAL RELEASE</span>
                                </div>
                            </div>
                            <div class="info-grid">
                                <div class="info-item"><b>Academic Term</b><span>${exam.academic_year || '2025-26'}</span></div>
                                <div class="info-item"><b>Commencement</b><span>${new Date(exam.start_date).toLocaleDateString()}</span></div>
                                <div class="info-item"><b>Conclusion</b><span>${new Date(exam.end_date).toLocaleDateString()}</span></div>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Time Window</th>
                                        <th>Class Cohort</th>
                                        <th>Subject Stream</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${schedules.length > 0 ? schedules.map(s => `
                                        <tr>
                                            <td>${new Date(s.exam_date).toLocaleDateString()}</td>
                                            <td>${s.start_time} - ${s.end_time}</td>
                                            <td>${s.class_name}</td>
                                            <td>${s.subject_name}</td>
                                        </tr>
                                    `).join('') : '<tr><td colspan="4" style="text-align:center; padding: 100px; color: #cbd5e1;">NO SCHEDULE DATA ENROLLED</td></tr>'}
                                </tbody>
                            </table>
                    <div class="footer">Generated on ${new Date().toLocaleString()}</div>
                        </body>
                    </html>
                `;
                const win = window.open('', '_blank');
                win.document.write(html);
                win.document.close();
                win.print();
            }
        } catch (err) {
            alert('Download failed. Please try again.');
        }
    };

    const getExamTypeGradient = (type) => {
        const types = {
            unit_test: 'linear-gradient(135deg, #2563eb, #06b6d4)',
            mid_term: 'linear-gradient(135deg, #f59e0b, #fb923c)',
            final: 'linear-gradient(135deg, #e11d48, #db2777)',
            class_test: 'linear-gradient(135deg, #059669, #14b8a6)',
        };
        return types[type] || 'linear-gradient(135deg, #475569, #94a3b8)';
    };

    return (
        <div className="page-content">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                    <h2 className="page-title" style={{ margin: 0 }}>Exams</h2>
                    <p style={{ margin: 0, color: '#64748b' }}>Manage schedules, publish results, and monitor completion.</p>
                </div>
                <button onClick={() => navigate('/exams/add')} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', height: 42, padding: '0 1.1rem' }}>
                    <Plus size={18} /> New exam
                </button>
            </div>

            {/* Loading / empty states */}
            {loading ? (
                <div className="card">
                    <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: '#94a3b8', gap: '0.75rem' }}>
                        <Fingerprint size={28} />
                        <span style={{ fontWeight: 700 }}>Loading exams…</span>
                    </div>
                </div>
            ) : exams.length === 0 ? (
                <div className="card">
                    <div className="card-body" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        <BookOpen size={48} style={{ marginBottom: '0.75rem', opacity: 0.6 }} />
                        <div style={{ fontWeight: 700 }}>No exams found.</div>
                        <div style={{ marginTop: '0.25rem' }}>Create an exam to get started.</div>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '1.25rem' }}>
                    {exams.map((exam) => {
                        const isCompleted = new Date() > new Date(exam.end_date);
                        const stats = examStats[exam.id] || {};
                        const schedule = examSchedules[exam.id] || [];
                        const totalStudents = parseInt(stats.total_students) || 0;
                        const studentsWithMarks = parseInt(stats.students_with_marks) || 0;
                        const completionRate = totalStudents > 0 ? Math.round((studentsWithMarks / totalStudents) * 100) : 0;

                        return (
                            <div key={exam.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5', textTransform: 'capitalize' }}>
                                            {exam.exam_type?.replace('_', ' ') || 'Exam'}
                                        </div>
                                        <h3 className="card-title" style={{ margin: '0.15rem 0' }}>{exam.name}</h3>
                                        <div style={{ color: '#64748b', fontWeight: 600, display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <Calendar size={16} />
                                            <span>{new Date(exam.start_date).toLocaleDateString()} – {new Date(exam.end_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                                        <button className="btn-secondary" onClick={() => navigate(`/exams/edit/${exam.id}`)} style={{ height: 36, width: 36, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Edit size={16} />
                                        </button>
                                        <button className="btn-secondary" onClick={() => handleDelete(exam.id)} style={{ height: 36, width: 36, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48', borderColor: '#fecdd3', background: '#fff1f2' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="card-body" style={{ display: 'grid', gap: '0.75rem' }}>
                                    {/* Status + progress */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: exam.is_published ? '#16a34a' : '#f59e0b', fontWeight: 700 }}>
                                            {exam.is_published ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
                                            {exam.is_published ? 'Published' : 'Draft'}
                                        </div>
                                        <div style={{ fontWeight: 800, color: '#4f46e5' }}>{completionRate}% graded</div>
                                    </div>
                                    <div style={{ height: 8, background: '#e2e8f0', borderRadius: 999 }}>
                                        <div style={{ height: 8, background: '#4f46e5', borderRadius: 999, width: `${completionRate}%`, transition: 'width 200ms ease' }} />
                                    </div>

                                    {/* Stats */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.6rem' }}>
                                        <div style={{ background: '#f8fafc', borderRadius: 10, padding: '0.65rem 0.75rem' }}>
                                            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>Students</div>
                                            <div style={{ fontWeight: 900, color: '#0f172a' }}>{totalStudents}</div>
                                        </div>
                                        <div style={{ background: '#f8fafc', borderRadius: 10, padding: '0.65rem 0.75rem' }}>
                                            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>Marks entered</div>
                                            <div style={{ fontWeight: 900, color: '#0f172a' }}>{studentsWithMarks}</div>
                                        </div>
                                        <div style={{ background: '#f8fafc', borderRadius: 10, padding: '0.65rem 0.75rem' }}>
                                            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>Duration</div>
                                            <div style={{ fontWeight: 900, color: '#0f172a' }}>
                                                {new Date(exam.start_date).toLocaleDateString()} - {new Date(exam.end_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Schedule snippet */}
                                    <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#111827', fontWeight: 800 }}>
                                            <Clock size={16} /> Schedule
                                        </div>
                                        {schedule.length === 0 ? (
                                            <div style={{ color: '#94a3b8', fontWeight: 600 }}>No schedule entries.</div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: 180, overflow: 'auto' }}>
                                                {schedule.slice(0, 4).map((s, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.9rem', color: '#334155' }}>
                                                        <div style={{ fontWeight: 700 }}>{s.subject_name}</div>
                                                        <div style={{ color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                            {new Date(s.exam_date).toLocaleDateString()} • {s.start_time} - {s.end_time}
                                                        </div>
                                                    </div>
                                                ))}
                                                {schedule.length > 4 && (
                                                    <div style={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.85rem' }}>+{schedule.length - 4} more</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="card-footer" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <button className="btn-secondary" onClick={() => downloadSchedule(exam)} style={{ height: 36, padding: '0 0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Printer size={16} /> Schedule
                                    </button>
                                    <button className="btn-secondary" style={{ height: 36, padding: '0 0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <FileText size={16} /> Marks
                                    </button>
                                    {!exam.is_published ? (
                                        <button className="btn-primary" onClick={() => handlePublish(exam.id)} style={{ height: 36, padding: '0 0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Check size={16} /> Publish Results
                                        </button>
                                    ) : (
                                        <button className="btn-secondary" disabled style={{ height: 36, padding: '0 0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a', borderColor: '#bbf7d0', background: '#f0fdf4' }}>
                                            <ShieldCheck size={16} /> Results Published
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Exams;
