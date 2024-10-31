// frontend/src/components/Chat/AnimatedMessage.js

import React, { useState, useEffect, useRef } from 'react';
import { 
    Typography, 
    Paper, 
    Avatar, 
    Box, 
    Collapse, 
    List, 
    ListItem, 
    Link as MuiLink, 
    Card, 
    IconButton 
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { CSSTransition } from 'react-transition-group';
import useTypewriterEffect from './useTypewriterEffect'; // パスを修正
import './AnimatedMessage.css';
import OpenInNewIcon from '@mui/icons-material/OpenInNew'; // アイコンのインポート

// シンタックスハイライトの言語登録
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
SyntaxHighlighter.registerLanguage('javascript', javascript);

const AnimatedMessage = ({ message }) => {
    const [show, setShow] = useState(false);
    const nodeRef = useRef(null);
    const [isExpanded, setIsExpanded] = useState(false);

    // フックを常に呼び出し、isNew フラグを渡す
    const displayedText = useTypewriterEffect(message.content, 5, message.isNew);

    useEffect(() => {
        setShow(true);
    }, []);

    const handleToggleArticles = () => {
        setIsExpanded(!isExpanded);
    };

    // カード全体をクリック可能にするためのハンドラー
    const handleCardClick = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <CSSTransition 
            in={show} 
            timeout={500} 
            classNames="fade" 
            unmountOnExit 
            nodeRef={nodeRef}
        >
            <Box
                ref={nodeRef}
                sx={{
                    mb: 2,
                    display: 'flex',
                    flexDirection: message.sender === 'ai' ? 'row' : 'row-reverse',
                    alignItems: 'flex-start',
                    '@media (max-width:600px)': { // 画面幅が600px以下の場合
                        flexDirection: 'column',
                        alignItems: 'stretch',
                    },
                }}
            >
                <Avatar
                    sx={{ 
                        mr: message.sender === 'ai' ? 2 : 0, 
                        ml: message.sender === 'ai' ? 0 : 2 
                    }}
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
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {message.sender === 'ai' && message.articles && message.articles.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Typography
                                variant="body2"
                                sx={{ 
                                    cursor: 'pointer', 
                                    textDecoration: 'underline',
                                    '&:hover': { color: 'primary.light' } // ホバー時の色変更
                                }}
                                onClick={handleToggleArticles}
                            >
                                {message.articles.length}件のサイトを検索しました
                            </Typography>
                            <Collapse in={isExpanded}>
                                <List sx={{ mt: 1, p: 0 }}>
                                    {message.articles.map((article, idx) => (
                                        <ListItem 
                                            key={idx} 
                                            disableGutters 
                                            sx={{ p: 0, mb: 1, cursor: 'pointer' }}
                                            onClick={() => handleCardClick(article.url)}
                                        >
                                            <Card 
                                                variant="outlined" 
                                                sx={{ 
                                                    width: '100%', 
                                                    bgcolor: 'background.paper', 
                                                    color: 'text.primary', 
                                                    borderRadius: 1,
                                                    boxShadow: 'none',
                                                    '&:hover': {
                                                        bgcolor: 'grey.100',
                                                    },
                                                    transition: 'background-color 0.3s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    p: 1, // パディングを小さく
                                                }}
                                            >
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography variant="subtitle1" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                                        {article.title}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                                        {article.url}
                                                    </Typography>
                                                </Box>
                                                <IconButton
                                                    component="span"
                                                    aria-label={`Open ${article.title} in a new tab`}
                                                    sx={{ p: 0.5 }}
                                                >
                                                    <OpenInNewIcon fontSize="small" />
                                                </IconButton>
                                            </Card>
                                        </ListItem>
                                    ))}
                                </List>
                            </Collapse>
                        </Box>
                    )}
                    {/* メッセージの表示 */}
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
                                    <MuiLink 
                                        href={href} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        sx={{ color: 'primary.light' }} // カラーパレットを使用
                                    >
                                        {children}
                                    </MuiLink>
                                );
                            },
                            img({ alt, src }) {
                                return <img src={src} alt={alt} style={{ maxWidth: '100%' }} />;
                            },
                        }}
                    >
                        {displayedText}
                    </ReactMarkdown>

                    {/* タイムスタンプ */}
                    <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                        {new Date(message.created_at).toLocaleTimeString()}
                    </Typography>
                </Paper>
            </Box>
        </CSSTransition>
    );

};

export default AnimatedMessage;
