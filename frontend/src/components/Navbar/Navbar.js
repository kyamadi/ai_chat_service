// frontend/src/components/Navbar/Navbar.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        // ログアウト処理をここに実装
        localStorage.removeItem('token');
        navigate('/login');
    };

    // ユーザーがログインしているかどうかをチェック（例: トークンの存在）
    const isLoggedIn = !!localStorage.getItem('token');

    return (
        <AppBar position="fixed">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    AIチャットアプリ
                </Typography>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    {isLoggedIn ? (
                        <>
                            <Button color="inherit" component={Link} to="/dashboard">
                                ダッシュボード
                            </Button>
                            <Button color="inherit" onClick={handleLogout}>
                                ログアウト
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button color="inherit" component={Link} to="/login">
                                ログイン
                            </Button>
                            <Button color="inherit" component={Link} to="/register">
                                登録
                            </Button>
                        </>
                    )}
                </Box>
                {/* モバイルビュー用のメニューボタン */}
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={handleMenu}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={open}
                        onClose={handleClose}
                    >
                        {isLoggedIn ? (
                            [
                                <MenuItem component={Link} to="/dashboard" onClick={handleClose} key="dashboard">
                                    ダッシュボード
                                </MenuItem>,
                                <MenuItem component={Link} to="/project/1/chat" onClick={handleClose} key="chat">
                                    チャット
                                </MenuItem>,
                                <MenuItem onClick={() => { handleClose(); handleLogout(); }} key="logout">
                                    ログアウト
                                </MenuItem>
                            ]
                        ) : (
                            [
                                <MenuItem component={Link} to="/login" onClick={handleClose} key="login">
                                    ログイン
                                </MenuItem>,
                                <MenuItem component={Link} to="/register" onClick={handleClose} key="register">
                                    登録
                                </MenuItem>
                            ]
                        )}
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
