import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/api';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await registerUser({ username, email, password });
            alert('ユーザー登録が完了しました');
            navigate('/dashboard'); // ダッシュボードにリダイレクト
        } catch (error) {
            alert(error.response?.data?.message || 'ユーザー登録に失敗しました');
        }
    };

    return (
        <form onSubmit={handleRegister}>
            <input type="text" placeholder="ユーザー名" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="email" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="パスワード" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">登録</button>
        </form>
    );
};

export default Register;
