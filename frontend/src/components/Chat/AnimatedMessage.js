// frontend/src/components/Chat/AnimatedMessage.js
import React, { useState, useEffect, useRef } from 'react';
import { Typography, Paper, Avatar, Box } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { CSSTransition } from 'react-transition-group';
import useTypewriterEffect from './useTypewriterEffect.js'; // カスタムフックをインポート
import './AnimatedMessage.css';

// シンタックスハイライトの言語登録
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
SyntaxHighlighter.registerLanguage('javascript', javascript);

const AnimatedMessage = ({ message }) => {
    const [show, setShow] = useState(false);
    const nodeRef = useRef(null);

    // タイプライター効果で表示されるテキスト
    const displayedText = useTypewriterEffect(message.content, 20); // スピードを調整（数値を小さくすると速くなる）

    useEffect(() => {
        setShow(true);
    }, []);

    return (
        <CSSTransition in={show} timeout={500} classNames="fade" unmountOnExit nodeRef={nodeRef}>
            <Box
                ref={nodeRef}
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
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
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
