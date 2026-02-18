import React from 'react';

interface StatusDisplayProps {
    status: 'success' | 'error' | null;
    message: string | null;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ status, message }) => {
    return (
        <div className={`status-display ${status}`}>
            {status && message && (
                <p>{message}</p>
            )}
        </div>
    );
};

export default StatusDisplay;