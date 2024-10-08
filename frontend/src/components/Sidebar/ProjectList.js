import React, { useState, useEffect } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../../services/api';

const ProjectList = () => {
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
        try {
            await createProject({ name: newProjectName });
            setNewProjectName('');
            loadProjects();
        } catch (error) {
            alert('プロジェクトの作成に失敗しました');
        }
    };

    const handleDeleteProject = async (projectId) => {
        try {
            await deleteProject(projectId);
            loadProjects();
        } catch (error) {
            alert('プロジェクトの削除に失敗しました');
        }
    };

    return (
        <div className="project-list">
            <h3>プロジェクト一覧</h3>
            <ul>
                {projects.map((project) => (
                    <li key={project.id}>
                        {project.name}
                        <button onClick={() => handleDeleteProject(project.id)}>削除</button>
                    </li>
                ))}
            </ul>
            <input
                type="text"
                placeholder="新しいプロジェクト名"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
            />
            <button onClick={handleCreateProject}>プロジェクト作成</button>
        </div>
    );
};

export default ProjectList;
