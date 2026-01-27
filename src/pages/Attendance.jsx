import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarCheck, Check, X, Clock, Users, Save, Search } from 'lucide-react';
import {
    fetchClasses,
    fetchSections,
    fetchClassAttendance,
    markAttendance,
    fetchAttendanceSummary,
    setSelectedClass,
    setSelectedSection,
    setSelectedDate,
    setSelectedStream,
    updateStudentStatus,
    markAllPresent,
    markAllAbsent,
    clearError,
    clearAttendanceData,
} from '../store/slices/attendanceSlice';

const Attendance = () => {
    const dispatch = useDispatch();
    const {
        classes,
        sections,
        selectedClass,
        selectedSection,
        selectedStream,
        selectedDate,
        students,
        summary,
        isMarked,
        loading,
        saving,
        error,
    } = useSelector((state) => state.attendance);

    // Find if current class is 11 or 12
    const currentClassObj = classes.find(c => c.id === selectedClass);
    const isSeniorClass = currentClassObj?.name?.includes('11') || currentClassObj?.name?.includes('12');

    useEffect(() => {
        dispatch(fetchClasses());
        dispatch(fetchAttendanceSummary(selectedDate));
    }, [dispatch, selectedDate]);

    useEffect(() => {
        if (selectedClass) {
            dispatch(fetchSections(selectedClass));
            // Reset stream if not 11/12
            if (!isSeniorClass) {
                dispatch(setSelectedStream(null));
            }
        }
    }, [dispatch, selectedClass, isSeniorClass]);

    // Clear list when filters change
    useEffect(() => {
        dispatch(clearAttendanceData());
    }, [dispatch, selectedClass, selectedSection, selectedDate, selectedStream]);

    const handleFetchStudents = () => {
        if (!selectedClass || !selectedSection) return;
        if (isSeniorClass && !selectedStream) return;

        dispatch(fetchClassAttendance({
            classId: selectedClass,
            sectionId: selectedSection,
            date: selectedDate,
            stream: selectedStream,
        }));
    };

    useEffect(() => {
        if (error) {
            alert(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleSaveAttendance = () => {
        const attendance = students.map(s => ({
            student_id: s.student_id,
            status: s.status || 'present',
        }));

        dispatch(markAttendance({
            classId: selectedClass,
            sectionId: selectedSection,
            date: selectedDate,
            attendance,
        }));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present': return '#10b981';
            case 'absent': return '#ef4444';
            case 'late': return '#f59e0b';
            default: return '#9ca3af';
        }
    };

    const presentCount = students.filter(s => s.status === 'present').length;
    const absentCount = students.filter(s => s.status === 'absent').length;
    const lateCount = students.filter(s => s.status === 'late').length;

    return (
        <>
            {/* Today's Summary */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon success">
                        <Check size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{summary?.totals?.present || 0}</h3>
                        <p>Present Today</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon danger">
                        <X size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{summary?.totals?.absent || 0}</h3>
                        <p>Absent Today</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon warning">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{summary?.totals?.late || 0}</h3>
                        <p>Late Today</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon primary">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{summary?.totals?.percentage || 0}%</h3>
                        <p>Attendance Rate</p>
                    </div>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-body">
                    <div className="filters">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={selectedDate}
                                onChange={(e) => dispatch(setSelectedDate(e.target.value))}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Class</label>
                            <select
                                className="form-select"
                                value={selectedClass || ''}
                                onChange={(e) => dispatch(setSelectedClass(e.target.value))}
                            >
                                <option value="">Select Class</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Section</label>
                            <select
                                className="form-select"
                                value={selectedSection || ''}
                                onChange={(e) => dispatch(setSelectedSection(e.target.value))}
                            >
                                <option value="">Select Section</option>
                                {sections.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        {isSeniorClass && (
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Stream</label>
                                <select
                                    className="form-select"
                                    value={selectedStream || ''}
                                    onChange={(e) => dispatch(setSelectedStream(e.target.value))}
                                >
                                    <option value="">Select Stream</option>
                                    <option value="Science">Science</option>
                                    <option value="Commerce">Commerce</option>
                                    <option value="Arts/Humanities">Arts/Humanities</option>
                                </select>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                            <button
                                className="btn btn-primary"
                                onClick={handleFetchStudents}
                                disabled={loading || !selectedClass || !selectedSection || (isSeniorClass && !selectedStream)}
                            >
                                <Search size={18} /> {loading ? 'Fetching...' : 'Get Students'}
                            </button>
                            <button className="btn btn-outline" onClick={() => dispatch(markAllPresent())}>
                                All Present
                            </button>
                            <button className="btn btn-outline" onClick={() => dispatch(markAllAbsent())}>
                                All Absent
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance List */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        Mark Attendance
                        {isMarked && <span className="badge badge-success" style={{ marginLeft: '0.5rem' }}>✓ Marked</span>}
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ color: '#10b981' }}>Present: {presentCount}</span>
                        <span style={{ color: '#ef4444' }}>Absent: {absentCount}</span>
                        <span style={{ color: '#f59e0b' }}>Late: {lateCount}</span>
                        <button
                            className="btn btn-primary"
                            onClick={handleSaveAttendance}
                            disabled={saving || !selectedClass || !selectedSection}
                        >
                            <Save size={18} /> {saving ? 'Saving...' : 'Save Attendance'}
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                            Loading students...
                        </div>
                    ) : !selectedClass || !selectedSection ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                            <CalendarCheck size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <p>Select a class and section to mark attendance</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                            No students found in this class/section
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Roll No</th>
                                    <th>Name</th>
                                    <th>Admission No</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, index) => (
                                    <tr key={student.student_id}>
                                        <td><strong>{student.roll_number || (index + 1)}</strong></td>
                                        <td>{student.first_name} {student.last_name}</td>
                                        <td>{student.admission_number}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                {['present', 'absent', 'late'].map((status) => (
                                                    <button
                                                        key={status}
                                                        className={`btn ${student.status === status ? 'btn-primary' : 'btn-outline'}`}
                                                        style={{
                                                            padding: '0.375rem 0.75rem',
                                                            backgroundColor: student.status === status ? getStatusColor(status) : 'transparent',
                                                            borderColor: getStatusColor(status),
                                                            color: student.status === status ? '#fff' : getStatusColor(status),
                                                        }}
                                                        onClick={() => dispatch(updateStudentStatus({
                                                            studentId: student.student_id,
                                                            status,
                                                        }))}
                                                    >
                                                        {status === 'present' && <Check size={16} />}
                                                        {status === 'absent' && <X size={16} />}
                                                        {status === 'late' && <Clock size={16} />}
                                                        <span style={{ marginLeft: '0.25rem' }}>
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
};

export default Attendance;
