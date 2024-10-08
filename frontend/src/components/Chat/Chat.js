import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getChatHistory, sendChatPrompt, getProjects } from '../../services/api';
import { Container, Box, TextField, Button, Typography, Paper } from '@mui/material';
import Sidebar from '../Sidebar/Sidebar';

const Chat = () => {
    const { projectId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        loadProjects();
        if (projectId) {
            loadChatHistory();
        }
    }, [projectId]);

    const loadProjects = async () => {
        try {
            const response = await getProjects();
            setProjects(response.data);
        } catch (error) {
            alert('プロジェクトの取得に失敗しました');
        }
    };

    const loadChatHistory = async () => {
        try {
            const response = await getChatHistory(projectId);
            setMessages(response.data);
        } catch (error) {
            alert('チャット履歴の取得に失敗しました');
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage) return;

        try {
            const response = await sendChatPrompt(projectId, newMessage);
            setMessages([...messages, { sender: 'user', content: newMessage }, { sender: 'ai', content: response.data.ai_response }]);
            setNewMessage('');
        } catch (error) {
            alert('メッセージの送信に失敗しました');
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar projects={projects} />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Container maxWidth="md">
                    <Box sx={{ mt: 5 }}>
                        <Typography variant="h4" gutterBottom>チャット</Typography>
                        <Paper elevation={3} sx={{ maxHeight: 400, overflow: 'auto', p: 2, mb: 3 }}>
                            {messages.map((message, index) => (
                                <Box key={index} sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color={message.sender === 'user' ? 'primary' : 'secondary'}>
                                        {message.sender === 'user' ? 'あなた' : 'AI'}
                                    </Typography>
                                    <Typography>{message.content}</Typography>
                                </Box>
                            ))}
                        </Paper>
                        <TextField
                            label="メッセージを入力..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            fullWidth
                            multiline
                        />
                        <Button variant="contained" color="primary" onClick={handleSendMessage} sx={{ mt: 2 }}>
                            送信
                        </Button>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default Chat;
