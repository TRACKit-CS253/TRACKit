import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEvents } from '../contexts/EventContext';
import { useCourse } from '../contexts/CourseContext';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { FaRegCalendarPlus, FaCalendarAlt, FaRegClock, FaRegCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { MdOutlineRefresh, MdOutlineEventNote, MdClose, MdDelete } from 'react-icons/md';
import { BiCalendarExclamation } from 'react-icons/bi';

const localizer = momentLocalizer(moment);

const MyCalendar = ({ initialView = 'month' }) => {
  const { currentUser } = useAuth();
  const { courseDetails } = useCourse();
  const { eventsByCourse, loading, addEvent, deleteEvent, refreshEvents } = useEvents();
  const { showNotification } = useNotification();
  
  const [courseEvents, setCourseEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '', description: '', location: '' });
  const [view, setView] = useState(initialView);
  const [date, setDate] = useState(new Date());
  const [scrollToTime, setScrollToTime] = useState(new Date());
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update view when initialView prop changes
  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  // Get events for this course from the eventsByCourse object
  useEffect(() => {
    if (courseDetails?.id && eventsByCourse[courseDetails.id]) {
      setCourseEvents(eventsByCourse[courseDetails.id]);
    } else {
      setCourseEvents([]);
    }
  }, [courseDetails, eventsByCourse]);

  // Update scrollToTime based on first event
  useEffect(() => {
    if (courseEvents.length > 0) {
      try {
        const firstEventStart = courseEvents.reduce((earliest, event) => {
          return event.start < earliest ? event.start : earliest;
        }, courseEvents[0].start);
        setScrollToTime(firstEventStart);
      } catch (err) {
        console.warn("Error setting scroll time:", err);
      }
    }
  }, [courseEvents]);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!courseDetails?.id) {
      showNotification('Course details not available', 'error');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const start = new Date(newEvent.start);
      const end = new Date(newEvent.end);

      if (end <= start) {
        showNotification('End time must be greater than start time', 'error');
        setIsSubmitting(false);
        return;
      }
      
      const result = await addEvent(courseDetails.id, {
        title: newEvent.title,
        description: newEvent.description,
        location: newEvent.location,
        start: start.toISOString(),
        end: end.toISOString()
      });
      
      if (result.success) {
        showNotification('Event added successfully', 'success');
        setShowForm(false);
        setNewEvent({ title: '', start: '', end: '', description: '', location: '' });
        setRefreshCounter(prev => prev + 1);
      } else {
        showNotification('Failed to add event', 'error');
      }
    } catch (error) {
      console.error('Error adding event:', error);
      showNotification('Failed to add event', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectSlot = (slotInfo) => {
    if (currentUser?.userType !== 'faculty') return;
    
    const formattedStart = moment(slotInfo.start).format('YYYY-MM-DDTHH:mm');
    const formattedEnd = moment(slotInfo.end).format('YYYY-MM-DDTHH:mm');
    
    setNewEvent({
      title: '',
      description: '',
      location: '',
      start: formattedStart,
      end: formattedEnd
    });
    
    setDate(slotInfo.start);
    setShowForm(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleRemoveEvent = async () => {
    if (!selectedEvent || !selectedEvent.id) return;
    setIsSubmitting(true);
    
    try {
      const result = await deleteEvent(selectedEvent.id, courseDetails.id);
      
      if (result.success) {
        showNotification('Event removed successfully', 'success');
        setShowEventModal(false);
        setRefreshCounter(prev => prev + 1);
      } else {
        showNotification('Failed to remove event', 'error');
      }
    } catch (error) {
      console.error('Error removing event:', error);
      showNotification('Failed to remove event', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualRefresh = () => {
    refreshEvents();
    showNotification('Refreshing calendar events...', 'info');
    setRefreshCounter(prev => prev + 1);
  };

  // Custom styling for different event types
  const eventStyleGetter = (event) => {
    let backgroundColor = '#3788d8'; // default blue
    let opacity = 0.8;
    
    // Color code based on title keywords
    const title = event.title.toLowerCase();
    if (title.includes('exam') || title.includes('test') || title.includes('quiz')) {
      backgroundColor = '#e53e3e'; // red
      opacity = 0.9;
    } else if (title.includes('lab')) {
      backgroundColor = '#38a169'; // green
    } else if (title.includes('assignment') || title.includes('homework')) {
      backgroundColor = '#d69e2e'; // amber
    } else if (title.includes('tutorial') || title.includes('tut')) {
      backgroundColor = '#805ad5'; // purple
    }
    
    return {
      style: {
        backgroundColor,
        opacity,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontWeight: '500',
      }
    };
  };

  const formats = {
    eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
      `${localizer.format(start, 'h:mm a', culture)} - ${localizer.format(end, 'h:mm a', culture)}`,
    agendaTimeFormat: (date, culture, localizer) =>
      localizer.format(date, 'h:mm a', culture),
  };

  const messages = {
    today: view === Views.MONTH ? 'This Month' : view === Views.WEEK ? 'This Week' : view === Views.DAY ? 'Today' : 'Today',
    previous: view === Views.MONTH ? 'Last Month' : view === Views.WEEK ? 'Last Week' : 'Back',
    next: view === Views.MONTH ? 'Next Month' : view === Views.WEEK ? 'Next Week' : 'Next',
  };
  
  // Components for customizing the calendar
  const components = {
    toolbar: (props) => (
      <div className="rbc-toolbar">
        <div className="rbc-btn-group">
          <button 
            type="button" 
            onClick={() => props.onNavigate('TODAY')}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg shadow-sm font-medium"
          >
            Today
          </button>
        </div>
        <div className="rbc-btn-group">
          <button 
            type="button" 
            onClick={() => props.onNavigate('PREV')}
            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-l-lg hover:bg-gray-50"
          >
            <span className="hidden md:inline mr-1">←</span> {messages.previous}
          </button>
          <button 
            type="button" 
            onClick={() => props.onNavigate('NEXT')}
            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-r-lg hover:bg-gray-50 border-l-0"
          >
            {messages.next} <span className="hidden md:inline ml-1">→</span>
          </button>
        </div>
        <span className="rbc-toolbar-label text-lg font-semibold text-gray-800">
          {props.label}
        </span>
        <div className="rbc-btn-group">
          <button 
            type="button"
            onClick={() => props.onView('month')}
            className={`px-3 py-1.5 ${view === 'month' 
              ? 'bg-blue-50 text-blue-700 border-blue-200' 
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'} 
              border rounded-l-lg font-medium`}
          >
            Month
          </button>
          <button 
            type="button"
            onClick={() => props.onView('week')}
            className={`px-3 py-1.5 ${view === 'week' 
              ? 'bg-blue-50 text-blue-700 border-blue-200' 
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'} 
              border border-l-0 font-medium`}
          >
            Week
          </button>
          <button 
            type="button"
            onClick={() => props.onView('day')}
            className={`px-3 py-1.5 ${view === 'day' 
              ? 'bg-blue-50 text-blue-700 border-blue-200' 
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'} 
              border border-l-0 rounded-r-lg font-medium`}
          >
            Day
          </button>
        </div>
      </div>
    ),
    event: ({ event }) => {
      return (
        <div className="rbc-event-content p-0.5">
          <div className="event-title font-medium leading-tight text-sm">
            {event.title}
          </div>
          {view !== 'month' && event.location && (
            <div className="event-location text-xs mt-0.5 flex items-center">
              <FaMapMarkerAlt className="mr-1 flex-shrink-0 text-xs opacity-80" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="calendar-container">
      {loading && (
        <div className="flex items-center justify-center py-3 bg-blue-50 rounded-lg border border-blue-100 mb-4">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mr-2"></div>
          <span className="text-blue-700 font-medium">Loading events...</span>
        </div>
      )}
      
      {courseEvents.length === 0 && !loading && (
        <div className="bg-gray-50 rounded-lg border border-gray-100 py-4 px-5 mb-4 flex items-center">
          <BiCalendarExclamation className="text-gray-500 text-xl mr-3" />
          <span className="text-gray-600">No events found for this course.</span>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4">
        {currentUser?.userType === 'faculty' && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-sm hover:shadow transition-all"
          >
            <FaRegCalendarPlus />
            <span>Add Event</span>
          </button>
        )}
        
        <button 
          onClick={handleManualRefresh}
          className="flex items-center gap-1 text-sm px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
        >
          <MdOutlineRefresh className={loading ? "animate-spin" : ""} />
          <span>Refresh Calendar</span>
        </button>
      </div>
      
      <div className="calendar-wrapper bg-white rounded-xl border border-gray-100 shadow-md p-4 overflow-hidden">
        <Calendar
          key={`calendar-${refreshCounter}`}
          localizer={localizer}
          events={courseEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          view={view}
          date={date}
          onView={setView}
          onNavigate={setDate}
          selectable={currentUser?.userType === 'faculty'}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          formats={formats}
          messages={messages}
          views={['month', 'week', 'day']}
          scrollToTime={scrollToTime}
          eventPropGetter={eventStyleGetter}
          components={components}
        />
      </div>
      
      {/* Add Event Modal */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm z-40" onClick={() => setShowForm(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-modal-in" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FaRegCalendarPlus className="text-blue-600 text-xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Add New Event</h3>
                </div>
                <button 
                  onClick={() => setShowForm(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <MdClose className="text-gray-600 text-xl" />
                </button>
              </div>
              
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter event title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaRegClock className="text-gray-400" />
                      </div>
                      <input
                        type="datetime-local"
                        value={newEvent.start}
                        onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaRegClock className="text-gray-400" />
                      </div>
                      <input
                        type="datetime-local"
                        value={newEvent.end}
                        onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaMapMarkerAlt className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter location"
                      value={newEvent.location || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <MdOutlineEventNote className="text-gray-400" />
                    </div>
                    <textarea
                      placeholder="Enter event details"
                      value={newEvent.description || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[100px]"
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    )}
                    <span>{isSubmitting ? 'Creating...' : 'Create Event'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
      
      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <>
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm z-40" onClick={() => setShowEventModal(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-modal-in" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full mt-1">
                    <FaCalendarAlt className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{selectedEvent.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <FaRegCalendarAlt className="flex-shrink-0" />
                      <span>
                        {moment(selectedEvent.start).format('MMM D, YYYY')}
                        {!moment(selectedEvent.start).isSame(selectedEvent.end, 'day') && 
                          ` - ${moment(selectedEvent.end).format('MMM D, YYYY')}`}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowEventModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <MdClose className="text-gray-600 text-xl" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <FaRegClock className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-0.5">Time</p>
                    <p className="text-gray-800">
                      {moment(selectedEvent.start).format('h:mm A')} - {moment(selectedEvent.end).format('h:mm A')}
                    </p>
                  </div>
                </div>
                
                {selectedEvent.location && (
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <FaMapMarkerAlt className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-0.5">Location</p>
                      <p className="text-gray-800">{selectedEvent.location}</p>
                    </div>
                  </div>
                )}
                
                {selectedEvent.description && (
                  <div className="flex gap-3">
                    <div className="bg-gray-100 p-2 rounded-full h-fit mt-0.5">
                      <MdOutlineEventNote className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-0.5">Description</p>
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedEvent.description}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                {currentUser?.userType === 'faculty' && (
                  <button
                    onClick={handleRemoveEvent}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                    ) : (
                      <MdDelete />
                    )}
                    <span>{isSubmitting ? 'Deleting...' : 'Delete Event'}</span>
                  </button>
                )}
                
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      <style jsx global>{`
        /* Calendar Container */
        .calendar-wrapper {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
        }
        
        /* Calendar Header Styles */
        .rbc-toolbar {
          padding: 0.5rem 0.25rem;
          margin-bottom: 1rem;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
        }
        
        .rbc-toolbar-label {
          flex-grow: 1;
          padding: 0 0.75rem;
          text-align: center;
        }
        
        .rbc-btn-group {
          display: flex;
          white-space: nowrap;
        }
        
        /* Calendar Cell Styles */
        .rbc-month-view {
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }
        
        .rbc-month-row, .rbc-day-bg {
          border-color: #e5e7eb;
        }
        
        .rbc-off-range-bg {
          background-color: #f9fafb;
        }
        
        .rbc-off-range {
          color: #9ca3af;
        }
        
        .rbc-header {
          padding: 0.75rem 0.5rem;
          font-weight: 600;
          color: #4b5563;
          border-color: #e5e7eb;
        }
        
        .rbc-date-cell {
          padding: 0.25rem;
          text-align: center;
          color: #4b5563;
        }
        
        .rbc-date-cell.rbc-now {
          font-weight: 600;
          color: #3b82f6;
        }
        
        .rbc-today {
          background-color: #eff6ff;
        }
        
        /* Event Styles */
        .rbc-event {
          padding: 2px 5px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          transition: box-shadow 0.2s ease;
        }
        
        .rbc-event:hover {
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .rbc-event-label {
          font-size: 0.7rem;
          font-weight: 500;
        }
        
        .event-title {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        /* Time Grid Styles */
        .rbc-time-view {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .rbc-time-header {
          border-color: #e5e7eb;
        }
        
        .rbc-time-slot {
          color: #6b7280;
        }
        
        .rbc-time-content {
          border-color: #e5e7eb;
        }
        
        .rbc-timeslot-group {
          border-color: #e5e7eb;
        }
        
        .rbc-current-time-indicator {
          background-color: #ef4444;
          height: 2px;
        }
        
        /* Agenda View */
        .rbc-agenda-view table {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .rbc-agenda-table th {
          padding: 0.75rem;
          font-weight: 600;
          background-color: #f9fafb;
          color: #4b5563;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .rbc-agenda-table td {
          padding: 0.75rem;
          border-color: #e5e7eb;
        }
        
        /* Animation for modals */
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-modal-in {
          animation: modalIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MyCalendar;