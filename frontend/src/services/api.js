import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const registerUser = (userData) => {
    return axios.post(`${API_URL}/auth/register`, userData);
};

export const loginUser = (userData) => {
    return axios.post(`${API_URL}/auth/login`, userData);
};

export const getProjects = () => {
    return axios.get(`${API_URL}/projects/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
};

export const createProject = (projectData) => {
    return axios.post(`${API_URL}/projects/`, projectData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
};

export const getChatHistory = (projectId) => {
    return axios.get(`${API_URL}/chat/${projectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
};

export const sendChatPrompt = (projectId, content) => {
    return axios.post(`${API_URL}/chat/${projectId}`, { content }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
};