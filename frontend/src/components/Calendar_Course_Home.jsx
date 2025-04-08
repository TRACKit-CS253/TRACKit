import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEvents } from '../contexts/EventContext';
import { useCourse } from '../contexts/CourseContext';
import { FaCalendarAlt, FaMapMarkerAlt, FaRegClock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { MdOutlineEventNote, MdClose } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  const { courseDetails } = useCourse();
  const { eventsByCourse, loading } = useEvents();
  
  const [courseEvents, setCourseEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [scrollToTime, setScrollToTime] = useState(new Date());
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Get events for this course from the context
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

  const handleSelectSlot = (slotInfo) => {
    setDate(slotInfo.start);
    setView(Views.DAY);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Custom event styling
  const eventStyleGetter = (event) => {
    let backgroundColor = '#3788d8'; // default blue
    let opacity = 0.9;
    let fontWeight = '500';
    let boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    
    // Color code based on title keywords
    const title = event.title.toLowerCase();
    if (title.includes('exam') || title.includes('test') || title.includes('quiz')) {
      backgroundColor = '#e53e3e'; // red
      opacity = 0.95;
      fontWeight = '600';
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
        fontWeight,
        border: 'none',
        borderRadius: '6px',
        padding: '3px 6px',
        boxShadow,
      }
    };
  };

  // Custom toolbar with modern design
  const CustomToolbar = (toolbar) => {
    return (
      <div className="flex flex-wrap justify-between items-center mb-4 p-1">
        <div className="flex items-center gap-1">
          <div className="bg-white rounded-lg overflow-hidden flex shadow-sm border border-gray-100">
            <button
              type="button"
              onClick={() => toolbar.onNavigate('PREV')}
              className="p-2 hover:bg-gray-50 transition-colors border-r border-gray-100"
            >
              <FaChevronLeft className="text-gray-600" />
            </button>
            <button
              type="button"
              onClick={() => toolbar.onNavigate('TODAY')}
              className="px-3 py-1.5 font-medium text-sm hover:bg-gray-50 transition-colors border-r border-gray-100"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => toolbar.onNavigate('NEXT')}
              className="p-2 hover:bg-gray-50 transition-colors"
            >
              <FaChevronRight className="text-gray-600" />
            </button>
          </div>
          
          <h2 className="ml-2 text-base sm:text-lg font-semibold text-gray-800">{toolbar.label}</h2>
        </div>
        
        <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-100 mt-2 sm:mt-0">
          {toolbar.views.map(view => (
            <button 
              key={view}
              type="button"
              onClick={() => toolbar.onView(view)}
              className={`px-3 py-1.5 text-sm font-medium ${
                toolbar.view === view 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              } transition-colors ${
                view !== 'day' ? 'border-r border-gray-100' : ''
              }`}
            >
              {view === 'month' ? 'Month' : view === 'week' ? 'Week' : 'Day'}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Custom components for the calendar
  const components = {
    toolbar: CustomToolbar,
    event: ({ event }) => (
      <div className="truncate text-sm">
        {event.title}
      </div>
    ),
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

  return (
    <div className="calendar-container bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      {loading && (
        <div className="flex items-center justify-center py-2 px-4 bg-blue-50 rounded-lg mb-4">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mr-2"></div>
          <span className="text-blue-700 text-sm font-medium">Loading events...</span>
        </div>
      )}
      
      <div className="calendar-wrapper" style={{ height: '400px' }}>
        <Calendar
          key={`calendar-${refreshCounter}`}
          localizer={localizer}
          events={courseEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%', width: '100%' }}
          view={view}
          date={date}
          onView={setView}
          onNavigate={setDate}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          formats={formats}
          views={['month', 'week', 'day']}
          scrollToTime={scrollToTime}
          min={new Date(0, 0, 0, 6, 0)}
          max={new Date(0, 0, 0, 22, 0)}
          components={components}
          eventPropGetter={eventStyleGetter}
        />
      </div>
      
      {/* Event Modal with Animation */}
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
                className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
                initial={{ scale: 0.9, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 10 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div 
                  className="p-4 flex justify-between items-center"
                  style={{
                    backgroundColor: eventStyleGetter(selectedEvent).style.backgroundColor,
                    color: 'white'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt />
                    <h3 className="text-lg font-bold">{selectedEvent.title}</h3>
                  </div>
                  <button 
                    onClick={() => setShowEventModal(false)}
                    className="p-1 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <MdClose size={20} />
                  </button>
                </div>
                
                <div className="p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <FaRegClock className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Time</p>
                      <p className="text-gray-800">
                        {moment(selectedEvent.start).format('dddd, MMMM D, YYYY')}
                      </p>
                      <p className="text-gray-800">
                        {moment(selectedEvent.start).format('h:mm A')} - {moment(selectedEvent.end).format('h:mm A')}
                      </p>
                    </div>
                  </div>
                  
                  {selectedEvent.location && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <FaMapMarkerAlt className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Location</p>
                        <p className="text-gray-800">{selectedEvent.location}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedEvent.description && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <MdOutlineEventNote className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Description</p>
                        <p className="text-gray-800 whitespace-pre-wrap">{selectedEvent.description}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => setShowEventModal(false)}
                      className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
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
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        /* Month View Header */
        .calendar-container .rbc-month-view {
          border: none;
          background-color: transparent;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .calendar-container .rbc-header {
          padding: 10px 5px;
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
          margin: 1px 0;
          transition: transform 0.1s ease;
        }
        
        .calendar-container .rbc-event:hover {
          transform: translateY(-1px);
        }
        
        /* Time-grid Views (Week/Day) */
        .calendar-container .rbc-time-view {
          border: none;
          border-radius: 8px;
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
        
        /* Smooth scrolling */
        .calendar-container .rbc-time-content {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default MyCalendar;