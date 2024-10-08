import React, { useState, useEffect } from 'react';
import { getProjects, createProject } from '../../services/api';
import { Container, Grid, TextField, Button, Typography, Card, CardContent, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Sidebar from '../Sidebar/Sidebar';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [newProjectName, setNewProjectName] = useState('');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const response = await getProjects();
            setProjects(response.data);
        } catch (error) {
            alert('プロジェクトの取得に失敗しました');
        }
    };

    const handleCreateProject = async () => {
        if (!newProjectName) return;
        try {
            await createProject({ name: newProjectName });
            setNewProjectName('');
            loadProjects();
        } catch (error) {
            alert('プロジェクトの作成に失敗しました');
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar projects={projects} />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Container maxWidth="md">
                    <Box sx={{ mt: 5 }}>
                        <Typography variant="h4" gutterBottom>ダッシュボード</Typography>
                        <Grid container spacing={3}>
                            {projects.map((project) => (
                                <Grid item xs={12} sm={6} md={4} key={project.id}>
                                    <Card sx={{ cursor: 'pointer' }}>
                                        <CardContent>
                                            <Typography variant="h5">{project.name}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        <Box sx={{ mt: 3 }}>
                            <TextField
                                label="新しいプロジェクト名"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                fullWidth
                            />
                            <Button
                                startIcon={<AddIcon />}
                                variant="contained"
                                color="primary"
                                onClick={handleCreateProject}
                                sx={{ mt: 2 }}
                            >
                                プロジェクト作成
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default Dashboard;
