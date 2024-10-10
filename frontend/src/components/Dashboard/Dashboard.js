// frontend/src/components/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../../services/api';
import { 
    Container, 
    Grid, 
    TextField, 
    Button, 
    Typography, 
    Card, 
    CardContent, 
    Box, 
    IconButton, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Sidebar from '../Sidebar/Sidebar';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [newProjectName, setNewProjectName] = useState('');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState(null);
    const [editedProjectName, setEditedProjectName] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);

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
        if (!newProjectName.trim()) return;
        try {
            await createProject({ name: newProjectName.trim() });
            setNewProjectName('');
            loadProjects();
        } catch (error) {
            alert('プロジェクトの作成に失敗しました');
        }
    };

    const handleEditClick = (project) => {
        setCurrentProject(project);
        setEditedProjectName(project.name);
        setEditDialogOpen(true);
    };

    const handleEditSave = async () => {
        if (!editedProjectName.trim()) return;
        try {
            await updateProject(currentProject.id, { name: editedProjectName.trim() });
            setEditDialogOpen(false);
            setCurrentProject(null);
            setEditedProjectName('');
            loadProjects();
        } catch (error) {
            alert('プロジェクトの更新に失敗しました');
        }
    };

    const handleDeleteClick = (project) => {
        setProjectToDelete(project);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteProject(projectToDelete.id);
            setDeleteDialogOpen(false);
            setProjectToDelete(null);
            loadProjects();
        } catch (error) {
            alert('プロジェクトの削除に失敗しました');
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
                                    <Card sx={{ cursor: 'pointer', position: 'relative' }}>
                                        <CardContent>
                                            <Typography variant="h5">{project.name}</Typography>
                                        </CardContent>
                                        <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
                                            <IconButton onClick={() => handleEditClick(project)} aria-label="edit">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDeleteClick(project)} aria-label="delete">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
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

            {/* 編集ダイアログ */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                <DialogTitle>プロジェクトの編集</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="プロジェクト名"
                        type="text"
                        fullWidth
                        value={editedProjectName}
                        onChange={(e) => setEditedProjectName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>キャンセル</Button>
                    <Button onClick={handleEditSave} variant="contained" color="primary">保存</Button>
                </DialogActions>
            </Dialog>

            {/* 削除確認ダイアログ */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>プロジェクトの削除</DialogTitle>
                <DialogContent>
                    <Typography>
                        本当に「{projectToDelete?.name}」を削除しますか？この操作は取り消せません。
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>キャンセル</Button>
                    <Button onClick={handleDeleteConfirm} variant="contained" color="secondary">削除</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Dashboard;
