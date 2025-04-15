import React from 'react';
import { useNotification } from '../contexts/NotificationContext';

export default function NotificationContainer() {
  const { notifications, hideNotification } = useNotification();

  const handleClose = (e, id) => {
    e.stopPropagation(); // Prevent event bubbling
    hideNotification(id);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-4 rounded shadow-lg text-white min-w-[200px] max-w-md 
                    transform transition-all duration-300 ease-in-out animate-fade-in ${getTypeStyles(notification.type)}`}
        >
          <div className="flex justify-between items-center">
            <div>{notification.message}</div>
            <button
              onClick={(e) => handleClose(e, notification.id)}
              className="ml-4 text-white hover:text-gray-200 focus:outline-none"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function getTypeStyles(type) {
  switch (type) {
    case 'success': return 'bg-green-500';
    case 'error': return 'bg-red-500';
    case 'warning': return 'bg-yellow-500';
    case 'info':
    default: return 'bg-blue-500';
  }
}
