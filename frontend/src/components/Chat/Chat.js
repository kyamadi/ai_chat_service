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
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import Sidebar from '../Sidebar/Sidebar';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
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
            id: Date.now(), // 一時的なID
            sender: 'user',
            content: newMessage.trim(),
            created_at: new Date().toISOString(),
            isNew: true,
            articles: []
        };
        setMessages(prevMessages => [...prevMessages, userMessage]);

        setLoading(true);

        try {
            const response = await sendChatPrompt(projectId, newMessage.trim());

            // AIメッセージと関連記事を追加
            const aiMessage = {
                id: Date.now() + 1, // 一時的なID
                sender: 'ai',
                content: response.data.ai_response,
                created_at: new Date().toISOString(),
                isNew: true,
                articles: response.data.articles || []
            };

            setMessages(prevMessages => [...prevMessages, aiMessage]);
        } catch (error) {
            alert('メッセージの送信に失敗しました');
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
                        <AnimatedMessage key={index} message={message} />
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
