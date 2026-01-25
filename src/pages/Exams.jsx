import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Plus, BookOpen, Award, Calendar, FileText, Check, Download,
    Eye, Sparkles, Clock, Target, AlertCircle, BarChart3, Fingerprint, Printer, ShieldCheck, Edit, Trash2
} from 'lucide-react';
import { fetchExams, publishResults, clearError, fetchExamStats, deleteExam, fetchExamSchedule } from '../store/slices/examsSlice';
import api from '../services/api';

const Exams = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { exams, examStats, examSchedules, loading, error } = useSelector((state) => state.exams);

    useEffect(() => {
        dispatch(fetchExams()).then((res) => {
            if (res.payload) {
                const examList = res.payload.exams || res.payload;
                if (Array.isArray(examList)) {
                    examList.forEach(exam => {
                        dispatch(fetchExamStats(exam.id));
                        dispatch(fetchExamSchedule(exam.id));
                    });
                }
            }
        });
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            alert(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handlePublish = (examId) => {
        if (window.confirm('PROTOCOL: Finalize and Broadcast results? Students and teachers will be notified.')) {
            dispatch(publishResults(examId));
        }
    };

    const handleDelete = (examId) => {
        if (window.confirm('CRITICAL ACTION: Terminate this exam and all related marks? This protocol is irreversible.')) {
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
                            <div class="footer">School ERP Matrix System • Generated on ${new Date().toLocaleString()}</div>
                        </body>
                    </html>
                `;
                const win = window.open('', '_blank');
                win.document.write(html);
                win.document.close();
                win.print();
            }
        } catch (err) {
            alert('DOWNLOAD ABORTED: Database synchronization failed.');
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
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', marginBottom: '4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.06em', margin: 0 }}>Exams</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.75rem' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4f46e5' }}></div>
                                <p style={{ fontSize: '12px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4em', margin: 0 }}>Result Lifecycle Terminal</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/exams/add')}
                            style={{ padding: '1.5rem 3rem', background: '#0f172a', color: '#fff', borderRadius: '2rem', fontWeight: 900, border: 'none', cursor: 'pointer', shadow: '0 25px 30px -5px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.15em' }}
                        >
                            <Plus size={22} /> Establish New Exam
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10rem 0', opacity: 0.1 }}><Fingerprint size={120} /></div>
                ) : exams.length === 0 ? (
                    <div style={{ padding: '10rem 2rem', textAlign: 'center', background: '#fff', borderRadius: '5rem', border: '10px dashed #f1f5f9' }}>
                        <BookOpen size={120} style={{ color: '#e2e8f0', marginBottom: '2.5rem' }} />
                        <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.3em' }}>Matrix Dormant</h3>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', gap: '3rem' }}>
                        {exams.map((exam) => {
                            const isCompleted = new Date() > new Date(exam.end_date);
                            const stats = examStats[exam.id] || [];
                            const schedule = examSchedules[exam.id] || [];
                            const totalStudents = stats.reduce((acc, s) => acc + (parseInt(s.total_students) || 0), 0);
                            const studentsWithMarks = stats.reduce((acc, s) => acc + (parseInt(s.students_with_marks) || 0), 0);
                            const completionRate = totalStudents > 0 ? Math.round((studentsWithMarks / totalStudents) * 100) : 0;

                            return (
                                <div key={exam.id} style={{ background: '#fff', borderRadius: '4rem', padding: '3.5rem', border: '1px solid #e2e8f0', shadow: '0 30px 60px -15px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s' }}>
                                    <div style={{ position: 'absolute', top: 0, right: 0, width: '250px', height: '250px', background: getExamTypeGradient(exam.exam_type), opacity: 0.04, borderRadius: '0 0 0 100%', zIndex: 0 }}></div>

                                    <div style={{ position: 'relative', zIndex: 1, marginBottom: '3rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                            <span style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: getExamTypeGradient(exam.exam_type), borderRadius: '1.25rem', color: '#fff', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', shadow: '0 12px 20px -5px rgba(0,0,0,0.2)' }}>
                                                {exam.exam_type?.replace('_', ' ')}
                                            </span>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button onClick={() => navigate(`/exams/edit/${exam.id}`)} style={{ width: '4rem', height: '4rem', borderRadius: '1.5rem', background: '#f8fafc', border: '2px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}>
                                                    <Edit size={24} />
                                                </button>
                                                <button onClick={() => handleDelete(exam.id)} style={{ width: '4rem', height: '4rem', borderRadius: '1.5rem', background: '#fff1f2', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48', cursor: 'pointer' }}>
                                                    <Trash2 size={24} />
                                                </button>
                                            </div>
                                        </div>
                                        <h4 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', margin: '0 0 1rem 0', lineHeight: 1 }}>{exam.name}</h4>
                                        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', marginTop: '2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b' }}>
                                                <Calendar size={18} />
                                                <span style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                                                    {new Date(exam.start_date).toLocaleDateString()} — {new Date(exam.end_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: exam.is_published ? '#10b981' : '#f59e0b' }}>
                                                {exam.is_published ? <ShieldCheck size={24} /> : <AlertCircle size={24} />}
                                                <span style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                                                    {exam.is_published ? 'Published' : 'Draft Protocol'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Schedule Breakdown */}
                                    <div style={{ position: 'relative', zIndex: 1, background: '#f8fafc', borderRadius: '3rem', padding: '2.5rem', marginBottom: '2.5rem', border: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                            <Clock size={22} style={{ color: '#4f46e5' }} />
                                            <span style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.3em' }}>Detailed Command Schedule</span>
                                        </div>
                                        {schedule.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                {schedule.map((s, idx) => (
                                                    <div key={idx} style={{ paddingBottom: '1.5rem', borderBottom: idx !== schedule.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                            <span style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>{s.subject_name}</span>
                                                            <span style={{ fontSize: '11px', fontWeight: 900, background: '#e0e7ff', color: '#4338ca', padding: '0.4rem 0.8rem', borderRadius: '0.75rem', textTransform: 'uppercase' }}>Class {s.class_name}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <Calendar size={12} /> {new Date(s.exam_date).toLocaleDateString()}
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <Clock size={12} /> {s.start_time} - {s.end_time}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>No Schedule Entries Logged</div>
                                        )}
                                    </div>

                                    {/* Evaluation Progress */}
                                    <div style={{ position: 'relative', zIndex: 1, background: '#ffffff', borderRadius: '2.5rem', padding: '2rem', marginBottom: '2.5rem', border: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <BarChart3 size={22} style={{ color: '#4f46e5' }} />
                                                <span style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.25em' }}>Completion Index</span>
                                            </div>
                                            <span style={{ fontSize: '14px', fontWeight: 900, color: '#4f46e5' }}>{completionRate}%</span>
                                        </div>
                                        <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', background: '#4f46e5', width: `${completionRate}%`, transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                                        </div>
                                    </div>

                                    <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                        <button
                                            onClick={() => downloadSchedule(exam)}
                                            style={{ padding: '1.5rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '1.75rem', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', letterSpacing: '0.15em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', shadow: '0 15px 20px -5px rgba(15, 23, 42, 0.2)' }}
                                        >
                                            <Printer size={18} /> Print
                                        </button>
                                        <button style={{ padding: '1.5rem', background: '#fff', border: '3px solid #f1f5f9', borderRadius: '1.75rem', fontSize: '12px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', cursor: 'pointer', letterSpacing: '0.1em' }}>Marks</button>
                                        {isCompleted && !exam.is_published ? (
                                            <button
                                                onClick={() => handlePublish(exam.id)}
                                                style={{ padding: '1.5rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '1.75rem', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', shadow: '0 15px 20px -5px rgba(16, 185, 129, 0.3)', letterSpacing: '0.1em' }}
                                            >
                                                Finalize
                                            </button>
                                        ) : (
                                            <button style={{ padding: '1.5rem', background: '#f1f5f9', color: '#94a3b8', border: 'none', borderRadius: '1.75rem', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', cursor: 'not-allowed', letterSpacing: '0.1em' }}>Locked</button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Exams;
