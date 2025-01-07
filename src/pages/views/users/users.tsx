import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './users.module.css';
import axios from 'axios';
import { User } from '../../../entity/user.ts';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '../../../entity/decodedToken.ts';

const Users: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [filterCategory, setFilterCategory] = useState<string>('firstName');
    const [filters, setFilters] = useState<{ [key: string]: string }>({});
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try{
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    console.error('No access token found');
                    return;
                }
                const decodedToken = jwtDecode<DecodedToken>(token);

                if(!decodedToken.roles.includes("admin")){
                    navigate('/home');
                    return;
                }

                const response = await axios.get('http://localhost:4000/users',{
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('API response:', response.data);
                if (response.data?.getAllUsers && Array.isArray(response.data.getAllUsers)){
                    setUsers(response.data.getAllUsers);
                    setFilteredUsers(response.data.getAllUsers);
                } else{
                    console.error('API response does not contain valid "getAllUsers" key:', response.data);
                }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    fetchUsers();
}, []);

    useEffect(() => {
        setFilteredUsers(
            users.filter(user =>
                Object.keys(filters).every(key =>
                    user[key as keyof User]?.toString().toLowerCase().includes(filters[key].toLowerCase())
                )
            )
        );
    }, [filters, users]);

    const handleFilterChange = (category: string, value: string) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [category]: value
        }));
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Users</h1>
            <div className={styles.filterContainer}>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="firstName">First Name</option>
                    <option value="lastName">Last Name</option>
                    <option value="serviceType">Service Type</option>
                    <option value="password">Password</option>
                </select>
                <input
                    type="text"
                    placeholder={`Filter by ${filterCategory}`}
                    value={filters[filterCategory] || ''}
                    onChange={(e) => handleFilterChange(filterCategory, e.target.value)}
                    className={styles.filterInput}
                />
                <button
                    onClick={() => handleFilterChange(filterCategory, '')}
                    className={styles.clearFilterButton}
                >
                    Clear Filter
                </button>
            </div>
            <ul className={styles.userList}>
                {filteredUsers.map(user => (
                    <Link to={`/user/${user.id}`} className={styles.userLink} key={user.id}>
                        <li className={styles.userItem}>
                            <p className={styles.userName}>{user.id}</p>
                            <p className={styles.userName}>{user.firstName}</p>
                            <p className={styles.userEmail}>{user.lastName}</p>
                            <p className={styles.userEmail}>{user.serviceType}</p>
                            <p className={styles.userEmail}>{user.password}</p>
                        </li>
                    </Link>
                ))}
            </ul>
        </div>
    );
};

export default Users;