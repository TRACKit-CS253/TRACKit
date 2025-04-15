import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEvents } from '../contexts/EventContext';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { FaCalendarAlt, FaMapMarkerAlt, FaRegClock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { MdOutlineRefresh, MdOutlineEventNote, MdClose, MdEventAvailable } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  const { allEvents, loading, refreshEvents } = useEvents();
  const { showNotification } = useNotification();
  const { currentUser } = useAuth();

  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [scrollToTime, setScrollToTime] = useState(new Date());
  const [hasRefreshedOnLogin, setHasRefreshedOnLogin] = useState(false);

  // Refresh events only when the user logs in
  useEffect(() => {
    if (currentUser && !hasRefreshedOnLogin) {
      refreshEvents();
      setHasRefreshedOnLogin(true);
    }
  }, [currentUser, hasRefreshedOnLogin, refreshEvents]);

  // Update scrollToTime based on the first event
  useEffect(() => {
    if (allEvents.length > 0) {
      try {
        const firstEventStart = allEvents.reduce((earliest, event) => {
          return event.start < earliest ? event.start : earliest;
        }, allEvents[0].start);
        setScrollToTime(firstEventStart);
      } catch (err) {
        console.warn('Error setting scroll time:', err);
      }
    }
  }, [allEvents]);

  const handleSelectSlot = (slotInfo) => {
    setDate(slotInfo.start);
    setView(Views.DAY);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleManualRefresh = () => {
    refreshEvents();
    showNotification('Refreshing calendar events...', 'info');
  };

  // Custom event styling with course colors
  const eventStyleGetter = (event) => {
    let backgroundColor = event.color || '#3174ad';
    let fontWeight = '500';
    let boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    
    // Determine event type based on title keywords
    const title = event.title.toLowerCase();
    if (title.includes('exam') || title.includes('test') || title.includes('quiz')) {
      backgroundColor = '#e53e3e';
      fontWeight = '600';
    } else if (title.includes('assignment') || title.includes('homework')) {
      backgroundColor = '#d69e2e';
    } else if (title.includes('tutorial') || title.includes('tut')) {
      backgroundColor = '#805ad5';
    }
    
    return {
      style: {
        backgroundColor,
        color: 'white',
        fontWeight,
        borderRadius: '6px',
        border: 'none',
        boxShadow,
        paddingLeft: '6px',
        paddingRight: '6px',
      }
    };
  };

  const formats = {
    monthHeaderFormat: (date, culture, localizer) =>
      localizer.format(date, 'MMMM YYYY', culture),
    dayHeaderFormat: (date, culture, localizer) =>
      localizer.format(date, 'dddd, MMMM D, YYYY', culture),
    dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
      `${localizer.format(start, 'MMM D', culture)} – ${localizer.format(end, 'MMM D, YYYY', culture)}`,
    eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
      `${localizer.format(start, 'h:mm A', culture)} - ${localizer.format(end, 'h:mm A', culture)}`,
  };

  const messages = {
    today: 'Today',
    previous: view === Views.MONTH ? 'Previous' : 'Previous',
    next: view === Views.MONTH ? 'Next' : 'Next',
  };

  // Custom components for more control over the UI
  const components = {
    toolbar: CustomToolbar,
    event: CustomEvent,
  };

  function CustomToolbar(toolbar) {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };
    
    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };
    
    const goToCurrent = () => {
      toolbar.onNavigate('TODAY');
    };

    const viewOptions = [
      { value: 'month', label: 'Month' },
      { value: 'week', label: 'Week' },
      { value: 'day', label: 'Day' },
    ];

    return (
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="bg-white p-1.5 rounded-lg shadow-sm flex items-center border border-gray-100">
            <button
              onClick={goToBack}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
            >
              <FaChevronLeft className="text-gray-600" />
            </button>
            <button
              onClick={goToCurrent}
              className="px-3 py-1.5 mx-1 text-sm font-medium bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
            >
              Today
            </button>
            <button
              onClick={goToNext}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
            >
              <FaChevronRight className="text-gray-600" />
            </button>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800">{toolbar.label}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all"
          >
            <MdOutlineRefresh className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-1">
            {viewOptions.map(option => (
              <button
                key={option.value}
                onClick={() => toolbar.onView(option.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  toolbar.view === option.value
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                } transition-colors`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function CustomEvent({ event }) {
    return (
      <div className="event-content-wrapper">
        <div className="event-title truncate font-medium">
          {event.title}
        </div>
        {view !== Views.MONTH && event.courseCode && (
          <div className="event-course text-xs text-white opacity-90 truncate">
            {event.courseCode}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="calendar-container bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 rounded-2xl p-6 shadow-sm border border-gray-100">
      {loading && (
        <div className="flex items-center justify-center p-3 mb-4 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-blue-700 font-medium">Loading events...</span>
        </div>
      )}

      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={allEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 650 }}
          view={view}
          date={date}
          onView={setView}
          onNavigate={setDate}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          formats={formats}
          messages={messages}
          views={['month', 'week', 'day']}
          scrollToTime={scrollToTime}
          min={new Date(0, 0, 0, 6, 0)}
          max={new Date(0, 0, 0, 22, 0)}
          eventPropGetter={eventStyleGetter}
          components={components}
          popup
        />
      </div>

      {/* Event details modal with animation */}
      <AnimatePresence>
        {showEventModal && selectedEvent && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40" 
              onClick={() => setShowEventModal(false)}
            ></div>
            <motion.div 
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white rounded-xl shadow-xl w-full max-w-md"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
              >
                <div 
                  className="p-4 rounded-t-xl flex justify-between items-center"
                  style={{
                    backgroundColor: selectedEvent.color || '#3174ad',
                    color: 'white'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                      <FaCalendarAlt />
                    </div>
                    <div>
                      <div className="text-sm text-white/80">
                        {selectedEvent.courseCode || 'Course Event'}
                      </div>
                      <h3 className="text-xl font-bold truncate max-w-[250px]">
                        {selectedEvent.title}
                      </h3>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowEventModal(false)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <MdClose size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <FaRegClock className="text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Date & Time</div>
                      <div className="text-gray-800">
                        {moment(selectedEvent.start).format('ddd, MMM D, YYYY')}
                      </div>
                      <div className="text-gray-800">
                        {moment(selectedEvent.start).format('h:mm A')} - {moment(selectedEvent.end).format('h:mm A')}
                      </div>
                    </div>
                  </div>

                  {selectedEvent.location && (
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <FaMapMarkerAlt className="text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Location</div>
                        <div className="text-gray-800">{selectedEvent.location}</div>
                      </div>
                    </div>
                  )}

                  {(selectedEvent.description || selectedEvent.courseName) && (
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <MdOutlineEventNote className="text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Details</div>
                        {selectedEvent.courseName && (
                          <div className="text-gray-800 font-medium">{selectedEvent.courseName}</div>
                        )}
                        {selectedEvent.description && (
                          <div className="text-gray-700 mt-1">{selectedEvent.description}</div>
                        )}
                        {!selectedEvent.description && !selectedEvent.courseName && (
                          <div className="text-gray-500 italic">No additional details</div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => setShowEventModal(false)}
                      className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        /* Calendar Container */
        .calendar-container .rbc-calendar {
          background-color: white;
          border-radius: 12px;
          overflow: hidden;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        /* Month View Header */
        .calendar-container .rbc-month-view {
          border: none;
          background-color: transparent;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .calendar-container .rbc-header {
          padding: 12px 5px;
          font-weight: 600;
          color: #4b5563;
          border-bottom: 1px solid #e5e7eb;
          background-color: #f9fafb;
        }
        
        /* Month Rows and Cells */
        .calendar-container .rbc-month-row {
          border-left: none;
          border-right: none;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .calendar-container .rbc-day-bg {
          background-color: white;
          transition: background-color 0.2s;
        }
        
        .calendar-container .rbc-day-bg:hover {
          background-color: #f9fafb;
        }
        
        .calendar-container .rbc-off-range-bg {
          background-color: #f3f4f6;
        }
        
        .calendar-container .rbc-off-range {
          color: #9ca3af;
        }
        
        .calendar-container .rbc-today {
          background-color: #eff6ff;
        }
        
        /* Events in Month View */
        .calendar-container .rbc-event {
          border-radius: 6px;
          padding: 2px 4px;
          transition: transform 0.1s ease;
        }
        
        .calendar-container .rbc-event:hover {
          transform: translateY(-1px);
        }
        
        /* Time-grid Views (Week/Day) */
        .calendar-container .rbc-time-view {
          border: none;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .calendar-container .rbc-time-header-content {
          border-left: none;
        }
        
        .calendar-container .rbc-time-content {
          border-top: 1px solid #e5e7eb;
          border-left: none;
        }
        
        .calendar-container .rbc-timeslot-group {
          border-bottom: 1px solid #f3f4f6;
        }
        
        .calendar-container .rbc-time-header-gutter {
          background-color: #f9fafb;
        }
        
        .calendar-container .rbc-label {
          font-size: 0.8rem;
          color: #6b7280;
          padding: 5px 5px;
        }
        
        /* Today Indicator */
        .calendar-container .rbc-current-time-indicator {
          background-color: #ef4444;
          height: 2px;
          opacity: 0.8;
        }

        /* Event Content */
        .event-content-wrapper {
          padding: 2px 0;
        }

        /* Override default toolbar styles */
        .calendar-container .rbc-toolbar {
          display: none;
        }
        
        /* Smooth scrolling */
        .calendar-container .rbc-time-content {
          scroll-behavior: smooth;
        }
        
        /* Popup overlay */
        .calendar-container .rbc-overlay {
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }
        
        .calendar-container .rbc-overlay-header {
          padding: 12px;
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
          color: #4b5563;
        }
      `}</style>
    </div>
  );
};

export default MyCalendar;