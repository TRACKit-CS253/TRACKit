import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from 'react-modal';
import { useEvents } from '../contexts/EventContext';
import { useCourse } from '../contexts/CourseContext';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
const localizer = momentLocalizer(moment);

Modal.setAppElement('#root');

const MyCalendar = () => {
  const { currentUser } = useAuth(); // Get the current user
  const { courseDetails } = useCourse();
  const { eventsByCourse, loading, addEvent, deleteEvent, refreshEvents } = useEvents();
  const { showNotification } = useNotification();
  
  const [courseEvents, setCourseEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '', description: '' });
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [scrollToTime, setScrollToTime] = useState(new Date());
  const [refreshCounter, setRefreshCounter] = useState(0);

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
    
    if (!courseDetails?.id) {
      showNotification('Course details not available', 'error');
      return;
    }
    
    try {
      const start = new Date(newEvent.start);
      const end = new Date(newEvent.end);

      if (end <= start) {
        showNotification('End time must be greater than start time', 'error');
        return;
      }
      
      const result = await addEvent(courseDetails.id, {
        title: newEvent.title,
        description: newEvent.description,
        start: start.toISOString(),
        end: end.toISOString()
      });
      
      if (result.success) {
        showNotification('Event added successfully', 'success');
        setShowForm(false);
        setNewEvent({ title: '', start: '', end: '', description: '' });
        setRefreshCounter(prev => prev + 1);
      } else {
        showNotification('Failed to add event', 'error');
      }
    } catch (error) {
      console.error('Error adding event:', error);
      showNotification('Failed to add event', 'error');
    }
  };

  const handleSelectSlot = (slotInfo) => {
    const formattedStart = moment(slotInfo.start).format('YYYY-MM-DDTHH:mm');
    const formattedEnd = moment(slotInfo.end).format('YYYY-MM-DDTHH:mm');
    
    setNewEvent({
      title: '',
      description: '',
      start: formattedStart,
      end: formattedEnd
    });
    
    setDate(slotInfo.start);
    setView(Views.DAY);
    setShowForm(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleRemoveEvent = async () => {
    if (!selectedEvent || !selectedEvent.id) return;
    
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
    }
  };

  const handleManualRefresh = () => {
    refreshEvents();
    showNotification('Refreshing calendar events...', 'info');
    setRefreshCounter(prev => prev + 1);
  };

  const formats = {
    agendaDateFormat: (date, culture, localizer) =>
      localizer.format(date, 'DD/MM/YYYY', culture),
    dateRangeFormat: ({ start, end }, culture, localizer) =>
      `${localizer.format(start, 'DD/MM/YYYY', culture)} – ${localizer.format(end, 'DD/MM/YYYY', culture)}`,
    dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
      `${localizer.format(start, 'DD/MM/YYYY', culture)} – ${localizer.format(end, 'DD/MM/YYYY', culture)}`,
  };

  const messages = {
    today: view === Views.MONTH ? 'This Month' : view === Views.WEEK ? 'This Week' : view === Views.DAY ? 'This Day' : 'Today',
    previous: view === Views.MONTH ? 'Last Month' : view === Views.WEEK ? 'Last Week' : 'Last Day',
    next: view === Views.MONTH ? 'Next Month' : view === Views.WEEK ? 'Next Week' : 'Next Day',
  };

  return (
    <div>
      {loading && (
        <div className="text-center py-2 text-blue-500 bg-white rounded shadow mb-2">
          Loading calendar events...
        </div>
      )}
      
      <div className="flex justify-between items-center mb-3">
      
        { currentUser?.userType === 'faculty' && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Event
          </button>
        )}
        
        <button 
          onClick={handleManualRefresh}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-xs"
        >
          Refresh Calendar
        </button>
      </div>
      
      <Calendar
        key={`calendar-${refreshCounter}`}
        localizer={localizer}
        events={courseEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        view={view}
        date={date}
        onView={(newView) => setView(newView)}
        onNavigate={(newDate) => setDate(newDate)}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        formats={formats}
        messages={messages}
        views={['month', 'week', 'day']}
        scrollToTime={scrollToTime}
      />
      
      <Modal
        isOpen={showForm}
        onRequestClose={() => setShowForm(false)}
        contentLabel="Add Event"
        className="modal"
        overlayClassName="overlay"
      >
        <h3 className="text-xl font-bold mb-4">Add New Event</h3>
        <form onSubmit={handleAddEvent}>
          <input
            type="text"
            placeholder="Title"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            className="block w-full p-2 mb-2 border rounded"
            required
          />
          <input
            type="datetime-local"
            placeholder="Start"
            value={newEvent.start}
            onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
            className="block w-full p-2 mb-2 border rounded"
            required
          />
          <input
            type="datetime-local"
            placeholder="End"
            value={newEvent.end}
            onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
            className="block w-full p-2 mb-2 border rounded"
            required
          />
          <textarea
            placeholder="Description"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            className="block w-full p-2 mb-2 border rounded"
          />
          <button 
            type="submit" 
            className="bg-green-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Event'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="bg-red-500 text-white px-4 py-2 rounded ml-2"
            disabled={loading}
          >
            Cancel
          </button>
        </form>
      </Modal>
      
      <Modal
        isOpen={showEventModal}
        onRequestClose={() => setShowEventModal(false)}
        contentLabel="Event Details"
        className="modal"
        overlayClassName="overlay"
      >
        {selectedEvent && (
          <div>
            <h3 className="text-xl font-bold mb-3">{selectedEvent.title}</h3>
            <p className="mb-2"><strong>Start:</strong> {selectedEvent.start.toLocaleString()}</p>
            <p className="mb-2"><strong>End:</strong> {selectedEvent.end.toLocaleString()}</p>
            <p className="mb-4"><strong>Description:</strong> {selectedEvent.description || 'No description provided'}</p>
            <button
              onClick={handleRemoveEvent}
              className="bg-red-500 text-white px-4 py-2 rounded mt-4"
              disabled={loading}
            >
              {loading ? 'Removing...' : 'Remove Event'}
            </button>
            <button
              onClick={() => setShowEventModal(false)}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-4 ml-2"
              disabled={loading}
            >
              Close
            </button>
          </div>
        )}
      </Modal>
      
      <style jsx>{`
        .modal {
          position: absolute;
          top: 50%;
          left: 50%;
          right: auto;
          bottom: auto;
          margin-right: -50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
           border-radius: 8px;
           box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          z-index: 1000;
          max-width: 500px;
          width: 90%;
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.75);
          z-index: 999;
        }
        
        /* Fix for potential z-index issues */
        :global(.rbc-calendar) {
          z-index: 1;
        }
        
        /* Improve event display */
        :global(.rbc-event) {
          padding: 2px 3px !important;
        }
      `}</style>
    </div>
  );
};

export default MyCalendar;