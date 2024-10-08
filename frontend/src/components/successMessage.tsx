import React, { useState, useEffect } from 'react';
import '../styles/successMessage.css';

interface SuccessMessageProps {
  message: string;
  duration?: number;
  onClose?: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ message, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="success-message">
      <div className="success-message__content">
        <span className="success-message__icon">✓</span>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default SuccessMessage;