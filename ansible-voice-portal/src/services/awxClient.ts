import axios from 'axios';

const AWX_BASE_URL = 'http://your-awx-server/api/v2'; // Replace with your AWX server URL

export const authenticate = async (username, password) => {
    try {
        const response = await axios.post(`${AWX_BASE_URL}/tokens/`, {
            username,
            password,
        });
        return response.data;
    } catch (error) {
        throw new Error('Authentication failed: ' + error.message);
    }
};

export const executeTask = async (token, taskData) => {
    try {
        const response = await axios.post(`${AWX_BASE_URL}/jobs/`, taskData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error('Task execution failed: ' + error.message);
    }
};

export const getTaskStatus = async (token, jobId) => {
    try {
        const response = await axios.get(`${AWX_BASE_URL}/jobs/${jobId}/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error('Failed to retrieve task status: ' + error.message);
    }
};