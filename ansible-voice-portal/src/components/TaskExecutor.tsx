import React, { useState } from 'react';
import { executeTask } from '../services/awxClient';
import { parseTaskCommand } from '../services/taskParser';

const TaskExecutor: React.FC = () => {
    const [status, setStatus] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleVoiceCommand = async (command: string) => {
        setStatus('Executing...');
        setError(null);

        try {
            const task = parseTaskCommand(command);
            const response = await executeTask(task);
            setStatus(`Task executed successfully: ${response.data}`);
        } catch (err) {
            setError(`Error executing task: ${err.message}`);
            setStatus('');
        }
    };

    return (
        <div>
            {error && <div className="error">{error}</div>}
            {status && <div className="status">{status}</div>}
        </div>
    );
};

export default TaskExecutor;