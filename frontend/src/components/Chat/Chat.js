import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getChatHistory, sendChatPrompt, getProjects } from '../../services/api';
import { Box, TextField, Button, Typography, Grid2, Link } from '@mui/material';
import Sidebar from '../Sidebar/Sidebar';

const Chat = () => {
    const { projectId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [projects, setProjects] = useState([]);
    const chatContainerRef = useRef(null);

    const loadProjects = useCallback(async () => {
        try {
            const response = await getProjects();
            setProjects(response.data);
        } catch (error) {
            alert('プロジェクトの取得に失敗しました');
        }
    }, []);

    const loadChatHistory = useCallback(async () => {
        try {
            const response = await getChatHistory(projectId);
            setMessages(response.data);
        } catch (error) {
            alert('チャット履歴の取得に失敗しました');
        }
    }, [projectId]);

    useEffect(() => {
        loadProjects();
        if (projectId) {
            loadChatHistory();
        }
    }, [projectId, loadProjects, loadChatHistory]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

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

    const parseMessageWithLinks = (message) => {
        const urlRegex = /(https?:\/\/[\w\-.]+\.[a-z]{2,}(\/[\w\-.?=&%]*)?)/g;
        const parts = message.split(urlRegex);
        return parts.map((part, index) => {
            if (urlRegex.test(part)) {
                return (
                    <Link href={part} target="_blank" rel="noopener noreferrer" key={index} sx={{ color: 'inherit', textDecoration: 'underline' }}>
                        {part}
                    </Link>
                );
            }
            return part;
        });
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <Sidebar projects={projects} />
            <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box
                    ref={chatContainerRef}
                    sx={{ flexGrow: 1, overflowY: 'auto', p: 3, bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}
                >
                    {messages.map((message, index) => (
                        <Box
                            key={index}
                            sx={{
                                mb: 2,
                                alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '70%',
                                bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main',
                                color: 'white',
                                p: 2,
                                borderRadius: 2,
                            }}
                        >
                            <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                                {parseMessageWithLinks(message.content)}
                            </Typography>
                        </Box>
                    ))}
                </Box>
                <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #ddd' }}>
                    <Grid2 container spacing={2} alignItems="center">
                        <Grid2 item xs>
                            <TextField
                                label="メッセージを入力..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                fullWidth
                                multiline
                                variant="outlined"
                            />
                        </Grid2>
                        <Grid2 item>
                            <Button variant="contained" color="primary" onClick={handleSendMessage}>
                                送信
                            </Button>
                        </Grid2>
                    </Grid2>
                </Box>
            </Box>
        </Box>
    );
};

export default Chat;