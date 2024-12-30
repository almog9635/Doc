import React from 'react';
import { Link } from 'react-router-dom';
import styles from './users.module.css';
import axios from 'axios';
import { User } from '../../../entity/user.ts';

const Users: React.FC = () => {
    const [users, setUsers] = React.useState<User[]>([]);

    React.useEffect(() => {
        axios.get('http://localhost:4000/users')
            .then(response => {
                console.log('API response:', response.data);
                console.log('API response type:', typeof response.data);
                // Extract users from the "getAllUsers" key
                if (response.data?.getAllUsers && Array.isArray(response.data.getAllUsers)) {
                    setUsers(response.data.getAllUsers);
                    console.log('Users:', response.data.getAllUsers);
                } else {
                    console.error('API response does not contain valid "getAllUsers" key:', response.data);
                }
            })
            .catch(error => console.error(error));
    }, []);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Users</h1>
            <ul className={styles.userList}>
                {users.map(user => (
                    <Link to={`/user/${user.id}`} className={styles.userLink}>
                        <li key={user.id} className={styles.userItem}>
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