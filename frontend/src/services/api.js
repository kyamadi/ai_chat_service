// frontend/src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Axiosインスタンスの作成
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// リクエストインターセプターでトークンを設定
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// APIエンドポイントの定義
export const registerUser = (userData) => apiClient.post('/auth/register', userData);
export const loginUser = (userData) => apiClient.post('/auth/login', userData);
export const logoutUser = () => apiClient.post('/auth/logout');
export const getProjects = () => apiClient.get('/projects/');
export const createProject = (projectData) => apiClient.post('/projects/', projectData);
export const updateProject = (projectId, projectData) => apiClient.put(`/projects/${projectId}`, projectData);
export const deleteProject = (projectId) => apiClient.delete(`/projects/${projectId}`);
export const getChatHistory = (projectId) => apiClient.get(`/chat/${projectId}`);
export const sendChatPrompt = (projectId, content) => apiClient.post(`/chat/${projectId}`, { content });
