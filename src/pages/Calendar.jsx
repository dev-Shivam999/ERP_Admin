import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, ChevronLeft, ChevronRight, PartyPopper, CalendarDays, Trash2 } from 'lucide-react';
import { fetchHolidays, fetchEvents, createHoliday, createEvent, deleteHoliday, deleteEvent, setSelectedMonth, setSelectedYear, clearError } from '../store/slices/calendarSlice';

const Calendar = () => {
    const dispatch = useDispatch();
    const { holidays, events, selectedMonth, selectedYear, loading, error } = useSelector((state) => state.calendar);

    const [showHolidayModal, setShowHolidayModal] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [holidayForm, setHolidayForm] = useState({
        title: '',
        holidayType: 'festival',
        startDate: '',
        endDate: '',
        description: '',
    });
    const [eventForm, setEventForm] = useState({
        title: '',
        eventType: 'other',
        startDatetime: '',
        endDatetime: '',
        location: '',
        description: '',
    });

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    useEffect(() => {
        dispatch(fetchHolidays({ month: selectedMonth + 1, year: selectedYear }));
        dispatch(fetchEvents({ month: selectedMonth + 1, year: selectedYear }));
    }, [dispatch, selectedMonth, selectedYear]);

    useEffect(() => {
        if (error) {
            alert(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handlePrevMonth = () => {
        if (selectedMonth === 0) {
            dispatch(setSelectedMonth(11));
            dispatch(setSelectedYear(selectedYear - 1));
        } else {
            dispatch(setSelectedMonth(selectedMonth - 1));
        }
    };

    const handleNextMonth = () => {
        if (selectedMonth === 11) {
            dispatch(setSelectedMonth(0));
            dispatch(setSelectedYear(selectedYear + 1));
        } else {
            dispatch(setSelectedMonth(selectedMonth + 1));
        }
    };

    const handleCreateHoliday = async () => {
        if (!holidayForm.title || !holidayForm.startDate) {
            alert('Title and Start Date are required');
            return;
        }
        await dispatch(createHoliday({
            ...holidayForm,
            endDate: holidayForm.endDate || holidayForm.startDate,
        }));
        setShowHolidayModal(false);
        setHolidayForm({ title: '', holidayType: 'festival', startDate: '', endDate: '', description: '' });
        dispatch(fetchHolidays({ month: selectedMonth + 1, year: selectedYear }));
    };

    const handleCreateEvent = async () => {
        if (!eventForm.title || !eventForm.startDatetime) {
            alert('Title and Start Date/Time are required');
            return;
        }
        await dispatch(createEvent(eventForm));
        setShowEventModal(false);
        setEventForm({ title: '', eventType: 'other', startDatetime: '', endDatetime: '', location: '', description: '' });
        dispatch(fetchEvents({ month: selectedMonth + 1, year: selectedYear }));
    };

    // Generate calendar days
    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const calendarDays = [];

    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    const getDateEvents = (day) => {
        if (!day) return { holidays: [], events: [] };
        const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const dayHolidays = holidays.filter(h => {
            const start = h.start_date?.split('T')[0];
            const end = h.end_date?.split('T')[0] || start;
            return dateStr >= start && dateStr <= end;
        });

        const dayEvents = events.filter(e => e.start_datetime?.split('T')[0] === dateStr);
        return { holidays: dayHolidays, events: dayEvents };
    };

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() && selectedMonth === today.getMonth() && selectedYear === today.getFullYear();
    };

    const isSunday = (day) => {
        if (!day) return false;
        return new Date(selectedYear, selectedMonth, day).getDay() === 0;
    };

    const getHolidayTypeColor = (type) => {
        const colors = {
            national: '#dc2626',
            festival: '#f59e0b',
            vacation: '#3b82f6',
            sudden: '#ef4444',
            other: '#6b7280',
        };
        return colors[type] || '#6b7280';
    };

    const getEventTypeIcon = (type) => {
        const icons = {
            annual_day: '🎉',
            sports_day: '🏃',
            trip: '🚌',
            parent_meeting: '👨‍👩‍👧',
            other: '📅',
        };
        return icons[type] || '📅';
    };

    return (
        <>
            {/* Header */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button className="btn btn-outline" onClick={handlePrevMonth}>
                                <ChevronLeft size={20} />
                            </button>
                            <h3 style={{ margin: 0, minWidth: '220px', textAlign: 'center', fontSize: '1.5rem' }}>
                                {monthNames[selectedMonth]} {selectedYear}
                            </h3>
                            <button className="btn btn-outline" onClick={handleNextMonth}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-outline" onClick={() => setShowHolidayModal(true)}>
                                <PartyPopper size={18} /> Add Holiday
                            </button>
                            <button className="btn btn-primary" onClick={() => setShowEventModal(true)}>
                                <CalendarDays size={18} /> Add Event
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="card">
                    <div className="card-body" style={{ padding: '1rem' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '4px',
                        }}>
                            {dayNames.map(day => (
                                <div key={day} style={{
                                    padding: '0.75rem',
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    color: day === 'Sun' ? '#dc2626' : '#374151',
                                    background: '#f9fafb',
                                    borderRadius: '8px',
                                }}>
                                    {day}
                                </div>
                            ))}

                            {calendarDays.map((day, index) => {
                                const { holidays: dayHolidays, events: dayEvents } = getDateEvents(day);
                                const hasHoliday = dayHolidays.length > 0;
                                const hasEvent = dayEvents.length > 0;

                                return (
                                    <div
                                        key={index}
                                        style={{
                                            padding: '0.5rem',
                                            minHeight: '90px',
                                            border: isToday(day) ? '2px solid #4f46e5' : '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            background: hasHoliday ? '#fef2f2' : isToday(day) ? '#eef2ff' : '#fff',
                                            position: 'relative',
                                            cursor: day ? 'pointer' : 'default',
                                        }}
                                    >
                                        {day && (
                                            <>
                                                <div style={{
                                                    fontWeight: isToday(day) ? 700 : 500,
                                                    fontSize: '1rem',
                                                    color: hasHoliday || isSunday(day) ? '#dc2626' : (isToday(day) ? '#4f46e5' : '#374151'),
                                                    marginBottom: '0.25rem',
                                                }}>
                                                    {day}
                                                </div>
                                                {hasHoliday && (
                                                    <div style={{
                                                        fontSize: '0.625rem',
                                                        color: getHolidayTypeColor(dayHolidays[0].holiday_type),
                                                        fontWeight: 500,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}>
                                                        🎉 {dayHolidays[0].title}
                                                    </div>
                                                )}
                                                {hasEvent && (
                                                    <div style={{
                                                        fontSize: '0.625rem',
                                                        color: '#4f46e5',
                                                        fontWeight: 500,
                                                        marginTop: '2px',
                                                    }}>
                                                        {getEventTypeIcon(dayEvents[0].event_type)} {dayEvents[0].title}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div>
                    {/* Holidays */}
                    <div className="card" style={{ marginBottom: '1rem' }}>
                        <div className="card-header">
                            <h3 className="card-title">🎉 Holidays ({holidays.length})</h3>
                        </div>
                        <div className="card-body" style={{ maxHeight: '250px', overflowY: 'auto', padding: '0.75rem' }}>
                            {holidays.length === 0 ? (
                                <p style={{ color: '#6b7280', textAlign: 'center', padding: '1rem' }}>No holidays this month</p>
                            ) : (
                                holidays.map(h => (
                                    <div key={h.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.75rem',
                                        background: '#fef2f2',
                                        borderRadius: '8px',
                                        marginBottom: '0.5rem',
                                        borderLeft: `4px solid ${getHolidayTypeColor(h.holiday_type)}`,
                                    }}>
                                        <div>
                                            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{h.title}</strong>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                {new Date(h.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                {h.end_date !== h.start_date && ` - ${new Date(h.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '0.25rem', color: '#ef4444' }}
                                            onClick={() => dispatch(deleteHoliday(h.id))}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Events */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">📅 Events ({events.length})</h3>
                        </div>
                        <div className="card-body" style={{ maxHeight: '250px', overflowY: 'auto', padding: '0.75rem' }}>
                            {events.length === 0 ? (
                                <p style={{ color: '#6b7280', textAlign: 'center', padding: '1rem' }}>No events this month</p>
                            ) : (
                                events.map(e => (
                                    <div key={e.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.75rem',
                                        background: '#eef2ff',
                                        borderRadius: '8px',
                                        marginBottom: '0.5rem',
                                        borderLeft: '4px solid #4f46e5',
                                    }}>
                                        <div>
                                            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                                                {getEventTypeIcon(e.event_type)} {e.title}
                                            </strong>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                {new Date(e.start_datetime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            {e.location && (
                                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>📍 {e.location}</div>
                                            )}
                                        </div>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '0.25rem', color: '#ef4444' }}
                                            onClick={() => dispatch(deleteEvent(e.id))}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Holiday Modal */}
            {showHolidayModal && (
                <div className="modal-overlay" onClick={() => setShowHolidayModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">🎉 Add Holiday</h3>
                            <button className="btn btn-outline" onClick={() => setShowHolidayModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={holidayForm.title}
                                    onChange={(e) => setHolidayForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g., Diwali, Republic Day"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Type</label>
                                <select
                                    className="form-select"
                                    value={holidayForm.holidayType}
                                    onChange={(e) => setHolidayForm(prev => ({ ...prev, holidayType: e.target.value }))}
                                >
                                    <option value="national">National Holiday</option>
                                    <option value="festival">Festival</option>
                                    <option value="vacation">Vacation</option>
                                    <option value="sudden">Sudden / Emergency</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Start Date *</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={holidayForm.startDate}
                                        onChange={(e) => setHolidayForm(prev => ({ ...prev, startDate: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={holidayForm.endDate}
                                        onChange={(e) => setHolidayForm(prev => ({ ...prev, endDate: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowHolidayModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleCreateHoliday}>Save Holiday</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Event Modal */}
            {showEventModal && (
                <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">📅 Add Event</h3>
                            <button className="btn btn-outline" onClick={() => setShowEventModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={eventForm.title}
                                    onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g., Annual Day, Sports Day"
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Type</label>
                                    <select
                                        className="form-select"
                                        value={eventForm.eventType}
                                        onChange={(e) => setEventForm(prev => ({ ...prev, eventType: e.target.value }))}
                                    >
                                        <option value="annual_day">Annual Day</option>
                                        <option value="sports_day">Sports Day</option>
                                        <option value="trip">Trip / Excursion</option>
                                        <option value="parent_meeting">Parent Meeting</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Location</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={eventForm.location}
                                        onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                                        placeholder="e.g., School Auditorium"
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Start Date/Time *</label>
                                    <input
                                        type="datetime-local"
                                        className="form-input"
                                        value={eventForm.startDatetime}
                                        onChange={(e) => setEventForm(prev => ({ ...prev, startDatetime: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date/Time</label>
                                    <input
                                        type="datetime-local"
                                        className="form-input"
                                        value={eventForm.endDatetime}
                                        onChange={(e) => setEventForm(prev => ({ ...prev, endDatetime: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-input"
                                    value={eventForm.description}
                                    onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Event details..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowEventModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleCreateEvent}>Save Event</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Calendar;
