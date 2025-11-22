import React, { useEffect } from 'react';
import './Css/Notification.css';

export function Notification({ message, type, onClose, duration = 3000 }) {
  // Duración fija de 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification notification-${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="notification-close">×</button>
    </div>
  );
}

export function NotificationContainer({ notifications, removeNotification }) {
  return (
    <div className="notification-container">
      {notifications.map((notif) => (
        <Notification
          key={notif.id}
          message={notif.message}
          type={notif.type}
          onClose={() => removeNotification(notif.id)}
          duration={notif.duration}
        />
      ))}
    </div>
  );
}

