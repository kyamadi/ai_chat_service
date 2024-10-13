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
import SendIcon from '@mui/icons-material/Send';
import Sidebar from '../Sidebar/Sidebar';
import ReactMarkdown from 'react-markdown';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import AnimatedMessage from './AnimatedMessage';

// シンタックスハイライトの言語登録
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
SyntaxHighlighter.registerLanguage('javascript', javascript);

const Chat = () => {
    const { projectId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatContainerRef = useRef(null);
    const [isAutoScroll, setIsAutoScroll] = useState(true);

    // プロジェクト一覧を取得
    const loadProjects = useCallback(async () => {
        try {
            const response = await getProjects();
            setProjects(response.data);
        } catch (error) {
            alert('プロジェクトの取得に失敗しました');
        }
    }, []);

    // チャット履歴を取得
    const loadChatHistory = useCallback(async () => {
        try {
            const response = await getChatHistory(projectId);
            // 各メッセージに isNew: false を追加
            const historyMessages = response.data.map(msg => ({ ...msg, isNew: false }));
            setMessages(historyMessages);
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

    // スクロール位置の管理
    useEffect(() => {
        if (chatContainerRef.current && isAutoScroll) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages, loading, isAutoScroll]);

    // ユーザーがスクロールした際のハンドラ
    const handleScroll = () => {
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50; // 50px のマージン
            setIsAutoScroll(isAtBottom);
        }
    };

    // スクロールイベントリスナーを追加
    useEffect(() => {
        const container = chatContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => {
                container.removeEventListener('scroll', handleScroll);
            };
        }
    }, []);

    // メッセージ送信処理
    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        // ユーザーメッセージを即座に追加し、isNew: true を設定
        const userMessage = {
            sender: 'user',
            content: newMessage.trim(),
            created_at: new Date().toISOString(),
            isNew: true,
        };
        setMessages(prevMessages => [...prevMessages, userMessage]);

        setLoading(true);

        // プレースホルダーメッセージを追加
        const aiPlaceholderMessage = {
            sender: 'ai',
            content: '',
            created_at: new Date().toISOString(),
            isNew: true,
            isPlaceholder: true,
        };
        setMessages(prevMessages => [...prevMessages, aiPlaceholderMessage]);

        try {
            const response = await sendChatPrompt(projectId, newMessage.trim());

            // プレースホルダーメッセージを実際の応答で置き換える
            setMessages(prevMessages => {
                const messagesWithoutPlaceholder = prevMessages.filter(msg => !msg.isPlaceholder);
                const aiMessage = {
                    sender: 'ai',
                    content: response.data.ai_response,
                    created_at: new Date().toISOString(),
                    isNew: true,
                };
                return [...messagesWithoutPlaceholder, aiMessage];
            });
        } catch (error) {
            alert('メッセージの送信に失敗しました');
            // プレースホルダーメッセージを削除
            setMessages(prevMessages => prevMessages.filter(msg => !msg.isPlaceholder));
        } finally {
            setLoading(false);
            setNewMessage('');
        }
    };

    // Enterキーで送信
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!loading) {
                handleSendMessage();
            }
        }
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            {/* サイドバー */}
            <Sidebar projects={projects} />
            <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
                {/* チャットメッセージ表示エリア */}
                <Box
                    ref={chatContainerRef}
                    sx={{ flexGrow: 1, overflowY: 'auto', p: 3, bgcolor: '#f5f5f5' }}
                >
                    {messages.map((message, index) => (
                        message.isNew ? (
                            <AnimatedMessage key={index} message={message} />
                        ) : (
                            <Box
                                key={index}
                                sx={{
                                    mb: 2,
                                    display: 'flex',
                                    flexDirection: message.sender === 'ai' ? 'row' : 'row-reverse',
                                    alignItems: 'flex-start',
                                }}
                            >
                                <Avatar
                                    sx={{ mr: message.sender === 'ai' ? 2 : 0, ml: message.sender === 'ai' ? 0 : 2 }}
                                    src={message.sender === 'ai' ? '/ai-avatar.png' : '/user-avatar.png'}
                                    alt={message.sender}
                                />
                                <Paper
                                    elevation={3}
                                    sx={{
                                        maxWidth: '70%',
                                        bgcolor: message.sender === 'ai' ? 'secondary.main' : 'primary.main',
                                        color: 'white',
                                        p: 2,
                                        borderRadius: 2,
                                    }}
                                >
                                    <ReactMarkdown
                                        components={{
                                            code({ node, inline, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return !inline && match ? (
                                                    <SyntaxHighlighter language={match[1]} style={github} {...props}>
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                ) : (
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            },
                                            a({ href, children }) {
                                                return (
                                                    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>
                                                        {children}
                                                    </a>
                                                );
                                            },
                                            img({ alt, src }) {
                                                return <img src={src} alt={alt} style={{ maxWidth: '100%' }} />;
                                            },
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                    <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                                        {new Date(message.created_at).toLocaleTimeString()}
                                    </Typography>
                                </Paper>
                            </Box>
                        )
                    ))}
                    {/* ローディングインジケーター */}
                    {loading && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <CircularProgress size={24} />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                                AIが思考中...
                            </Typography>
                        </Box>
                    )}
                </Box>
                {/* メッセージ入力エリア */}
                <Box 
                    sx={{ 
                        p: 2, 
                        bgcolor: 'white', 
                        borderTop: '1px solid #ddd', 
                        position: 'sticky', 
                        bottom: 0 
                    }}
                >
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
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={handleSendMessage}
                                disabled={loading}
                                endIcon={<SendIcon />}
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
