import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, loginUser } from '../../services/api';
import { TextField, Button, Container, Typography, Box } from '@mui/material';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await registerUser({ username, email, password });
            // 自動的にログインしてダッシュボードに遷移
            const response = await loginUser({ email, password });
            localStorage.setItem('token', response.data.access_token);
            navigate('/dashboard');
        } catch (error) {
            alert(error.response?.data?.message || 'ユーザー登録に失敗しました');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 5 }}>
                <Typography variant="h4" gutterBottom>新規登録</Typography>
                <form onSubmit={handleRegister}>
                    <TextField
                        label="ユーザー名"
                        type="text"
                        fullWidth
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
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
                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>登録</Button>
                </form>
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                        すでにアカウントをお持ちの方は <Link to="/login">こちら</Link> からログインしてください。
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
};

export default Register;