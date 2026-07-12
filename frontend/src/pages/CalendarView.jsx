import React, { useEffect, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // July 2026 context (matches current time metadata)
  const [currentYear] = useState(2026);
  const [currentMonth] = useState(6); // 0-indexed (July is 6)
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await apiClient.get('/student/calendar');
      setEvents(response.data.events);
    } catch (err) {
      console.error('Failed to load calendar events', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate cells for a monthly grid
  const getCalendarCells = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const cells = [];
    
    // Fill pre-month blank days
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, dateStr: null });
    }

    // Fill current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      cells.push({ day, dateStr });
    }

    return cells;
  };

  const getEventsForDate = (dateStr) => {
    if (!dateStr) return [];
    return events.filter(e => e.event_date.substring(0, 10) === dateStr);
  };

  const getEventBadgeColor = (type) => {
    switch (type) {
      case 'Interview': return '#7c3aed';
      case 'Assessment': return '#f59e0b';
      case 'Job Applied': return '#3b82f6';
      default: return '#64748b';
    }
  };

  const cells = getCalendarCells();

  if (loading) {
    return (
      <StudentLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <Spinner size="lg" />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="fade-in">
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Calendar</h2>
          <p style={{ color: 'var(--text-muted)' }}>Keep track of interviews schedule dates, assessments deadlines, and applied position milestones.</p>
        </div>

        <Card style={{ padding: '32px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {monthNames[currentMonth]} {currentYear}
            </h3>
          </div>

          {/* Days labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '12px' }}>
            {dayNames.map((name, i) => (
              <div key={i} style={{ padding: '8px 0', color: 'var(--text-light)' }}>{name}</div>
            ))}
          </div>

          {/* Calendar Grid cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {cells.map((cell, idx) => {
              const dayEvents = getEventsForDate(cell.dateStr);
              return (
                <div key={idx} style={{
                  minHeight: '90px',
                  backgroundColor: cell.day ? 'var(--bg-main)' : 'transparent',
                  border: cell.day ? '1px solid var(--border-light)' : 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  {cell.day && (
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {cell.day}
                    </span>
                  )}
                  {dayEvents.map((e, index) => (
                    <div key={index} style={{
                      backgroundColor: getEventBadgeColor(e.type),
                      color: '#FFFFFF',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer'
                    }} title={`${e.type}: ${e.details} (${e.status || ''})`}>
                      {e.type === 'Job Applied' ? 'Applied' : e.type}: {e.details}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
};

export default CalendarView;
