// frontend/src/components/Chat/Chat.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getChatHistory, sendChatPrompt, getProjects } from '../../services/api';
import { 
    Box, 
    TextField, 
    Button, 
    Typography, 
    Grid, 
    CircularProgress, 
    Avatar, 
    Paper 
} from '@mui/material';
import Sidebar from '../Sidebar/Sidebar';
import ReactMarkdown from 'react-markdown';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import github from 'react-syntax-highlighter/dist/esm/styles/hljs/github';

// シンタックスハイライトの言語登録
SyntaxHighlighter.registerLanguage('javascript', javascript);

const Chat = () => {
    const { projectId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
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
    }, [messages, loading]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        setLoading(true); // ローディング開始

        try {
            const response = await sendChatPrompt(projectId, newMessage.trim());
            setMessages([...messages, { sender: 'user', content: newMessage.trim(), created_at: new Date().toISOString() }, { sender: 'ai', content: response.data.ai_response, created_at: new Date().toISOString() }]);
            setNewMessage('');
        } catch (error) {
            alert('メッセージの送信に失敗しました');
        } finally {
            setLoading(false); // ローディング終了
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!loading) { // ローディング中でない場合のみ送信
                handleSendMessage();
            }
        }
    };

    // カスタムレンダラー: リンクをクリック可能にする
    const renderers = {
        link: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>
                {children}
            </a>
        ),
        code({ language, value }) {
            return (
                <SyntaxHighlighter language={language} style={github}>
                    {value}
                </SyntaxHighlighter>
            );
        },
        image({ alt, src }) {
            return <img src={src} alt={alt} style={{ maxWidth: '100%' }} />;
        },
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar projects={projects} />
            <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* チャットメッセージ表示エリア */}
                <Box
                    ref={chatContainerRef}
                    sx={{ flexGrow: 1, overflowY: 'auto', p: 3, bgcolor: '#f5f5f5' }}
                >
                    {messages.map((message, index) => (
                        <Box
                            key={index}
                            sx={{
                                mb: 2,
                                display: 'flex',
                                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                                alignItems: 'flex-start',
                            }}
                        >
                            <Avatar
                                sx={{ mr: message.sender === 'user' ? 0 : 2, ml: message.sender === 'user' ? 2 : 0 }}
                                src={message.sender === 'user' ? '/user-avatar.png' : '/ai-avatar.png'}
                                alt={message.sender}
                            />
                            <Paper
                                elevation={3}
                                sx={{
                                    maxWidth: '70%',
                                    bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main',
                                    color: 'white',
                                    p: 2,
                                    borderRadius: 2,
                                }}
                            >
                                <ReactMarkdown components={renderers}>
                                    {message.content}
                                </ReactMarkdown>
                                <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                                    {new Date(message.created_at).toLocaleTimeString()}
                                </Typography>
                            </Paper>
                        </Box>
                    ))}
                </Box>
                {/* ローディングインジケーター */}
                {loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, px: 3 }}>
                        <CircularProgress size={24} />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                            AIが思考中...
                        </Typography>
                    </Box>
                )}
                {/* メッセージ入力エリア */}
                <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #ddd' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs>
                            <TextField
                                label="メッセージを入力..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                fullWidth
                                multiline
                                variant="outlined"
                                disabled={loading} // ローディング中は入力を無効化
                            />
                        </Grid>
                        <Grid item>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={handleSendMessage}
                                disabled={loading} // ローディング中は送信ボタンを無効化
                            >
                                送信
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
};

export default Chat;
