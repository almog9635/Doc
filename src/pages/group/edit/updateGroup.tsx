import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Group } from '../../../entity/group';
import { User } from '../../../entity/user';
import styles from './updateGroup.module.css';
import { DecodedToken } from '../../../entity/decodedToken';
import { jwtDecode } from 'jwt-decode';

const UpdateGroup: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [group, setGroup] = useState<Group | null>(null);
    const [groupName, setGroupName] = useState<string>('');
    const [commanderId, setCommanderId] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchGroupAndUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                const groupResponse = await axios.get(`http://localhost:4000/group/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const fetchedGroup = groupResponse.data.groups;
                setGroup(fetchedGroup);
                setGroupName(fetchedGroup.name);
                setCommanderId(fetchedGroup.commander?.id || null);
                setUsers(fetchedGroup.users || []);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load group data or users. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchGroupAndUsers();
    }, [id, navigate]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        const token = localStorage.getItem('accessToken');
        if (!group || !token) {
            setError('Cannot update group. Please try logging in again.');
            return;
        }

        const selectedCommander = users.find(user => user.id === commanderId) || null;

        const updatedGroupData = {
            name: groupName,
            commander: selectedCommander?.id,
        };

        const decoded: DecodedToken = jwtDecode<DecodedToken>(token);
        
        try {
            await axios.put(`http://localhost:4000/group/${id}`, updatedGroupData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'User-Id': decoded.sub,
                    'Content-Type': 'application/json',
                },
            });
            navigate('/groups');
        } catch (err) {
            console.error('Error updating group:', err);
            setError('Failed to update group. Please check the details and try again.');
        }
    };

    if (loading) {
        return <div className={styles.message}>Loading group details...</div>;
    }

    if (error) {
        return <div className={`${styles.message} ${styles.error}`}>{error}</div>;
    }

    if (!group) {
        return <div className={styles.message}>Group not found.</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Update Group: {group.name}</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <p className={styles.error}>{error}</p>}
                <div className={styles.formGroup}>
                    <label htmlFor="groupName" className={styles.label}>Group Name:</label>
                    <input
                        type="text"
                        id="groupName"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="commander" className={styles.label}>Commander:</label>
                    <select
                        id="commander"
                        value={commanderId || ''}
                        onChange={(e) => setCommanderId(e.target.value || null)}
                        className={styles.select}
                    >
                        <option value="">No Commander</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.firstName} ({user.id})
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.submitButton}>Update Group</button>
                    <button type="button" onClick={() => navigate('/groups')} className={styles.cancelButton}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default UpdateGroup;