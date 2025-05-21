import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './user.module.css';
import { User } from '../../../entity/user';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '../../../entity/decodedToken';
import { Rank, ServiceType } from '../../../consts';
import { Role } from '../../../entity/role/role';
import { Group } from '../../../entity/group';
import { RoleData } from '../../../entity/role/roleData';

const UpdateUser: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<Partial<User & { password?: string; roleIds?: string[]; groupId?: string }>>({
        firstName: '',
        lastName: '',
        serviceType: undefined,
        rank: undefined,
        password: undefined,
        roleIds: undefined,
        groupId: '',
    });
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [allGroups, setAllGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('No access token found');
                setLoading(false);
                navigate('/login');
                return;
            }

            try {
                setLoading(true);
                const decodedToken = jwtDecode<DecodedToken>(token);
                if (!decodedToken.roles.includes("admin")) {
                    navigate('/home');
                    return;
                }

                const userResponse = await axios.get(`http://localhost:4000/user/edit/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                const userData = userResponse.data.users[0];
                if (userData) {
                    const fetchedServiceType = userData.serviceType;
                    const isValidServiceType = Object.values(ServiceType).includes(fetchedServiceType as ServiceType);
                    const serviceTypeToSet = isValidServiceType ? fetchedServiceType as ServiceType : undefined;
                    if (!isValidServiceType && fetchedServiceType != null) {
                        console.warn(`Invalid ServiceType received from API: ${fetchedServiceType}`);
                    }

                    const fetchedRank = userData.rank;
                    const isValidRank = Object.values(Rank).includes(fetchedRank as Rank);
                    const rankToSet = isValidRank ? fetchedRank as Rank : undefined;
                    if (!isValidRank && fetchedRank != null) {
                        console.warn(`Invalid Rank received from API: ${fetchedRank}`);
                    }

                    console.log(userData.roles);

                    setUser(prev => ({
                        ...prev,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        serviceType: serviceTypeToSet,
                        rank: rankToSet,
                        roleIds: userData.roles?.map((r: RoleData) => r.role?.id) || [],
                        groupId: userData.group?.id || '',
                    }));
                } else {
                    setError('User data not found in response.');
                }

                setAllRoles(userResponse.data.getAllRoles || []);
                setAllGroups(userResponse.data.getAllGroups || []);

            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to fetch required data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox' && name === 'roles') {
            const { checked } = e.target as HTMLInputElement;
            setUser(prevUser => {
                const currentRoleIds = prevUser.roleIds || [];
                if (checked) {
                    return { ...prevUser, roleIds: [...currentRoleIds, value] };
                } else {
                    return { ...prevUser, roleIds: currentRoleIds.filter(roleId => roleId !== value) };
                }
            });
        } else if (name === 'roles' && type === 'select-multiple') {
            const selectedOptions = (e.target as HTMLSelectElement).selectedOptions;
            const selectedRoleIds = Array.from(selectedOptions).map(option => option.value);
            setUser(prevUser => ({
                ...prevUser,
                roleIds: selectedRoleIds,
            }));
        } else {
            setUser(prevUser => ({
                ...prevUser,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('Authentication token not found. Please log in again.');
            return;
        }

        try {
            const decodedToken = jwtDecode<DecodedToken>(token);
            if (!decodedToken.roles.includes("admin")) {
                setError('Unauthorized: Only admins can update users.');
                return;
            }

            const payload = {
                firstName: user.firstName,
                lastName: user.lastName,
                serviceType: user.serviceType,
                rank: user.rank,
                roles: user.roleIds,
                group: user.groupId,
                password: user.password,
            };

            await axios.put(`http://localhost:4000/user/${id}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "User-Id": "    1",
                    'Content-Type': 'application/json',
                },
            });
            alert('User updated successfully!');
            navigate('/users');
        } catch (err) {
            console.error('Error updating user:', err);
            const errorMessage = (axios.isAxiosError(err) && err.response?.data?.message) || 'Failed to update user. Please try again.';
            setError(errorMessage);
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Edit User</h1>
            {error && <div className={styles.error}>Error: {error}</div>}
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="firstName" className={styles.label}>First Name:</label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={user?.firstName || ''}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="lastName" className={styles.label}>Last Name:</label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={user?.lastName || ''}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="serviceType" className={styles.label}>Service Type:</label>
                    <select
                        id="serviceType"
                        name="serviceType"
                        value={user.serviceType || ''}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    >
                        <option value="" disabled>Select Service Type</option>
                        {Object.values(ServiceType).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="rank" className={styles.label}>Rank:</label>
                    <select
                        id="rank"
                        name="rank"
                        value={user.rank || ''}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    >
                        <option value="" disabled>Select Rank</option>
                        {Object.values(Rank).map(rank => (
                            <option key={rank} value={rank}>{rank}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="password" className={styles.label}>New Password (optional):</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={user.password || ''}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="Leave blank to keep current password"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Roles:</label>
                    <div className={styles.checkboxGroup}>
                        {allRoles.map(role => (
                            <div key={role.id} className={styles.checkboxItem}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        name="roles"
                                        value={role.id}
                                        checked={user.roleIds?.includes(role.id) || false}
                                        onChange={handleChange}
                                        className={styles.checkboxInput}
                                    />
                                    {role.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="groupId" className={styles.label}>Group:</label>
                    <select
                        id="groupId"
                        name="groupId"
                        value={user.groupId || ''}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    >
                        <option value="" disabled>Select Group</option>
                        {allGroups.map(group => (
                            <option key={group.id} value={group.id}>{group.name}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.submitButton}>Update User</button>
                    <button type="button" onClick={() => navigate('/users')} className={styles.cancelButton}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default UpdateUser;
