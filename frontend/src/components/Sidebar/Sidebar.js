// frontend/src/components/Sidebar/Sidebar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Drawer, Box, Typography, List, ListItem, ListItemText, Button, ListItemButton } from '@mui/material'; // ListItemButton をインポート
import { logoutUser } from '../../services/api';

const Sidebar = ({ projects }) => {
    const navigate = useNavigate();

    const handleProjectClick = (projectId) => {
        navigate(`/project/${projectId}/chat`);
    };

    const handleLogout = async () => {
        try {
            await logoutUser();  // バックエンドのログアウトAPIを呼び出し
            localStorage.removeItem('token');
            navigate('/login');
        } catch (error) {
            alert('ログアウトに失敗しました');
        }
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 240,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
            }}
        >
            <Box sx={{ overflow: 'auto' }}>
                <Typography variant="h6" sx={{ p: 2 }}>プロジェクト一覧</Typography>
                <List>
                    {projects.map((project) => (
                        <ListItem key={project.id} disablePadding>
                            <ListItemButton onClick={() => handleProjectClick(project.id)}>
                                <ListItemText primary={project.name} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Button variant="contained" color="secondary" onClick={handleLogout} sx={{ m: 2 }}>
                    ログアウト
                </Button>
            </Box>
        </Drawer>
    );
};

export default Sidebar;
