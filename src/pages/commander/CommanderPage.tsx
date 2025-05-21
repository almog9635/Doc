import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import styles from './commanderPage.module.css';
import { DecodedToken } from '../../entity/decodedToken';
import { User } from '../../entity/user';
import { Group } from '../../entity/group';
import { Task } from '../../entity/debrief/task';
import LoadingSpinner from '../../components/loading/LoadingSpinner';

// Interface for role data structure
interface RoleData {
    role: {
        id: string;
        name: string;
    };
}

interface GroupDetails extends Group {
    users: User[];
}

interface UserWithTasks extends User {
    tasks: Task[];
}

const CommanderPage: React.FC = () => {
    const { id: commanderId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [commander, setCommander] = useState<User | null>(null);
    const [group, setGroup] = useState<GroupDetails | null>(null);
    const [usersWithTasks, setUsersWithTasks] = useState<UserWithTasks[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const decoded = jwtDecode<DecodedToken>(token);

            if ((decoded.roles.includes('leader') && decoded.sub === commanderId) || decoded.roles.includes('admin')) {
                setIsAuthorized(true);
            } else {
                setError('Unauthorized access.');
                setLoading(false);
            }
        } catch (err) {
            console.error('Token decoding error:', err);
            navigate('/login');
        }
    }, [commanderId, navigate]);

    useEffect(() => {
        if (!isAuthorized) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('accessToken');
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            };

            try {
                const commanderRes = await axios.get(`http://localhost:4000/user/${commanderId}`, { headers });
                const fetchedCommander = commanderRes.data?.users?.[0];
                if (!fetchedCommander) throw new Error('Commander not found.');
                setCommander(fetchedCommander);

                if (!fetchedCommander.group?.id) {
                    throw new Error('Commander does not belong to a group.');
                }

                const groupRes = await axios.get(`http://localhost:4000/group/${fetchedCommander.group.id}`, { headers });
                console.log(groupRes.data.groups);
                const fetchedGroup = groupRes.data?.groups; 
                if (!fetchedGroup || !fetchedGroup.users) throw new Error('Group details or users not found.');
                setGroup(fetchedGroup);
                const usersWithTasksData = fetchedGroup.users.map((user: User) => ({
                    ...user,
                    tasks: user.tasks || [],
                }));
                setUsersWithTasks(usersWithTasksData);

            } catch (err: any) {
                console.error('Error fetching commander data:', err);
                setError(err.message || 'Failed to load data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [commanderId, isAuthorized]);

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString();
        } catch (e) {
            return 'Invalid Date';
        }
    };

    const getTaskStatusStyle = (task: Task) => {
        if (task.completed) {
            return styles.completedTask;
        }
        
        if (task.deadline) {
            const now = new Date();
            const deadline = new Date(task.deadline);
            if (now > deadline) {
                return styles.overdueTask;
            }
        }
        
        return styles.pendingTask;
    };

    const formatRoles = (user: User) => {
        if (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
            return 'None';
        }

        return user.roles.map((roleOrRoleData) => {
            const roleData = (roleOrRoleData as RoleData).role ? (roleOrRoleData as RoleData).role : roleOrRoleData;
            return roleData && roleData.name ? roleData.name : 'Unknown Role';
        }).join(', ');
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className={styles.error}>Error: {error}</div>;
    }

    if (!isAuthorized) {
        return <div className={styles.error}>Unauthorized.</div>;
    }

    if (!commander || !group) {
        return <div className={styles.error}>Could not load commander or group information.</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Commander Dashboard</h1>
            <div className={styles.commanderInfo}>
                <h2>Welcome, {commander.firstName} {commander.lastName}</h2>
                <p>Rank: {commander.rank}</p>
                <p>Group: {group.name} (ID: {group.id})</p>
                <p>Roles: {formatRoles(commander)}</p>
                <p>Service Type: {commander.serviceType || 'Not specified'}</p>
            </div>

            <h2 className={styles.subtitle}>Group Members and Tasks</h2>
            {usersWithTasks.length > 0 ? (
                <ul className={styles.userList}>
                    {usersWithTasks.map(user => (
                        <li key={user.id} className={styles.userItem}>
                            <div className={styles.userInfo}>
                                <h3>{user.firstName} {user.lastName} ({user.rank})</h3>
                                <p>ID: {user.id}</p>
                                <p>Roles: {formatRoles(user)}</p>
                                <p>Service Type: {user.serviceType || 'Not specified'}</p>
                            </div>
                            <div className={styles.taskList}>
                                <h4>Tasks ({user.tasks.length})</h4>
                                {user.tasks.length > 0 ? (
                                    <ul className={styles.tasks}>
                                        {user.tasks.map((task, index) => (
                                            <li 
                                                key={task.id || `task-${index}`} 
                                                className={`${styles.taskItem} ${getTaskStatusStyle(task)}`}
                                            >
                                                <p><strong>Task:</strong> {task.content}</p>
                                                <p><strong>Dates:</strong> {formatDate(task.startDate)} - {formatDate(task.deadline)}</p>
                                                <p><strong>Status:</strong> {task.completed ? 'Completed' : 'Pending'}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No tasks assigned.</p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No users found in this group.</p>
            )}
        </div>
    );
};

export default CommanderPage;
