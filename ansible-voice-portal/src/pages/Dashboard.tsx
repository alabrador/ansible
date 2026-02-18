import React from 'react';
import VoiceInput from '../components/VoiceInput';
import TaskExecutor from '../components/TaskExecutor';
import StatusDisplay from '../components/StatusDisplay';

const Dashboard: React.FC = () => {
    return (
        <div>
            <h1>Ansible Voice Portal</h1>
            <VoiceInput />
            <TaskExecutor />
            <StatusDisplay />
        </div>
    );
};

export default Dashboard;