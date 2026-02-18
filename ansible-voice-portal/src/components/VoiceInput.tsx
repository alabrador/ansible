import React, { useEffect, useState } from 'react';
import { startVoiceRecognition } from '../services/voiceRecognition';
import { parseTaskCommand } from '../services/taskParser';
import TaskExecutor from './TaskExecutor';

const VoiceInput: React.FC = () => {
    const [command, setCommand] = useState<string>('');
    const [isListening, setIsListening] = useState<boolean>(false);

    const handleVoiceCommand = (text: string) => {
        const parsedCommand = parseTaskCommand(text);
        setCommand(parsedCommand);
    };

    const toggleListening = () => {
        if (isListening) {
            setIsListening(false);
        } else {
            setIsListening(true);
            startVoiceRecognition(handleVoiceCommand);
        }
    };

    useEffect(() => {
        if (isListening) {
            startVoiceRecognition(handleVoiceCommand);
        }
    }, [isListening]);

    return (
        <div>
            <button onClick={toggleListening}>
                {isListening ? 'Stop Listening' : 'Start Listening'}
            </button>
            <TaskExecutor command={command} />
        </div>
    );
};

export default VoiceInput;