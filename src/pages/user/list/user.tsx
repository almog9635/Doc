import React from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { User } from '../../../entity/user.ts';
import styles from './user.module.css';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '../../../entity/decodedToken.ts';
import { RoleData } from '../../../entity/role/roleData.ts';
import { Task } from '../../../entity/debrief/task.ts';

const UserView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = React.useState<User | null>(null);
    const [tasks, setTasks] = React.useState<Task[]>([]); // State for tasks

    React.useEffect(() => {
        const fetchUserAndTasks = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    console.error('No access token found');
                    return;
                }
                const decodedToken = jwtDecode<DecodedToken>(token);
                // Allow admin or the user themselves to view
                if(decodedToken.sub !== id && !decodedToken.roles.includes("admin")){
                    console.error('User not authorized to view this page');
                    return;
                }

                const response = await axios.get(`http://localhost:4000/user/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('API response:', response.data);
                if (response.data && response.data.users && response.data.users.length > 0) {
                    const userData = response.data.users[0];
                    setUser(userData);
                    setTasks(Array.isArray(userData.tasks) ? userData.tasks : []);
                } else {
                    console.error('API response does not contain expected user data:', response.data);
                    setUser(null);
                    setTasks([]);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setUser(null);
                setTasks([]);
            }
        };

        fetchUserAndTasks();
    }, [id]);

    const handleCompleteTask = async (taskId: string) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.error('No access token found for completing task');
            return;
        }

        const decodedToken : DecodedToken = jwtDecode<DecodedToken>(token);

        try {
            const response = await axios.put(`http://localhost:4000/task/complete/${taskId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    "user-id" : decodedToken.sub, 
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data === true) {
                console.log(`Task ${taskId} marked as complete.`);
                
                setTasks(prevTasks => 
                    prevTasks.map(task => 
                        task.id === taskId 
                            ? { ...task, completed: true }
                            : task
                    )
                );
            } else {
                console.warn(`Failed to mark task ${taskId} as complete.`);
            }
        } catch (error) {
            console.error(`Error completing task ${taskId}:`, error);
        }
    };

    if (!user) {
        return <div className={styles.loading}>Loading user data...</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>User Profile</h1>

            <div className={styles.userDetails}>
                <p><strong className={styles.label}>ID:</strong> {user.id}</p>
                <p><strong className={styles.label}>First Name:</strong> {user.firstName}</p>
                <p><strong className={styles.label}>Last Name:</strong> {user.lastName}</p>
                <p><strong className={styles.label}>Service Type:</strong> {user.serviceType}</p>
                <p><strong className={styles.label}>Rank:</strong> {user.rank}</p>
                {user.group && <p><strong className={styles.label}>Group:</strong> {user.group.name}</p>}
            </div>

            <div className={styles.rolesSection}>
                <h2 className={styles.subtitle}>Roles</h2>
                <ul className={styles.rolesList}>
                    {Array.isArray(user.roles) && user.roles.map((roleOrRoleData) => {
                        const roleData = (roleOrRoleData as RoleData).role ? (roleOrRoleData as RoleData).role : roleOrRoleData;
                        return roleData && roleData.id && roleData.name ? (
                            <li key={roleData.id} className={styles.roleItem}>{roleData.name}</li>
                        ) : null;
                    })}
                </ul>
            </div>

            <div className={styles.tasksSection}>
                <h2 className={styles.subtitle}>Tasks</h2>
                {tasks.length > 0 ? (
                    <ul className={styles.taskList}>
                        {tasks.map((task) => (
                            <li key={task.id} className={`${styles.taskItem} ${task.completed ? styles.completedTask : ''}`}>
                                <div className={styles.taskDetail}><strong className={styles.label}>ID:</strong> {task.id}</div>
                                {task.content && <div className={styles.taskDetail}><strong className={styles.label}>Content:</strong> {task.content}</div>}
                                {task.startDate && <div className={styles.taskDetail}><strong className={styles.label}>Start Date:</strong> {new Date(task.startDate).toLocaleDateString()}</div>}
                                {task.deadline && <div className={styles.taskDetail}><strong className={styles.label}>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}</div>}
                                <div className={styles.taskDetail}><strong className={styles.label}>Status:</strong> {task.completed ? 'Completed' : 'Pending'}</div>
                                {!task.completed && (
                                    <button
                                        onClick={() => handleCompleteTask(task.id)}
                                        className={styles.completeButton}
                                    >
                                        Mark as Complete
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={styles.noTasks}>No tasks assigned.</p>
                )}
            </div>
        </div>
    );
};

export default UserView;