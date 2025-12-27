import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from './AuthContext';
import { useCourses } from './CourseContext';

const EventContext = createContext();

export const useEvents = () => useContext(EventContext);

// Course colors for consistent color coding
const courseColors = [
  '#3174ad', // blue
  '#4caf50', // green
  '#f44336', // red
  '#ff9800', // orange
  '#9c27b0', // purple
  '#00bcd4', // cyan
  '#795548', // brown
  '#607d8b', // blue-grey
  '#e91e63', // pink
  '#673ab7'  // deep purple
];

export const EventProvider = ({ children }) => {
  const [eventsByCourse, setEventsByCourse] = useState({});
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(null);
  const [courseColorMap, setCourseColorMap] = useState({});
  const { currentUser } = useAuth() || {};
  const { courses } = useCourses() || { courses: [] };

  // Set up course color mapping
  useEffect(() => {
    if (courses && courses.length > 0) {
      const colorMap = {};
      courses.forEach((course, index) => {
        colorMap[course.id] = courseColors[index % courseColors.length];
      });
      setCourseColorMap(colorMap);
    }
  }, [courses]);

  // Fetch all events for all courses
  const fetchAllEvents = useCallback(async (force = false) => {
    // Skip if no user or no courses
    if (!currentUser || !courses || courses.length === 0) {
      setLoading(false);
      return;
    }

    // Skip if we already fetched recently (within last 30 mins) unless forced
    const thirtyMinsAgo = new Date();
    thirtyMinsAgo.setMinutes(thirtyMinsAgo.getMinutes() - 30);
    if (!force && lastFetched && lastFetched > thirtyMinsAgo) {
      console.log("Using cached events (fetched within last 30 minutes)");
      return;
    }

    try {
      setLoading(true);
      
      // Create an object to store events by course ID
      const eventsByCourseTmp = {};
      const allEventsTmp = [];
      
      // Use Promise.all for parallel requests
      const requests = courses.map(course => {
        return axiosInstance.get(`/events/course/${course.id}`)
        .then(response => {
          if (response.data.success && Array.isArray(response.data.data)) {
            // Format the events
            const formattedEvents = response.data.data.map(event => ({
              ...event,
              start: new Date(event.start),
              end: new Date(event.end),
              courseId: course.id,
              courseName: course.name || '',
              courseCode: course.code || '',
              color: courseColorMap[course.id] || '#3174ad'
            }));
            
            // Store by course ID
            eventsByCourseTmp[course.id] = formattedEvents;
            // Add to the flattened array
            allEventsTmp.push(...formattedEvents);
          }
        })
        .catch(err => {
          console.warn(`Error fetching events for course ${course.id}:`, err);
          eventsByCourseTmp[course.id] = [];
        });
      });
      
      // Wait for all requests to complete
      await Promise.all(requests);
      
      // Update state with all events
      setEventsByCourse(eventsByCourseTmp);
      setAllEvents(allEventsTmp);
      setLastFetched(new Date());
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, courses, courseColorMap, lastFetched]);

  // Initial fetch on login/course change
  useEffect(() => {
    if (currentUser && courses?.length > 0 && Object.keys(courseColorMap).length > 0) {
      fetchAllEvents();
    }
  }, [currentUser, courses, courseColorMap, fetchAllEvents]);

  // Add an event
  const addEvent = async (courseId, eventData) => {
    try {
      const response = await axiosInstance.post(
        `/events/course/${courseId}`,
        eventData
      );
      
      if (response.data.success) {
        const course = courses.find(c => c.id === courseId);
        const newEvent = {
          ...response.data.data,
          start: new Date(response.data.data.start),
          end: new Date(response.data.data.end),
          courseId,
          courseName: course?.name || '',
          courseCode: course?.code || '',
          color: courseColorMap[courseId] || '#3174ad'
        };
        
        // Update local state
        setEventsByCourse(prev => ({
          ...prev,
          [courseId]: [...(prev[courseId] || []), newEvent]
        }));
        setAllEvents(prev => [...prev, newEvent]);
        
        return { success: true, event: newEvent };
      }
      return { success: false };
    } catch (error) {
      console.error('Error adding event:', error);
      return { success: false, error };
    }
  };

  // Delete an event
  const deleteEvent = async (eventId, courseId) => {
    try {
      const response = await axiosInstance.delete(`/events/${eventId}`);
      
      if (response.data.success) {
        // Update course-specific events
        setEventsByCourse(prev => ({
          ...prev,
          [courseId]: prev[courseId]?.filter(event => event.id !== eventId) || []
        }));
        
        // Update all events
        setAllEvents(prev => prev.filter(event => event.id !== eventId));
        
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error deleting event:', error);
      return { success: false, error };
    }
  };

  // Force refresh all events
  const refreshEvents = () => fetchAllEvents(true);

  const value = {
    eventsByCourse,
    allEvents,
    loading,
    courseColorMap,
    lastFetched,
    addEvent,
    deleteEvent,
    refreshEvents
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};