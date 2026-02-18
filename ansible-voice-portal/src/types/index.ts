export type Task = {
    id: string;
    name: string;
    description: string;
    parameters: Record<string, any>;
};

export type Status = 'pending' | 'running' | 'success' | 'error';

export type VoiceCommand = {
    command: string;
    parameters?: Record<string, any>;
};