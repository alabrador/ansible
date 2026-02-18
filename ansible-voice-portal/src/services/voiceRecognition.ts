import { useEffect } from 'react';

export const startVoiceRecognition = (onCommandRecognized: (command: string) => void) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        console.log('Voice recognition started. Speak into the microphone.');
    };

    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript;
        console.log('Recognized command:', command);
        onCommandRecognized(command);
    };

    recognition.onerror = (event) => {
        console.error('Voice recognition error:', event.error);
    };

    recognition.onend = () => {
        console.log('Voice recognition ended. Restarting...');
        recognition.start();
    };

    recognition.start();

    return () => {
        recognition.stop();
    };
};