import React from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { User } from '../../../entity/user.ts';
import styles from './user.module.css';

const UserView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = React.useState<User | null>(null);

    React.useEffect(() => {
        axios.get(`http://localhost:4000/user/${id}`)
            .then(response => {
                console.log('API response:', response.data);
                console.log('API response type:', typeof response.data);
                if (response.data && response.data.users) {
                    setUser(response.data.users);
                    console.log('User set:', response.data.users);
                } else {
                    console.error('API response does not contain user data:', response.data);
                }
            })
            .catch(error => console.error(error));
    }, [id]);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>User Details</h1>
            <p><strong>First Name:</strong> {user.firstName}</p>
            <p><strong>Last Name:</strong> {user.lastName}</p>
            <p><strong>Service Type:</strong> {user.serviceType}</p>
            <p><strong>Password:</strong> {user.password}</p>
            <p><strong>Group:</strong> {user.group.id}</p>
            <div>
                <strong>Roles:</strong>
                <ul>
                    {Array.isArray(user.roles) && user.roles.map(role => (
                        <li key={role.id}>{role.name}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default UserView;