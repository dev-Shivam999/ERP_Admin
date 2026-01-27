import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BookOpen, Calendar, CheckCircle, Clock, XCircle, AlertCircle, Eye, Search, Filter } from 'lucide-react';
import { fetchClasses, fetchSectionsByClass } from '../store/slices/academicSlice';
import { fetchHomeworkByClass, fetchHomeworkStatus, clearSelectedHomework } from '../store/slices/homeworkSlice';

const Homework = () => {
    const dispatch = useDispatch();
    const { classes, sectionsByClass } = useSelector((state) => state.academic);
    const { homeworkList, selectedHomeworkStatus, loading } = useSelector((state) => state.homework);

    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [viewingHomework, setViewingHomework] = useState(null);

    useEffect(() => {
        dispatch(fetchClasses());
    }, [dispatch]);

    // Fetch sections when class changes
    useEffect(() => {
        if (selectedClass) {
            dispatch(fetchSectionsByClass(selectedClass));
            setSelectedSection('');
        }
    }, [dispatch, selectedClass]);

    useEffect(() => {
        if (selectedClass && selectedSection) {
            dispatch(fetchHomeworkByClass({
                classId: selectedClass,
                sectionId: selectedSection,
                date: selectedDate
            }));
        }
    }, [dispatch, selectedClass, selectedSection, selectedDate]);

        const handleViewStatus = (homework) => {
        setViewingHomework(homework);
        dispatch(fetchHomeworkStatus(homework.id));
    };

    const closeStatusModal = () => {
        setViewingHomework(null);
        dispatch(clearSelectedHomework());
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return <span className="badge badge-success">Completed</span>;
            case 'pending':
                return <span className="badge badge-warning">Pending</span>;
            case 'not_completed':
                return <span className="badge badge-danger">Not Done</span>;
            case 'not_started':
                return <span className="badge" style={{ backgroundColor: '#e5e7eb', color: '#374151' }}>Not Started</span>;
            default:
                return <span className="badge badge-info">{status}</span>;
        }
    };

    // Helper to get sections for selected class
    const getSections = () => {
        if (!selectedClass) return [];
        return sectionsByClass[selectedClass] || [];
    };

    return (
        <div className="container-fluid">
            {/* Filters */}
            <div className="card mb-4" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                <div className="card-body" style={{ padding: '1.5rem' }}>
                    <div className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label" style={{ fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Class</label>
                            <select
                                className="form-select"
                                value={selectedClass}
                                onChange={(e) => {
                                    setSelectedClass(e.target.value);
                                    setSelectedSection('');
                                }}
                            >
                                <option value="">Select Class</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label" style={{ fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Section</label>
                            <select
                                className="form-select"
                                value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}
                                disabled={!selectedClass}
                            >
                                <option value="">Select Section</option>
                                {getSections().map(sec => (
                                    <option key={sec.id} value={sec.id}>{sec.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label" style={{ fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Date (Optional)</label>
                            <input
                                type="date"
                                className="form-control"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Homework List */}
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="card-title m-0">Homework Assignments</h3>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead style={{ backgroundColor: '#f9fafb' }}>
                            <tr>
                                <th>Subject</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Due Date</th>
                                <th>Teacher</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!selectedClass || !selectedSection ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        Please select Class and Section to view homework
                                    </td>
                                </tr>
                            ) : homeworkList.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        No homework found for this selection
                                    </td>
                                </tr>
                            ) : (
                                homeworkList.map(item => (
                                    <tr key={item.id}>
                                        <td className="fw-bold text-primary">{item.subject_name}</td>
                                        <td className="fw-semibold">{item.title}</td>
                                        <td>
                                            <span title={item.description}>
                                                {item.description.length > 50
                                                    ? item.description.substring(0, 50) + '...'
                                                    : item.description}
                                            </span>
                                        </td>
                                        <td>{new Date(item.due_date).toLocaleDateString()}</td>
                                        <td>{item.teacher_name}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
                                                onClick={() => handleViewStatus(item)}
                                            >
                                                <Eye size={16} /> View Status
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Status Modal */}
            {viewingHomework && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={closeStatusModal}>
                    <div className="modal-content" style={{
                        backgroundColor: '#fff', borderRadius: '8px',
                        maxWidth: '800px', width: '90%', maxHeight: '90vh',
                        display: 'flex', flexDirection: 'column'
                    }} onClick={e => e.stopPropagation()}>

                        <div className="modal-header border-bottom p-3 d-flex justify-content-between align-items-center">
                            <div>
                                <h4 className="m-0">{viewingHomework.title}</h4>
                                <div className="text-muted small">
                                    {viewingHomework.subject_name} • Due: {new Date(viewingHomework.due_date).toLocaleDateString()}
                                </div>
                            </div>
                            <button className="btn-close" onClick={closeStatusModal} style={{ border: 'none', background: 'none', fontSize: '1.5rem' }}>×</button>
                        </div>

                        <div className="modal-body p-0" style={{ overflowY: 'auto' }}>
                            {loading ? (
                                <div className="text-center p-5">Loading status...</div>
                            ) : (
                                <table className="table table-striped m-0">
                                    <thead className="sticky-top bg-light">
                                        <tr>
                                            <th className="px-4 py-3">Roll No</th>
                                            <th className="px-4 py-3">Student Name</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedHomeworkStatus.map(student => (
                                            <tr key={student.student_id}>
                                                <td className="px-4">{student.roll_number || '-'}</td>
                                                <td className="px-4 fw-medium">
                                                    {student.first_name} {student.last_name}
                                                </td>
                                                <td className="px-4">
                                                    {getStatusBadge(student.status)}
                                                </td>
                                                <td className="px-4 text-muted small">
                                                    {student.remarks || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="modal-footer border-top p-3 text-end bg-light" style={{ borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                            <div className="d-flex gap-3 small text-muted me-auto">
                                <span className="d-flex align-items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }}></span> Completed</span>
                                <span className="d-flex align-items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }}></span> Pending</span>
                                <span className="d-flex align-items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></span> Not Done</span>
                            </div>
                            <button className="btn btn-secondary" onClick={closeStatusModal}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Homework;
