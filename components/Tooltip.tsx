import React from 'react';

interface TooltipProps {
  message: string | null;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ message, children }) => {
  const hasMessage = message !== null;
  
  return (
    <div className={`tooltip-container w-full ${hasMessage ? 'active' : ''}`}>
      {children}
      {hasMessage && <div className="tooltip-text">{message}</div>}
    </div>
  );
};

export default Tooltip;
