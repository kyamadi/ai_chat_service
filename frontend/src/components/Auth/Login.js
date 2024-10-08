import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/api';
import { TextField, Button, Container, Typography, Box } from '@mui/material';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser({ email, password });
            localStorage.setItem('token', response.data.access_token);
            navigate('/dashboard');
        } catch (error) {
            alert(error.response?.data?.message || 'ログインに失敗しました');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 5 }}>
                <Typography variant="h4" gutterBottom>ログイン</Typography>
                <form onSubmit={handleLogin}>
                    <TextField
                        label="メールアドレス"
                        type="email"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="パスワード"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>ログイン</Button>
                </form>
            </Box>
        </Container>
    );
};

export default Login;
